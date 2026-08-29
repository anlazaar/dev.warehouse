"use client";

import { useState } from "react";
import {
  X,
  Code2,
  Binary,
  Clock,
  KeyRound,
  Copy,
  Check,
  Zap,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface DevToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "json" | "base64" | "timestamp" | "uuid";

export function DevToolsModal({ isOpen, onClose }: DevToolsModalProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("json");

  // JSON Formatter state
  const [jsonInput, setJsonInput] = useState(`{\n  "project": "DEV.WAREHOUSE",\n  "status": "active",\n  "features": ["Excalidraw", "Markdown", "DevTools"]\n}`);
  const [jsonOutput, setJsonOutput] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Base64 state
  const [base64Input, setBase64Input] = useState("Hello DEV.WAREHOUSE Developer!");
  const [base64Output, setBase64Output] = useState("");
  const [base64Mode, setBase64Mode] = useState<"encode" | "decode">("encode");

  // Timestamp state
  const [timestampInput, setTimestampInput] = useState(() => Math.floor(Date.now() / 1000).toString());
  const [convertedDate, setConvertedDate] = useState<string | null>(null);

  // UUID state
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);
  const [uuidCount, setUuidCount] = useState(5);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`Copied ${label} to clipboard`, "success");
    setTimeout(() => setCopiedField(null), 2000);
  };

  // JSON Format actions
  const handleFormatJson = () => {
    setJsonError(null);
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
    } catch (err: any) {
      setJsonError(err?.message || "Invalid JSON syntax");
      setJsonOutput("");
    }
  };

  const handleMinifyJson = () => {
    setJsonError(null);
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed));
    } catch (err: any) {
      setJsonError(err?.message || "Invalid JSON syntax");
      setJsonOutput("");
    }
  };

  // Base64 actions
  const handleProcessBase64 = () => {
    try {
      if (base64Mode === "encode") {
        setBase64Output(btoa(base64Input));
      } else {
        setBase64Output(atob(base64Input));
      }
    } catch (err) {
      setBase64Output("Error: Invalid input for operation");
    }
  };

  // Timestamp actions
  const handleConvertTimestamp = () => {
    const ts = parseInt(timestampInput, 10);
    if (isNaN(ts)) {
      setConvertedDate("Invalid Timestamp");
      return;
    }
    // If seconds vs millis
    const date = ts > 1e11 ? new Date(ts) : new Date(ts * 1000);
    setConvertedDate(date.toUTCString() + `\nLocal: ${date.toLocaleString()}`);
  };

  // UUID generator
  const handleGenerateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      list.push(crypto.randomUUID());
    }
    setGeneratedUuids(list);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in-scale select-none">
      <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-foreground">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl brand-gradient-bg flex items-center justify-center text-white brand-glow-subtle">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-foreground">Developer Utilities Hub</h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20">
                  Toolbox
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                High-speed offline developer tools & text converters
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-border bg-card overflow-x-auto">
          <button
            onClick={() => setActiveTab("json")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "json"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>JSON Formatter</span>
          </button>

          <button
            onClick={() => setActiveTab("base64")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "base64"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Binary className="w-4 h-4" />
            <span>Base64 Encoder</span>
          </button>

          <button
            onClick={() => setActiveTab("timestamp")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "timestamp"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Epoch Timestamp</span>
          </button>

          <button
            onClick={() => setActiveTab("uuid")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "uuid"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>UUID Generator</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* JSON Formatter */}
          {activeTab === "json" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Raw JSON Input
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFormatJson}
                    className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Format JSON</span>
                  </button>
                  <button
                    onClick={handleMinifyJson}
                    className="px-3 py-1.5 rounded-xl bg-card border border-border hover:bg-slate-800 text-foreground text-xs font-bold transition-colors cursor-pointer"
                  >
                    Minify
                  </button>
                </div>
              </div>

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={6}
                className="w-full p-4 rounded-2xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Paste JSON string here..."
              />

              {jsonError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                  ⚠️ {jsonError}
                </div>
              )}

              {jsonOutput && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Formatted Result
                    </span>
                    <button
                      onClick={() => copyToClipboard(jsonOutput, "Formatted JSON")}
                      className="px-2.5 py-1 rounded-lg bg-card border border-border hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === "Formatted JSON" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto max-h-56">
                    {jsonOutput}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Base64 Encoder */}
          {activeTab === "base64" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBase64Mode("encode")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      base64Mode === "encode"
                        ? "bg-indigo-500 text-white"
                        : "bg-background text-slate-400 border border-border"
                    }`}
                  >
                    Encode to Base64
                  </button>
                  <button
                    onClick={() => setBase64Mode("decode")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      base64Mode === "decode"
                        ? "bg-indigo-500 text-white"
                        : "bg-background text-slate-400 border border-border"
                    }`}
                  >
                    Decode from Base64
                  </button>
                </div>

                <button
                  onClick={handleProcessBase64}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Process</span>
                </button>
              </div>

              <textarea
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                rows={4}
                className="w-full p-4 rounded-2xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Type or paste text..."
              />

              {base64Output && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Output Result
                    </span>
                    <button
                      onClick={() => copyToClipboard(base64Output, "Base64 Output")}
                      className="px-2.5 py-1 rounded-lg bg-card border border-border hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === "Base64 Output" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 break-all">
                    {base64Output}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Epoch Timestamp */}
          {activeTab === "timestamp" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                    Current Unix Epoch (Seconds)
                  </span>
                  <span className="text-xl font-black font-mono text-foreground">
                    {Math.floor(Date.now() / 1000)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const nowTs = Math.floor(Date.now() / 1000).toString();
                    setTimestampInput(nowTs);
                    copyToClipboard(nowTs, "Current Timestamp");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Now</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Timestamp to Convert (Seconds or Milliseconds)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={timestampInput}
                    onChange={(e) => setTimestampInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. 1741700000"
                  />
                  <button
                    onClick={handleConvertTimestamp}
                    className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Convert Date
                  </button>
                </div>
              </div>

              {convertedDate && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-slate-400 block">Human Readable Date:</span>
                  <pre className="font-mono text-xs text-indigo-300 whitespace-pre-wrap">
                    {convertedDate}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* UUID Generator */}
          {activeTab === "uuid" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Quantity:
                  </span>
                  {[1, 5, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setUuidCount(num)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        uuidCount === num
                          ? "bg-indigo-500 text-white"
                          : "bg-background text-slate-400 border border-border"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerateUuids}
                  className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Generate UUID v4</span>
                </button>
              </div>

              {generatedUuids.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Generated UUID List
                    </span>
                    <button
                      onClick={() => copyToClipboard(generatedUuids.join("\n"), "UUID List")}
                      className="px-2.5 py-1 rounded-lg bg-card border border-border hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === "UUID List" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy All</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 max-h-60 overflow-y-auto">
                    {generatedUuids.map((uuid, idx) => (
                      <div
                        key={idx}
                        onClick={() => copyToClipboard(uuid, `UUID #${idx + 1}`)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900/80 font-mono text-xs text-indigo-300 cursor-pointer group transition-colors"
                      >
                        <span>{uuid}</span>
                        <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
