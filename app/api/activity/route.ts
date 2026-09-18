import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Activity } from "@/lib/models/Activity";
import { getSession } from "@/lib/auth";

const ActivitySchema = z.object({
  action: z.string().min(1),
  targetType: z.enum(["page", "folder", "snippet", "cheatsheet", "settings"]),
  targetTitle: z.string().min(1),
  targetId: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const activities = await Activity.find({ userId: session.userId })
      .sort({ timestamp: -1 })
      .limit(30);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("GET /api/activity Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = ActivitySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid activity log payload" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const activity = await Activity.create({
      userId: session.userId,
      ...result.data,
      timestamp: new Date(),
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error("POST /api/activity Error:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}
