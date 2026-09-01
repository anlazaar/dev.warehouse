"use client";

import { useState, useEffect } from "react";
import { X, Play, Pause, RotateCcw, Timer, Coffee, Flame } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = "work" | "shortBreak" | "longBreak";

const MODE_TIMES: Record<Mode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function DevPomodoroWidget({ isOpen, onClose }: Props) {
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState<number>(MODE_TIMES.work);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      if (mode === "work") {
        setCompletedSessions((prev) => prev + 1);
        showToast("Great focus! Time for a 5-minute break ☕", "success");
        setMode("shortBreak");
        setTimeLeft(MODE_TIMES.shortBreak);
      } else {
        showToast("Break over! Ready for your next focus session? 🔥", "info");
        setMode("work");
        setTimeLeft(MODE_TIMES.work);
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode, showToast]);

  if (!isOpen) return null;

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_TIMES[mode]);
  };

  const changeMode = (newMode: Mode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(MODE_TIMES[newMode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progress = ((MODE_TIMES[mode] - timeLeft) / MODE_TIMES[mode]) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in-scale select-none">
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl overflow-hidden text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                Focus Pomodoro Timer
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-mono border border-amber-500/20">
                  ALT+T
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Boost deep work & study focus</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-400 hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 flex flex-col items-center space-y-6">
          {/* Mode Selector */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 w-full justify-between">
            <button
              onClick={() => changeMode("work")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === "work"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-foreground"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Focus (25m)</span>
            </button>

            <button
              onClick={() => changeMode("shortBreak")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === "shortBreak"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-foreground"
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Break (5m)</span>
            </button>

            <button
              onClick={() => changeMode("longBreak")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === "longBreak"
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-foreground"
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Rest (15m)</span>
            </button>
          </div>

          {/* Clock Display */}
          <div className="relative w-56 h-56 rounded-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/60 border-4 border-slate-200 dark:border-slate-800 shadow-inner">
            <div className="text-5xl font-mono font-black tracking-tight text-foreground">
              {formattedTime}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-2">
              {mode === "work" ? "Focusing" : "Resting"}
            </div>

            {/* Progress Circle Indicator */}
            <div
              className="absolute inset-0 rounded-full border-4 border-amber-500 transition-all duration-1000"
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${progress > 25 ? "100% 0%" : "50% 0%"}, ${
                  progress > 50 ? "100% 100%" : "100% 0%"
                }, ${progress > 75 ? "0% 100%" : "100% 100%"}, ${progress >= 100 ? "0% 0%" : "0% 100%"})`,
              }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTimer}
              className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl transition-all cursor-pointer active:scale-95 ${
                isRunning
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90"
                  : "bg-amber-500 text-white hover:bg-amber-400 shadow-amber-500/30"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer active:scale-95"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Session Counter */}
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-2 border-t border-border w-full justify-center">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Completed Focus Sessions: <strong className="text-foreground">{completedSessions}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
