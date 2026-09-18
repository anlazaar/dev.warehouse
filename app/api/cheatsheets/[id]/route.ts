import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Cheatsheet } from "@/lib/models/Cheatsheet";
import { getSession } from "@/lib/auth";

const UpdateCheatsheetSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  category: z.string().optional(),
  content: z.string().optional(),
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
    const result = UpdateCheatsheetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid cheatsheet update payload", details: result.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const cheatsheet = await Cheatsheet.findOneAndUpdate(
      { _id: id, userId: session.userId },
      result.data,
      { new: true }
    );

    if (!cheatsheet) {
      return NextResponse.json({ error: "Cheatsheet not found" }, { status: 404 });
    }

    return NextResponse.json({ cheatsheet });
  } catch (error) {
    console.error("PUT /api/cheatsheets/[id] Error:", error);
    return NextResponse.json(
      { error: "Failed to update cheatsheet" },
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

    const cheatsheet = await Cheatsheet.findOneAndDelete({
      _id: id,
      userId: session.userId,
    });
    if (!cheatsheet) {
      return NextResponse.json({ error: "Cheatsheet not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Cheatsheet deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/cheatsheets/[id] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete cheatsheet" },
      { status: 500 }
    );
  }
}
