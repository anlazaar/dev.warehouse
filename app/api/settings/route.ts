import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { UserSettings } from "@/lib/models/UserSettings";
import { getSession } from "@/lib/auth";

const SettingsSchema = z.object({
  theme: z.enum(["dark", "light", "system"]).optional(),
  autoSave: z.boolean().optional(),
  autoSaveInterval: z.number().optional(),
  compactSidebar: z.boolean().optional(),
  defaultView: z.enum(["dashboard", "last_opened"]).optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    let settings = await UserSettings.findOne({ userId: session.userId });

    if (!settings) {
      settings = await UserSettings.create({
        userId: session.userId,
        theme: "dark",
        autoSave: true,
        defaultView: "dashboard",
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("GET /api/settings Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = SettingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid settings payload", details: result.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const settings = await UserSettings.findOneAndUpdate(
      { userId: session.userId },
      { $set: result.data },
      { new: true, upsert: true }
    );

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("PUT /api/settings Error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
