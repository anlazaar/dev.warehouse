"use client";

import { useState, useRef, useCallback } from "react";
import {
  Check,
  Loader2,
  AlertTriangle,
  RefreshCw,
  FileText,
  Bold,
  Italic,
  Code,
  Heading1,
  List,
  CheckSquare,
  Eye,
  Edit3,
  Columns,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface NoteEditorProps {
  pageId: string;
  initialData: {
    title?: string;
    textContent?: string;
  };
  onTitleChange?: (newTitle: string) => void;
}

type SaveState = "saved" | "saving" | "error" | "idle";
type ViewMode = "edit" | "preview" | "split";

export function NoteEditor({ pageId, initialData, onTitleChange }: NoteEditorProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState(initialData.title || "Untitled Note");
  const [textContent, setTextContent] = useState(initialData.textContent || "");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  const saveNote = useCallback(
    async (contentToSave: string, titleToSave: string) => {
      setSaveState("saving");
      try {
        const res = await fetch(`/api/pages/${pageId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: titleToSave,
            textContent: contentToSave,
          }),
        });

        if (!res.ok) throw new Error("Failed to save note");

        setSaveState("saved");
      } catch (err) {
        console.error("Note autosave error:", err);
        setSaveState("error");
        showToast("Failed to save note", "error");
      }
    },
    [pageId, showToast]
  );

  const handleContentChange = (val: string) => {
    setTextContent(val);
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveState("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      saveNote(val, title);
    }, 1000);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    onTitleChange?.(val);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveNote(textContent, val);
    }, 1000);
  };

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textContent.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;

    const newContent =
      textContent.substring(0, start) + replacement + textContent.substring(end);

    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length + (selected ? 0 : 4)
      );
    }, 50);
  };

  const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  const charCount = textContent.length;

  // Simple clean markdown preview renderer helper
  const renderSimpleMarkdown = (raw: string) => {
    if (!raw.trim()) {
      return (
        <p className="text-slate-400 italic text-sm">
          No content yet. Type in editor to see live formatted output...
        </p>
      );
    }

    const lines = raw.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={idx} className="text-2xl font-black text-foreground mb-3 mt-4">
            {line.replace("# ", "")}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={idx} className="text-xl font-bold text-foreground mb-2 mt-3">
            {line.replace("## ", "")}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-lg font-bold text-foreground mb-2 mt-2">
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("- [ ] ") || line.startsWith("- [x] ")) {
        const checked = line.startsWith("- [x] ");
        return (
          <div key={idx} className="flex items-center gap-2 text-sm text-foreground my-1">
            <input type="checkbox" checked={checked} readOnly className="rounded accent-indigo-500" />
            <span className={checked ? "line-through text-slate-400" : ""}>
              {line.substring(6)}
            </span>
          </div>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={idx} className="ml-4 text-sm text-foreground list-disc my-0.5">
            {line.replace("- ", "")}
          </li>
        );
      }
      if (line.startsWith("```")) {
        return (
          <div key={idx} className="my-2 p-3 rounded-xl bg-slate-900 text-indigo-300 font-mono text-xs overflow-x-auto border border-slate-800">
            {line}
          </div>
        );
      }
      return (
        <p key={idx} className="text-sm text-foreground leading-relaxed my-1 min-h-[1rem]">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-border bg-card/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-base font-bold text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-indigo-500 focus:outline-none px-1 py-0.5 w-full max-w-md truncate transition-colors"
            placeholder="Note Title"
          />
        </div>

        {/* View Mode Split Controls */}
        <div className="flex items-center gap-1 bg-background/90 p-1 rounded-xl border border-border text-xs font-bold text-slate-400">
          <button
            onClick={() => setViewMode("edit")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === "edit" ? "bg-card text-indigo-400 shadow-xs border border-border" : "hover:text-foreground"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => setViewMode("split")}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === "split" ? "bg-card text-indigo-400 shadow-xs border border-border" : "hover:text-foreground"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>

          <button
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === "preview" ? "bg-card text-indigo-400 shadow-xs border border-border" : "hover:text-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>

        {/* Quick Toolbar */}
        <div className="hidden lg:flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-border/80 text-slate-500">
          <button
            onClick={() => insertMarkdown("**", "**")}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-foreground cursor-pointer transition-colors"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown("*", "*")}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-foreground cursor-pointer transition-colors"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown("# ")}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-foreground cursor-pointer transition-colors"
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown("\n```ts\n", "\n```\n")}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-foreground cursor-pointer transition-colors"
            title="Code Block"
          >
            <Code className="w-3.5 h-3.5 text-indigo-500" />
          </button>
          <button
            onClick={() => insertMarkdown("- ")}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-foreground cursor-pointer transition-colors"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown("- [ ] ")}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-foreground cursor-pointer transition-colors"
            title="Task Item"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Persistence Indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-2 text-[11px] font-semibold text-slate-400">
            <span>{wordCount} words</span>
            <span>&bull;</span>
            <span>{charCount} chars</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-xl bg-card border border-border shadow-xs">
            {saveState === "saving" && (
              <span className="flex items-center gap-1.5 text-amber-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </span>
            )}
            {saveState === "saved" && (
              <span className="flex items-center gap-1.5 text-emerald-500">
                <Check className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            )}
            {saveState === "error" && (
              <button
                onClick={() => saveNote(textContent, title)}
                className="flex items-center gap-1 text-red-500 hover:text-red-400 font-semibold cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Retry</span>
                <RefreshCw className="w-3 h-3 ml-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container Panes */}
      <div className="flex-1 flex overflow-hidden">
        {/* Edit Pane */}
        {(viewMode === "edit" || viewMode === "split") && (
          <div className="flex-1 p-6 md:p-8 overflow-y-auto border-r border-border/40">
            <textarea
              ref={textareaRef}
              value={textContent}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="# Developer Notebook Entry&#10;&#10;Write system designs, API schemas, or code snippets here..."
              className="w-full h-full min-h-[500px] bg-transparent resize-none focus:outline-none text-foreground font-mono text-sm leading-relaxed placeholder:text-slate-500"
            />
          </div>
        )}

        {/* Live Preview Pane */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-card/30">
            <div className="max-w-3xl mx-auto space-y-2">
              {renderSimpleMarkdown(textContent)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
