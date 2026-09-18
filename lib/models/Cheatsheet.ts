import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICheatsheet extends Document {
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId | null;
  title: string;
  category: string;
  content: string;
  tags?: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  isTrash?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CheatsheetSchema: Schema = new Schema(
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
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    content: {
      type: String,
      required: true,
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

CheatsheetSchema.index({ userId: 1, category: 1, isTrash: 1 });
CheatsheetSchema.index({ userId: 1, projectId: 1 });

export const Cheatsheet: Model<ICheatsheet> =
  mongoose.models.Cheatsheet || mongoose.model<ICheatsheet>("Cheatsheet", CheatsheetSchema);
