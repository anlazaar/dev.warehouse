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
  Shield,
  Hash,
  Link as LinkIcon,
  Globe,
  Package,
  Send,
  Loader2,
  ExternalLink,
  Terminal,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface DevToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType =
  | "playground"
  | "npm"
  | "json"
  | "base64"
  | "timestamp"
  | "uuid"
  | "jwt"
  | "regex"
  | "hash"
  | "url";

export function DevToolsModal({ isOpen, onClose }: DevToolsModalProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("playground");

  // --- API Playground State ---
  const [apiMethod, setApiMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">("GET");
  const [apiUrl, setApiUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [apiHeaders, setApiHeaders] = useState(`{\n  "Content-Type": "application/json"\n}`);
  const [apiBody, setApiBody] = useState(`{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}`);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [apiTime, setApiTime] = useState<number | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // --- NPM Package Explorer State ---
  const [npmQuery, setNpmQuery] = useState("react");
  const [npmData, setNpmData] = useState<any | null>(null);
  const [npmLoading, setNpmLoading] = useState(false);
  const [npmError, setNpmError] = useState<string | null>(null);

  // --- JSON Formatter state ---
  const [jsonInput, setJsonInput] = useState(
    `{\n  "project": "DEV.WAREHOUSE",\n  "status": "active",\n  "features": ["Excalidraw", "Markdown", "DevTools"]\n}`
  );
  const [jsonOutput, setJsonOutput] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // --- Base64 state ---
  const [base64Input, setBase64Input] = useState("Hello DEV.WAREHOUSE Developer!");
  const [base64Output, setBase64Output] = useState("");
  const [base64Mode, setBase64Mode] = useState<"encode" | "decode">("encode");

  // --- Timestamp state ---
  const [timestampInput, setTimestampInput] = useState(() =>
    Math.floor(Date.now() / 1000).toString()
  );
  const [convertedDate, setConvertedDate] = useState<string | null>(null);

  // --- UUID state ---
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);
  const [uuidCount, setUuidCount] = useState(5);

  // --- JWT Decoder state ---
  const [jwtInput, setJwtInput] = useState("");
  const [jwtHeader, setJwtHeader] = useState<string | null>(null);
  const [jwtPayload, setJwtPayload] = useState<string | null>(null);
  const [jwtError, setJwtError] = useState<string | null>(null);

  // --- Regex Tester state ---
  const [regexPattern, setRegexPattern] = useState(
    `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}`
  );
  const [regexFlags, setRegexFlags] = useState("g");
  const [regexText, setRegexText] = useState(
    "Contact us at support@devwarehouse.local or dev@company.org for assistance."
  );
  const [regexMatches, setRegexMatches] = useState<string[]>([]);

  // --- Hash Generator state ---
  const [hashInput, setHashInput] = useState("DEV.WAREHOUSE Secret Text");
  const [hashOutput, setHashOutput] = useState<{ sha256?: string; sha512?: string } | null>(
    null
  );

  // --- URL Encoder state ---
  const [urlInput, setUrlInput] = useState(
    "https://devwarehouse.local/search?q=developer tools & workspace"
  );
  const [urlOutput, setUrlOutput] = useState("");
  const [urlMode, setUrlMode] = useState<"encode" | "decode">("encode");

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`Copied ${label} to clipboard`, "success");
    setTimeout(() => setCopiedField(null), 2000);
  };

  // --- API Playground Action ---
  const handleSendApiRequest = async () => {
    setApiLoading(true);
    setApiError(null);
    setApiResponse(null);
    setApiStatus(null);
    setApiTime(null);
    const startTime = performance.now();

    try {
      let parsedHeaders: Record<string, string> = {};
      try {
        if (apiHeaders.trim()) parsedHeaders = JSON.parse(apiHeaders);
      } catch (err) {
        throw new Error("Invalid Headers JSON format");
      }

      const options: RequestInit = {
        method: apiMethod,
        headers: parsedHeaders,
      };

      if (apiMethod !== "GET" && apiBody.trim()) {
        options.body = apiBody;
      }

      const res = await fetch(apiUrl, options);
      const endTime = performance.now();
      setApiTime(Math.round(endTime - startTime));
      setApiStatus(res.status);

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const json = await res.json();
        setApiResponse(JSON.stringify(json, null, 2));
      } else {
        const text = await res.text();
        setApiResponse(text);
      }
    } catch (err: any) {
      setApiError(err?.message || "Failed to execute request");
    } finally {
      setApiLoading(false);
    }
  };

  const generateCurlCommand = () => {
    let curl = `curl -X ${apiMethod} "${apiUrl}"`;
    try {
      if (apiHeaders.trim()) {
        const parsed = JSON.parse(apiHeaders);
        Object.entries(parsed).forEach(([k, v]) => {
          curl += ` -H "${k}: ${v}"`;
        });
      }
    } catch {}
    if (apiMethod !== "GET" && apiBody.trim()) {
      curl += ` -d '${apiBody.replace(/\n/g, "")}'`;
    }
    return curl;
  };

  // --- NPM Package Action ---
  const handleSearchNpmPackage = async () => {
    if (!npmQuery.trim()) return;
    setNpmLoading(true);
    setNpmError(null);
    setNpmData(null);
    try {
      const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(npmQuery.trim())}`);
      if (!res.ok) {
        throw new Error(`Package "${npmQuery}" not found on NPM registry`);
      }
      const data = await res.json();
      const latestVersion = data["dist-tags"]?.latest || Object.keys(data.versions || {}).pop();
      const latestData = data.versions?.[latestVersion] || {};

      setNpmData({
        name: data.name,
        description: data.description,
        version: latestVersion,
        license: latestData.license || data.license || "MIT",
        homepage: data.homepage || latestData.homepage,
        repository: data.repository?.url || latestData.repository?.url,
        dependenciesCount: Object.keys(latestData.dependencies || {}).length,
        devDependenciesCount: Object.keys(latestData.devDependencies || {}).length,
        author: typeof data.author === "object" ? data.author.name : data.author,
      });
    } catch (err: any) {
      setNpmError(err?.message || "Failed to fetch NPM package details");
    } finally {
      setNpmLoading(false);
    }
  };

  // --- Utility Actions ---
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

  const handleConvertTimestamp = () => {
    const ts = parseInt(timestampInput, 10);
    if (isNaN(ts)) {
      setConvertedDate("Invalid Timestamp");
      return;
    }
    const date = ts > 1e11 ? new Date(ts) : new Date(ts * 1000);
    setConvertedDate(date.toUTCString() + `\nLocal: ${date.toLocaleString()}`);
  };

  const handleGenerateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      list.push(crypto.randomUUID());
    }
    setGeneratedUuids(list);
  };

  const handleDecodeJwt = () => {
    setJwtError(null);
    setJwtHeader(null);
    setJwtPayload(null);
    try {
      const parts = jwtInput.trim().split(".");
      if (parts.length < 2) {
        throw new Error("Invalid JWT token format");
      }
      const headerStr = atob(parts[0].replace(/-/g, "+").replace(/_/g, "/"));
      const payloadStr = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));

      setJwtHeader(JSON.stringify(JSON.parse(headerStr), null, 2));
      setJwtPayload(JSON.stringify(JSON.parse(payloadStr), null, 2));
    } catch (err: any) {
      setJwtError(err?.message || "Failed to decode JWT token");
    }
  };

  const handleTestRegex = () => {
    try {
      const re = new RegExp(regexPattern, regexFlags);
      const matches = Array.from(regexText.matchAll(re), (m) => m[0]);
      setRegexMatches(matches);
    } catch (err: any) {
      setRegexMatches([`Regex Error: ${err?.message || "Invalid regular expression"}`]);
    }
  };

  const handleGenerateHashes = async () => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(hashInput);

      const buffer256 = await crypto.subtle.digest("SHA-256", data);
      const hash256 = Array.from(new Uint8Array(buffer256))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const buffer512 = await crypto.subtle.digest("SHA-512", data);
      const hash512 = Array.from(new Uint8Array(buffer512))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      setHashOutput({ sha256: hash256, sha512: hash512 });
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessUrl = () => {
    try {
      if (urlMode === "encode") {
        setUrlOutput(encodeURIComponent(urlInput));
      } else {
        setUrlOutput(decodeURIComponent(urlInput));
      }
    } catch (err) {
      setUrlOutput("Error: Invalid URL string");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in-scale select-none">
      <div className="bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92dvh] flex flex-col overflow-hidden text-foreground">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl brand-gradient-bg flex items-center justify-center text-white brand-glow-subtle">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-foreground">Developer Utilities Suite</h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20">
                  Workspace DevTools
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                API Playground, NPM Explorer, JSON, Base64, JWT, Regex & Hashes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 py-2 border-b border-border bg-card overflow-x-auto shrink-0">
          {[
            { id: "playground", label: "API Playground", icon: Globe },
            { id: "npm", label: "NPM Explorer", icon: Package },
            { id: "json", label: "JSON Formatter", icon: Code2 },
            { id: "jwt", label: "JWT Decoder", icon: Shield },
            { id: "base64", label: "Base64", icon: Binary },
            { id: "regex", label: "Regex Tester", icon: Code2 },
            { id: "hash", label: "Hash Generator", icon: Hash },
            { id: "url", label: "URL Encode/Decode", icon: LinkIcon },
            { id: "timestamp", label: "Timestamp", icon: Clock },
            { id: "uuid", label: "UUID Generator", icon: KeyRound },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* --- API Playground Tab --- */}
          {activeTab === "playground" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={apiMethod}
                  onChange={(e) => setApiMethod(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-background border border-border font-mono text-xs font-bold text-indigo-400 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>

                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.example.com/v1/resource"
                  className="flex-1 w-full px-4 py-2 rounded-xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:border-indigo-500"
                />

                <button
                  onClick={handleSendApiRequest}
                  disabled={apiLoading}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  {apiLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Send Request</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Headers (JSON)
                  </label>
                  <textarea
                    value={apiHeaders}
                    onChange={(e) => setApiHeaders(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-2xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {apiMethod !== "GET" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Request Body (JSON / Text)
                    </label>
                    <textarea
                      value={apiBody}
                      onChange={(e) => setApiBody(e.target.value)}
                      rows={4}
                      className="w-full p-3 rounded-2xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* cURL Command Generator */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Terminal className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-mono text-muted-foreground truncate">{generateCurlCommand()}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(generateCurlCommand(), "cURL command")}
                  className="px-2.5 py-1 rounded-lg bg-card border border-border hover:bg-muted text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy cURL</span>
                </button>
              </div>

              {/* Response Section */}
              {apiError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                  ⚠️ {apiError}
                </div>
              )}

              {apiResponse && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Response Output
                      </span>
                      {apiStatus && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                            apiStatus < 300
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-red-500/10 text-red-400 border-red-500/30"
                          }`}
                        >
                          Status: {apiStatus}
                        </span>
                      )}
                      {apiTime && (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {apiTime} ms
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(apiResponse, "API Response")}
                      className="px-2.5 py-1 rounded-lg bg-card border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === "API Response" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy Result</span>
                    </button>
                  </div>

                  <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto max-h-72">
                    {apiResponse}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* --- NPM Package Explorer Tab --- */}
          {activeTab === "npm" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={npmQuery}
                  onChange={(e) => setNpmQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchNpmPackage()}
                  placeholder="Enter package name (e.g. react, lodash, zippie)..."
                  className="flex-1 px-4 py-2 rounded-xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSearchNpmPackage}
                  disabled={npmLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {npmLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                  <span>Search Registry</span>
                </button>
              </div>

              {npmError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                  ⚠️ {npmError}
                </div>
              )}

              {npmData && (
                <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
                  <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-foreground">{npmData.name}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold border border-indigo-500/30">
                          v{npmData.version}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-mono border border-border">
                          {npmData.license}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{npmData.description}</p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(`npm i ${npmData.name}`, "install command")}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>npm i {npmData.name}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Author</span>
                      <span className="font-semibold text-foreground truncate block">{npmData.author || "Community"}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Dependencies</span>
                      <span className="font-semibold text-foreground">{npmData.dependenciesCount}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">DevDependencies</span>
                      <span className="font-semibold text-foreground">{npmData.devDependenciesCount}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">NPM Registry</span>
                      <a
                        href={`https://www.npmjs.com/package/${npmData.name}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline font-bold flex items-center gap-1"
                      >
                        <span>npmjs.com</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- JSON Formatter --- */}
          {activeTab === "json" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
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
                    className="px-3 py-1.5 rounded-xl bg-card border border-border hover:bg-muted text-foreground text-xs font-bold transition-colors cursor-pointer"
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
                      className="px-2.5 py-1 rounded-lg bg-card border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === "Formatted JSON" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
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

          {/* --- JWT Decoder --- */}
          {activeTab === "jwt" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Paste Encoded JWT Token
                </span>
                <button
                  onClick={handleDecodeJwt}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Decode Token</span>
                </button>
              </div>

              <textarea
                value={jwtInput}
                onChange={(e) => setJwtInput(e.target.value)}
                rows={3}
                className="w-full p-4 rounded-2xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSIsImlhdCI6MTYwMDAwMDAwMH0..."
              />

              {jwtError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                  ⚠️ {jwtError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jwtHeader && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                      HEADER: ALGORITHM & TOKEN TYPE
                    </span>
                    <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
                      {jwtHeader}
                    </pre>
                  </div>
                )}

                {jwtPayload && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                      PAYLOAD: DATA CLAIMS
                    </span>
                    <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                      {jwtPayload}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- Regex Tester --- */}
          {activeTab === "regex" && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-3 space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Regex Pattern
                  </label>
                  <input
                    type="text"
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:border-indigo-500"
                    placeholder="Pattern (e.g. [a-z]+)"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Flags
                  </label>
                  <input
                    type="text"
                    value={regexFlags}
                    onChange={(e) => setRegexFlags(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:border-indigo-500"
                    placeholder="g, i, m"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Test Subject Text
                  </label>
                  <button
                    onClick={handleTestRegex}
                    className="px-3 py-1 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Execute Regex
                  </button>
                </div>
                <textarea
                  value={regexText}
                  onChange={(e) => setRegexText(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-2xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:border-indigo-500"
                />
              </div>

              {regexMatches.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Matches Found ({regexMatches.length})
                  </span>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 max-h-48 overflow-y-auto">
                    {regexMatches.map((m, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 font-mono text-xs border border-indigo-500/20"
                      >
                        Match #{idx + 1}: <span className="font-bold text-white">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- Hash Generator --- */}
          {activeTab === "hash" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Input String to Hash
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleGenerateHashes}
                    className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Generate Hashes
                  </button>
                </div>
              </div>

              {hashOutput && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      SHA-256
                    </span>
                    <div
                      onClick={() => copyToClipboard(hashOutput.sha256 || "", "SHA-256")}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 break-all cursor-pointer hover:border-emerald-500/50 transition-colors"
                    >
                      {hashOutput.sha256}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      SHA-512
                    </span>
                    <div
                      onClick={() => copyToClipboard(hashOutput.sha512 || "", "SHA-512")}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 break-all cursor-pointer hover:border-indigo-500/50 transition-colors max-h-24 overflow-y-auto"
                    >
                      {hashOutput.sha512}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- URL Encoder/Decoder --- */}
          {activeTab === "url" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUrlMode("encode")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      urlMode === "encode"
                        ? "bg-indigo-500 text-white"
                        : "bg-background text-muted-foreground border border-border"
                    }`}
                  >
                    Encode URL
                  </button>
                  <button
                    onClick={() => setUrlMode("decode")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      urlMode === "decode"
                        ? "bg-indigo-500 text-white"
                        : "bg-background text-muted-foreground border border-border"
                    }`}
                  >
                    Decode URL
                  </button>
                </div>

                <button
                  onClick={handleProcessUrl}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Process URL
                </button>
              </div>

              <textarea
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                rows={4}
                className="w-full p-4 rounded-2xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:border-indigo-500"
              />

              {urlOutput && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Processed Result
                    </span>
                    <button
                      onClick={() => copyToClipboard(urlOutput, "URL Result")}
                      className="px-2.5 py-1 rounded-lg bg-card border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === "URL Result" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 break-all">
                    {urlOutput}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- Base64 Encoder --- */}
          {activeTab === "base64" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBase64Mode("encode")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      base64Mode === "encode"
                        ? "bg-indigo-500 text-white"
                        : "bg-background text-muted-foreground border border-border"
                    }`}
                  >
                    Encode to Base64
                  </button>
                  <button
                    onClick={() => setBase64Mode("decode")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      base64Mode === "decode"
                        ? "bg-indigo-500 text-white"
                        : "bg-background text-muted-foreground border border-border"
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
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Output Result
                    </span>
                    <button
                      onClick={() => copyToClipboard(base64Output, "Base64 Output")}
                      className="px-2.5 py-1 rounded-lg bg-card border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === "Base64 Output" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
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

          {/* --- Epoch Timestamp --- */}
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
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
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
                  <span className="text-xs font-bold text-muted-foreground block">
                    Human Readable Date:
                  </span>
                  <pre className="font-mono text-xs text-indigo-300 whitespace-pre-wrap">
                    {convertedDate}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* --- UUID Generator --- */}
          {activeTab === "uuid" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Quantity:
                  </span>
                  {[1, 5, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setUuidCount(num)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        uuidCount === num
                          ? "bg-indigo-500 text-white"
                          : "bg-background text-muted-foreground border border-border"
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
                      className="px-2.5 py-1 rounded-lg bg-card border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === "UUID List" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
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
                        <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-indigo-400 transition-colors" />
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
