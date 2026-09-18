"use client";

import { useEffect, useState } from "react";
import {
  Layout,
  FileText,
  Folder as FolderIcon,
  Plus,
  Compass,
  Code2,
  BookOpen,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
  Zap,
  Activity,
  User,
  ShieldCheck,
} from "lucide-react";
import { PageData, FolderData } from "./Sidebar";

interface DashboardProps {
  pages: PageData[];
  folders: FolderData[];
  userName?: string;
  userEmail?: string;
  onSelectPage: (id: string) => void;
  onCreatePage: (type: "canvas" | "doc", folderId?: string | null) => void;
  onOpenDevTools: () => void;
  onOpenDevHub: () => void;
  onOpenSnippets: () => void;
  onOpenCheatSheet: () => void;
}

interface ActivityItem {
  _id: string;
  action: string;
  targetType: string;
  targetTitle: string;
  timestamp: string;
}

export function Dashboard({
  pages,
  folders,
  userName,
  userEmail,
  onSelectPage,
  onCreatePage,
  onOpenDevTools,
  onOpenDevHub,
  onOpenSnippets,
  onOpenCheatSheet,
}: DashboardProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  useEffect(() => {
    async function fetchActivities() {
      setIsLoadingActivity(true);
      try {
        const res = await fetch("/api/activity");
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities || []);
        }
      } catch (err) {
        console.error("Fetch activities error:", err);
      } finally {
        setIsLoadingActivity(false);
      }
    }
    fetchActivities();
  }, []);

  const canvasPages = pages.filter((p) => p.type === "canvas");
  const docPages = pages.filter((p) => p.type === "doc");
  const pinnedPages = pages.filter((p) => p.isPinned);
  const recentPages = [...pages].sort(
    (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  ).slice(0, 6);

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 bg-dot-grid space-y-6 select-none">
      {/* Welcome Hero Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authenticated Workspace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Welcome back, <span className="text-indigo-500">{userName || userEmail || "Developer"}</span>
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed font-normal">
            Your personal workspace with isolated notes, architecture diagrams, snippets, and live developer feeds.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onCreatePage("canvas")}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Canvas</span>
          </button>
          <button
            onClick={() => onCreatePage("doc")}
            className="px-3.5 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs border border-border flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 text-blue-500" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Layout className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{canvasPages.length}</div>
            <div className="text-[11px] font-medium text-muted-foreground">Canvases</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{docPages.length}</div>
            <div className="text-[11px] font-medium text-muted-foreground">Markdown Notes</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{pinnedPages.length}</div>
            <div className="text-[11px] font-medium text-muted-foreground">Pinned Favorites</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <FolderIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{folders.length}</div>
            <div className="text-[11px] font-medium text-muted-foreground">Folders</div>
          </div>
        </div>
      </div>

      {/* Quick Launch Tools Grid */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Launch Utilities & Hub</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            onClick={onOpenDevHub}
            className="p-4 rounded-xl bg-card border border-border hover:border-indigo-500/40 transition-colors cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-foreground group-hover:text-indigo-500 transition-colors flex items-center justify-between">
                <span>Developer Hub</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-[11px] text-muted-foreground font-normal leading-normal">
                Hacker News feed, DEV Community articles & roadmap.sh guides.
              </p>
            </div>
          </div>

          <div
            onClick={onOpenDevTools}
            className="p-4 rounded-xl bg-card border border-border hover:border-blue-500/40 transition-colors cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-foreground group-hover:text-blue-500 transition-colors flex items-center justify-between">
                <span>Dev Tools Suite</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-[11px] text-muted-foreground font-normal leading-normal">
                JWT Decoder, Regex Tester, JSON Formatter, Hash & Base64.
              </p>
            </div>
          </div>

          <div
            onClick={onOpenSnippets}
            className="p-4 rounded-xl bg-card border border-border hover:border-purple-500/40 transition-colors cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-foreground group-hover:text-purple-500 transition-colors flex items-center justify-between">
                <span>Snippet Vault</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-[11px] text-muted-foreground font-normal leading-normal">
                Store and search reusable code snippets by language.
              </p>
            </div>
          </div>

          <div
            onClick={onOpenCheatSheet}
            className="p-4 rounded-xl bg-card border border-border hover:border-amber-500/40 transition-colors cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-foreground group-hover:text-amber-500 transition-colors flex items-center justify-between">
                <span>CheatSheet Vault</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-[11px] text-muted-foreground font-normal leading-normal">
                Quick reference cards for Git, HTTP codes, Markdown & Regex.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Workspace Pages Grid */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>Recent Work & Canvases</span>
        </h2>

        {recentPages.length === 0 ? (
          <div className="p-6 rounded-xl bg-card border border-border text-center text-xs text-muted-foreground">
            No pages created yet. Click "+ New Canvas" or "+ New Note" above to start!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {recentPages.map((page) => (
              <div
                key={page._id}
                onClick={() => onSelectPage(page._id)}
                className="p-3.5 rounded-xl bg-card border border-border hover:border-indigo-500/40 transition-colors cursor-pointer group flex items-start justify-between gap-3"
              >
                <div className="space-y-1 truncate">
                  <div className="flex items-center gap-2">
                    {page.type === "canvas" ? (
                      <Layout className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-foreground group-hover:text-indigo-500 transition-colors truncate">
                      {page.title}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium">
                    Updated {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : "recently"}
                  </div>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
