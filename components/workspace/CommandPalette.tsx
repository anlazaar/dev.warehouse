"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Layout, FileText, Folder as FolderIcon, X, Loader2, Command, Sparkles, Filter, Timer } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (id: string) => void;
  onCreatePage?: (type: "canvas" | "doc") => void;
  onToggleZenMode?: () => void;
  onOpenSnippets?: () => void;
  onOpenPomodoro?: () => void;
}

interface SearchResults {
  pages: Array<{
    _id: string;
    title: string;
    type: "canvas" | "doc";
    folderId?: string;
  }>;
  folders: Array<{
    _id: string;
    name: string;
  }>;
}

type FilterCategory = "all" | "canvas" | "doc" | "folder";

export function CommandPalette({
  isOpen,
  onClose,
  onSelectPage,
  onCreatePage,
  onToggleZenMode,
  onOpenSnippets,
  onOpenPomodoro,
}: CommandPaletteProps) {
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [results, setResults] = useState<SearchResults>({ pages: [], folders: [] });
  const [isLoading, setIsLoading] = useState(false);

  const searchWorkspace = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults({ pages: [], folders: [] });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchWorkspace(query);
    }, 180);
    return () => clearTimeout(timer);
  }, [query, searchWorkspace]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPages = results.pages.filter((p) => {
    if (activeFilter === "canvas") return p.type === "canvas";
    if (activeFilter === "doc") return p.type === "doc";
    return true;
  });

  const filteredFolders = activeFilter === "all" || activeFilter === "folder" ? results.folders : [];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 p-4 animate-fade-in-scale select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-border bg-card/90">
          <Search className="w-4 h-4 text-indigo-500 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notebook pages or type commands..."
            className="w-full bg-transparent text-xs sm:text-sm text-foreground focus:outline-none placeholder:text-slate-400 font-medium"
          />
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin ml-2 shrink-0" />
          ) : query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-lg text-slate-400 hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/60 bg-background/50 text-xs font-semibold text-slate-400">
          <Filter className="w-3 h-3 text-slate-500 mr-1" />
          {(["all", "canvas", "doc", "folder"] as FilterCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-2.5 py-1 rounded-xl uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                activeFilter === cat
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                  : "hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-foreground"
              }`}
            >
              {cat === "all" ? "All Results" : cat === "canvas" ? "Canvases" : cat === "doc" ? "Notes" : "Folders"}
            </button>
          ))}
        </div>

        {/* Results & Quick Actions */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {!query.trim() && (
            <div className="p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                Quick Command Shortcuts
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onCreatePage?.("canvas");
                    onClose();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 text-xs font-bold transition-all text-left cursor-pointer"
                >
                  <Layout className="w-4 h-4" />
                  <div>
                    <p className="text-foreground">New Excalidraw Canvas</p>
                    <p className="text-[10px] text-slate-400 font-normal">Create architectural diagram</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onCreatePage?.("doc");
                    onClose();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-500 text-xs font-bold transition-all text-left cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <div>
                    <p className="text-foreground">New Markdown Note</p>
                    <p className="text-[10px] text-slate-400 font-normal">Create developer notebook note</p>
                  </div>
                </button>

                {onOpenSnippets && (
                  <button
                    onClick={() => {
                      onOpenSnippets();
                      onClose();
                    }}
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 text-purple-500 text-xs font-bold transition-all text-left cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <div>
                      <p className="text-foreground">Snippet Vault (Alt+V)</p>
                      <p className="text-[10px] text-slate-400 font-normal">React, SQL, Docker code snippets</p>
                    </div>
                  </button>
                )}

                {onOpenPomodoro && (
                  <button
                    onClick={() => {
                      onOpenPomodoro();
                      onClose();
                    }}
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 text-xs font-bold transition-all text-left cursor-pointer"
                  >
                    <Timer className="w-4 h-4" />
                    <div>
                      <p className="text-foreground">Focus Pomodoro (Alt+T)</p>
                      <p className="text-[10px] text-slate-400 font-normal">25m focus & study session timer</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {query.trim() && filteredPages.length === 0 && filteredFolders.length === 0 && !isLoading && (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              No matching pages or folders found for &quot;{query}&quot;.
            </div>
          )}

          {filteredPages.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                Pages ({filteredPages.length})
              </p>
              {filteredPages.map((page) => (
                <div
                  key={page._id}
                  onClick={() => {
                    onSelectPage(page._id);
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-indigo-500/10 text-foreground cursor-pointer text-xs font-semibold transition-all group border border-transparent hover:border-indigo-500/20"
                >
                  <div className="flex items-center gap-3 truncate">
                    {page.type === "canvas" ? (
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                        <Layout className="w-3.5 h-3.5 shrink-0" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                      </div>
                    )}
                    <span className="truncate">{page.title}</span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-card border border-border text-slate-400 group-hover:text-indigo-400">
                    {page.type === "canvas" ? "Excalidraw" : "Markdown"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {filteredFolders.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                Folders ({filteredFolders.length})
              </p>
              {filteredFolders.map((folder) => (
                <div
                  key={folder._id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground text-xs font-semibold"
                >
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <FolderIcon className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <span className="truncate">{folder.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-card/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Fast search across all pages & notes</span>
          </span>
          <kbd className="px-2 py-0.5 rounded-md border border-border bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-400">
            ESC to close
          </kbd>
        </div>
      </div>
    </div>
  );
}
