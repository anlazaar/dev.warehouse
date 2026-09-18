"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Search,
  Sun,
  Moon,
  Database,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Command,
  Maximize2,
  Minimize2,
  ChevronRight,
  Code2,
  BookOpen,
  StickyNote,
  Sparkles,
  Timer,
  Compass,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useToast } from "@/components/ui/Toast";

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenExportImport: () => void;
  onOpenDevTools?: () => void;
  onOpenDevHub?: () => void;
  onOpenCheatSheet?: () => void;
  onToggleScratchpad?: () => void;
  onOpenSnippets?: () => void;
  onOpenPomodoro?: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeBreadcrumb?: { folderName?: string; pageTitle?: string };
  isZenMode?: boolean;
  onToggleZenMode?: () => void;
}

export function Header({
  onOpenSearch,
  onOpenExportImport,
  onOpenDevTools,
  onOpenDevHub,
  onOpenCheatSheet,
  onToggleScratchpad,
  onOpenSnippets,
  onOpenPomodoro,
  sidebarOpen,
  onToggleSidebar,
  activeBreadcrumb,
  isZenMode,
  onToggleZenMode,
}: HeaderProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLocking, setIsLocking] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("devwarehouse_theme");
      if (savedTheme === "light") {
        document.documentElement.classList.remove("dark");
        setIsDark(false);
      } else if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDark) {
          document.documentElement.classList.add("dark");
          setIsDark(true);
        } else {
          document.documentElement.classList.remove("dark");
          setIsDark(false);
        }
      }
    }
  }, []);

  // Global ESC, Alt+Z, Alt+S, Alt+V, Alt+T listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZenMode && onToggleZenMode) {
        onToggleZenMode();
        showToast("Exited Zen Mode", "info");
      }
      if (e.altKey && (e.key === "z" || e.key === "Z") && onToggleZenMode) {
        e.preventDefault();
        onToggleZenMode();
      }
      if (e.altKey && (e.key === "s" || e.key === "S") && onToggleScratchpad) {
        e.preventDefault();
        onToggleScratchpad();
      }
      if (e.altKey && (e.key === "v" || e.key === "V") && onOpenSnippets) {
        e.preventDefault();
        onOpenSnippets();
      }
      if (e.altKey && (e.key === "t" || e.key === "T") && onOpenPomodoro) {
        e.preventDefault();
        onOpenPomodoro();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZenMode, onToggleZenMode, onToggleScratchpad, onOpenSnippets, onOpenPomodoro, showToast]);

  const toggleTheme = () => {
    const nextDark = !document.documentElement.classList.contains("dark");
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("devwarehouse_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("devwarehouse_theme", "light");
    }
    showToast(`Switched to ${nextDark ? "Dark" : "Light"} Mode`, "info");
  };

  const handleLockNotebook = async () => {
    setIsLocking(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      showToast("Workspace locked", "info");
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Lock notebook error:", err);
      setIsLocking(false);
    }
  };

  if (isZenMode) {
    return (
      <div className="fixed top-3 right-4 z-50 animate-fade-in-scale">
        <button
          onClick={() => {
            onToggleZenMode?.();
            showToast("Exited Zen Mode", "info");
          }}
          className="px-3.5 py-2 rounded-2xl bg-card text-foreground border border-indigo-500/40 shadow-2xl backdrop-blur-xl flex items-center gap-2 text-xs font-bold hover:scale-105 transition-all cursor-pointer group"
          title="Exit Zen Mode (Or press ESC key)"
        >
          <Minimize2 className="w-3.5 h-3.5 text-indigo-500 group-hover:rotate-90 transition-transform" />
          <span>Exit Zen Mode</span>
          <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300 border border-border">
            ESC
          </kbd>
        </button>
      </div>
    );
  }

  return (
    <header className="h-13 w-full border-b border-border bg-card px-3 sm:px-4 flex items-center justify-between shrink-0 select-none z-30 transition-colors">
      {/* Left Brand Area & Breadcrumbs */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleSidebar}
          title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer active:scale-95"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" />
          )}
        </button>

        <BrandLogo size="md" showText={true} />

        {/* Breadcrumb Navigation */}
        {activeBreadcrumb?.pageTitle && (
          <div className="hidden lg:flex items-center gap-1.5 pl-2.5 border-l border-border text-xs font-medium text-muted-foreground">
            {activeBreadcrumb.folderName && (
              <>
                <span className="truncate max-w-[120px]">{activeBreadcrumb.folderName}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </>
            )}
            <span className="font-semibold text-foreground truncate max-w-[160px]">
              {activeBreadcrumb.pageTitle}
            </span>
          </div>
        )}
      </div>

      {/* Middle Command Search Trigger */}
      <button
        onClick={onOpenSearch}
        className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer"
      >
        <Search className="w-3.5 h-3.5 text-muted-foreground" />
        <span>Search pages, notes & tools...</span>
        <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono text-muted-foreground flex items-center gap-0.5">
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onOpenSearch}
          className="md:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
          title="Search Workspace"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Developer Hub Trigger */}
        {onOpenDevHub && (
          <button
            onClick={onOpenDevHub}
            className="p-1.5 px-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-emerald-500 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Open Developer Hub"
          >
            <Compass className="w-4 h-4 text-emerald-500" />
            <span className="hidden xl:inline">Dev Hub</span>
          </button>
        )}

        {/* Developer Utilities Modal Trigger */}
        {onOpenDevTools && (
          <button
            onClick={onOpenDevTools}
            className="p-1.5 px-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-indigo-500 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Open Developer Utilities"
          >
            <Code2 className="w-4 h-4 text-indigo-500" />
            <span className="hidden xl:inline">DevTools</span>
          </button>
        )}

        {/* Code Snippet Vault Trigger */}
        {onOpenSnippets && (
          <button
            onClick={onOpenSnippets}
            className="p-1.5 px-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-purple-500 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Open Code Snippet Vault (Alt+V)"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="hidden xl:inline">Snippets</span>
          </button>
        )}

        {/* Focus Pomodoro Timer Trigger */}
        {onOpenPomodoro && (
          <button
            onClick={onOpenPomodoro}
            className="p-1.5 px-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Open Focus Pomodoro Timer (Alt+T)"
          >
            <Timer className="w-4 h-4 text-amber-500" />
            <span className="hidden xl:inline">Timer</span>
          </button>
        )}

        {/* Developer CheatSheet Trigger */}
        {onOpenCheatSheet && (
          <button
            onClick={onOpenCheatSheet}
            className="p-1.5 px-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-blue-500 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Open Developer CheatSheet"
          >
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span className="hidden xl:inline">CheatSheet</span>
          </button>
        )}

        {/* Developer Quick Scratchpad Trigger */}
        {onToggleScratchpad && (
          <button
            onClick={onToggleScratchpad}
            className="p-1.5 px-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Toggle Quick Scratchpad (Alt+S)"
          >
            <StickyNote className="w-4 h-4 text-amber-500" />
            <span className="hidden xl:inline">Scratchpad</span>
          </button>
        )}

        {/* Zen Mode Button */}
        {onToggleZenMode && (
          <button
            onClick={() => {
              onToggleZenMode();
              showToast("Entered Zen Mode — Press ESC to exit", "info");
            }}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            title="Toggle Zen Mode (Focus Mode - ESC to exit)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenExportImport}
          className="p-1.5 px-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          title="Backup & Restore Workspace"
        >
          <Database className="w-4 h-4 text-indigo-500" />
          <span className="hidden sm:inline">Backup</span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
          title="Toggle Dark/Light Theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Lock Notebook Button */}
        <button
          onClick={handleLockNotebook}
          disabled={isLocking}
          className="px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isLocking ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span className="hidden sm:inline">Lock</span>
        </button>
      </div>
    </header>
  );
}

