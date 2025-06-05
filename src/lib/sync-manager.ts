import { MediaItem } from './types';
import { AuthService } from './auth';

export interface SyncConflict {
    type: 'real-conflict' | 'deletion-conflict';
    conflictedItems: {
        id: string;
        title: string;
        local: MediaItem;
        cloud: MediaItem;
        conflictType: 'modified' | 'deleted-locally' | 'deleted-in-cloud';
    }[];
    local: {
        items: MediaItem[];
        count: number;
        timestamp: string;
    };
    cloud: {
        items: MediaItem[];
        count: number;
        timestamp: string;
    };
    additionsOnly: {
        localOnly: MediaItem[];
        cloudOnly: MediaItem[];
    };
}

export interface BackupInfo {
    id: string;
    timestamp: string;
    items: MediaItem[];
    reason: string;
}

export class SyncManager {
    private static instance: SyncManager;
    private authService = AuthService.getInstance();

    static getInstance(): SyncManager {
        if (!SyncManager.instance) {
            SyncManager.instance = new SyncManager();
        }
        return SyncManager.instance;
    }

    // Create backup before any destructive operation
    async createBackup(items: MediaItem[], reason: string): Promise<string> {
        const backupId = `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const backup: BackupInfo = {
            id: backupId,
            timestamp: new Date().toISOString(),
            items: [...items], // Deep copy
            reason,
        };

        try {
            // Save backup to localStorage
            const existingBackups = this.getLocalBackups();
            existingBackups.push(backup);

            // Keep only last 10 backups
            const recentBackups = existingBackups.slice(-10);
            localStorage.setItem('isolist-backups', JSON.stringify(recentBackups));

            // Also try to save backup to Google Drive
            await this.saveBackupToCloud(backup);

            console.log('💾 Backup created:', backupId);
            return backupId;
        } catch (error) {
            console.error('Failed to create backup:', error);
            throw error;
        }
    }

    private async saveBackupToCloud(backup: BackupInfo): Promise<void> {
        if (!this.authService.isAuthenticated()) return;

        try {
            const driveService = this.authService.getDriveService();
            await driveService.saveData({
                type: 'backup',
                backup,
                version: 1,
            }, `isolist-backup-${backup.id}.json`);
        } catch (error) {
            console.warn('Failed to save backup to cloud:', error);
            // Don't throw - local backup is sufficient
        }
    }

    getLocalBackups(): BackupInfo[] {
        try {
            const backups = localStorage.getItem('isolist-backups');
            return backups ? JSON.parse(backups) : [];
        } catch (error) {
            console.error('Failed to load backups:', error);
            return [];
        }
    }

    async restoreFromBackup(backupId: string): Promise<MediaItem[] | null> {
        const backups = this.getLocalBackups();
        const backup = backups.find(b => b.id === backupId);

        if (!backup) {
            console.error('Backup not found:', backupId);
            return null;
        }

        console.log('🔄 Restoring from backup:', backupId);
        return backup.items;
    }

    // Enhanced conflict detection that only flags real conflicts
    async detectConflict(localItems: MediaItem[]): Promise<SyncConflict | null> {
        if (!this.authService.isAuthenticated()) return null;

        try {
            const driveService = this.authService.getDriveService();
            const cloudData = await driveService.loadData();

            const localTimestamp = localStorage.getItem('localTimestamp') || '';
            const cloudItems = cloudData?.mediaItems || [];
            const cloudTimestamp = cloudData?.lastModified || '';

            // Analyze the differences
            const analysis = this.analyzeDataDifferences(localItems, cloudItems);

            console.log('🔍 Data analysis:', {
                realConflicts: analysis.conflicts.length,
                localOnlyItems: analysis.localOnly.length,
                cloudOnlyItems: analysis.cloudOnly.length,
                identical: analysis.identical.length,
            });

            // Only return conflict if there are REAL conflicts (same item modified differently)
            if (analysis.conflicts.length === 0) {
                console.log('✅ No real conflicts detected - just additions/differences that can be auto-merged');
                return null;
            }

            // Real conflicts found
            const conflict: SyncConflict = {
                type: analysis.conflicts.some(c => c.conflictType === 'modified') ? 'real-conflict' : 'deletion-conflict',
                conflictedItems: analysis.conflicts,
                local: {
                    items: localItems,
                    count: localItems.length,
                    timestamp: localTimestamp,
                },
                cloud: {
                    items: cloudItems,
                    count: cloudItems.length,
                    timestamp: cloudTimestamp,
                },
                additionsOnly: {
                    localOnly: analysis.localOnly,
                    cloudOnly: analysis.cloudOnly,
                },
            };

            console.log('⚠️ Real conflicts detected:', analysis.conflicts.length);
            return conflict;
        } catch (error) {
            console.error('Failed to detect conflict:', error);
            return null;
        }
    }

    async safeSyncWithUserChoice(localItems: MediaItem[], userChoice: 'local' | 'cloud' | 'merge' | 'cancel'): Promise<MediaItem[]> {
        const conflict = await this.detectConflict(localItems);
        if (!conflict) return localItems;

        // Create backup before any changes
        await this.createBackup(conflict.cloud.items, `Before sync - user chose ${userChoice}`);

        switch (userChoice) {
            case 'local':
                // Use local data, upload to cloud
                await this.authService.getDriveService().saveData({
                    mediaItems: localItems,
                    lastModified: new Date().toISOString(),
                    version: 1,
                });
                this.updateLocalTimestamp();
                return localItems;

            case 'cloud':
                // Use cloud data, update local
                this.saveToLocalSafely(conflict.cloud.items);
                return conflict.cloud.items;

            case 'merge':
                // Merge both datasets
                const merged = this.autoMergeAdditions(conflict.local.items, conflict.cloud.items);
                await this.authService.getDriveService().saveData({
                    mediaItems: merged,
                    lastModified: new Date().toISOString(),
                    version: 1,
                });
                this.saveToLocalSafely(merged);
                return merged;

            case 'cancel':
                // Don't sync, keep local as-is
                return localItems;

            default:
                throw new Error('Invalid user choice');
        }
    }


    // Analyze what type of differences exist between local and cloud
    private analyzeDataDifferences(localItems: MediaItem[], cloudItems: MediaItem[]) {
        const localMap = new Map(localItems.map(item => [item.id, item]));
        const cloudMap = new Map(cloudItems.map(item => [item.id, item]));

        const conflicts: SyncConflict['conflictedItems'] = [];
        const localOnly: MediaItem[] = [];
        const cloudOnly: MediaItem[] = [];
        const identical: MediaItem[] = [];

        // Check local items
        for (const localItem of localItems) {
            const cloudItem = cloudMap.get(localItem.id);

            if (!cloudItem) {
                // Item only exists locally (new addition)
                localOnly.push(localItem);
            } else {
                // Item exists in both - check if they're different
                if (this.areItemsIdentical([localItem], [cloudItem])) {
                    identical.push(localItem);
                } else {
                    // Same item, different content = real conflict
                    conflicts.push({
                        id: localItem.id,
                        title: localItem.title,
                        local: localItem,
                        cloud: cloudItem,
                        conflictType: 'modified',
                    });
                }
            }
        }

        // Check cloud items that don't exist locally
        for (const cloudItem of cloudItems) {
            if (!localMap.has(cloudItem.id)) {
                // Item only exists in cloud (new addition)
                cloudOnly.push(cloudItem);
            }
        }

        return {
            conflicts,
            localOnly,
            cloudOnly,
            identical,
        };
    }

    // Smart sync that auto-merges additions and only prompts for real conflicts
    async intelligentSync(localItems: MediaItem[]): Promise<{ success: boolean; items: MediaItem[]; action: string }> {
        if (!this.authService.isAuthenticated()) {
            return { success: false, items: localItems, action: 'not-authenticated' };
        }

        try {
            const driveService = this.authService.getDriveService();
            const conflict = await this.detectConflict(localItems);

            if (!conflict) {
                // No real conflicts - perform auto-merge
                console.log('🔄 No conflicts detected, performing intelligent auto-merge...');
                const cloudData = await driveService.loadData();
                const cloudItems = cloudData?.mediaItems || [];

                if (cloudItems.length === 0) {
                    // No cloud data, upload local
                    console.log('⬆️ No cloud data, uploading local items');
                    await this.uploadToCloud(localItems);
                    return { success: true, items: localItems, action: 'uploaded-to-cloud' };
                }

                if (localItems.length === 0) {
                    // No local data, download cloud
                    console.log('⬇️ No local data, downloading cloud items');
                    this.saveToLocalSafely(cloudItems);
                    return { success: true, items: cloudItems, action: 'downloaded-from-cloud' };
                }

                // Both have data, auto-merge
                console.log('🔀 Auto-merging additions from both sources');
                const merged = this.autoMergeAdditions(localItems, cloudItems);
                await this.uploadToCloud(merged);
                this.saveToLocalSafely(merged);

                return { success: true, items: merged, action: 'auto-merged' };
            } else {
                // Real conflicts exist - return conflict for user resolution
                console.log('⚠️ Real conflicts detected, user intervention required');
                return { success: false, items: localItems, action: 'requires-user-resolution' };
            }
        } catch (error) {
            console.error('Intelligent sync failed:', error);
            return { success: false, items: localItems, action: 'error' };
        }
    }

    // Auto-merge items that are just additions (no conflicts)
    private autoMergeAdditions(localItems: MediaItem[], cloudItems: MediaItem[]): MediaItem[] {
        const merged = new Map<string, MediaItem>();

        // Add all items, preferring newer modifications
        [...cloudItems, ...localItems].forEach(item => {
            const existing = merged.get(item.id);
            if (!existing) {
                // New item
                merged.set(item.id, item);
            } else {
                // Item exists, prefer the one with more recent data or more complete data
                const existingScore = this.getItemCompleteness(existing);
                const newScore = this.getItemCompleteness(item);

                if (newScore > existingScore) {
                    merged.set(item.id, item);
                }
                // If scores are equal, keep existing (first one wins)
            }
        });

        const result = Array.from(merged.values());
        console.log('🔀 Auto-merge result:', {
            local: localItems.length,
            cloud: cloudItems.length,
            merged: result.length,
        });

        return result;
    }

    // Score item completeness to help with auto-merge decisions
    private getItemCompleteness(item: MediaItem): number {
        let score = 0;

        if (item.rating) score += 2;
        if (item.notes && item.notes.trim()) score += 2;
        if (item.completionDate) score += 1;
        if (item.startDate) score += 1;
        if (item.genres && item.genres.length > 0) score += 1;
        if (item.director && item.director.trim()) score += 1;
        if (item.platform && item.platform.trim()) score += 1;
        if (item.episodesWatched && item.totalEpisodes) score += 1;

        return score;
    }

    private async uploadToCloud(items: MediaItem[]): Promise<void> {
        const driveService = this.authService.getDriveService();
        const success = await driveService.saveData({
            mediaItems: items,
            lastModified: new Date().toISOString(),
            version: 1,
        });

        if (!success) {
            throw new Error('Failed to upload to cloud');
        }

        console.log('☁️ Upload successful, clearing local changes flag');
        this.updateLocalTimestamp();
    }

    private updateLocalTimestamp(): void {
        console.log('🕒 Updating local timestamp and clearing changes flag...');
        const timestamp = new Date().toISOString();
        localStorage.setItem('localTimestamp', timestamp);
        localStorage.setItem('lastSync', timestamp);
        localStorage.removeItem('hasLocalChanges');
        console.log('✅ Local timestamp updated, changes flag cleared');
    }

    private saveToLocalSafely(items: MediaItem[]): void {
        console.log('💾 Saving to local storage safely...');
        const timestamp = new Date().toISOString();
        localStorage.setItem('mediaItems', JSON.stringify(items));
        localStorage.setItem('localTimestamp', timestamp);
        localStorage.setItem('lastSync', timestamp);
        localStorage.removeItem('hasLocalChanges');
        console.log('✅ Saved to local storage:', items.length, 'items, changes flag cleared');
    }

    private areItemsIdentical(items1: MediaItem[], items2: MediaItem[]): boolean {
        if (items1.length !== items2.length) return false;

        const sorted1 = [...items1].sort((a, b) => a.id.localeCompare(b.id));
        const sorted2 = [...items2].sort((a, b) => a.id.localeCompare(b.id));

        return JSON.stringify(sorted1) === JSON.stringify(sorted2);
    }


}
