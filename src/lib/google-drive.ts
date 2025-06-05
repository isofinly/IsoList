const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const FILE_NAME = 'isolist-data.json';

export class GoogleDriveService {
  private accessToken: string | null = null;

  async initialize(accessToken: string): Promise<void> {
    this.accessToken = accessToken;
  }

  async saveData(data: any): Promise<boolean> {
    if (!this.accessToken) throw new Error('Drive service not initialized');

    try {
      // Check if file exists
      const existingFile = await this.findDataFile();

      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });

      if (existingFile) {
        // Update existing file
        const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: blob,
        });

        if (!response.ok) throw new Error('Failed to update file');
      } else {
        // Create new file
        const metadata = {
          name: FILE_NAME,
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', blob);

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: form,
        });

        if (!response.ok) throw new Error('Failed to create file');
      }

      console.log('✅ Data synced to Google Drive');
      return true;
    } catch (error) {
      console.error('❌ Failed to save to Google Drive:', error);
      return false;
    }
  }

  async loadData(): Promise<any | null> {
    if (!this.accessToken) throw new Error('Drive service not initialized');

    try {
      const file = await this.findDataFile();
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

  async getFileInfo(): Promise<{ lastModified: Date; size: number } | null> {
    if (!this.accessToken) return null;

    try {
      const file = await this.findDataFile();
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

  private async findDataFile(): Promise<{ id: string; name: string; modifiedTime: string } | null> {
    if (!this.accessToken) return null;

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${FILE_NAME}' and trashed=false&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to search files');

      const data = await response.json();
      return data.files?.[0] || null;
    } catch (error) {
      console.error('Failed to find data file:', error);
      return null;
    }
  }

  async getLastModified(): Promise<Date | null> {
    try {
      const file = await this.findDataFile();
      if (!file?.modifiedTime) return null;

      return new Date(file.modifiedTime);
    } catch (error) {
      console.error('Failed to get last modified time:', error);
      return null;
    }
  }

  async isCloudDataNewer(localTimestamp: string): Promise<boolean> {
    try {
      const fileInfo = await this.getFileInfo();
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
