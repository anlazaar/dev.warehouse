"use client";

import { useState, FormEvent } from "react";
import { X, AlertTriangle, Loader2, FolderPlus, Edit3, Trash2 } from "lucide-react";

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialValue?: string;
  onSave: (name: string) => Promise<void>;
  placeholder?: string;
}

export function ItemDialog({
  isOpen,
  onClose,
  title,
  initialValue = "",
  onSave,
  placeholder = "Enter name...",
}: ItemDialogProps) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    setIsLoading(true);
    try {
      await onSave(value.trim());
      onClose();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-scale"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl p-6 relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Edit3 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-semibold focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-border text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !value.trim()}
              className="px-4 py-2 rounded-xl brand-gradient-bg brand-gradient-bg-hover text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
}

export function ConfirmDeleteDialog({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-scale"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl p-6 relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed font-medium">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-border text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
}



interface MovePageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pageName: string;
  folders: { _id: string; name: string }[];
  onConfirm: (folderId: string | null) => Promise<void>;
}

export function MovePageDialog({
  isOpen,
  onClose,
  pageName,
  folders,
  onConfirm,
}: MovePageDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>("root");
  const [isLoadingDialog, setIsLoadingDialog] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoadingDialog(true);
    try {
      await onConfirm(selectedFolderId === "root" ? null : selectedFolderId);
      onClose();
    } catch (err) {
      console.error("Move error:", err);
    } finally {
      setIsLoadingDialog(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-scale"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl p-6 relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shrink-0">
            <FolderPlus className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Move "{pageName}"</h3>
        </div>

        <div className="mb-6 space-y-3">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            To Folder:
          </label>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            <div
              className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-colors flex items-center gap-2 ${
                selectedFolderId === "root"
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground"
              }`}
              onClick={() => setSelectedFolderId("root")}
            >
              Workspace Root
            </div>
            {folders.map((f) => (
              <div
                key={f._id}
                className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-colors flex items-center gap-2 ${
                  selectedFolderId === f._id
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground"
                }`}
                onClick={() => setSelectedFolderId(f._id)}
              >
                {f.name}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-border text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoadingDialog}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoadingDialog && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Move</span>
          </button>
        </div>
      </div>
    </div>
  );
}
