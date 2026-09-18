import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Page } from "@/lib/models/Page";
import { getSession } from "@/lib/auth";

export async function POST(
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

    const originalPage = await Page.findOne({ _id: id, userId: session.userId });
    if (!originalPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const duplicatedPage = await Page.create({
      userId: session.userId,
      title: `${originalPage.title} (Copy)`,
      folderId: originalPage.folderId,
      type: originalPage.type,
      tags: originalPage.tags || [],
      category: originalPage.category || "General",
      elements: JSON.parse(JSON.stringify(originalPage.elements || [])),
      appState: JSON.parse(JSON.stringify(originalPage.appState || {})),
      files: JSON.parse(JSON.stringify(originalPage.files || {})),
      textContent: originalPage.textContent || "",
      isPinned: false,
      position: (originalPage.position || 0) + 1,
    });

    return NextResponse.json({ page: duplicatedPage }, { status: 201 });
  } catch (error) {
    console.error("POST /api/pages/[id]/duplicate Error:", error);
    return NextResponse.json(
      { error: "Failed to duplicate page" },
      { status: 500 }
    );
  }
}
