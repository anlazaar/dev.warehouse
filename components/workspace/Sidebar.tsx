"use client";

import { useState } from "react";
import {
  Folder as FolderIcon,
  FolderOpen,
  FileText,
  Layout,
  Plus,
  ChevronRight,
  ChevronDown,
  FolderPlus,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Star,
  Sparkles,
} from "lucide-react";

export interface PageData {
  _id: string;
  title: string;
  type: "canvas" | "doc";
  folderId?: string | null;
  updatedAt?: string;
  isPinned?: boolean;
}

export interface FolderData {
  _id: string;
  name: string;
  createdAt?: string;
}

interface SidebarProps {
  isOpen: boolean;
  folders: FolderData[];
  pages: PageData[];
  activePageId: string | null;
  onSelectPage: (id: string) => void;
  onCreatePage: (type: "canvas" | "doc", folderId?: string | null) => void;
  onCreateFolder: () => void;
  onRenameFolder: (folder: FolderData) => void;
  onDeleteFolder: (id: string) => void;
  onRenamePage: (page: PageData) => void;
  onDuplicatePage: (id: string) => void;
  onDeletePage: (id: string) => void;
  onTogglePinPage?: (id: string) => void;
}

export function Sidebar({
  isOpen,
  folders,
  pages,
  activePageId,
  onSelectPage,
  onCreatePage,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onRenamePage,
  onDuplicatePage,
  onDeletePage,
  onTogglePinPage,
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [activeMenu, setActiveMenu] = useState<{
    type: "folder" | "page";
    id: string;
  } | null>(null);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const rootPages = pages.filter((p) => !p.folderId);
  const pinnedPages = pages.filter((p) => p.isPinned);

  if (!isOpen) return null;

  return (
    <aside className="w-64 h-full border-r border-border bg-card/60 backdrop-blur-xl flex flex-col justify-between shrink-0 select-none overflow-hidden z-20 animate-fade-in-scale">
      {/* Top Section */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* Quick Action Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workspace Pages
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onCreateFolder()}
                title="Create New Folder"
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onCreatePage("canvas")}
                title="Create Excalidraw Canvas"
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-amber-500 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onCreatePage("canvas")}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 text-xs font-bold transition-all group cursor-pointer"
            >
              <Layout className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>+ Canvas</span>
            </button>

            <button
              onClick={() => onCreatePage("doc")}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-500 text-xs font-bold transition-all group cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>+ Note</span>
            </button>
          </div>
        </div>

        {/* Pinned / Favorites Section */}
        {pinnedPages.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>Pinned Favorites ({pinnedPages.length})</span>
            </div>
            {pinnedPages.map((page) => {
              const isActive = page._id === activePageId;
              return (
                <div
                  key={`pinned-${page._id}`}
                  onClick={() => onSelectPage(page._id)}
                  className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {page.type === "canvas" ? (
                      <Layout className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    )}
                    <span className="truncate">{page.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Folders & Pages Navigation Tree */}
        <div className="space-y-1">
          {folders.map((folder) => {
            const folderPages = pages.filter((p) => p.folderId === folder._id);
            const isExpanded = !!expandedFolders[folder._id];

            return (
              <div key={folder._id} className="space-y-0.5">
                {/* Folder Header */}
                <div className="group relative flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-400 hover:text-foreground text-xs font-bold transition-colors">
                  <div
                    onClick={() => toggleFolder(folder._id)}
                    className="flex items-center gap-2 flex-1 cursor-pointer truncate"
                  >
                    <span className="text-slate-500">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </span>
                    {isExpanded ? (
                      <FolderOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : (
                      <FolderIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                    )}
                    <span className="truncate">{folder.name}</span>
                    <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500">
                      {folderPages.length}
                    </span>
                  </div>

                  {/* Folder Options Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(
                        activeMenu?.id === folder._id ? null : { type: "folder", id: folder._id }
                      );
                    }}
                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-foreground transition-opacity"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                    {/* Context Menu */}
                    {activeMenu?.type === "folder" && activeMenu.id === folder._id && (
                      <div
                        className="absolute right-0 top-7 z-30 w-40 bg-card border border-border rounded-2xl shadow-2xl p-1 space-y-0.5 text-xs text-foreground animate-fade-in-scale"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            onCreatePage("canvas", folder._id);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-amber-500/10 text-amber-500 font-semibold"
                        >
                          <Layout className="w-3.5 h-3.5" />
                          <span>Add Canvas</span>
                        </button>
                        <button
                          onClick={() => {
                            onCreatePage("doc", folder._id);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-blue-500/10 text-blue-500 font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Add Note</span>
                        </button>
                        <button
                          onClick={() => {
                            onRenameFolder(folder);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground font-semibold"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Rename Folder</span>
                        </button>
                        <div className="h-px bg-border my-0.5" />
                        <button
                          onClick={() => {
                            onDeleteFolder(folder._id);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-red-500/10 text-red-500 font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Folder</span>
                        </button>
                      </div>
                    )}
                </div>

                {/* Nested Pages List */}
                {isExpanded && (
                  <div className="pl-6 space-y-0.5 border-l border-border/40 ml-3">
                    {folderPages.map((page) => {
                      const isActive = page._id === activePageId;

                      return (
                        <div
                          key={page._id}
                          onClick={() => onSelectPage(page._id)}
                          className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer text-xs font-semibold transition-all ${
                            isActive
                              ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-400 hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {page.type === "canvas" ? (
                              <Layout className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            )}
                            <span className="truncate">{page.title}</span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(
                                activeMenu?.id === page._id ? null : { type: "page", id: page._id }
                              );
                            }}
                            className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-foreground transition-opacity"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* Page Context Menu */}
                          {activeMenu?.type === "page" && activeMenu.id === page._id && (
                            <div
                              className="absolute right-0 top-7 z-30 w-40 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1 space-y-0.5 text-xs text-slate-300 animate-fade-in-scale"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  onTogglePinPage?.(page._id);
                                  setActiveMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 text-amber-400 font-semibold"
                              >
                                <Star className="w-3.5 h-3.5" />
                                <span>{page.isPinned ? "Unpin Page" : "Pin Page"}</span>
                              </button>
                              <button
                                onClick={() => {
                                  onRenamePage(page);
                                  setActiveMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 font-semibold"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Rename Title</span>
                              </button>
                              <button
                                onClick={() => {
                                  onDuplicatePage(page._id);
                                  setActiveMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 font-semibold"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Duplicate</span>
                              </button>
                              <div className="h-px bg-slate-800 my-0.5" />
                              <button
                                onClick={() => {
                                  onDeletePage(page._id);
                                  setActiveMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-red-500/20 text-red-400 font-semibold"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Page</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Root Uncategorized Pages */}
          {rootPages.length > 0 && (
            <div className="pt-2 space-y-0.5">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Root Workspace ({rootPages.length})
              </div>
              {rootPages.map((page) => {
                const isActive = page._id === activePageId;

                return (
                  <div
                    key={page._id}
                    onClick={() => onSelectPage(page._id)}
                    className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-400 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {page.type === "canvas" ? (
                        <Layout className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      )}
                      <span className="truncate">{page.title}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(
                          activeMenu?.id === page._id ? null : { type: "page", id: page._id }
                        );
                      }}
                      className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-foreground transition-opacity"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Page Context Menu */}
                    {activeMenu?.type === "page" && activeMenu.id === page._id && (
                      <div
                        className="absolute right-0 top-7 z-30 w-40 bg-card border border-border rounded-2xl shadow-2xl p-1 space-y-0.5 text-xs text-foreground animate-fade-in-scale"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            onTogglePinPage?.(page._id);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-amber-500/10 text-amber-500 font-semibold"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>{page.isPinned ? "Unpin Page" : "Pin Page"}</span>
                        </button>
                        <button
                          onClick={() => {
                            onRenamePage(page);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground font-semibold"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Rename Title</span>
                        </button>
                        <button
                          onClick={() => {
                            onDuplicatePage(page._id);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground font-semibold"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Duplicate</span>
                        </button>
                        <div className="h-px bg-border my-0.5" />
                        <button
                          onClick={() => {
                            onDeletePage(page._id);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-red-500/10 text-red-500 font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Page</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Workspace Badge */}
      <div className="p-3 border-t border-border bg-card/40">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Self-Hosted & Private</span>
        </div>
      </div>
    </aside>
  );
}
