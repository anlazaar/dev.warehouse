import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Folder } from "@/lib/models/Folder";
import { Page } from "@/lib/models/Page";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    await connectToDatabase();

    // Check if it's a full DEV.WAREHOUSE backup or a single Excalidraw JSON file
    if (data.type === "excalidraw" || Array.isArray(data.elements)) {
      // Import as single Excalidraw canvas page
      const page = await Page.create({
        userId: session.userId,
        title: data.name || data.title || "Imported Excalidraw Diagram",
        type: "canvas",
        elements: data.elements || [],
        appState: data.appState || {},
        files: data.files || {},
      });

      return NextResponse.json({
        success: true,
        message: "Excalidraw diagram imported successfully",
        importedCount: { folders: 0, pages: 1 },
        pageId: page._id,
      });
    }

    if (data.app === "DEV.WAREHOUSE" && Array.isArray(data.pages)) {
      const folderMap = new Map<string, string>(); // oldId -> newId

      if (Array.isArray(data.folders)) {
        for (const f of data.folders) {
          const newFolder = await Folder.create({
            userId: session.userId,
            name: f.name || "Imported Folder",
            icon: f.icon || "folder",
            color: f.color || "default",
            position: f.position || 0,
          });
          if (f._id) {
            folderMap.set(f._id.toString(), newFolder._id.toString());
          }
        }
      }

      let importedPagesCount = 0;
      for (const p of data.pages) {
        const targetFolderId = p.folderId ? folderMap.get(p.folderId.toString()) || null : null;
        await Page.create({
          userId: session.userId,
          title: p.title || "Imported Page",
          folderId: targetFolderId,
          type: p.type || "canvas",
          tags: p.tags || [],
          category: p.category || "General",
          elements: p.elements || [],
          appState: p.appState || {},
          files: p.files || {},
          textContent: p.textContent || "",
          isPinned: !!p.isPinned,
          position: p.position || 0,
        });
        importedPagesCount++;
      }

      return NextResponse.json({
        success: true,
        message: "Workspace backup imported successfully",
        importedCount: {
          folders: folderMap.size,
          pages: importedPagesCount,
        },
      });
    }

    return NextResponse.json(
      { error: "Unrecognized import data format" },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/import Error:", error);
    return NextResponse.json(
      { error: "Failed to import workspace data" },
      { status: 500 }
    );
  }
}
