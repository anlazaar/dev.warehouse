import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Snippet } from "@/lib/models/Snippet";
import { getSession } from "@/lib/auth";

const SnippetSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  language: z.string().default("typescript"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const snippets = await Snippet.find({ userId: session.userId }).sort({
      isPinned: -1,
      updatedAt: -1,
    });

    return NextResponse.json({ snippets });
  } catch (error) {
    console.error("GET /api/snippets Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch snippets" },
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
    const result = SnippetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid snippet payload", details: result.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const snippet = await Snippet.create({
      userId: session.userId,
      ...result.data,
    });

    return NextResponse.json({ snippet }, { status: 201 });
  } catch (error) {
    console.error("POST /api/snippets Error:", error);
    return NextResponse.json(
      { error: "Failed to create snippet" },
      { status: 500 }
    );
  }
}
