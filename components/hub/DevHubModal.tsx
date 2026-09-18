"use client";

import { DevHub } from "./DevHub";
import { X } from "lucide-react";

interface DevHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DevHubModal({ isOpen, onClose }: DevHubModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in-scale select-none">
      <div className="w-full max-w-5xl h-[90dvh] max-h-[90dvh] bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-muted/80 hover:bg-muted text-slate-400 hover:text-foreground transition-colors cursor-pointer"
          title="Close Developer Hub"
        >
          <X className="w-4 h-4" />
        </button>

        <DevHub />
      </div>
    </div>
  );
}
