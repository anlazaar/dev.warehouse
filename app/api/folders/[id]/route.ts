import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Folder } from "@/lib/models/Folder";
import { Page } from "@/lib/models/Page";

const UpdateFolderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  parentId: z.string().nullable().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  position: z.number().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = UpdateFolderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid update payload", details: result.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const folder = await Folder.findByIdAndUpdate(id, result.data, {
      new: true,
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ folder });
  } catch (error) {
    console.error("PUT /api/folders/[id] Error:", error);
    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const folder = await Folder.findByIdAndDelete(id);
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Move orphan pages to root (folderId = null) to protect data integrity
    await Page.updateMany({ folderId: id }, { $set: { folderId: null } });

    // Move orphan child folders to root
    await Folder.updateMany({ parentId: id }, { $set: { parentId: null } });

    return NextResponse.json({
      success: true,
      message: "Folder deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/folders/[id] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}
