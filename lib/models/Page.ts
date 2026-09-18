import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPageVersion {
  title: string;
  textContent: string;
  createdAt: Date;
}

export interface IPage extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  folderId?: mongoose.Types.ObjectId | null;
  projectId?: mongoose.Types.ObjectId | null;
  type: "canvas" | "doc";
  elements: Record<string, unknown>[];
  appState: Record<string, unknown>;
  files: Record<string, unknown>;
  textContent?: string;
  tags?: string[];
  category?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  isTrash?: boolean;
  position?: number;
  versions?: IPageVersion[];
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled Page",
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    type: {
      type: String,
      enum: ["canvas", "doc"],
      default: "canvas",
    },
    elements: {
      type: Schema.Types.Mixed,
      default: [],
    },
    appState: {
      type: Schema.Types.Mixed,
      default: {},
    },
    files: {
      type: Schema.Types.Mixed,
      default: {},
    },
    textContent: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: "General",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isTrash: {
      type: Boolean,
      default: false,
    },
    position: {
      type: Number,
      default: 0,
    },
    versions: {
      type: [
        {
          title: { type: String, required: true },
          textContent: { type: String, default: "" },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

PageSchema.index({ userId: 1, folderId: 1 });
PageSchema.index({ userId: 1, projectId: 1 });
PageSchema.index({ userId: 1, isPinned: 1, isFavorite: 1, isTrash: 1 });
PageSchema.index({ title: "text", textContent: "text" });

export const Page: Model<IPage> =
  mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema);
