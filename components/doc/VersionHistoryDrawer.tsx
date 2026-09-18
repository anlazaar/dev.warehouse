"use client";

import { useState, useEffect } from "react";
import { History, X, RotateCcw, Loader2, Clock, FileText } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface VersionItem {
  title: string;
  textContent: string;
  createdAt: string;
}

interface VersionHistoryDrawerProps {
  pageId: string;
  isOpen: boolean;
  onClose: () => void;
  onVersionRestored: (newTitle: string, newContent: string) => void;
}

export function VersionHistoryDrawer({
  pageId,
  isOpen,
  onClose,
  onVersionRestored,
}: VersionHistoryDrawerProps) {
  const { showToast } = useToast();
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [restoringIdx, setRestoringIdx] = useState<number | null>(null);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/versions`);
      if (!res.ok) throw new Error("Failed to fetch note versions");
      const data = await res.json();
      setVersions(data.versions || []);
      if (data.versions && data.versions.length > 0) {
        setSelectedIdx(0);
      }
    } catch (err) {
      console.error("Fetch versions error:", err);
      showToast("Failed to fetch version history", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && pageId) {
      fetchVersions();
    }
  }, [isOpen, pageId]);

  const handleRestore = async (index: number) => {
    if (!confirm("Restore this previous version? Your current state will be saved into history.")) return;
    setRestoringIdx(index);
    try {
      const res = await fetch(`/api/pages/${pageId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionIndex: index }),
      });

      if (!res.ok) throw new Error("Failed to restore version");

      const data = await res.json();
      showToast("Previous version restored", "success");
      onVersionRestored(data.page.title, data.page.textContent);
      onClose();
    } catch (err) {
      console.error("Restore version error:", err);
      showToast("Failed to restore version", "error");
    } finally {
      setRestoringIdx(null);
    }
  };

  if (!isOpen) return null;

  const selectedVersion = selectedIdx !== null ? versions[selectedIdx] : null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col text-foreground select-none animate-slide-in-right">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Note Version History</h2>
            <p className="text-[11px] text-muted-foreground">Snapshot revisions recorded during edits</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Drawer Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Revision List */}
        <div className="w-1/3 border-r border-border overflow-y-auto p-2 space-y-1 bg-muted/20">
          {loading ? (
            <div className="py-8 flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            </div>
          ) : versions.length === 0 ? (
            <div className="py-8 px-2 text-center text-xs text-muted-foreground">
              No previous revisions saved yet.
            </div>
          ) : (
            versions.map((ver, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    isSelected ? "bg-indigo-500/15 text-indigo-500 font-bold border border-indigo-500/30" : "hover:bg-muted text-foreground font-medium"
                  }`}
                >
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(ver.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="truncate text-xs font-semibold">{ver.title || "Untitled"}</p>
                </button>
              );
            })
          )}
        </div>

        {/* Snapshot Content Preview */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-background">
          {selectedVersion ? (
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold text-foreground">{selectedVersion.title}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {new Date(selectedVersion.createdAt).toLocaleString()}
                  </span>
                </div>
                <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-muted-foreground max-h-[400px] overflow-y-auto p-3 rounded-xl bg-muted/40 border border-border">
                  {selectedVersion.textContent || "(Empty content)"}
                </pre>
              </div>

              <button
                onClick={() => selectedIdx !== null && handleRestore(selectedIdx)}
                disabled={restoringIdx !== null}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {restoringIdx === selectedIdx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                <span>Restore This Revision</span>
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <FileText className="w-8 h-8 opacity-30" />
              <p className="text-xs">Select a revision from the left list to preview and restore</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
