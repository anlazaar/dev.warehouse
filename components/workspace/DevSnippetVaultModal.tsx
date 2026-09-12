"use client";

import { useState } from "react";
import { X, Search, Copy, Check, Code, Sparkles, Terminal, Database, Cpu, Layers } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Snippet {
  id: string;
  title: string;
  category: "React" | "SQL" | "Docker" | "Bash" | "CSS";
  description: string;
  code: string;
  tags: string[];
}

const SNIPPETS: Snippet[] = [
  {
    id: "react-debounced-value",
    title: "useDebounce Hook",
    category: "React",
    description: "Delay updating a value until user stops typing for specified milliseconds.",
    code: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,
    tags: ["react", "hooks", "performance", "debouncing"],
  },
  {
    id: "react-local-storage",
    title: "useLocalStorage Hook",
    category: "React",
    description: "Synchronize component state seamlessly with window.localStorage.",
    code: `import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}`,
    tags: ["react", "storage", "persistence", "hooks"],
  },
  {
    id: "sql-pagination",
    title: "Keyset / Cursor Pagination Query",
    category: "SQL",
    description: "High-performance database pagination replacing slow OFFSET queries.",
    code: `-- Keyset Pagination query for high-volume database tables
SELECT id, title, created_at, user_id
FROM posts
WHERE (created_at, id) < ('2026-09-11 12:00:00', '10045')
ORDER BY created_at DESC, id DESC
LIMIT 20;`,
    tags: ["sql", "postgres", "performance", "pagination"],
  },
  {
    id: "sql-json-aggregate",
    title: "PostgreSQL JSON Aggregation",
    category: "SQL",
    description: "Aggregate nested relational records into a structured JSON array.",
    code: `SELECT 
  u.id, 
  u.name, 
  COALESCE(
    JSON_AGG(
      JSON_BUILD_OBJECT('id', p.id, 'title', p.title, 'created_at', p.created_at)
    ) FILTER (WHERE p.id IS NOT NULL), '[]'
  ) AS user_posts
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
GROUP BY u.id, u.name;`,
    tags: ["sql", "postgres", "json", "aggregation"],
  },
  {
    id: "docker-compose-fullstack",
    title: "Next.js + Postgres + Redis Compose",
    category: "Docker",
    description: "Complete docker-compose setup for local web application development.",
    code: `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://dev:secret@db:5432/devwarehouse
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: devwarehouse
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:`,
    tags: ["docker", "compose", "postgres", "redis", "devops"],
  },
  {
    id: "bash-find-large-files",
    title: "Find & Sort Top 10 Largest Files",
    category: "Bash",
    description: "Quick Linux command to locate disk-space consumers.",
    code: `# Find top 10 largest files in the current directory tree
find . -type f -exec du -h {} + | sort -rh | head -n 10`,
    tags: ["bash", "linux", "terminal", "disk"],
  },
  {
    id: "bash-kill-port",
    title: "Kill Process Running on Port",
    category: "Bash",
    description: "Find PID using a specific port and terminate it immediately.",
    code: `# Kill process listening on port 3000 (Linux / macOS)
lsof -ti:3000 | xargs kill -9

# Windows PowerShell equivalent:
# Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force`,
    tags: ["bash", "port", "process", "kill"],
  },
  {
    id: "css-glassmorphism",
    title: "Modern Glassmorphism CSS",
    category: "CSS",
    description: "Sleek translucent glass card styling with backdrop blur.",
    code: `.glass-card {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
}`,
    tags: ["css", "styling", "ui", "glassmorphism"],
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function DevSnippetVaultModal({ isOpen, onClose }: Props) {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ["All", "React", "SQL", "Docker", "Bash", "CSS"];

  const filteredSnippets = SNIPPETS.filter((s) => {
    const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
    const matchesQuery =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handleCopy = (snippet: Snippet) => {
    navigator.clipboard.writeText(snippet.code);
    setCopiedId(snippet.id);
    showToast(`Copied "${snippet.title}" to clipboard!`, "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in-scale select-none">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-3xl bg-card border border-border shadow-2xl overflow-hidden text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                Developer Snippet Vault
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[10px] font-mono border border-indigo-500/20">
                  ALT+V
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Production-ready code patterns & utility snippets</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-400 hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-border bg-card flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search code snippets or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Snippets List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/60 dark:bg-slate-950/60">
          {filteredSnippets.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No code snippets matching "{search}".
            </div>
          ) : (
            filteredSnippets.map((snippet) => (
              <div
                key={snippet.id}
                className="p-4 rounded-2xl bg-card border border-border hover:border-indigo-500/30 shadow-sm transition-all group space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20">
                        {snippet.category}
                      </span>
                      <h3 className="text-sm font-bold text-foreground">{snippet.title}</h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{snippet.description}</p>
                  </div>

                  <button
                    onClick={() => handleCopy(snippet)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
                  >
                    {copiedId === snippet.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-slate-950 text-slate-100 p-3.5 border border-slate-800 text-[11px] font-mono leading-relaxed overflow-x-auto shadow-inner">
                  <pre>{snippet.code}</pre>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {snippet.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 text-[10px] font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
