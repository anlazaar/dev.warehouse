import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  targetType: "page" | "folder" | "snippet" | "cheatsheet" | "settings";
  targetTitle: string;
  targetId?: string;
  timestamp: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["page", "folder", "snippet", "cheatsheet", "settings"],
      required: true,
    },
    targetTitle: {
      type: String,
      required: true,
    },
    targetId: {
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ActivitySchema.index({ userId: 1, timestamp: -1 });

export const Activity: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);
