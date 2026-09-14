"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import type { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

const DynamicExcalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod: any) => (mod.Excalidraw || mod.default) as any),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-semibold text-foreground">Loading Excalidraw Canvas...</p>
      </div>
    ),
  }
);

export type ExcalidrawProps = ComponentProps<typeof Excalidraw>;

export default function ExcalidrawWrapper(props: ExcalidrawProps) {
  const initialDataObj = (props.initialData as any) || {};
  const rawElements = Array.isArray(initialDataObj.elements) ? initialDataObj.elements : [];

  const safeElements = rawElements.filter((el: any) => {
    if (!el || typeof el !== "object" || typeof el.type !== "string" || !el.id) return false;
    if (typeof el.x !== "number" || Number.isNaN(el.x)) return false;
    if (typeof el.y !== "number" || Number.isNaN(el.y)) return false;
    if (typeof el.width !== "number" || Number.isNaN(el.width)) return false;
    if (typeof el.height !== "number" || Number.isNaN(el.height)) return false;
    return true;
  });

  const appStateObj = { ...(initialDataObj.appState || {}) };
  if (typeof appStateObj.scrollX !== "number" || Number.isNaN(appStateObj.scrollX)) {
    appStateObj.scrollX = 0;
  }
  if (typeof appStateObj.scrollY !== "number" || Number.isNaN(appStateObj.scrollY)) {
    appStateObj.scrollY = 0;
  }
  if (!appStateObj.zoom || typeof appStateObj.zoom !== "object" || typeof appStateObj.zoom.value !== "number" || Number.isNaN(appStateObj.zoom.value)) {
    appStateObj.zoom = { value: 1 };
  }

  delete appStateObj.newElement;
  delete appStateObj.editingTextElement;
  delete appStateObj.editingLinearElement;
  delete appStateObj.resizingElement;
  delete appStateObj.selectionElement;

  const safeInitialData = {
    elements: safeElements,
    appState: {
      theme: props.theme || "dark",
      ...appStateObj,
    },
    files: initialDataObj.files || {},
  };

  return <DynamicExcalidraw {...(props as any)} initialData={safeInitialData} />;
}
