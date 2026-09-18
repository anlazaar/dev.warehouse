import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISnippet extends Document {
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId | null;
  title: string;
  language: string;
  code: string;
  description?: string;
  tags?: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  isTrash?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SnippetSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      default: "typescript",
      trim: true,
    },
    code: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
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
  },
  {
    timestamps: true,
  }
);

SnippetSchema.index({ userId: 1, isPinned: 1, isFavorite: 1, isTrash: 1 });
SnippetSchema.index({ userId: 1, projectId: 1 });

export const Snippet: Model<ISnippet> =
  mongoose.models.Snippet || mongoose.model<ISnippet>("Snippet", SnippetSchema);
