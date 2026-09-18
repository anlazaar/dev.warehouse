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
  UserPlus,
  LogIn,
  User,
  CheckCircle2,
  Terminal,
  Layout,
  FileText,
} from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "register") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        mode === "register"
          ? { email, password, name }
          : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <div className="w-full max-w-sm animate-fade-in-scale relative z-10">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-1">
          <span>DEV</span>
          <span className="text-indigo-500">.WAREHOUSE</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Personal Developer Workspace
        </p>
      </div>

      {/* Main Card */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-md relative overflow-hidden">
        {/* Mode Toggle Switcher */}
        <div className="grid grid-cols-2 p-1 bg-muted rounded-lg mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === "login"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === "register"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:border-indigo-500 focus:outline-none text-xs font-medium text-foreground placeholder:text-muted-foreground transition-colors"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@devwarehouse.local"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:border-indigo-500 focus:outline-none text-xs font-medium text-foreground placeholder:text-muted-foreground transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:border-indigo-500 focus:outline-none text-xs font-medium text-foreground placeholder:text-muted-foreground transition-colors"
            />
          </div>

          {mode === "register" && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:border-indigo-500 focus:outline-none text-xs font-medium text-foreground placeholder:text-muted-foreground transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer mt-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mode === "register" ? "Creating Account..." : "Authenticating..."}</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>{mode === "register" ? "Create Account & Enter" : "Sign In to Workspace"}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5 opacity-80" />
              </>
            )}
          </button>
        </form>

        {/* Feature Highlights Footer */}
        <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-2 text-[11px] text-muted-foreground font-medium">
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
            <span>Isolated Workspace</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Private Session</span>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-6 text-center">
        <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Private & Isolated • Engineered for Developers</span>
        </p>
      </div>
    </div>
  );
}
