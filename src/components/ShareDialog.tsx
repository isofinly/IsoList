"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useGlobalToast } from "@/contexts/ToastContext";

import { useMediaStore } from "@/lib/store";
import { AuthService } from "@/lib/auth";
import { Share2, Copy, UserPlus, Trash2, RefreshCw } from "lucide-react";
import { SyncManager } from "@/lib/sync-manager";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  syncManager: SyncManager;
}

export function ShareDialog({
  isOpen,
  onClose,
  syncManager,
}: ShareDialogProps) {
  const {
    mediaItems,
    joinedUsers,
    addJoinedUser,
    removeJoinedUser,
    syncJoinedUserData,
    addSharedFileId,
    removeSharedFileId,
  } = useMediaStore();
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [joinShareId, setJoinShareId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [mySharedFiles, setMySharedFiles] = useState<
    Array<{ id: string; name: string; createdTime: string }>
  >([]);
  const [isLoadingShares, setIsLoadingShares] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const authService = AuthService.getInstance();
  const currentUser = authService.getUser();
  const { toast } = useGlobalToast();

  const createShare = async () => {
    if (!currentUser) return;

    setIsCreatingShare(true);
    try {
      // Create a separate shared file with only the data the user wants to share
      const sharedData = {
        mediaItems,
        sharedBy: currentUser.email,
        sharedAt: new Date().toISOString(),
        version: 1,
        type: "isolist-share",
      };

      const shareId = await syncManager.createShareableFile(sharedData);
      const url = `${window.location.origin}/share/${shareId}`;
      setShareUrl(url);

      // Track this shared file for automatic updates
      addSharedFileId(shareId);

      // Refresh the list of shared files
      await loadMySharedFiles();
    } catch (error) {
      console.error("Failed to create share:", error);
      toast.error(
        "Share Creation Failed",
        "Failed to create share. Please try again."
      );
    } finally {
      setIsCreatingShare(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Copied!", "Share URL copied to clipboard!");
  };

  const joinShare = async () => {
    if (!joinShareId.trim() || !currentUser) return;

    setIsJoining(true);
    try {
      // Extract file ID from URL or use directly if it's just the ID
      let fileId = joinShareId.trim();
      const urlMatch = joinShareId.match(/\/share\/([a-zA-Z0-9_-]+)/);
      if (urlMatch) {
        fileId = urlMatch[1];
      }

      // Access the shared file
      const shareData = await syncManager.accessSharedFile(fileId);

      if (!shareData.sharedBy) {
        throw new Error("Invalid share file format");
      }

      // Add to joined users
      const newUser = {
        id: fileId,
        email: shareData.sharedBy,
        shareId: fileId,
        lastSync: new Date(),
        status: "active" as const,
        mediaItems: shareData.mediaItems || [],
      };

      addJoinedUser(newUser);
      setJoinShareId("");
      toast.success(
        "Share Joined!",
        `Successfully joined ${shareData.sharedBy}'s shared lists!`
      );
    } catch (error: any) {
      console.error("Failed to join share:", error);
      if (error.status === 403 || error.status === 401) {
        toast.error(
          "Access Denied",
          "Make sure the share link is correct and you have permission."
        );
      } else if (error.status === 404) {
        toast.error("Share Not Found", "Please check the link.");
      } else {
        toast.error("Join Failed", "Failed to join share. Please try again.");
      }
    } finally {
      setIsJoining(false);
    }
  };

  const refreshUserData = async (userId: string) => {
    try {
      await syncJoinedUserData(userId, true); // true = manual sync
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  const loadMySharedFiles = async () => {
    setIsLoadingShares(true);
    try {
      const files = await syncManager.listUserSharedFiles();
      setMySharedFiles(files);

      // Add any missing files to tracking (for existing shares)
      const { getSharedFileIds } = useMediaStore.getState();
      const trackedIds = getSharedFileIds();
      files.forEach((file) => {
        if (!trackedIds.includes(file.id)) {
          addSharedFileId(file.id);
        }
      });
    } catch (error) {
      console.error("Failed to load shared files:", error);
    } finally {
      setIsLoadingShares(false);
    }
  };

  const deleteSharedFile = async (fileId: string) => {
    try {
      await syncManager.deleteSharedFile(fileId);
      setMySharedFiles((prev) => prev.filter((f) => f.id !== fileId));

      // Stop tracking this shared file
      removeSharedFileId(fileId);

      toast.success("Share Deleted", "Share deleted successfully!");
    } catch (error) {
      console.error("Failed to delete shared file:", error);
      toast.error("Delete Failed", "Failed to delete share. Please try again.");
    }
  };

  const handleDeleteClick = (fileId: string) => {
    setFileToDelete(fileId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (fileToDelete) {
      deleteSharedFile(fileToDelete);
      setFileToDelete(null);
    }
  };

  // Load shared files when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      loadMySharedFiles();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 size={20} />
            Share Your Lists
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Create New Share</h3>
            <p className="text-sm text-gray-600">
              Share read only access to your media collection including ratings,
              watchlist, and calendar data.
            </p>

            <Button
              onClick={createShare}
              disabled={isCreatingShare}
              className="w-full mt-2"
            >
              {isCreatingShare ? "Creating..." : "Create Share Link"}
            </Button>

            {shareUrl && (
              <div className="space-y-2">
                <Label>Share URL:</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly />
                  <Button
                    onClick={copyToClipboard}
                    size="icon"
                    variant="outline"
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Join Share Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <UserPlus size={18} />
              Join Someone's Share
            </h3>
            <div className="space-y-2">
              <Label className="text-sm">Share URL or ID:</Label>
              <Input
                value={joinShareId}
                onChange={(e) => setJoinShareId(e.target.value)}
                placeholder="Enter share URL or file ID"
              />
            </div>
            <Button
              onClick={joinShare}
              disabled={isJoining || !joinShareId.trim()}
              className="w-full"
            >
              {isJoining ? "Joining..." : "Join Share"}
            </Button>
          </div>

          {/* My Shared Files Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">My Shared Files</h3>
              {isLoadingShares && (
                <RefreshCw size={16} className="animate-spin text-gray-400" />
              )}
            </div>

            {mySharedFiles.length > 0 ? (
              <div className="space-y-2">
                {mySharedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">Share Link</div>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(file.createdTime).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {window.location.origin}/share/{file.id}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            `${window.location.origin}/share/${file.id}`
                          )
                        }
                        title="Copy link"
                      >
                        <Copy size={16} />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDeleteClick(file.id)}
                        title="Delete share"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No shared files yet. Create a share above to get started.
              </div>
            )}
          </div>

          {/* Joined Users Section */}
          {joinedUsers.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Joined Shares</h3>
              <div className="space-y-2">
                {joinedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{user.email}</div>
                      <div className="text-sm text-gray-500">
                        {user.lastSync
                          ? `Last synced: ${user.lastSync.toLocaleString()}`
                          : "Never synced"}
                        {user.status === "error" && " (Error)"}
                        {user.status === "unauthorized" && " (Unauthorized)"}
                      </div>
                      <div className="text-xs text-gray-400">
                        Full access to all data (read-only)
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => refreshUserData(user.id)}
                        title="Refresh data"
                      >
                        <RefreshCw size={16} />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => removeJoinedUser(user.id)}
                        title="Unfollow"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Share"
        description="Are you sure you want to delete this share? People who have joined this share will lose access."
        confirmText="Delete Share"
        cancelText="Cancel"
        variant="destructive"
      />
    </Dialog>
  );
}
