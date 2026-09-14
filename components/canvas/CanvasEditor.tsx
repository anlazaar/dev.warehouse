"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ExcalidrawWrapper from "./ExcalidrawWrapper";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";
import { Check, Loader2, AlertTriangle, Download, Layout } from "lucide-react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { useToast } from "@/components/ui/Toast";

interface CanvasEditorProps {
  pageId: string;
  initialData: {
    elements?: Record<string, unknown>[];
    appState?: Record<string, unknown>;
    files?: Record<string, unknown>;
    title?: string;
  };
  onTitleChange?: (newTitle: string) => void;
}

type SaveState = "saved" | "saving" | "error" | "idle";

// Strict Excalidraw Element Validator to prevent Rough.js path-data-parser & layout crashes
function isValidExcalidrawElement(el: any): boolean {
  if (!el || typeof el !== "object") return false;
  if (typeof el.type !== "string" || !el.type) return false;
  if (!el.id || typeof el.id !== "string") return false;

  // Geometric coordinates & dimensions MUST be valid numeric values (never null, undefined, or NaN)
  if (typeof el.x !== "number" || Number.isNaN(el.x)) return false;
  if (typeof el.y !== "number" || Number.isNaN(el.y)) return false;
  if (typeof el.width !== "number" || Number.isNaN(el.width)) return false;
  if (typeof el.height !== "number" || Number.isNaN(el.height)) return false;

  // Sanitize array properties
  if (el.boundElements != null && !Array.isArray(el.boundElements)) {
    el.boundElements = [];
  }
  if (el.groupIds != null && !Array.isArray(el.groupIds)) {
    el.groupIds = [];
  }

  // Linear / Freedraw shapes (line, arrow, freedraw) require valid non-empty points array
  if (["line", "arrow", "freedraw"].includes(el.type)) {
    if (!Array.isArray(el.points) || el.points.length === 0) return false;
    if (
      el.points.some(
        (p: any) =>
          !Array.isArray(p) ||
          p.length < 2 ||
          typeof p[0] !== "number" ||
          Number.isNaN(p[0]) ||
          typeof p[1] !== "number" ||
          Number.isNaN(p[1])
      )
    ) {
      return false;
    }
  }

  // Non-linear shapes (rectangle, ellipse, diamond, text) must NOT have points array
  if (["rectangle", "ellipse", "diamond", "text"].includes(el.type)) {
    if ("points" in el) {
      delete el.points;
    }
  }

  return true;
}

// Sanitize appState to ensure scrollX, scrollY, zoom, and active elements never contain null/corrupted data
function sanitizeAppState(appState: Record<string, any> = {}): Record<string, any> {
  const clean: Record<string, any> = { ...appState };

  if (typeof clean.scrollX !== "number" || Number.isNaN(clean.scrollX)) {
    clean.scrollX = 0;
  }
  if (typeof clean.scrollY !== "number" || Number.isNaN(clean.scrollY)) {
    clean.scrollY = 0;
  }
  if (!clean.zoom || typeof clean.zoom !== "object" || typeof clean.zoom.value !== "number" || Number.isNaN(clean.zoom.value)) {
    clean.zoom = { value: 1 };
  }

  // Strip transient runtime states that crash Excalidraw when loaded from storage
  delete clean.newElement;
  delete clean.editingTextElement;
  delete clean.editingLinearElement;
  delete clean.resizingElement;
  delete clean.selectionElement;
  delete clean.collaborators;

  return clean;
}

// Helper to create fully compliant Excalidraw rectangle/text element objects
function createCleanExcalidrawElement(overrides: Record<string, any>) {
  const id = overrides.id || `el_${Math.random().toString(36).substring(2, 9)}`;
  const base = {
    id,
    type: "rectangle",
    x: 100,
    y: 100,
    width: 160,
    height: 70,
    angle: 0,
    strokeColor: "#6366f1",
    backgroundColor: "transparent",
    fillStyle: "hachure",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    index: "a0",
    roundness: { type: 3 },
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 100000),
    isDeleted: false,
    boundElements: [],
    updated: Date.now(),
    link: null,
    locked: false,
    ...overrides,
  };

  if (["rectangle", "ellipse", "diamond", "text"].includes(base.type)) {
    delete (base as any).points;
  }

  return base;
}

export function CanvasEditor({ pageId, initialData, onTitleChange }: CanvasEditorProps) {
  const { showToast } = useToast();
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [title, setTitle] = useState(initialData.title || "Untitled Canvas");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "dark";
  });

  // Strictly memoize & sanitize initialData per pageId
  const memoizedInitialData = useMemo(() => {
    const cleanElements = Array.isArray(initialData.elements)
      ? initialData.elements.filter(isValidExcalidrawElement)
      : [];

    const cleanAppState = sanitizeAppState(initialData.appState || {});
    cleanAppState.theme = theme;
    cleanAppState.viewBackgroundColor = "transparent";

    return {
      elements: cleanElements as any,
      appState: cleanAppState,
      files: (initialData.files as any) || {},
    };
  }, [pageId, initialData.elements, initialData.appState, initialData.files, theme]);

  // Keep track of active theme to avoid redundant updateScene calls
  const prevThemeRef = useRef(theme);

  useEffect(() => {
    const handleThemeMutation = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const currentTheme: "light" | "dark" = isDark ? "dark" : "light";
      
      if (currentTheme !== prevThemeRef.current) {
        prevThemeRef.current = currentTheme;
        setTheme(currentTheme);

        if (excalidrawAPI) {
          const existingAppState = excalidrawAPI.getAppState();
          const currentElements = (excalidrawAPI.getSceneElements() || []).filter(
            isValidExcalidrawElement
          );
          excalidrawAPI.updateScene({
            elements: currentElements,
            appState: {
              ...existingAppState,
              theme: currentTheme,
              viewBackgroundColor: "transparent",
            },
          });
        }
      }
    };

    const observer = new MutationObserver(handleThemeMutation);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [excalidrawAPI]);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  const lastSavedElementsJson = useRef(JSON.stringify(memoizedInitialData.elements));

  const saveCanvas = useCallback(
    async (elements: readonly Record<string, unknown>[], appState: Record<string, unknown>, files: Record<string, unknown>) => {
      setSaveState("saving");
      try {
        const cleanAppState = { ...appState };
        delete cleanAppState.collaborators;
        delete cleanAppState.selectedElementIds;
        delete cleanAppState.selectedGroupIds;
        delete cleanAppState.viewBackgroundColor;

        const cleanElements = elements.filter(isValidExcalidrawElement);

        const res = await fetch(`/api/pages/${pageId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            elements: cleanElements,
            appState: cleanAppState,
            files,
            title,
          }),
        });

        if (!res.ok) {
          throw new Error("Save request failed");
        }

        lastSavedElementsJson.current = JSON.stringify(cleanElements);
        setSaveState("saved");
      } catch (err) {
        console.error("Autosave error:", err);
        setSaveState("error");
      }
    },
    [pageId, title]
  );

  const onChange = useCallback(
    (elements: readonly Record<string, unknown>[], appState: Record<string, unknown>, files: Record<string, unknown>) => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      const cleanElements = elements.filter(isValidExcalidrawElement);

      const currentElementsJson = JSON.stringify(cleanElements);
      if (currentElementsJson === lastSavedElementsJson.current) {
        return;
      }

      setSaveState("saving");

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(() => {
        saveCanvas(cleanElements, appState, files);
      }, 1000);
    },
    [saveCanvas]
  );

  const exportExcalidrawFile = () => {
    if (!excalidrawAPI) return;
    const elements = (excalidrawAPI.getSceneElements() || []).filter(isValidExcalidrawElement);
    const appState = excalidrawAPI.getAppState();
    const files = excalidrawAPI.getFiles();

    const data = {
      type: "excalidraw",
      version: 2,
      source: "DEV.WAREHOUSE",
      elements,
      appState,
      files,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.excalidraw`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded .excalidraw canvas file", "success");
  };

  // Safe Diagram Template Insertion
const insertTemplate = async (type: "flowchart" | "architecture" | "erd" | "react") => {
    if (!excalidrawAPI) return;

    const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");

    const baseElements = (excalidrawAPI.getSceneElements() || []).filter(
      (e) => isValidExcalidrawElement(e) && !e.isDeleted
    );

    const offset = baseElements.length > 0 ? 60 * (1 + Math.floor(Math.random() * 4)) : 0;
    const uid = Math.random().toString(36).slice(2, 8); // unique ids so repeated inserts don't collide
    const id = (n: string) => `${uid}-${n}`;

    let skeletons: any[] = [];

    if (type === "flowchart") {
      skeletons = [
        { id: id("start"), type: "ellipse", x: 260 + offset, y: 40 + offset, width: 160, height: 60,
          strokeColor: "#10b981", backgroundColor: "#ecfdf5", fillStyle: "solid",
          label: { text: "Start", fontSize: 16 } },
        { id: id("validate"), type: "rectangle", x: 250 + offset, y: 150 + offset, width: 180, height: 70,
          strokeColor: "#6366f1", backgroundColor: "#eef2ff", fillStyle: "solid",
          label: { text: "Validate Input", fontSize: 16 } },
        { id: id("decision"), type: "diamond", x: 240 + offset, y: 270 + offset, width: 200, height: 110,
          strokeColor: "#f59e0b", backgroundColor: "#fffbeb", fillStyle: "solid",
          label: { text: "Valid?", fontSize: 16 } },
        { id: id("success"), type: "rectangle", x: 500 + offset, y: 285 + offset, width: 190, height: 80,
          strokeColor: "#3b82f6", backgroundColor: "#eff6ff", fillStyle: "solid",
          label: { text: "Process Request", fontSize: 16 } },
        { id: id("error"), type: "rectangle", x: -30 + offset, y: 285 + offset, width: 190, height: 80,
          strokeColor: "#ef4444", backgroundColor: "#fef2f2", fillStyle: "solid",
          label: { text: "Return 400 Error", fontSize: 16 } },
        { id: id("end"), type: "ellipse", x: 260 + offset, y: 430 + offset, width: 180, height: 60,
          strokeColor: "#0ea5e9", backgroundColor: "#f0f9ff", fillStyle: "solid",
          label: { text: "Response Sent", fontSize: 16 } },
        { type: "arrow", x: 330 + offset, y: 100 + offset, start: { id: id("start") }, end: { id: id("validate") } },
        { type: "arrow", x: 330 + offset, y: 220 + offset, start: { id: id("validate") }, end: { id: id("decision") } },
        { type: "arrow", x: 440 + offset, y: 320 + offset, start: { id: id("decision") }, end: { id: id("success") }, label: { text: "Yes", fontSize: 14 } },
        { type: "arrow", x: 240 + offset, y: 320 + offset, start: { id: id("decision") }, end: { id: id("error") }, label: { text: "No", fontSize: 14 } },
        { type: "arrow", x: 560 + offset, y: 365 + offset, start: { id: id("success") }, end: { id: id("end") } },
        { type: "arrow", x: 90 + offset, y: 365 + offset, start: { id: id("error") }, end: { id: id("end") } },
      ];
    } else if (type === "architecture") {
      skeletons = [
        { id: id("client"), type: "ellipse", x: 300 + offset, y: 20 + offset, width: 160, height: 60,
          strokeColor: "#a855f7", backgroundColor: "#f5f3ff", fillStyle: "solid",
          label: { text: "Client Browser", fontSize: 15 } },
        { id: id("gateway"), type: "rectangle", x: 280 + offset, y: 130 + offset, width: 200, height: 70,
          strokeColor: "#6366f1", backgroundColor: "#eef2ff", fillStyle: "solid",
          label: { text: "API Gateway", fontSize: 16 } },
        { id: id("auth"), type: "rectangle", x: 60 + offset, y: 260 + offset, width: 180, height: 70,
          strokeColor: "#f59e0b", backgroundColor: "#fffbeb", fillStyle: "solid",
          label: { text: "Auth Service", fontSize: 15 } },
        { id: id("app"), type: "rectangle", x: 300 + offset, y: 260 + offset, width: 200, height: 70,
          strokeColor: "#10b981", backgroundColor: "#ecfdf5", fillStyle: "solid",
          label: { text: "App Server\n(Next.js)", fontSize: 15 } },
        { id: id("cache"), type: "rectangle", x: 560 + offset, y: 260 + offset, width: 180, height: 70,
          strokeColor: "#ef4444", backgroundColor: "#fef2f2", fillStyle: "solid",
          label: { text: "Redis Cache", fontSize: 15 } },
        { id: id("db"), type: "rectangle", x: 300 + offset, y: 400 + offset, width: 200, height: 70,
          strokeColor: "#06b6d4", backgroundColor: "#ecfeff", fillStyle: "solid",
          label: { text: "MongoDB", fontSize: 16 } },
        { type: "arrow", x: 380 + offset, y: 85 + offset, start: { id: id("client") }, end: { id: id("gateway") } },
        { type: "arrow", x: 280 + offset, y: 220 + offset, start: { id: id("gateway") }, end: { id: id("auth") } },
        { type: "arrow", x: 380 + offset, y: 220 + offset, start: { id: id("gateway") }, end: { id: id("app") } },
        { type: "arrow", x: 480 + offset, y: 295 + offset, start: { id: id("app") }, end: { id: id("cache") } },
        { type: "arrow", x: 400 + offset, y: 335 + offset, start: { id: id("app") }, end: { id: id("db") } },
      ];
    } else if (type === "erd") {
      skeletons = [
        { id: id("users"), type: "rectangle", x: 120 + offset, y: 120 + offset, width: 230, height: 150,
          strokeColor: "#ec4899", backgroundColor: "#fdf2f8", fillStyle: "solid",
          label: { text: "USERS\n\n- id: ObjectId\n- email: String\n- passwordHash: String", fontSize: 14 } },
        { id: id("pages"), type: "rectangle", x: 460 + offset, y: 120 + offset, width: 230, height: 150,
          strokeColor: "#8b5cf6", backgroundColor: "#f5f3ff", fillStyle: "solid",
          label: { text: "PAGES\n\n- id: ObjectId\n- userId: ObjectId\n- title: String\n- type: String", fontSize: 14 } },
        { type: "arrow", x: 350 + offset, y: 195 + offset, start: { id: id("users") }, end: { id: id("pages") }, label: { text: "1 . . N", fontSize: 13 } },
      ];
    } else if (type === "react") {
      skeletons = [
        { id: id("app"), type: "rectangle", x: 300 + offset, y: 30 + offset, width: 200, height: 60,
          strokeColor: "#8b5cf6", backgroundColor: "#f5f3ff", fillStyle: "solid",
          label: { text: "<App />", fontSize: 16 } },
        { id: id("layout"), type: "rectangle", x: 300 + offset, y: 150 + offset, width: 200, height: 60,
          strokeColor: "#6366f1", backgroundColor: "#eef2ff", fillStyle: "solid",
          label: { text: "<Layout />", fontSize: 16 } },
        { id: id("page"), type: "rectangle", x: 300 + offset, y: 270 + offset, width: 200, height: 60,
          strokeColor: "#3b82f6", backgroundColor: "#eff6ff", fillStyle: "solid",
          label: { text: "<WorkspacePage />", fontSize: 15 } },
        { id: id("canvas"), type: "rectangle", x: 140 + offset, y: 390 + offset, width: 190, height: 60,
          strokeColor: "#10b981", backgroundColor: "#ecfdf5", fillStyle: "solid",
          label: { text: "<CanvasEditor />", fontSize: 14 } },
        { id: id("note"), type: "rectangle", x: 470 + offset, y: 390 + offset, width: 190, height: 60,
          strokeColor: "#f59e0b", backgroundColor: "#fffbeb", fillStyle: "solid",
          label: { text: "<NoteEditor />", fontSize: 14 } },
        { type: "arrow", x: 400 + offset, y: 95 + offset, start: { id: id("app") }, end: { id: id("layout") } },
        { type: "arrow", x: 400 + offset, y: 215 + offset, start: { id: id("layout") }, end: { id: id("page") } },
        { type: "arrow", x: 350 + offset, y: 335 + offset, start: { id: id("page") }, end: { id: id("canvas") } },
        { type: "arrow", x: 450 + offset, y: 335 + offset, start: { id: id("page") }, end: { id: id("note") } },
      ];
    }

    const newElements = convertToExcalidrawElements(skeletons);
    const allElements = [...baseElements, ...newElements];

    excalidrawAPI.updateScene({ elements: allElements });
    excalidrawAPI.scrollToContent(newElements, { fitToContent: true, animate: true });

    showToast(`Inserted ${type} diagram`, "success");
    setIsTemplateMenuOpen(false);
  };

  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  return (
    <div className="w-full h-full flex flex-col bg-background overflow-hidden">
      {/* Top Dedicated Non-Overlapping Canvas Header Bar */}
      <div className="h-12 w-full border-b border-border bg-card/90 backdrop-blur-md flex items-center justify-between px-3.5 sm:px-4 shrink-0 z-20 select-none">
        {/* Title Editor */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
            <Layout className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              onTitleChange?.(e.target.value);
            }}
            className="text-xs font-bold text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-indigo-500 focus:outline-none px-1 py-0.5 max-w-[200px] truncate transition-colors"
            placeholder="Canvas Title"
          />
        </div>

        {/* Center Controls & Export Actions */}
        <div className="flex items-center gap-2">
          {/* Architecture Diagram Templates Picker */}
          <div className="relative">
            <button
              onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-indigo-500/20"
              title="Insert architecture & system diagram templates"
            >
              <span>Diagram Templates</span>
            </button>

            {isTemplateMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-2xl p-2 z-50 space-y-1 animate-fade-in-scale">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pre-built Diagram Nodes
                </div>
                <button
                  onClick={() => insertTemplate("flowchart")}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-xs font-semibold text-foreground flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Flowchart Stream</span>
                  <span className="text-[10px] text-indigo-400">API Flow</span>
                </button>
                <button
                  onClick={() => insertTemplate("architecture")}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-xs font-semibold text-foreground flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>System Architecture</span>
                  <span className="text-[10px] text-blue-400">Fullstack</span>
                </button>
                <button
                  onClick={() => insertTemplate("erd")}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-xs font-semibold text-foreground flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Database ERD Schema</span>
                  <span className="text-[10px] text-pink-400">SQL/Mongo</span>
                </button>
                <button
                  onClick={() => insertTemplate("react")}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-xs font-semibold text-foreground flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>React Component Tree</span>
                  <span className="text-[10px] text-purple-400">UI Nodes</span>
                </button>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-border/80" />

          {/* Save Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl bg-background/60 border border-border">
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
                onClick={() => {
                  if (excalidrawAPI) {
                    saveCanvas(
                      (excalidrawAPI.getSceneElements() || []).filter(isValidExcalidrawElement),
                      excalidrawAPI.getAppState(),
                      excalidrawAPI.getFiles()
                    );
                  }
                }}
                className="flex items-center gap-1 text-red-500 hover:text-red-400 font-bold cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={exportExcalidrawFile}
            title="Export as .excalidraw file"
            className="p-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors cursor-pointer active:scale-95 border border-indigo-500/20"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Excalidraw Engine Container */}
      <div className="w-full flex-1 relative overflow-hidden">
        <CanvasErrorBoundary pageId={pageId}>
          <ExcalidrawWrapper
            key={pageId}
            excalidrawAPI={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
            theme={theme}
            initialData={memoizedInitialData}
            onChange={(elements, appState, files) =>
              onChange(elements as any, appState as any, files as any)
            }
          />
        </CanvasErrorBoundary>
      </div>
    </div>
  );
}

