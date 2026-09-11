"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  pageId?: string;
  onResetCanvas?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("CanvasErrorBoundary caught a rendering error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onResetCanvas) {
      this.props.onResetCanvas();
    } else if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-200 border border-red-500/20 rounded-2xl select-none">
          <div className="max-w-md w-full flex flex-col items-center text-center space-y-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl animate-fade-in-scale">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Canvas Rendering Issue Prevented</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The canvas data contained malformed elements or coordinates. The app prevented a crash.
              </p>
            </div>
            {this.state.error?.message && (
              <div className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-red-300 truncate text-left">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sanitize & Reload Canvas</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
