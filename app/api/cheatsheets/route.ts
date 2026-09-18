import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Cheatsheet } from "@/lib/models/Cheatsheet";
import { getSession } from "@/lib/auth";

const CheatsheetSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  category: z.string().default("General"),
  content: z.string().min(1, "Content is required"),
  isPinned: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const cheatsheets = await Cheatsheet.find({ userId: session.userId }).sort({
      isPinned: -1,
      category: 1,
      updatedAt: -1,
    });

    return NextResponse.json({ cheatsheets });
  } catch (error) {
    console.error("GET /api/cheatsheets Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cheatsheets" },
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
    const result = CheatsheetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid cheatsheet payload", details: result.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const cheatsheet = await Cheatsheet.create({
      userId: session.userId,
      ...result.data,
    });

    return NextResponse.json({ cheatsheet }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cheatsheets Error:", error);
    return NextResponse.json(
      { error: "Failed to create cheatsheet" },
      { status: 500 }
    );
  }
}
