"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/workspace/Header";
import { Sidebar, FolderData, PageData } from "@/components/workspace/Sidebar";
import { CanvasEditor } from "@/components/canvas/CanvasEditor";
import { NoteEditor } from "@/components/doc/NoteEditor";
import { CommandPalette } from "@/components/workspace/CommandPalette";
import { ExportImportModal } from "@/components/workspace/ExportImportModal";
import { DevToolsModal } from "@/components/workspace/DevToolsModal";
import { DevCheatSheetModal } from "@/components/workspace/DevCheatSheetModal";
import { DevScratchpadDrawer } from "@/components/workspace/DevScratchpadDrawer";
import { DevSnippetVaultModal } from "@/components/workspace/DevSnippetVaultModal";
import { DevPomodoroWidget } from "@/components/workspace/DevPomodoroWidget";
import { ItemDialog, ConfirmDeleteDialog } from "@/components/workspace/Dialogs";
import { useToast } from "@/components/ui/Toast";
import {
  Layout,
  FileText,
  FolderPlus,
  Loader2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Database,
  Zap,
  Code2,
  BookOpen,
  StickyNote,
  Timer,
} from "lucide-react";

interface ActivePageDetails extends PageData {
  elements?: Record<string, unknown>[];
  appState?: Record<string, unknown>;
  files?: Record<string, unknown>;
  textContent?: string;
}

export default function WorkspacePage() {
  const { showToast } = useToast();
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [pages, setPages] = useState<PageData[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [activePageDetails, setActivePageDetails] = useState<ActivePageDetails | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  // Developer Tools State
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isSnippetsOpen, setIsSnippetsOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);

  // Dialog States
  const [folderDialog, setFolderDialog] = useState<{
    isOpen: boolean;
    folder?: FolderData;
  }>({ isOpen: false });

  const [pageDialog, setPageDialog] = useState<{
    isOpen: boolean;
    page?: PageData;
  }>({ isOpen: false });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: "folder" | "page";
    id: string;
    name: string;
  }>({ isOpen: false, type: "page", id: "", name: "" });

  const fetchWorkspaceData = useCallback(async () => {
    try {
      const [foldersRes, pagesRes] = await Promise.all([
        fetch("/api/folders"),
        fetch("/api/pages"),
      ]);

      if (foldersRes.ok) {
        const data = await foldersRes.json();
        setFolders(data.folders || []);
      }

      if (pagesRes.ok) {
        const data = await pagesRes.json();
        const pagesList: PageData[] = data.pages || [];
        setPages(pagesList);

        if (!activePageId && pagesList.length > 0) {
          setActivePageId(pagesList[0]._id);
        }
      }
    } catch (err) {
      console.error("Fetch workspace error:", err);
    }
  }, [activePageId]);

  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  const [prevActivePageId, setPrevActivePageId] = useState<string | null>(null);

  if (activePageId !== prevActivePageId) {
    setPrevActivePageId(activePageId);
    setActivePageDetails(null);
  }

  // Load active page details
  useEffect(() => {
    if (!activePageId) return;

    let isMounted = true;

    const loadPage = async () => {
      setIsLoadingPage(true);
      try {
        const res = await fetch(`/api/pages/${activePageId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.page) {
            setActivePageDetails(data.page);
          }
        }
      } catch (err) {
        console.error("Error loading active page:", err);
      } finally {
        if (isMounted) {
          setIsLoadingPage(false);
        }
      }
    };

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [activePageId]);

  // Folder CRUD Operations
  const handleSaveFolder = async (name: string) => {
    if (folderDialog.folder) {
      await fetch(`/api/folders/${folderDialog.folder._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      showToast(`Renamed folder to "${name}"`, "success");
    } else {
      await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      showToast(`Created folder "${name}"`, "success");
    }
    fetchWorkspaceData();
  };

  const handleDeleteFolder = async (id: string) => {
    await fetch(`/api/folders/${id}`, { method: "DELETE" });
    showToast("Deleted folder", "info");
    fetchWorkspaceData();
  };

  // Page CRUD Operations
  const handleCreatePage = async (
    type: "canvas" | "doc",
    folderId?: string | null
  ) => {
    const defaultTitle = type === "canvas" ? "Untitled Canvas" : "Untitled Note";
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: defaultTitle,
          type,
          folderId: folderId || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetchWorkspaceData();
        setActivePageId(data.page._id);
        showToast(`Created new ${type === "canvas" ? "Excalidraw Canvas" : "Note"}`, "success");
      }
    } catch (err) {
      console.error("Create page error:", err);
    }
  };

  const handleSavePageTitle = async (title: string) => {
    if (pageDialog.page) {
      await fetch(`/api/pages/${pageDialog.page._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      showToast(`Renamed title to "${title}"`, "success");
      fetchWorkspaceData();
    }
  };

  const handleDuplicatePage = async (id: string) => {
    try {
      const res = await fetch(`/api/pages/${id}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        await fetchWorkspaceData();
        setActivePageId(data.page._id);
        showToast("Page duplicated successfully", "success");
      }
    } catch (err) {
      console.error("Duplicate page error:", err);
    }
  };

  const handleDeletePage = async (id: string) => {
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    if (activePageId === id) {
      setActivePageId(null);
    }
    showToast("Deleted page", "info");
    fetchWorkspaceData();
  };

  const handleTogglePinPage = (id: string) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p._id === id) {
          const nextPinned = !p.isPinned;
          showToast(nextPinned ? "Pinned page to favorites" : "Unpinned page", "info");
          return { ...p, isPinned: nextPinned };
        }
        return p;
      })
    );
  };

  const activePageObj = pages.find((p) => p._id === activePageId);
  const activeFolderObj = folders.find((f) => f._id === activePageObj?.folderId);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-background">
      {/* Top Header */}
      {!isZenMode && (
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenExportImport={() => setIsExportImportOpen(true)}
          onOpenDevTools={() => setIsDevToolsOpen(true)}
          onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
          onToggleScratchpad={() => setIsScratchpadOpen(!isScratchpadOpen)}
          onOpenSnippets={() => setIsSnippetsOpen(true)}
          onOpenPomodoro={() => setIsPomodoroOpen(true)}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeBreadcrumb={{
            folderName: activeFolderObj?.name,
            pageTitle: activePageObj?.title,
          }}
          isZenMode={isZenMode}
          onToggleZenMode={() => setIsZenMode(!isZenMode)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {!isZenMode && (
          <Sidebar
            isOpen={sidebarOpen}
            folders={folders}
            pages={pages}
            activePageId={activePageId}
            onSelectPage={(id) => setActivePageId(id)}
            onCreatePage={(type, folderId) => handleCreatePage(type, folderId)}
            onCreateFolder={() => setFolderDialog({ isOpen: true })}
            onRenameFolder={(f) => setFolderDialog({ isOpen: true, folder: f })}
            onDeleteFolder={(id) => {
              const f = folders.find((item) => item._id === id);
              setDeleteConfirm({
                isOpen: true,
                type: "folder",
                id,
                name: f?.name || "this folder",
              });
            }}
            onRenamePage={(p) => setPageDialog({ isOpen: true, page: p })}
            onDuplicatePage={(id) => handleDuplicatePage(id)}
            onDeletePage={(id) => {
              const p = pages.find((item) => item._id === id);
              setDeleteConfirm({
                isOpen: true,
                type: "page",
                id,
                name: p?.title || "this page",
              });
            }}
            onTogglePinPage={(id) => handleTogglePinPage(id)}
          />
        )}

        {/* Editor Area */}
        <main className="flex-1 h-full overflow-hidden relative bg-background flex flex-col">
          {isLoadingPage ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-semibold text-foreground">Loading workspace page...</p>
            </div>
          ) : activePageDetails ? (
            activePageDetails.type === "canvas" ? (
              <CanvasEditor
                key={activePageDetails._id}
                pageId={activePageDetails._id}
                initialData={{
                  elements: activePageDetails.elements,
                  appState: activePageDetails.appState,
                  files: activePageDetails.files,
                  title: activePageDetails.title,
                }}
                onTitleChange={(newTitle) => {
                  setPages((prev) =>
                    prev.map((p) =>
                      p._id === activePageDetails._id ? { ...p, title: newTitle } : p
                    )
                  );
                }}
              />
            ) : (
              <NoteEditor
                key={activePageDetails._id}
                pageId={activePageDetails._id}
                initialData={{
                  title: activePageDetails.title,
                  textContent: activePageDetails.textContent,
                }}
                onTitleChange={(newTitle) => {
                  setPages((prev) =>
                    prev.map((p) =>
                      p._id === activePageDetails._id ? { ...p, title: newTitle } : p
                    )
                  );
                }}
              />
            )
          ) : (
            /* DEV.WAREHOUSE Command Center Empty State */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto bg-dot-grid relative">
              <div className="max-w-3xl w-full flex flex-col items-center text-center relative z-10 animate-fade-in-scale space-y-8">
                {/* Hero Badge */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-3xl brand-gradient-bg flex items-center justify-center text-white shadow-xl brand-glow">
                    <ShieldCheck className="w-9 h-9" />
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 text-xs font-extrabold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>DEV.WAREHOUSE Pro Command Center</span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                    Private Developer Workspace
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                    Visual system architecture with Excalidraw, high-speed markdown notes, built-in developer tools & quick references.
                  </p>
                </div>

                {/* Quick Action Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  <div
                    onClick={() => handleCreatePage("canvas")}
                    className="p-5 rounded-2xl bg-card border border-border hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 text-left transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Layout className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-amber-500 transition-colors flex items-center justify-between">
                        <span>New Canvas</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                        Excalidraw canvas for system diagrams & architecture.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => handleCreatePage("doc")}
                    className="p-5 rounded-2xl bg-card border border-border hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 text-left transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-blue-500 transition-colors flex items-center justify-between">
                        <span>New Note</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                        Developer notebook for code snippets & specs.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setIsDevToolsOpen(true)}
                    className="p-5 rounded-2xl bg-card border border-border hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 text-left transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Code2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-indigo-500 transition-colors flex items-center justify-between">
                        <span>Dev Utilities</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                        JSON Formatter, Base64, Epoch & UUID tools.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setIsCheatSheetOpen(true)}
                    className="p-5 rounded-2xl bg-card border border-border hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 text-left transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-purple-500 transition-colors flex items-center justify-between">
                        <span>CheatSheet</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                        Quick reference for Git, HTTP, Regex & Markdown.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shortcuts & Quick Info Footer Bar */}
                <div className="p-4 rounded-2xl glass-panel bg-card/60 border border-border/80 w-full flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded-md border border-border bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-foreground font-bold">
                      ⌘K / Ctrl+K
                    </kbd>
                    <span>Search workspace</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded-md border border-border bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-foreground font-bold">
                      Alt+S
                    </kbd>
                    <span>Toggle Floating Scratchpad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Real-time Local Auto-Save</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Command Palette Modal (Cmd+K) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPage={(id) => setActivePageId(id)}
        onCreatePage={(type) => handleCreatePage(type)}
        onToggleZenMode={() => setIsZenMode(!isZenMode)}
        onOpenSnippets={() => setIsSnippetsOpen(true)}
        onOpenPomodoro={() => setIsPomodoroOpen(true)}
      />

      {/* Backup / Export / Import Modal */}
      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        onRefreshWorkspace={fetchWorkspaceData}
      />

      {/* Developer Utilities Hub Modal */}
      <DevToolsModal
        isOpen={isDevToolsOpen}
        onClose={() => setIsDevToolsOpen(false)}
      />

      {/* Developer CheatSheet Reference Modal */}
      <DevCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />

      {/* Developer Floating Quick Scratchpad Drawer */}
      <DevScratchpadDrawer
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />

      {/* Developer Snippet Vault Modal */}
      <DevSnippetVaultModal
        isOpen={isSnippetsOpen}
        onClose={() => setIsSnippetsOpen(false)}
      />

      {/* Developer Focus Pomodoro Timer Widget */}
      <DevPomodoroWidget
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
      />

      {/* Folder Creation/Rename Dialog */}
      <ItemDialog
        key={folderDialog.folder?._id || "new-folder"}
        isOpen={folderDialog.isOpen}
        onClose={() => setFolderDialog({ isOpen: false })}
        title={folderDialog.folder ? "Rename Folder" : "Create New Folder"}
        initialValue={folderDialog.folder?.name || ""}
        placeholder="Folder Name (e.g. Frontend Architecture, API Specs)"
        onSave={handleSaveFolder}
      />

      {/* Page Title Rename Dialog */}
      <ItemDialog
        key={pageDialog.page?._id || "new-page"}
        isOpen={pageDialog.isOpen}
        onClose={() => setPageDialog({ isOpen: false })}
        title="Rename Page"
        initialValue={pageDialog.page?.title || ""}
        placeholder="Page Title"
        onSave={handleSavePageTitle}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        title={`Delete ${deleteConfirm.type === "folder" ? "Folder" : "Page"}`}
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        onConfirm={async () => {
          if (deleteConfirm.type === "folder") {
            await handleDeleteFolder(deleteConfirm.id);
          } else {
            await handleDeletePage(deleteConfirm.id);
          }
        }}
      />
    </div>
  );
}

