"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ExcalidrawWrapper from "./ExcalidrawWrapper";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";
import { Check, Loader2, AlertTriangle, Download, Layout } from "lucide-react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
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
  const insertTemplate = (type: "flowchart" | "architecture" | "erd" | "react") => {
    if (!excalidrawAPI) return;

    const baseElements = (excalidrawAPI.getSceneElements() || []).filter(
      (e) => isValidExcalidrawElement(e) && !e.isDeleted
    );
    let newElements: any[] = [];

    if (type === "flowchart") {
      const step1 = createCleanExcalidrawElement({
        type: "rectangle",
        x: 200,
        y: 160,
        width: 160,
        height: 60,
        strokeColor: "#6366f1",
      });
      const text1 = createCleanExcalidrawElement({
        type: "text",
        x: 220,
        y: 180,
        width: 120,
        height: 24,
        fontSize: 16,
        fontFamily: 1,
        text: "1. Client Request",
        strokeColor: "#ffffff",
      });

      const step2 = createCleanExcalidrawElement({
        type: "rectangle",
        x: 420,
        y: 160,
        width: 160,
        height: 60,
        strokeColor: "#3b82f6",
      });
      const text2 = createCleanExcalidrawElement({
        type: "text",
        x: 440,
        y: 180,
        width: 120,
        height: 24,
        fontSize: 16,
        fontFamily: 1,
        text: "2. API Controller",
        strokeColor: "#ffffff",
      });

      newElements = [step1, text1, step2, text2];
    } else if (type === "architecture") {
      const box1 = createCleanExcalidrawElement({
        type: "rectangle",
        x: 180,
        y: 140,
        width: 180,
        height: 80,
        strokeColor: "#10b981",
      });
      const text1 = createCleanExcalidrawElement({
        type: "text",
        x: 200,
        y: 170,
        width: 140,
        height: 24,
        fontSize: 16,
        fontFamily: 1,
        text: "Frontend (Next.js)",
        strokeColor: "#ffffff",
      });

      const box2 = createCleanExcalidrawElement({
        type: "rectangle",
        x: 420,
        y: 140,
        width: 180,
        height: 80,
        strokeColor: "#06b6d4",
      });
      const text2 = createCleanExcalidrawElement({
        type: "text",
        x: 440,
        y: 170,
        width: 140,
        height: 24,
        fontSize: 16,
        fontFamily: 1,
        text: "Database (MongoDB)",
        strokeColor: "#ffffff",
      });

      newElements = [box1, text1, box2, text2];
    } else if (type === "erd") {
      const userBox = createCleanExcalidrawElement({
        type: "rectangle",
        x: 200,
        y: 200,
        width: 180,
        height: 100,
        strokeColor: "#ec4899",
      });
      const userText = createCleanExcalidrawElement({
        type: "text",
        x: 220,
        y: 230,
        width: 140,
        height: 40,
        fontSize: 14,
        fontFamily: 1,
        text: "USERS TABLE\n- id: ObjectId\n- email: String",
        strokeColor: "#ffffff",
      });
      newElements = [userBox, userText];
    } else if (type === "react") {
      const appBox = createCleanExcalidrawElement({
        type: "rectangle",
        x: 250,
        y: 100,
        width: 200,
        height: 70,
        strokeColor: "#8b5cf6",
      });
      const appText = createCleanExcalidrawElement({
        type: "text",
        x: 270,
        y: 125,
        width: 160,
        height: 24,
        fontSize: 16,
        fontFamily: 1,
        text: "<AppProvider />",
        strokeColor: "#ffffff",
      });
      newElements = [appBox, appText];
    }

    excalidrawAPI.updateScene({ elements: [...baseElements, ...newElements] });
    showToast(`Inserted template into canvas`, "success");
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

