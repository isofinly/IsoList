// src/components/ConflictProvider.tsx
"use client";

import { ConflictDialog } from "./ConflictDialog";
import { useMediaStore } from "@/lib/store";

export function ConflictProvider({ children }: { children: React.ReactNode }) {
  const { conflict, showConflictDialog, resolveConflict, setConflictDialog } =
    useMediaStore();

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
