"use client";

import { useState, useEffect } from "react";
import { X, StickyNote, Copy, Check, Trash2, Zap, Save } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface DevScratchpadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "dev_warehouse_scratchpad_content";

export function DevScratchpadDrawer({ isOpen, onClose }: DevScratchpadDrawerProps) {
  const { showToast } = useToast();
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setContent(saved);
      }
    }
  }, []);

  const handleChange = (val: string) => {
    setContent(val);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, val);
    }
  };

  const handleClear = () => {
    setContent("");
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    showToast("Scratchpad cleared", "info");
  };

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    showToast("Copied scratchpad to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-950/40 backdrop-blur-xs animate-fade-in-scale select-none">
      <div className="w-full max-w-md h-full bg-card border-l border-border shadow-2xl flex flex-col animate-slide-in-right text-foreground">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <StickyNote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Developer Quick Scratchpad</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Ephemeral notes & code buffer</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-400 hover:text-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-4 py-2 border-b border-border bg-card flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Local Auto-Save</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1 font-semibold cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>Copy</span>
            </button>
            <button
              onClick={handleClear}
              className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-950/50">
          <textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Paste code snippets, API tokens, response JSON, or temporary terminal logs here..."
            className="w-full h-full bg-transparent resize-none focus:outline-none font-mono text-xs text-foreground leading-relaxed placeholder:text-slate-400"
          />
        </div>
      </div>
    </div>
  );
}
