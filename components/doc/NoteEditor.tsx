"use client";

import { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
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
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Eye,
  Edit3,
  Columns,
  Quote,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Strikethrough,
  Minus,
  Copy,
  History,
  Workflow,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { MermaidRenderer } from "./MermaidRenderer";
import { VersionHistoryDrawer } from "./VersionHistoryDrawer";

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
  const [isVersionDrawerOpen, setIsVersionDrawerOpen] = useState(false);
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

  const insertMarkdown = (prefix: string, suffix: string = "", placeholderText: string = "text") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textContent.substring(start, end);
    const replacement = `${prefix}${selected || placeholderText}${suffix}`;

    const newContent =
      textContent.substring(0, start) + replacement + textContent.substring(end);

    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length + (selected ? 0 : placeholderText.length)
      );
    }, 50);
  };

  const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  const charCount = textContent.length;

  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2.5 border-b border-border bg-card/60 backdrop-blur-md shrink-0 select-none">
        <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-sm font-bold text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-indigo-500 focus:outline-none px-1 py-0.5 w-full max-w-md truncate transition-colors"
            placeholder="Note Title"
          />
        </div>

        {/* View Mode Split Controls */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border text-xs font-bold text-muted-foreground">
          <button
            onClick={() => setViewMode("edit")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              viewMode === "edit" ? "bg-card text-indigo-500 shadow-xs border border-border" : "hover:text-foreground"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => setViewMode("split")}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              viewMode === "split" ? "bg-card text-indigo-500 shadow-xs border border-border" : "hover:text-foreground"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>

          <button
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              viewMode === "preview" ? "bg-card text-indigo-500 shadow-xs border border-border" : "hover:text-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>

        {/* Formatting Toolbar */}
        <div className="hidden lg:flex items-center gap-0.5 bg-muted p-1 rounded-lg border border-border text-muted-foreground">
          <button
            onClick={() => insertMarkdown("**", "**", "bold text")}
            className="p-1 rounded-md hover:bg-card hover:text-foreground cursor-pointer transition-colors"
            title="Bold (**text**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown("*", "*", "italic text")}
            className="p-1 rounded-md hover:bg-card hover:text-foreground cursor-pointer transition-colors"
            title="Italic (*text*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown("~~", "~~", "strikethrough")}
            className="p-1 rounded-md hover:bg-card hover:text-foreground cursor-pointer transition-colors"
            title="Strikethrough (~~text~~)"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-border my-auto mx-0.5" />
          <button
            onClick={() => insertMarkdown("# ", "", "Heading 1")}
            className="p-1 rounded-md hover:bg-card hover:text-foreground cursor-pointer transition-colors"
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown("## ", "", "Heading 2")}
            className="p-1 rounded-md hover:bg-card hover:text-foreground cursor-pointer transition-colors"
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown("### ", "", "Heading 3")}
            className="p-1 rounded-md hover:bg-card hover:text-foreground cursor-pointer transition-colors"
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-border my-auto mx-0.5" />
          <button
            onClick={() => insertMarkdown("`", "`", "code")}
            className="p-1 rounded-md hover:bg-card hover:text-foreground cursor-pointer transition-colors"
            title="Inline Code"
          >
            <Code className="w-3.5 h-3.5 text-indigo-500" />
          </button>
          <button
            onClick={() => insertMarkdown("\n```typescript\n", "\n```\n", "// Write TypeScript code here")}
            className="p-1.5 rounded-md hover:bg-card hover:text-foreground cursor-pointer transition-colors text-[10px] font-bold font-mono"
            title="Code Block"
          >
            ```
          </button>
          <button
            onClick={() => insertMarkdown("\n> ", "", "Quote text")}
            className="p-1 rounded-md hover:bg-card hover:text-foreground cursor-pointer transition-colors"
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-border my-auto mx-0.5" />
          <button
            onClick={() => insertMarkdown("- ", "", "List item")}
            className="p-1 rounded-md hover:bg-card hover:text-foreground cursor-pointer transition-colors"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown("1. ", "", "First item")}
            className="p-1 rounded-md hover:bg-card hover:text-foreground cursor-pointer transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown("- [ ] ", "", "Task item")}
            className="p-1 rounded-md hover:bg-card hover:text-foreground cursor-pointer transition-colors"
            title="Task List"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-border my-auto mx-0.5" />
          <button
            onClick={() => insertMarkdown("\n| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n")}
            className="p-1 rounded-md hover:bg-card hover:text-foreground cursor-pointer transition-colors"
            title="Table"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown("[", "](https://example.com)", "Link Title")}
            className="p-1 rounded-md hover:bg-card hover:text-foreground cursor-pointer transition-colors"
            title="Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown("![Alt Text](", ")", "https://images.unsplash.com/photo-1555066931-4365d14bab8c")}
            className="p-1 rounded-md hover:bg-card hover:text-foreground cursor-pointer transition-colors"
            title="Image"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown("\n---\n", "")}
            className="p-1 rounded-md hover:bg-card hover:text-foreground cursor-pointer transition-colors"
            title="Horizontal Rule"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Persistence Indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
            <span>{wordCount} words</span>
            <span>&bull;</span>
            <span>{charCount} chars</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-card border border-border shadow-xs">
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
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto border-r border-border bg-background">
            <textarea
              ref={textareaRef}
              value={textContent}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="# Developer Notebook Entry&#10;&#10;Write system designs, API schemas, code snippets, or GFM tables here..."
              className="w-full h-full min-h-[500px] bg-transparent resize-none focus:outline-none text-foreground font-mono text-xs sm:text-sm leading-relaxed placeholder:text-muted-foreground"
            />
          </div>
        )}

        {/* Live GFM Markdown Preview Pane */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className={`flex-1 p-4 sm:p-6 overflow-y-auto bg-card/40 ${viewMode === "split" ? "hidden md:block" : ""}`}>
            <div className="max-w-3xl mx-auto space-y-4 text-foreground text-xs sm:text-sm leading-relaxed">
              {!textContent.trim() ? (
                <p className="text-muted-foreground italic text-xs">
                  No content yet. Type in the editor pane to see live GFM rendered preview...
                </p>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-xl sm:text-2xl font-bold text-foreground border-b border-border pb-2 mt-4 mb-3">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg sm:text-xl font-bold text-foreground border-b border-border/50 pb-1.5 mt-4 mb-2">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base sm:text-lg font-bold text-foreground mt-3 mb-1.5">
                        {children}
                      </h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="text-sm font-bold text-foreground mt-2 mb-1">
                        {children}
                      </h4>
                    ),
                    h5: ({ children }) => (
                      <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2 mb-1">
                        {children}
                      </h5>
                    ),
                    h6: ({ children }) => (
                      <h6 className="text-xs font-semibold text-muted-foreground italic mt-2 mb-1">
                        {children}
                      </h6>
                    ),
                    p: ({ children }) => (
                      <p className="text-foreground leading-relaxed my-2">
                        {children}
                      </p>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-indigo-500 bg-muted/40 pl-4 py-2 my-3 rounded-r-lg italic text-muted-foreground">
                        {children}
                      </blockquote>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5 my-2 space-y-1 text-foreground">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5 my-2 space-y-1 text-foreground">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-foreground my-0.5">
                        {children}
                      </li>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4 rounded-lg border border-border">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-muted text-foreground font-bold border-b border-border">
                        {children}
                      </thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody className="divide-y divide-border/60">
                        {children}
                      </tbody>
                    ),
                    tr: ({ children }) => (
                      <tr className="hover:bg-muted/30 transition-colors">
                        {children}
                      </tr>
                    ),
                    th: ({ children }) => (
                      <th className="px-3 py-2 font-bold text-foreground border-r border-border last:border-r-0">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-2 border-r border-border last:border-r-0">
                        {children}
                      </td>
                    ),
                    code: ({ className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || "");
                      if (match && match[1] === "mermaid") {
                        return <MermaidRenderer chart={String(children).replace(/\n$/, "")} />;
                      }
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-indigo-500 dark:text-indigo-400 font-mono text-xs font-semibold" {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className={`${className} font-mono text-xs block overflow-x-auto p-4 rounded-xl bg-slate-950 text-slate-100 border border-border my-3`} {...props}>
                          {children}
                        </code>
                      );
                    },
                    hr: () => <hr className="border-border my-6" />,
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline font-semibold">
                        {children}
                      </a>
                    ),
                    img: ({ src, alt }) => (
                      <img src={src} alt={alt} className="max-w-full h-auto rounded-lg border border-border my-3" />
                    ),
                  }}
                >
                  {textContent}
                </ReactMarkdown>
              )}
            </div>
          </div>
        )}
      </div>

      <VersionHistoryDrawer
        pageId={pageId}
        isOpen={isVersionDrawerOpen}
        onClose={() => setIsVersionDrawerOpen(false)}
        onVersionRestored={(newTitle, newContent) => {
          setTitle(newTitle);
          setTextContent(newContent);
          onTitleChange?.(newTitle);
        }}
      />
    </div>
  );
}
