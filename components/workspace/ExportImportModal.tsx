"use client";

import { useState, ChangeEvent, DragEvent } from "react";
import { Download, Upload, Database, X, Check, Loader2, AlertCircle, ShieldCheck, FileJson } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshWorkspace: () => void;
}

export function ExportImportModal({
  isOpen,
  onClose,
  onRefreshWorkspace,
}: ExportImportModalProps) {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error("Failed to export workspace");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dev-warehouse-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setMessage({ type: "success", text: "Workspace backup exported successfully!" });
      showToast("Workspace backup JSON downloaded", "success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage({ type: "error", text: err.message });
      } else {
        setMessage({ type: "error", text: "Failed to export workspace" });
      }
      showToast("Export failed", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const processFile = async (file: File) => {
    setIsImporting(true);
    setMessage(null);

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setMessage({
        type: "success",
        text: data.message || "Data imported successfully!",
      });

      showToast("Workspace backup imported successfully", "success");
      onRefreshWorkspace();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage({ type: "error", text: err.message });
      } else {
        setMessage({ type: "error", text: "Invalid file format or import failure" });
      }
      showToast("Import failed", "error");
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-scale select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-2xl brand-gradient-bg text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              Backup & Data Portability
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Full workspace JSON backup & Excalidraw file restoration
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500"
                : "bg-red-500/10 border-red-500/25 text-red-500"
            }`}
          >
            {message.type === "success" ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Drag & Drop Target Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`mb-4 p-6 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-2 ${
            isDragOver
              ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
              : "border-border/80 bg-background/50 hover:border-indigo-500/50"
          }`}
        >
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <FileJson className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-foreground">
            Drag & Drop JSON Backup or `.excalidraw` file here
          </p>
          <p className="text-[11px] text-slate-500 font-medium">or select a file manually</p>

          <label className="mt-2 px-4 py-2 rounded-xl brand-gradient-bg text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/20 hover:opacity-90 active:scale-95 transition-all">
            {isImporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>Select File to Restore</span>
            <input
              type="file"
              accept=".json,.excalidraw"
              onChange={handleImportFile}
              disabled={isImporting}
              className="hidden"
            />
          </label>
        </div>

        {/* Export Action */}
        <div className="p-4 rounded-2xl border border-border bg-background/60 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-foreground">
              Export Complete Workspace
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Download JSON archive of all canvases, notes, and folders.
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-card hover:bg-slate-200 dark:hover:bg-slate-800 border border-border text-foreground font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-xs active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            ) : (
              <Download className="w-3.5 h-3.5 text-indigo-500" />
            )}
            <span>Export JSON</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-border/60 text-center">
          <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero Lock-in &bull; Self-hosted JSON data format</span>
          </p>
        </div>
      </div>
    </div>
  );
}
