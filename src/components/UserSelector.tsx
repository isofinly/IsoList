"use client";

import { AuthService } from "@/lib/auth";
import { useMediaStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User, Users, RefreshCw } from "lucide-react";
import { useState } from "react";

interface UserSelectorProps {
  page: "ratings" | "watchlist" | "calendar" | "places";
  className?: string;
}

export function UserSelector({ page, className }: UserSelectorProps) {
  const {
    joinedUsers,
    currentViewUserId,
    setCurrentViewUser,
    syncJoinedUserData,
    refreshAllJoinedUsers,
  } = useMediaStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const authService = AuthService.getInstance();
  const currentUser = authService.getUser();

  // Filter users based on status only (no permissions needed)
  const availableUsers = joinedUsers.filter((user) => {
    return user.status === "active";
  });

  const handleUserChange = async (userId: string) => {
    if (userId === "own") {
      setCurrentViewUser(null);
    } else {
      setCurrentViewUser(userId);
      // Sync the user's data if it's been a while or if there's an error
      const user = joinedUsers.find((u) => u.id === userId);
      if (
        user &&
        (!user.lastSync ||
          Date.now() - new Date(user.lastSync).getTime() > 300000)
      ) {
        // 5 minutes
        await syncJoinedUserData(userId, true);
      }
    }
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllJoinedUsers();
    } catch (error) {
      console.error("Failed to refresh all users:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getCurrentValue = () => {
    return currentViewUserId || "own";
  };

  const getCurrentDisplayText = () => {
    if (!currentViewUserId)
      return "My " + page.charAt(0).toUpperCase() + page.slice(1);

    const user = joinedUsers.find((u) => u.id === currentViewUserId);
    return user ? user.email.split("@")[0] : currentViewUserId;
  };

  if (availableUsers.length === 0) {
    return null; // Don't show selector if no joined users have permission for this page
  }

  return (
    <div className="flex items-center gap-2">
      <Users size={16} className="text-text-muted" />
      <Select value={getCurrentValue()} onValueChange={handleUserChange}>
        <SelectTrigger className={`w-auto min-w-[140px] ${className}`}>
          <span className="truncate">{getCurrentDisplayText()}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="own">
            My {page.charAt(0).toUpperCase() + page.slice(1)}
          </SelectItem>

          {availableUsers.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <div className="flex items-center justify-between w-full">
                <span>{user.email.split("@")[0]}</span>
                {user.hasRecentUpdate && (
                  <span className="ml-2 text-xs text-green-500">•</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {joinedUsers.length > 0 && (
        <Button
          size="icon"
          variant="ghost"
          onClick={handleRefreshAll}
          disabled={isRefreshing}
          className="h-8 w-8"
          title="Refresh all shared data"
        >
          <RefreshCw
            size={14}
            className={`${isRefreshing ? "animate-spin" : ""} text-text-muted`}
          />
        </Button>
      )}
    </div>
  );
}
