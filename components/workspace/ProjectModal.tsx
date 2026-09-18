"use client";

import { useState, useEffect } from "react";
import { FolderKanban, X, Loader2, Star, Trash2, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export interface ProjectData {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  isFavorite?: boolean;
  tags?: string[];
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: ProjectData | null;
  onProjectSaved: (project: ProjectData) => void;
  onProjectDeleted?: (projectId: string) => void;
}

const PROJECT_COLORS = [
  "#6366f1", // Indigo
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
];

export function ProjectModal({
  isOpen,
  onClose,
  projectToEdit,
  onProjectSaved,
  onProjectDeleted,
}: ProjectModalProps) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name || "");
      setDescription(projectToEdit.description || "");
      setColor(projectToEdit.color || PROJECT_COLORS[0]);
      setIsFavorite(!!projectToEdit.isFavorite);
      setTagsInput(projectToEdit.tags ? projectToEdit.tags.join(", ") : "");
    } else {
      setName("");
      setDescription("");
      setColor(PROJECT_COLORS[0]);
      setIsFavorite(false);
      setTagsInput("");
    }
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Project name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        color,
        isFavorite,
        tags,
      };

      const url = projectToEdit ? `/api/projects/${projectToEdit._id}` : "/api/projects";
      const method = projectToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save project");

      const data = await res.json();
      showToast(projectToEdit ? "Project updated" : "Project created", "success");
      onProjectSaved(data.project);
      onClose();
    } catch (err) {
      console.error("Save project error:", err);
      showToast("Failed to save project", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!projectToEdit) return;
    if (!confirm(`Move project "${projectToEdit.name}" to Trash?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectToEdit._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");

      showToast("Project moved to trash", "info");
      onProjectDeleted?.(projectToEdit._id);
      onClose();
    } catch (err) {
      showToast("Failed to delete project", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in-scale select-none">
      <div className="bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden text-foreground">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
              style={{ backgroundColor: color }}
            >
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {projectToEdit ? "Edit Project" : "New Project"}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Next.js Architecture Redesign"
              className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-indigo-500 focus:outline-none text-foreground font-semibold"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of tasks, specs, and design goals..."
              className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-indigo-500 focus:outline-none text-foreground font-medium resize-none h-20"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1.5">Project Color</label>
            <div className="flex items-center gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                    color === c ? "scale-110 ring-2 ring-indigo-500 ring-offset-2 ring-offset-card" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3 h-3 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="frontend, react, api"
              className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-indigo-500 focus:outline-none text-foreground font-medium"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                isFavorite
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                  : "bg-background text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? "fill-amber-500 text-amber-500" : ""}`} />
              <span>{isFavorite ? "Favorited Project" : "Favorite Project"}</span>
            </button>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            {projectToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Move to Trash</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl border border-border hover:bg-muted font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{projectToEdit ? "Save Changes" : "Create Project"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
