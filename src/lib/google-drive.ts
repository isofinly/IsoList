import type { AuthService } from "./auth";
import type { BackupInfo } from "./sync-manager";

const FILE_NAME = "isolist-data.json";
const FOLDER_NAME = "IsoList";

export class GoogleDriveService {
  private accessToken: string | null = null;
  private authService: AuthService;
  private appFolderId: string | null = null;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async initialize(accessToken: string): Promise<void> {
    this.accessToken = accessToken;
    if (!this.appFolderId) {
      const storedFolderId = localStorage.getItem("isolist-folder-id");
      if (storedFolderId) {
        this.appFolderId = storedFolderId;
        console.log("Restored cached folder ID:", this.appFolderId);
      }
    }
  }

  private async ensureValidToken(): Promise<boolean> {
    const isValid = await this.authService.ensureValidToken();
    if (isValid) {
      const user = this.authService.getUser();
      if (user?.accessToken) {
        this.accessToken = user.accessToken;
      }
    }
    return isValid;
  }

  private async ensureAppFolder(): Promise<string | null> {
    if (this.appFolderId) {
      const isValid = await this.verifyFolderExists(this.appFolderId);
      if (isValid) {
        return this.appFolderId;
      }
      console.log("Cached folder no longer exists, clearing cache");
      this.appFolderId = null;
      localStorage.removeItem("isolist-folder-id");
    }

    if (!this.accessToken) return null;

    try {
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name,createdTime)&orderBy=createdTime`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (!searchResponse.ok) {
        throw new Error("Failed to search for folder");
      }

      const searchData = await searchResponse.json();

      if (searchData.files && searchData.files.length > 0) {
        this.appFolderId = searchData.files[0].id;
        if (this.appFolderId) {
          localStorage.setItem("isolist-folder-id", this.appFolderId);
        }

        if (searchData.files.length > 1) {
          console.warn("Multiple IsoList folders found:", searchData.files.length);
        }

        return this.appFolderId;
      }

      const createResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: FOLDER_NAME,
          mimeType: "application/vnd.google-apps.folder",
          description: "IsoList media tracking data folder",
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Failed to create folder: ${errorText}`);
      }

      const folderData = await createResponse.json();
      this.appFolderId = folderData.id;
      if (this.appFolderId) {
        localStorage.setItem("isolist-folder-id", this.appFolderId);
      }

      return this.appFolderId;
    } catch (error) {
      console.error("Failed to ensure app folder:", error);
      return null;
    }
  }

  private async verifyFolderExists(folderId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,trashed`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        return false;
      }

      const folderData = await response.json();
      return !folderData.trashed;
    } catch (error) {
      console.error("Failed to verify folder:", error);
      return false;
    }
  }

  async saveData(
    data: {
      mediaItems?: any;
      lastModified?: string;
      version?: number;
      type?: string;
      backup?: BackupInfo;
    },
    fileName = "isolist-data.json",
  ): Promise<boolean> {
    const hasValidToken = await this.ensureValidToken();
    if (!hasValidToken) {
      console.error("No valid token available for save operation");
      return false;
    }

    try {
      const folderId = await this.ensureAppFolder();
      if (!folderId) {
        throw new Error("Failed to create or find app folder");
      }

      const existingFile = await this.findDataFile();

      const jsonData = JSON.stringify(data, null, 2);

      if (existingFile) {
        const response = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              "Content-Type": "application/json",
            },
            body: jsonData,
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Failed to update file:", response.status, errorText);
          throw new Error(`Failed to update file: ${response.status} ${errorText}`);
        }
      } else {
        const metadata = {
          name: fileName,
          parents: [folderId],
          description: "IsoList media tracking data",
        };

        const form = new FormData();
        form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
        form.append("file", new Blob([jsonData], { type: "application/json" }));

        const response = await fetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
            body: form,
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Failed to create file:", response.status, errorText);
          throw new Error(`Failed to create file: ${response.status} ${errorText}`);
        }

        await response.json();
      }

      return true;
    } catch (error) {
      console.error("GoogleDrive save failed:", error);
      throw error;
    }
  }

  // TODO: Type this method
  async loadData(): Promise<any | null> {
    const hasValidToken = await this.ensureValidToken();
    if (!hasValidToken) {
      console.error("No valid token available for load operation");
      return null;
    }

    try {
      const file = await this.findDataFile();
      if (!file) {
        console.log("No data file found in IsoList folder");
        return null;
      }

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const text = await response.text();
      const data = JSON.parse(text);

      return data;
    } catch (error) {
      console.error("Failed to load from Google Drive folder:", error);
      return null;
    }
  }

  private async findDataFile(): Promise<{ id: string; name: string; modifiedTime: string } | null> {
    const hasValidToken = await this.ensureValidToken();
    if (!hasValidToken) {
      console.log("No valid token for file search");
      return null;
    }

    try {
      const folderId = await this.ensureAppFolder();
      if (!folderId) {
        console.log("No app folder found");
        return null;
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${FILE_NAME}' and '${folderId}' in parents and trashed=false&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Search failed:", response.status, errorText);
        throw new Error("Failed to search files in folder");
      }

      const data = await response.json();
      return data.files?.[0] || null;
    } catch (error) {
      console.error("Failed to find data file in folder:", error);
      return null;
    }
  }

  async getFolderInfo(): Promise<{ id: string; name: string; webViewLink: string } | null> {
    try {
      const folderId = await this.ensureAppFolder();
      if (!folderId) return null;

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,webViewLink`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (!response.ok) return null;

      const folderData = await response.json();
      return {
        id: folderData.id,
        name: folderData.name,
        webViewLink: folderData.webViewLink,
      };
    } catch (error) {
      console.error("Failed to get folder info:", error);
      return null;
    }
  }

  async getFileInfo(): Promise<{ lastModified: Date; size: number } | null> {
    const hasValidToken = await this.ensureValidToken();
    if (!hasValidToken) return null;

    try {
      const file = await this.findDataFile();
      if (!file) return null;

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?fields=modifiedTime,size`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (!response.ok) return null;

      const fileInfo = await response.json();
      return {
        lastModified: new Date(fileInfo.modifiedTime),
        size: Number.parseInt(fileInfo.size || "0"),
      };
    } catch (error) {
      console.error("Failed to get file info:", error);
      return null;
    }
  }

  async getLastModified(): Promise<Date | null> {
    const hasValidToken = await this.ensureValidToken();
    if (!hasValidToken) return null;

    try {
      const file = await this.findDataFile();
      if (!file?.modifiedTime) return null;

      return new Date(file.modifiedTime);
    } catch (error) {
      console.error("Failed to get last modified time:", error);
      return null;
    }
  }

  async isCloudDataNewer(localTimestamp: string): Promise<boolean> {
    const hasValidToken = await this.ensureValidToken();
    if (!hasValidToken) return false;

    try {
      const fileInfo = await this.getFileInfo();
      if (!fileInfo) return false;

      const cloudTime = fileInfo.lastModified.getTime();
      const localTime = new Date(localTimestamp).getTime();

      return cloudTime > localTime;
    } catch (error) {
      console.error("Failed to compare timestamps:", error);
      return false;
    }
  }

  async findAllIsoListFolders(): Promise<
    Array<{ id: string; name: string; createdTime: string; webViewLink: string }>
  > {
    const hasValidToken = await this.ensureValidToken();
    if (!hasValidToken) return [];

    try {
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name,createdTime,webViewLink)&orderBy=createdTime`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (!searchResponse.ok) {
        throw new Error("Failed to search for folders");
      }

      const searchData = await searchResponse.json();
      return searchData.files || [];
    } catch (error) {
      console.error("Failed to find all IsoList folders:", error);
      return [];
    }
  }

  clearCachedFolderId(): void {
    this.appFolderId = null;
    localStorage.removeItem("isolist-folder-id");
    console.log("Cleared cached folder ID");
  }

  // Sharing functionality
  async makeFilePublic(fileId: string): Promise<void> {
    const hasValidToken = await this.ensureValidToken();
    if (!hasValidToken) {
      throw new Error("No valid token available");
    }

    try {
      // Set permissions to allow anyone with the link to read
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: "reader",
            type: "anyone",
            allowFileDiscovery: false, // File won't appear in search results
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to make file public: ${response.status} ${errorText}`);
      }

      // Verify the permission was set correctly
      const permissionResult = await response.json();
      console.log("File made public with permission ID:", permissionResult.id);

    } catch (error) {
      console.error("Failed to make file public:", error);
      throw error;
    }
  }

  async loadSharedData(fileId: string): Promise<any> {
    const hasValidToken = await this.ensureValidToken();
    if (!hasValidToken) {
      // Still try public access even if not authenticated
      console.log("Not authenticated, trying public proxy...");
    }

    try {
      // Method 1: Try to access the file with authentication first.
      // This works if the user has direct access to the file.
      let response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const text = await response.text();
        return JSON.parse(text);
      }

      if (response.status === 404 || response.status === 403) {
        // Method 2: If authenticated access fails with 403/404,
        // it's likely a public file we don't have direct permission for.
        // Use our server-side proxy to bypass CORS.
        console.log(
          "Authenticated access failed, trying server-side proxy..."
        );
        const proxyResponse = await fetch(`/api/share/proxy?fileId=${fileId}`);

        if (!proxyResponse.ok) {
          const errorData = await proxyResponse.json();
          const errorMessage = proxyResponse.status === 404
            ? "File not found (may have been deleted by owner)"
            : (errorData.error || `Proxy request failed with status: ${proxyResponse.status}`);

          const error = new Error(errorMessage);
          (error as any).status = proxyResponse.status;
          throw error;
        }

        return await proxyResponse.json();

      } else {
        // Handle other API errors
        const errorMessage = response.status === 404
          ? "File not found (may have been deleted by owner)"
          : `Google Drive API error: ${response.status}`;

        const error = new Error(errorMessage);
        (error as any).status = response.status;
        throw error;
      }
    } catch (error: any) {
      console.error("Failed to load shared data:", error);

      const err = new Error(`Failed to load shared data: ${error.message}`);
      (err as any).status = error.status || 500;
      throw err;
    }
  }

  async saveDataWithFileId(
    data: {
      mediaItems?: any;
      lastModified?: string;
      version?: number;
      type?: string;
      backup?: BackupInfo;
    },
    fileName = "isolist-data.json",
  ): Promise<string> {
    const hasValidToken = await this.ensureValidToken();
    if (!hasValidToken) {
      throw new Error("No valid token available for save operation");
    }

    try {
      const folderId = await this.ensureAppFolder();
      if (!folderId) {
        throw new Error("Failed to create or find app folder");
      }

      const jsonData = JSON.stringify(data, null, 2);

      // For share files, always create a new file instead of updating existing ones
      if (fileName.includes('share') || data.type === 'isolist-share') {
        const metadata = {
          name: fileName,
          parents: [folderId],
          description: "IsoList shared data",
        };

        const form = new FormData();
        form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
        form.append("file", new Blob([jsonData], { type: "application/json" }));

        const response = await fetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
            body: form,
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create share file: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        return result.id;
      }

      // For main data files, check if existing file should be updated
      const existingFile = await this.findDataFile();

      if (existingFile) {
        const response = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              "Content-Type": "application/json",
            },
            body: jsonData,
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update file: ${response.status} ${errorText}`);
        }

        return existingFile.id;
      } else {
        const metadata = {
          name: fileName,
          parents: [folderId],
          description: "IsoList media tracking data",
        };

        const form = new FormData();
        form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
        form.append("file", new Blob([jsonData], { type: "application/json" }));

        const response = await fetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
            body: form,
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create file: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        return result.id;
      }
    } catch (error) {
      console.error("GoogleDrive save failed:", error);
      throw error;
    }
  }

  // Method to delete a specific file
  async deleteFile(fileId: string): Promise<boolean> {
    const hasValidToken = await this.ensureValidToken();
    if (!hasValidToken) {
      throw new Error("No valid token available");
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete file: ${response.status} ${errorText}`);
      }

      return true;
    } catch (error) {
      console.error("Failed to delete file:", error);
      throw error;
    }
  }

  // Method to list files created by the user (for managing shares)
  async listUserFiles(): Promise<Array<{ id: string, name: string, createdTime: string }>> {
    const hasValidToken = await this.ensureValidToken();
    if (!hasValidToken) {
      throw new Error("No valid token available");
    }

    try {
      const folderId = await this.ensureAppFolder();
      if (!folderId) {
        throw new Error("Failed to find app folder");
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false and name contains 'isolist-share'&fields=files(id,name,createdTime)&orderBy=createdTime desc`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to list files: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error("Failed to list user files:", error);
      throw error;
    }
  }

  // Method to update a file by ID directly (for updating shared files)
  async updateFileById(fileId: string, data: any): Promise<boolean> {
    const hasValidToken = await this.ensureValidToken();
    if (!hasValidToken) {
      throw new Error("No valid token available");
    }

    try {
      const jsonData = JSON.stringify(data, null, 2);

      const response = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: jsonData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update file: ${response.status} ${errorText}`);
      }

      return true;
    } catch (error) {
      console.error("Failed to update file by ID:", error);
      throw error;
    }
  }
}
