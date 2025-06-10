"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, Info, Trash2 } from "lucide-react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning";
  icon?: React.ReactNode;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  icon,
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case "destructive":
        return <Trash2 className="h-6 w-6 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-warning" />;
      default:
        return <Info className="h-6 w-6 text-info" />;
    }
  };

  const getButtonStyles = () => {
    switch (variant) {
      case "destructive":
        return {
          confirm: cn(
            "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium",
            "bg-destructive text-text-on-destructive",
            "hover:bg-destructive-hover",
            "focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2",
            "transition-all duration-short ease-fluent-standard",
            "reveal-hover"
          ),
          cancel: cn(
            "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium",
            "border border-border-subtle bg-bg-layer-1 text-text-primary",
            "hover:bg-bg-layer-2 hover:border-border-interactive",
            "focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2",
            "transition-all duration-short ease-fluent-standard",
            "reveal-hover"
          ),
        };
      case "warning":
        return {
          confirm: cn(
            "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium",
            "bg-warning text-black",
            "hover:bg-warning/90",
            "focus:outline-none focus:ring-2 focus:ring-warning focus:ring-offset-2",
            "transition-all duration-short ease-fluent-standard",
            "reveal-hover"
          ),
          cancel: cn(
            "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium",
            "border border-border-subtle bg-bg-layer-1 text-text-primary",
            "hover:bg-bg-layer-2 hover:border-border-interactive",
            "focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2",
            "transition-all duration-short ease-fluent-standard",
            "reveal-hover"
          ),
        };
      default:
        return {
          confirm: cn(
            "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium",
            "bg-accent-primary text-text-on-accent",
            "hover:bg-accent-primary-hover",
            "focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2",
            "transition-all duration-short ease-fluent-standard",
            "reveal-hover"
          ),
          cancel: cn(
            "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium",
            "border border-border-subtle bg-bg-layer-1 text-text-primary",
            "hover:bg-bg-layer-2 hover:border-border-interactive",
            "focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2",
            "transition-all duration-short ease-fluent-standard",
            "reveal-hover"
          ),
        };
    }
  };

  const buttonStyles = getButtonStyles();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-left">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">{icon || getDefaultIcon()}</div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold text-text-primary">
                {title}
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-text-secondary leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleCancel}
            className={buttonStyles.cancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={buttonStyles.confirm}
          >
            {confirmText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
