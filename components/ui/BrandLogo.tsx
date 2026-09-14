"use client";

import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function BrandLogo({ size = "md", showText = true, className = "" }: BrandLogoProps) {
  const dimensions = {
    sm: { icon: "w-5 h-5", box: "w-7 h-7", text: "text-xs", subtitle: "hidden" },
    md: { icon: "w-6 h-6", box: "w-9 h-9", text: "text-sm", subtitle: "text-[10px]" },
    lg: { icon: "w-8 h-8", box: "w-11 h-11", text: "text-base", subtitle: "text-xs" },
    xl: { icon: "w-11 h-11", box: "w-14 h-14", text: "text-xl", subtitle: "text-xs" },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Geometric Logo Icon */}
      <div className={`relative flex items-center justify-center shrink-0 ${dimensions.box}`}>
        <div className="absolute inset-0 rounded-2xl brand-gradient-bg opacity-90 blur-xs brand-glow" />
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`relative z-10 text-white transition-transform hover:scale-105 ${dimensions.icon}`}
        >
          {/* Warehouse Isometric Cubes Path */}
          <path
            d="M16 3L4 9V23L16 29L28 23V9L16 3Z"
            fill="url(#brandGradient)"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M16 3V16M16 16L4 9M16 16L28 9"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.9"
          />
          <path
            d="M10 19.5L16 22.5L22 19.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.95"
          />
          <defs>
            <linearGradient
              id="brandGradient"
              x1="4"
              y1="3"
              x2="28"
              y2="29"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#6366f1" />
              <stop offset="0.5" stopColor="#4f46e5" />
              <stop offset="1" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-wider uppercase text-foreground ${dimensions.text}`}>
              DEV<span className="brand-gradient-text">.WAREHOUSE</span>
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-mono text-[9px] font-extrabold uppercase border border-indigo-500/20">
              PRO
            </span>
          </div>
          <span className={`text-slate-400 font-medium leading-tight mt-0.5 ${dimensions.subtitle}`}>
            Developer Workspace
          </span>
        </div>
      )}
    </div>
  );
}

