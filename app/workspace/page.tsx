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
import { DevHubModal } from "@/components/hub/DevHubModal";
import { Dashboard } from "@/components/workspace/Dashboard";
import { ItemDialog, ConfirmDeleteDialog, MovePageDialog } from "@/components/workspace/Dialogs";
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
  const [isDevHubOpen, setIsDevHubOpen] = useState(false);
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

  const [moveDialog, setMoveDialog] = useState<{
    isOpen: boolean;
    pageId: string;
    pageName: string;
  }>({ isOpen: false, pageId: "", pageName: "" });

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

  if (activePageDetails && activePageDetails._id !== activePageId) {
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

  const handleMovePage = async (folderId: string | null) => {
    if (moveDialog.pageId) {
      await fetch(`/api/pages/${moveDialog.pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      showToast(`Moved page successfully`, "success");
      await fetchWorkspaceData();
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
          onOpenDevHub={() => setIsDevHubOpen(true)}
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
            onMovePage={(p) => setMoveDialog({ isOpen: true, pageId: p._id, pageName: p.title })}
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
            onOpenDevHub={() => setIsDevHubOpen(true)}
            onCloseMobileSidebar={() => setSidebarOpen(false)}
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
            <Dashboard
              pages={pages}
              folders={folders}
              onSelectPage={(id) => setActivePageId(id)}
              onCreatePage={(type, folderId) => handleCreatePage(type, folderId)}
              onOpenDevTools={() => setIsDevToolsOpen(true)}
              onOpenDevHub={() => setIsDevHubOpen(true)}
              onOpenSnippets={() => setIsSnippetsOpen(true)}
              onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
            />
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

      {/* Developer Hub Live Resources Modal */}
      <DevHubModal
        isOpen={isDevHubOpen}
        onClose={() => setIsDevHubOpen(false)}
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

      <MovePageDialog
        isOpen={moveDialog.isOpen}
        onClose={() => setMoveDialog({ ...moveDialog, isOpen: false })}
        pageName={moveDialog.pageName}
        folders={folders}
        onConfirm={handleMovePage}
      />
    </div>
  );
}

