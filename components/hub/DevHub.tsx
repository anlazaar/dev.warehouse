"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Newspaper,
  BookOpen,
  ExternalLink,
  Search,
  RefreshCw,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Clock,
  Code,
  Compass,
  Sparkles,
  Loader2,
  Tag,
} from "lucide-react";

interface HNStory {
  id: number;
  title: string;
  url?: string;
  by: string;
  score: number;
  time: number;
  comments_count?: number;
}

interface DevArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  user: { name: string; username: string; profile_image: string };
  positive_reactions_count: number;
  comments_count: number;
  tag_list: string[];
  reading_time_minutes: number;
}

interface RoadmapItem {
  id: string;
  title: string;
  category: "Role Based" | "Skill Based";
  description: string;
  url: string;
  tags: string[];
  iconBg: string;
}

const ROADMAPS: RoadmapItem[] = [
  {
    id: "frontend",
    title: "Frontend Developer",
    category: "Role Based",
    description: "Step by step guide to becoming a modern frontend developer in 2026.",
    url: "https://roadmap.sh/frontend",
    tags: ["HTML", "CSS", "JavaScript", "React", "Next.js", "TypeScript"],
    iconBg: "from-blue-500 to-cyan-500",
  },
  {
    id: "backend",
    title: "Backend Developer",
    category: "Role Based",
    description: "System design, databases, Node.js, Go, microservices, and APIs.",
    url: "https://roadmap.sh/backend",
    tags: ["Node.js", "Python", "SQL", "PostgreSQL", "Docker", "REST/gRPC"],
    iconBg: "from-emerald-500 to-teal-500",
  },
  {
    id: "devops",
    title: "DevOps & SRE",
    category: "Role Based",
    description: "CI/CD pipelines, Kubernetes, Terraform, AWS, and infrastructure.",
    url: "https://roadmap.sh/devops",
    tags: ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS", "Prometheus"],
    iconBg: "from-amber-500 to-orange-500",
  },
  {
    id: "full-stack",
    title: "Full Stack Developer",
    category: "Role Based",
    description: "End-to-end web app development architecture and engineering.",
    url: "https://roadmap.sh/full-stack",
    tags: ["Frontend", "Backend", "Databases", "DevOps", "Testing"],
    iconBg: "from-indigo-500 to-purple-500",
  },
  {
    id: "ai-data-science",
    title: "AI & Data Science",
    category: "Skill Based",
    description: "Machine learning algorithms, LLMs, PyTorch, and data engineering.",
    url: "https://roadmap.sh/ai-data-scientist",
    tags: ["Python", "PyTorch", "LLMs", "Vector DBs", "Scikit-Learn"],
    iconBg: "from-purple-500 to-pink-500",
  },
  {
    id: "computer-science",
    title: "Computer Science",
    category: "Skill Based",
    description: "Core algorithms, data structures, OS, networking, and architecture.",
    url: "https://roadmap.sh/computer-science",
    tags: ["Algorithms", "Data Structures", "OS", "Networking", "Design"],
    iconBg: "from-red-500 to-rose-500",
  },
];

export function DevHub() {
  const [activeTab, setActiveTab] = useState<"hn" | "devto" | "roadmaps">("hn");
  const [searchQuery, setSearchQuery] = useState("");

  // Hacker News State
  const [hnStories, setHnStories] = useState<HNStory[]>([]);
  const [isLoadingHn, setIsLoadingHn] = useState(false);

  // DEV.to State
  const [devArticles, setDevArticles] = useState<DevArticle[]>([]);
  const [isLoadingDev, setIsLoadingDev] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("webdev");

  // Fetch Hacker News Top Stories
  const fetchHnStories = useCallback(async () => {
    setIsLoadingHn(true);
    try {
      // Official Hacker News Algolia API for fast search/top stories
      const res = await fetch(
        "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=25"
      );
      if (res.ok) {
        const data = await res.json();
        const mapped: HNStory[] = (data.hits || []).map((item: any) => ({
          id: item.objectID,
          title: item.title || "Untitled",
          url: item.url || `https://news.ycombinator.com/item?id=${item.objectID}`,
          by: item.author || "anonymous",
          score: item.points || 0,
          time: item.created_at_i || Math.floor(Date.now() / 1000),
          comments_count: item.num_comments || 0,
        }));
        setHnStories(mapped);
      }
    } catch (err) {
      console.error("Error fetching Hacker News:", err);
    } finally {
      setIsLoadingHn(false);
    }
  }, []);

  // Fetch DEV.to Articles
  const fetchDevArticles = useCallback(async (tag: string) => {
    setIsLoadingDev(true);
    try {
      const res = await fetch(
        `https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&per_page=20`
      );
      if (res.ok) {
        const data = await res.json();
        setDevArticles(data || []);
      }
    } catch (err) {
      console.error("Error fetching DEV.to articles:", err);
    } finally {
      setIsLoadingDev(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "hn" && hnStories.length === 0) {
      fetchHnStories();
    } else if (activeTab === "devto" && devArticles.length === 0) {
      fetchDevArticles(selectedTag);
    }
  }, [activeTab, hnStories.length, devArticles.length, selectedTag, fetchHnStories, fetchDevArticles]);

  const filteredHn = hnStories.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDev = devArticles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRoadmaps = ROADMAPS.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Dev Hub Header Bar */}
      <div className="p-4 sm:p-5 border-b border-border bg-card/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl brand-gradient-bg flex items-center justify-center text-white shadow-md">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Developer Hub
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-extrabold uppercase border border-indigo-500/20">
                Live Tech Feeds
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Curated tech news from Hacker News, DEV Community & roadmap.sh guides.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news, topics, roadmaps..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-background/80 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-4 py-2 border-b border-border/60 bg-muted/30 flex items-center justify-between shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("hn")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "hn"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-foreground hover:bg-slate-800/40"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Hacker News</span>
          </button>

          <button
            onClick={() => setActiveTab("devto")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "devto"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-foreground hover:bg-slate-800/40"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>DEV Community</span>
          </button>

          <button
            onClick={() => setActiveTab("roadmaps")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "roadmaps"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-foreground hover:bg-slate-800/40"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Developer Roadmaps</span>
          </button>
        </div>

        {/* Refresh Button */}
        {activeTab !== "roadmaps" && (
          <button
            onClick={() => {
              if (activeTab === "hn") fetchHnStories();
              else if (activeTab === "devto") fetchDevArticles(selectedTag);
            }}
            disabled={isLoadingHn || isLoadingDev}
            className="p-1.5 rounded-xl text-slate-400 hover:text-foreground hover:bg-slate-800/40 transition-colors cursor-pointer"
            title="Refresh feed"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isLoadingHn || isLoadingDev ? "animate-spin text-indigo-400" : ""
              }`}
            />
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* HACKER NEWS TAB */}
        {activeTab === "hn" && (
          <div>
            {isLoadingHn ? (
              <div className="w-full py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                <p className="text-xs font-semibold">Fetching latest Hacker News stories...</p>
              </div>
            ) : filteredHn.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No stories match your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredHn.map((story) => (
                  <a
                    key={story.id}
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-card border border-border hover:border-amber-500/50 hover:shadow-lg transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <ThumbsUp className="w-3 h-3" />
                          {story.score} pts
                        </span>
                        <span>•</span>
                        <span>by {story.by}</span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-amber-500 transition-colors line-clamp-2 leading-snug">
                        {story.title}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-slate-500" />
                        {story.comments_count || 0} comments
                      </span>
                      <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-indigo-400 font-semibold">
                        Read Story <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DEV.TO TAB */}
        {activeTab === "devto" && (
          <div className="space-y-4">
            {/* Tag Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {["webdev", "javascript", "react", "nextjs", "python", "devops", "ai"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(tag);
                    fetchDevArticles(tag);
                  }}
                  className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                    selectedTag === tag
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40"
                      : "bg-card border border-border text-slate-400 hover:text-foreground"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>

            {isLoadingDev ? (
              <div className="w-full py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-xs font-semibold">Fetching #{selectedTag} articles from DEV.to...</p>
              </div>
            ) : filteredDev.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No DEV.to articles found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredDev.map((article) => (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-card border border-border hover:border-indigo-500/50 hover:shadow-lg transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {article.user?.profile_image && (
                          <img
                            src={article.user.profile_image}
                            alt={article.user.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        )}
                        <span className="text-[11px] text-slate-400 font-medium">
                          {article.user?.name || "DEV Author"}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.reading_time_minutes} min read
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-foreground group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h3>

                      {article.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-normal">
                          {article.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {article.tag_list?.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-mono text-[10px]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <span className="flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                        Open Article <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ROADMAPS TAB */}
        {activeTab === "roadmaps" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <p className="font-bold text-indigo-200">Official Community Developer Roadmaps</p>
                <p className="text-slate-400 text-[11px]">
                  Explore official, community-curated learning paths and skill guides from roadmap.sh.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoadmaps.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 rounded-2xl bg-card border border-border hover:border-emerald-500/50 hover:shadow-xl transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold uppercase">
                        {item.category}
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    </div>

                    <h3 className="text-base font-bold text-foreground group-hover:text-emerald-400 transition-colors mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal mb-4 font-normal">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[10px] font-semibold border border-slate-700/50"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
