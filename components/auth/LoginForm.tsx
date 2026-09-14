"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Key,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Terminal,
  Layout,
  FileText,
  CheckCircle2,
} from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("anasslazaar9@gmail.com");
  const [password, setPassword] = useState("Anass_2004");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/workspace");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected authentication error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-in-scale relative z-10">
      {/* Brand Header Badge */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="relative mb-3 group">
          <div className="w-16 h-16 rounded-2xl brand-gradient-bg p-0.5 shadow-lg shadow-indigo-500/25 brand-glow transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
          </span>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            DEV.WAREHOUSE v1.0
          </span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-1.5">
          <span>DEV</span>
          <span className="brand-gradient-text">.WAREHOUSE</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-xs">
          Private, self-hosted developer notebook & Excalidraw visual workspace
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="p-7 sm:p-8 rounded-3xl glass-panel bg-card/90 border border-border shadow-2xl shadow-indigo-500/10 relative overflow-hidden">
        {/* Decorative Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 brand-gradient-bg" />

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-500 dark:text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1">
              <p className="font-semibold">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Developer Identity</span>
              <Mail className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anasslazaar9@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/80 focus:bg-background focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-medium text-foreground placeholder:text-slate-400 transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Security Key</span>
              <Key className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/80 focus:bg-background focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-medium text-foreground placeholder:text-slate-400 transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl brand-gradient-bg brand-gradient-bg-hover text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating & Unlocking...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Unlock Developer Workspace</span>
                <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
              </>
            )}
          </button>
        </form>

        {/* Feature Highlights Grid */}
        <div className="mt-6 pt-5 border-t border-border/60 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Layout className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Excalidraw Engine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Markdown Notes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Local DB Storage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Zero Tracking</span>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-6 text-center">
        <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Self-Hosted & Private • Engineered for Developers</span>
        </p>
      </div>
    </div>
  );
}
