import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Page } from "@/lib/models/Page";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const originalPage = await Page.findById(id);
    if (!originalPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const duplicatedPage = await Page.create({
      title: `${originalPage.title} (Copy)`,
      folderId: originalPage.folderId,
      type: originalPage.type,
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
