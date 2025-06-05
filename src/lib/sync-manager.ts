import { MediaItem } from './types';
import { AuthService } from './auth';

export interface SyncConflict {
    type: 'local-empty' | 'cloud-empty' | 'both-have-data' | 'different-data';
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

    // Detect conflicts between local and cloud data
    async detectConflict(localItems: MediaItem[]): Promise<SyncConflict | null> {
        if (!this.authService.isAuthenticated()) return null;

        try {
            const driveService = this.authService.getDriveService();
            const cloudData = await driveService.loadData();

            const localTimestamp = localStorage.getItem('localTimestamp') || '';
            const localCount = localItems.length;
            const cloudItems = cloudData?.mediaItems || [];
            const cloudCount = cloudItems.length;
            const cloudTimestamp = cloudData?.lastModified || '';

            const conflict: SyncConflict = {
                type: this.determineConflictType(localCount, cloudCount, localItems, cloudItems),
                local: {
                    items: localItems,
                    count: localCount,
                    timestamp: localTimestamp,
                },
                cloud: {
                    items: cloudItems,
                    count: cloudCount,
                    timestamp: cloudTimestamp,
                },
            };

            // Only return conflict if it's significant
            if (conflict.type === 'local-empty' && cloudCount > 0) return conflict;
            if (conflict.type === 'cloud-empty' && localCount > 0) return conflict;
            if (conflict.type === 'both-have-data' && this.hasSignificantDifference(localItems, cloudItems)) return conflict;
            if (conflict.type === 'different-data') return conflict;

            return null;
        } catch (error) {
            console.error('Failed to detect conflict:', error);
            return null;
        }
    }

    private determineConflictType(localCount: number, cloudCount: number, localItems: MediaItem[], cloudItems: MediaItem[]): SyncConflict['type'] {
        if (localCount === 0 && cloudCount > 0) return 'local-empty';
        if (cloudCount === 0 && localCount > 0) return 'cloud-empty';
        if (localCount > 0 && cloudCount > 0) {
            if (this.areItemsIdentical(localItems, cloudItems)) return 'both-have-data';
            return 'different-data';
        }
        return 'both-have-data';
    }

    private hasSignificantDifference(localItems: MediaItem[], cloudItems: MediaItem[]): boolean {
        const threshold = 0.3; // 30% difference is significant
        const maxCount = Math.max(localItems.length, cloudItems.length);
        const difference = Math.abs(localItems.length - cloudItems.length);

        return difference / maxCount > threshold;
    }

    private areItemsIdentical(items1: MediaItem[], items2: MediaItem[]): boolean {
        if (items1.length !== items2.length) return false;

        const sorted1 = [...items1].sort((a, b) => a.id.localeCompare(b.id));
        const sorted2 = [...items2].sort((a, b) => a.id.localeCompare(b.id));

        return JSON.stringify(sorted1) === JSON.stringify(sorted2);
    }

    // Safe sync with conflict resolution
    async safeSyncWithUserChoice(localItems: MediaItem[], userChoice: 'local' | 'cloud' | 'merge' | 'cancel'): Promise<MediaItem[]> {
        console.log('🔧 SyncManager: safeSyncWithUserChoice called with:', userChoice);

        if (userChoice === 'cancel') {
            console.log('❌ User cancelled sync');
            return localItems;
        }

        const conflict = await this.detectConflict(localItems);
        console.log('🔍 Conflict detection result:', conflict?.type);

        if (!conflict) {
            console.log('ℹ️ No conflict detected, returning local items');
            return localItems;
        }

        // Create backup before any changes
        try {
            console.log('💾 Creating backup before sync...');
            await this.createBackup(conflict.cloud.items, `Before sync - user chose ${userChoice}`);
            console.log('✅ Backup created successfully');
        } catch (error) {
            console.warn('⚠️ Failed to create backup:', error);
            // Continue anyway - backup failure shouldn't stop sync
        }

        const driveService = this.authService.getDriveService();
        if (!driveService) {
            throw new Error('Google Drive service not available');
        }

        switch (userChoice) {
            case 'local':
                console.log('⬆️ Using local data, uploading to cloud...');

                try {
                    const success = await driveService.saveData({
                        mediaItems: localItems,
                        lastModified: new Date().toISOString(),
                        version: 1,
                    });

                    if (!success) {
                        throw new Error('Failed to upload to Google Drive');
                    }

                    console.log('✅ Local data uploaded to cloud successfully');
                    this.updateLocalTimestamp();
                    return localItems;
                } catch (error) {
                    console.error('❌ Failed to upload local data:', error);
                    throw new Error(`Failed to upload to Google Drive: ${error}`);
                }

            case 'cloud':
                console.log('⬇️ Using cloud data, updating local...');

                try {
                    this.saveToLocalSafely(conflict.cloud.items);
                    console.log('✅ Cloud data saved to local successfully');
                    return conflict.cloud.items;
                } catch (error) {
                    console.error('❌ Failed to save cloud data locally:', error);
                    throw new Error(`Failed to save cloud data: ${error}`);
                }

            case 'merge':
                console.log('🔀 Merging local and cloud data...');

                try {
                    const merged = this.mergeItems(conflict.local.items, conflict.cloud.items);
                    console.log('📊 Merged data:', {
                        local: conflict.local.items.length,
                        cloud: conflict.cloud.items.length,
                        merged: merged.length
                    });

                    const success = await driveService.saveData({
                        mediaItems: merged,
                        lastModified: new Date().toISOString(),
                        version: 1,
                    });

                    if (!success) {
                        throw new Error('Failed to upload merged data to Google Drive');
                    }

                    this.saveToLocalSafely(merged);
                    console.log('✅ Merged data saved successfully');
                    return merged;
                } catch (error) {
                    console.error('❌ Failed to merge data:', error);
                    throw new Error(`Failed to merge data: ${error}`);
                }

            default:
                throw new Error('Invalid user choice: ' + userChoice);
        }
    }

    private mergeItems(localItems: MediaItem[], cloudItems: MediaItem[]): MediaItem[] {
        const merged = new Map<string, MediaItem>();

        // Add all items, preferring local changes for duplicates
        cloudItems.forEach(item => merged.set(item.id, item));
        localItems.forEach(item => merged.set(item.id, item));

        return Array.from(merged.values());
    }

    private updateLocalTimestamp(): void {
        console.log('🕒 Updating local timestamp...');
        const timestamp = new Date().toISOString();
        localStorage.setItem('localTimestamp', timestamp);
        localStorage.setItem('lastSync', timestamp);
        localStorage.removeItem('hasLocalChanges');
        console.log('✅ Local timestamp updated:', timestamp);
    }

    private saveToLocalSafely(items: MediaItem[]): void {
        console.log('💾 Saving to local storage safely...');
        const timestamp = new Date().toISOString();
        localStorage.setItem('mediaItems', JSON.stringify(items));
        localStorage.setItem('localTimestamp', timestamp);
        localStorage.setItem('lastSync', timestamp);
        localStorage.removeItem('hasLocalChanges');
        console.log('✅ Saved to local storage:', items.length, 'items');
    }
}
