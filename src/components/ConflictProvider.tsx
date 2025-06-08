"use client";

import { useMediaStore } from "@/lib/store";
import { ConflictDialog } from "./ConflictDialog";

export function ConflictProvider({ children }: { children: React.ReactNode }) {
  const { conflict, showConflictDialog, resolveConflict, setConflictDialog } = useMediaStore();

  return (
    <>
      {children}
      <ConflictDialog
        isOpen={showConflictDialog}
        conflict={conflict}
        onResolve={resolveConflict}
        onClose={() => setConflictDialog(false)}
      />
    </>
  );
}
