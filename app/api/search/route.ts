import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Page } from "@/lib/models/Page";
import { Folder } from "@/lib/models/Folder";
import { Snippet } from "@/lib/models/Snippet";
import { Cheatsheet } from "@/lib/models/Cheatsheet";
import { Project } from "@/lib/models/Project";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({
        pages: [],
        folders: [],
        snippets: [],
        cheatsheets: [],
        projects: [],
      });
    }

    await connectToDatabase();
    const searchRegex = new RegExp(query.trim(), "i");

    const [pages, folders, snippets, cheatsheets, projects] = await Promise.all([
      Page.find({
        userId: session.userId,
        isTrash: { $ne: true },
        $or: [
          { title: searchRegex },
          { textContent: searchRegex },
          { tags: searchRegex },
          { category: searchRegex },
        ],
      })
        .select("_id title folderId projectId type textContent tags category isFavorite updatedAt")
        .limit(15),

      Folder.find({ userId: session.userId, name: searchRegex })
        .select("_id name icon color")
        .limit(10),

      Snippet.find({
        userId: session.userId,
        isTrash: { $ne: true },
        $or: [
          { title: searchRegex },
          { code: searchRegex },
          { description: searchRegex },
          { language: searchRegex },
          { tags: searchRegex },
        ],
      })
        .select("_id title code language description tags projectId isFavorite updatedAt")
        .limit(10),

      Cheatsheet.find({
        userId: session.userId,
        isTrash: { $ne: true },
        $or: [
          { title: searchRegex },
          { category: searchRegex },
          { tags: searchRegex },
          { "items.command": searchRegex },
          { "items.description": searchRegex },
        ],
      })
        .select("_id title category tags projectId isFavorite updatedAt")
        .limit(10),

      Project.find({
        userId: session.userId,
        isTrash: { $ne: true },
        $or: [{ name: searchRegex }, { description: searchRegex }],
      })
        .select("_id name description color isFavorite updatedAt")
        .limit(5),
    ]);

    return NextResponse.json({ pages, folders, snippets, cheatsheets, projects });
  } catch (error) {
    console.error("GET /api/search Error:", error);
    return NextResponse.json(
      { error: "Failed to perform workspace search" },
      { status: 500 }
    );
  }
}
