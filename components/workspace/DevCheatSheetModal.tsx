"use client";

import { useState } from "react";
import {
  X,
  BookOpen,
  Search,
  GitBranch,
  Globe,
  Regex,
  FileCode,
  Copy,
  Check,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface DevCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHEATSHEET_DATA = {
  git: [
    { cmd: "git checkout -b <branch>", desc: "Create and switch to a new branch" },
    { cmd: "git stash push -m 'wip'", desc: "Save working changes to stash stack" },
    { cmd: "git stash pop", desc: "Apply latest stash entry and drop it" },
    { cmd: "git log --oneline --graph --all", desc: "Visual branch history graph" },
    { cmd: "git reset --soft HEAD~1", desc: "Undo last commit, keep changes staged" },
    { cmd: "git rebase -i HEAD~3", desc: "Interactive rebase last 3 commits" },
    { cmd: "git remote -v", desc: "List remote repository URLs" },
  ],
  http: [
    { cmd: "200 OK", desc: "Standard successful HTTP request response" },
    { cmd: "201 Created", desc: "Resource successfully created (POST/PUT)" },
    { cmd: "204 No Content", desc: "Request succeeded, no body returned (DELETE/PUT)" },
    { cmd: "400 Bad Request", desc: "Malformed request syntax or validation error" },
    { cmd: "401 Unauthorized", desc: "Authentication credentials required or expired" },
    { cmd: "403 Forbidden", desc: "Authenticated but lacks permission for resource" },
    { cmd: "404 Not Found", desc: "Requested resource URI does not exist" },
    { cmd: "409 Conflict", desc: "Conflict with current state of target resource" },
    { cmd: "500 Internal Error", desc: "Unhandled server exception or unexpected failure" },
    { cmd: "502 Bad Gateway", desc: "Invalid response from upstream proxy/server" },
  ],
  regex: [
    { cmd: "^ and $", desc: "Start and end of line anchors" },
    { cmd: "\\d / \\D", desc: "Digit (0-9) / Non-digit character" },
    { cmd: "\\w / \\W", desc: "Word character [a-zA-Z0-9_] / Non-word" },
    { cmd: "\\s / \\S", desc: "Whitespace (space, tab, newline) / Non-whitespace" },
    { cmd: "(?:...)", desc: "Non-capturing grouping parenthesis" },
    { cmd: "(?=...)", desc: "Positive lookahead assertion" },
    { cmd: "(?!...)", desc: "Negative lookahead assertion" },
  ],
  markdown: [
    { cmd: "# Heading 1 / ## Heading 2", desc: "Section & subsection headers" },
    { cmd: "```ts ... ```", desc: "Fenced code block with syntax highlighting" },
    { cmd: "- [ ] Task / - [x] Done", desc: "Interactive checklist items" },
    { cmd: "> [!NOTE] / > [!IMPORTANT]", desc: "GitHub-style callout callouts" },
    { cmd: "| Col 1 | Col 2 |", desc: "Markdown data table format" },
  ],
};

export function DevCheatSheetModal({ isOpen, onClose }: DevCheatSheetModalProps) {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState<"git" | "http" | "regex" | "markdown">("git");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast(`Copied snippet to clipboard`, "success");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!isOpen) return null;

  const currentList = CHEATSHEET_DATA[activeCategory].filter(
    (item) =>
      item.cmd.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in-scale select-none">
      <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden text-foreground">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl brand-gradient-bg flex items-center justify-center text-white brand-glow-subtle">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-foreground">Developer Quick Reference</h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20">
                  CheatSheet
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instant search for Git commands, HTTP status codes, Regex & Markdown
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-400 hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Search Bar */}
        <div className="p-4 border-b border-border bg-card flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/80 text-slate-400 focus-within:border-indigo-500 transition-colors">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search command, status code, or syntax..."
              className="w-full text-xs font-medium text-foreground bg-transparent focus:outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-border bg-card overflow-x-auto">
          <button
            onClick={() => setActiveCategory("git")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "git"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Git Commands</span>
          </button>

          <button
            onClick={() => setActiveCategory("http")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "http"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>HTTP Statuses</span>
          </button>

          <button
            onClick={() => setActiveCategory("regex")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "regex"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Regex className="w-3.5 h-3.5" />
            <span>Regex Tokens</span>
          </button>

          <button
            onClick={() => setActiveCategory("markdown")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "markdown"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Markdown</span>
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-slate-50/60 dark:bg-slate-950/60">
          {currentList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">
              No matching reference items found for "{searchQuery}".
            </div>
          ) : (
            currentList.map((item, idx) => (
              <div
                key={idx}
                onClick={() => copyToClipboard(item.cmd, idx)}
                className="p-3.5 rounded-2xl bg-card border border-border hover:border-indigo-500/50 flex items-center justify-between gap-4 transition-all cursor-pointer group shadow-xs"
              >
                <div className="space-y-1 min-w-0">
                  <code className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 block truncate">
                    {item.cmd}
                  </code>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                    {item.desc}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-indigo-500/40 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
