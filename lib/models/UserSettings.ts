import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserSettings extends Document {
  userId: mongoose.Types.ObjectId;
  theme: "dark" | "light" | "system";
  autoSave: boolean;
  autoSaveInterval: number; // in milliseconds
  compactSidebar: boolean;
  defaultView: "dashboard" | "last_opened";
  createdAt: Date;
  updatedAt: Date;
}

const UserSettingsSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    theme: {
      type: String,
      enum: ["dark", "light", "system"],
      default: "dark",
    },
    autoSave: {
      type: Boolean,
      default: true,
    },
    autoSaveInterval: {
      type: Number,
      default: 2000,
    },
    compactSidebar: {
      type: Boolean,
      default: false,
    },
    defaultView: {
      type: String,
      enum: ["dashboard", "last_opened"],
      default: "dashboard",
    },
  },
  {
    timestamps: true,
  }
);

export const UserSettings: Model<IUserSettings> =
  mongoose.models.UserSettings ||
  mongoose.model<IUserSettings>("UserSettings", UserSettingsSchema);
