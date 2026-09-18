"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Layout,
  FileText,
  Folder as FolderIcon,
  X,
  Loader2,
  Sparkles,
  Filter,
  Timer,
  Code2,
  Bookmark,
  FolderKanban,
  Star,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (id: string) => void;
  onSelectProject?: (id: string) => void;
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
    projectId?: string;
    isFavorite?: boolean;
    tags?: string[];
  }>;
  folders: Array<{
    _id: string;
    name: string;
    color?: string;
  }>;
  snippets: Array<{
    _id: string;
    title: string;
    language: string;
    description?: string;
    isFavorite?: boolean;
  }>;
  cheatsheets: Array<{
    _id: string;
    title: string;
    category?: string;
    isFavorite?: boolean;
  }>;
  projects: Array<{
    _id: string;
    name: string;
    color?: string;
    description?: string;
    isFavorite?: boolean;
  }>;
}

type FilterCategory = "all" | "doc" | "canvas" | "snippet" | "cheatsheet" | "project";

export function CommandPalette({
  isOpen,
  onClose,
  onSelectPage,
  onSelectProject,
  onCreatePage,
  onOpenSnippets,
  onOpenPomodoro,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [results, setResults] = useState<SearchResults>({
    pages: [],
    folders: [],
    snippets: [],
    cheatsheets: [],
    projects: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const searchWorkspace = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults({ pages: [], folders: [], snippets: [], cheatsheets: [], projects: [] });
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
    }, 150);
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
    return activeFilter === "all";
  });

  const filteredSnippets = activeFilter === "all" || activeFilter === "snippet" ? results.snippets : [];
  const filteredCheatsheets = activeFilter === "all" || activeFilter === "cheatsheet" ? results.cheatsheets : [];
  const filteredProjects = activeFilter === "all" || activeFilter === "project" ? results.projects : [];
  const filteredFolders = activeFilter === "all" ? results.folders : [];

  const hasAnyResults =
    filteredPages.length > 0 ||
    filteredSnippets.length > 0 ||
    filteredCheatsheets.length > 0 ||
    filteredProjects.length > 0 ||
    filteredFolders.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-12 sm:pt-20 p-4 animate-fade-in-scale select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] relative z-10"
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
            placeholder="Search notes, canvases, snippets, cheatsheets, projects (Cmd + K)..."
            className="w-full bg-transparent text-xs sm:text-sm text-foreground focus:outline-none placeholder:text-muted-foreground font-medium"
          />
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin ml-2 shrink-0" />
          ) : query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground overflow-x-auto">
          <Filter className="w-3 h-3 text-indigo-500 mr-1 shrink-0" />
          {(
            [
              { id: "all", label: "All Items" },
              { id: "doc", label: "Notes" },
              { id: "canvas", label: "Canvases" },
              { id: "snippet", label: "Snippets" },
              { id: "cheatsheet", label: "Cheatsheets" },
              { id: "project", label: "Projects" },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === cat.id
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                  : "hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results & Quick Actions */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {!query.trim() && (
            <div className="p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                Quick Command Shortcuts
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                    <p className="text-[10px] text-muted-foreground font-normal">Architectural diagram</p>
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
                    <p className="text-[10px] text-muted-foreground font-normal">Developer notebook note</p>
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
                    <Code2 className="w-4 h-4" />
                    <div>
                      <p className="text-foreground">Snippet Vault</p>
                      <p className="text-[10px] text-muted-foreground font-normal">Code snippets & templates</p>
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
                      <p className="text-foreground">Focus Pomodoro</p>
                      <p className="text-[10px] text-muted-foreground font-normal">Focus & session timer</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {query.trim() && !hasAnyResults && !isLoading && (
            <div className="p-8 text-center text-muted-foreground text-xs font-medium">
              No matching items found for &quot;{query}&quot;.
            </div>
          )}

          {/* Projects Results */}
          {filteredProjects.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1 flex items-center justify-between">
                <span>Projects ({filteredProjects.length})</span>
              </p>
              {filteredProjects.map((proj) => (
                <div
                  key={proj._id}
                  onClick={() => {
                    onSelectProject?.(proj._id);
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-indigo-500/10 text-foreground cursor-pointer text-xs font-semibold transition-all group border border-transparent hover:border-indigo-500/20"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: proj.color || "#6366f1" }}
                    />
                    <div className="truncate">
                      <p className="font-bold text-foreground">{proj.name}</p>
                      {proj.description && (
                        <p className="text-[10px] text-muted-foreground truncate">{proj.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {proj.isFavorite && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground">
                      Project
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pages Results */}
          {filteredPages.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1">
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
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                        <Layout className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className="truncate">{page.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {page.isFavorite && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground group-hover:text-indigo-400">
                      {page.type === "canvas" ? "Excalidraw" : "Markdown"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Snippets Results */}
          {filteredSnippets.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1">
                Snippets ({filteredSnippets.length})
              </p>
              {filteredSnippets.map((snip) => (
                <div
                  key={snip._id}
                  onClick={() => {
                    onOpenSnippets?.();
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-purple-500/10 text-foreground cursor-pointer text-xs font-semibold transition-all group border border-transparent hover:border-purple-500/20"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                      <Code2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-foreground">{snip.title}</p>
                      {snip.description && (
                        <p className="text-[10px] text-muted-foreground truncate">{snip.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-card border border-border text-purple-400">
                    {snip.language}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Cheatsheets Results */}
          {filteredCheatsheets.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1">
                Cheatsheets ({filteredCheatsheets.length})
              </p>
              {filteredCheatsheets.map((cs) => (
                <div
                  key={cs._id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-emerald-500/10 text-foreground text-xs font-semibold"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                      <Bookmark className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate font-bold">{cs.title}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-card border border-border text-emerald-400">
                    {cs.category || "Cheatsheet"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Folders Results */}
          {filteredFolders.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1">
                Folders ({filteredFolders.length})
              </p>
              {filteredFolders.map((folder) => (
                <div
                  key={folder._id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-muted text-foreground text-xs font-semibold"
                >
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                    <FolderIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{folder.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-card/60 flex items-center justify-between text-[11px] text-muted-foreground font-medium">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Search notes, canvases, snippets, cheatsheets & projects</span>
          </span>
          <kbd className="px-2 py-0.5 rounded-md border border-border bg-muted text-[10px] font-mono text-muted-foreground">
            ESC to close
          </kbd>
        </div>
      </div>
    </div>
  );
}
