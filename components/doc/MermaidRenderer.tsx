"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { AlertTriangle, Loader2 } from "lucide-react";

interface MermaidRendererProps {
  chart: string;
}

export function MermaidRenderer({ chart }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const isDark = document.documentElement.classList.contains("dark");

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "default",
        securityLevel: "loose",
        fontFamily: "var(--font-sans), sans-serif",
      });

      const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
      
      mermaid
        .render(uniqueId, chart.trim())
        .then(({ svg: renderedSvg }) => {
          if (isMounted) {
            setSvg(renderedSvg);
            setError(null);
            setRendering(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.error("Mermaid rendering error:", err);
            setError(err?.message || "Invalid Mermaid syntax");
            setRendering(false);
          }
        });
    } catch (err: any) {
      if (isMounted) {
        setError(err?.message || "Failed to initialize Mermaid");
        setRendering(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="my-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono space-y-1">
        <div className="flex items-center gap-1.5 font-bold">
          <AlertTriangle className="w-4 h-4" />
          <span>Mermaid Diagram Syntax Error</span>
        </div>
        <p className="text-[11px] text-muted-foreground">{error}</p>
        <pre className="p-2 rounded bg-background border border-border text-foreground text-[10px] overflow-x-auto mt-2">
          {chart}
        </pre>
      </div>
    );
  }

  if (rendering && !svg) {
    return (
      <div className="my-4 py-8 flex items-center justify-center text-muted-foreground gap-2 bg-muted/20 rounded-xl border border-border">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
        <span className="text-xs font-medium">Rendering Mermaid Diagram...</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-4 p-4 rounded-xl bg-card border border-border overflow-x-auto flex justify-center items-center shadow-xs"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
