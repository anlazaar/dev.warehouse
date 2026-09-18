import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Snippet } from "@/lib/models/Snippet";
import { getSession } from "@/lib/auth";

const UpdateSnippetSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  language: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = UpdateSnippetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid snippet update payload", details: result.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const snippet = await Snippet.findOneAndUpdate(
      { _id: id, userId: session.userId },
      result.data,
      { new: true }
    );

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    return NextResponse.json({ snippet });
  } catch (error) {
    console.error("PUT /api/snippets/[id] Error:", error);
    return NextResponse.json(
      { error: "Failed to update snippet" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const snippet = await Snippet.findOneAndDelete({
      _id: id,
      userId: session.userId,
    });
    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Snippet deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/snippets/[id] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete snippet" },
      { status: 500 }
    );
  }
}
