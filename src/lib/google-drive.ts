const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const FILE_NAME = 'isolist-data.json';

export class GoogleDriveService {
  private accessToken: string | null = null;

  async initialize(accessToken: string): Promise<void> {
    this.accessToken = accessToken;
  }

  async saveData(data: any, fileName: string = 'isolist-data.json'): Promise<boolean> {
    console.log('☁️ GoogleDrive: Starting save operation...');

    if (!this.accessToken) {
      console.error('❌ GoogleDrive: No access token available');
      throw new Error('Drive service not initialized');
    }

    try {
      // Check if file exists
      console.log('🔍 Checking for existing file...');
      const existingFile = await this.findDataFile(fileName);

      const jsonData = JSON.stringify(data, null, 2);
      console.log('📦 Data to save:', {
        size: jsonData.length,
        itemCount: data.mediaItems?.length || 0,
        hasExistingFile: !!existingFile
      });

      if (existingFile) {
        console.log('📝 Updating existing file:', existingFile.id);

        // Update existing file using simple upload
        const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: jsonData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Failed to update file:', response.status, errorText);
          throw new Error(`Failed to update file: ${response.status} ${errorText}`);
        }

        console.log('✅ File updated successfully');
      } else {
        console.log('📁 Creating new file...');

        // Create new file WITHOUT specifying parents (no appDataFolder)
        const metadata = {
          name: fileName,
          description: 'IsoList media tracking data',
          // Remove parents array completely to store in root Drive folder
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([jsonData], { type: 'application/json' }));

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: form,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Failed to create file:', response.status, errorText);
          throw new Error(`Failed to create file: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ File created successfully:', result.id);
      }

      console.log('🎉 Data saved to Google Drive successfully');
      return true;
    } catch (error) {
      console.error('💥 GoogleDrive save failed:', error);
      throw error;
    }
  }

  // Update the search query to look in root folder instead of appDataFolder
  private async findDataFile(fileName: string): Promise<{ id: string; name: string; modifiedTime: string } | null> {
    if (!this.accessToken) return null;

    try {
      // Search for files created by this app (no parent folder restriction)
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Search failed:', response.status, errorText);
        throw new Error('Failed to search files');
      }

      const data = await response.json();
      console.log('🔍 Search results:', data.files?.length || 0, 'files found');
      return data.files?.[0] || null;
    } catch (error) {
      console.error('Failed to find data file:', error);
      return null;
    }
  }

  async loadData(fileName?: string): Promise<any | null> {
    if (!this.accessToken) throw new Error('Drive service not initialized');

    try {
      const file = await this.findDataFile(fileName || FILE_NAME);
      if (!file) {
        console.log('📂 No data file found in Google Drive');
        return null;
      }

      console.log('⬇️ Downloading data from Google Drive...');

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const text = await response.text();
      const data = JSON.parse(text);

      console.log('✅ Data loaded from Google Drive:', {
        itemCount: data.mediaItems?.length || 0,
        lastModified: data.lastModified,
        version: data.version,
      });

      return data;
    } catch (error) {
      console.error('❌ Failed to load from Google Drive:', error);
      return null;
    }
  }

  async getFileInfo(fileName?: string): Promise<{ lastModified: Date; size: number } | null> {
    if (!this.accessToken) return null;

    try {
      const file = await this.findDataFile(fileName || FILE_NAME);
      if (!file) return null;

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?fields=modifiedTime,size`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) return null;

      const fileInfo = await response.json();
      return {
        lastModified: new Date(fileInfo.modifiedTime),
        size: parseInt(fileInfo.size || '0'),
      };
    } catch (error) {
      console.error('Failed to get file info:', error);
      return null;
    }
  }

  async getLastModified(fileName?: string): Promise<Date | null> {
    try {
      const file = await this.findDataFile(fileName || FILE_NAME);
      if (!file?.modifiedTime) return null;

      return new Date(file.modifiedTime);
    } catch (error) {
      console.error('Failed to get last modified time:', error);
      return null;
    }
  }

  async isCloudDataNewer(localTimestamp: string, fileName?: string): Promise<boolean> {
    try {
      const fileInfo = await this.getFileInfo(fileName);
      if (!fileInfo) return false;

      const cloudTime = fileInfo.lastModified.getTime();
      const localTime = new Date(localTimestamp).getTime();

      return cloudTime > localTime;
    } catch (error) {
      console.error('Failed to compare timestamps:', error);
      return false;
    }
  }
}
