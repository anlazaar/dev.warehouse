"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  X,
  RotateCcw,
  Loader2,
  AlertTriangle,
  FolderKanban,
  FileText,
  Code2,
  BookOpen,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface TrashItem {
  id: string;
  title: string;
  itemType: "page" | "snippet" | "cheatsheet" | "project";
  subType?: string;
  updatedAt: string;
}

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemRestored?: () => void;
}

export function TrashModal({ isOpen, onClose, onItemRestored }: TrashModalProps) {
  const { showToast } = useToast();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isEmptying, setIsEmptying] = useState(false);

  const fetchTrashItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trash");
      if (!res.ok) throw new Error("Failed to load trash");
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error("Trash fetch error:", err);
      showToast("Failed to load trash items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTrashItems();
    }
  }, [isOpen]);

  const handleRestore = async (id: string, itemType: string) => {
    setProcessingId(id);
    try {
      const res = await fetch("/api/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", id, itemType }),
      });
      if (!res.ok) throw new Error("Failed to restore item");
      setItems((prev) => prev.filter((item) => item.id !== id));
      showToast("Item restored successfully", "success");
      onItemRestored?.();
    } catch (err) {
      showToast("Failed to restore item", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeletePermanent = async (id: string, itemType: string) => {
    if (!confirm("Are you sure? This item will be permanently deleted!")) return;
    setProcessingId(id);
    try {
      const res = await fetch("/api/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id, itemType }),
      });
      if (!res.ok) throw new Error("Failed to delete item permanently");
      setItems((prev) => prev.filter((item) => item.id !== id));
      showToast("Item permanently deleted", "info");
    } catch (err) {
      showToast("Failed to delete item", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm("Empty entire Trash? All items in Trash will be permanently deleted!")) return;
    setIsEmptying(true);
    try {
      const res = await fetch("/api/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "empty" }),
      });
      if (!res.ok) throw new Error("Failed to empty trash");
      setItems([]);
      showToast("Trash emptied completely", "info");
      onItemRestored?.();
    } catch (err) {
      showToast("Failed to empty trash", "error");
    } finally {
      setIsEmptying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in-scale select-none">
      <div className="bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90dvh] flex flex-col overflow-hidden text-foreground">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Trash & Recovery</h2>
              <p className="text-xs text-muted-foreground">
                Restore soft-deleted items or permanently remove them from your workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                disabled={isEmptying}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isEmptying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Empty Trash</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <p className="text-xs font-medium">Loading trash items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Trash2 className="w-8 h-8 opacity-40" />
              <p className="text-sm font-semibold">Trash is empty</p>
              <p className="text-xs text-muted-foreground">Deleted notes, snippets, or projects will appear here</p>
            </div>
          ) : (
            items.map((item) => {
              const isProcessing = processingId === item.id;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-indigo-500/30 transition-all text-xs"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-2 rounded-lg bg-muted text-indigo-500 shrink-0">
                      {item.itemType === "page" ? (
                        <FileText className="w-4 h-4" />
                      ) : item.itemType === "snippet" ? (
                        <Code2 className="w-4 h-4" />
                      ) : item.itemType === "cheatsheet" ? (
                        <BookOpen className="w-4 h-4" />
                      ) : (
                        <FolderKanban className="w-4 h-4" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-foreground truncate">{item.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="capitalize">{item.itemType}</span>
                        {item.subType && (
                          <>
                            <span>&bull;</span>
                            <span>{item.subType}</span>
                          </>
                        )}
                        <span>&bull;</span>
                        <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleRestore(item.id, item.itemType)}
                      disabled={isProcessing}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                      title="Restore Item"
                    >
                      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => handleDeletePermanent(item.id, item.itemType)}
                      disabled={isProcessing}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
