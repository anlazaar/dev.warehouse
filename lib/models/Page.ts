import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPage extends Document {
  title: string;
  folderId?: mongoose.Types.ObjectId | null;
  type: "canvas" | "doc";
  elements: Record<string, unknown>[];
  appState: Record<string, unknown>;
  files: Record<string, unknown>;
  textContent?: string;
  isPinned?: boolean;
  position?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema: Schema = new Schema(
  {
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
    isPinned: {
      type: Boolean,
      default: false,
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

PageSchema.index({ folderId: 1 });
PageSchema.index({ title: "text", textContent: "text" });

export const Page: Model<IPage> =
  mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema);
