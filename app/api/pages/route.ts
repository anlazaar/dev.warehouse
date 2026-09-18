import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Page } from "@/lib/models/Page";
import { getSession } from "@/lib/auth";

const CreatePageSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  folderId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  type: z.enum(["canvas", "doc"]).default("canvas"),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  isFavorite: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    const projectId = searchParams.get("projectId");
    const tag = searchParams.get("tag");
    const isPinned = searchParams.get("pinned");
    const isFavorite = searchParams.get("favorite");
    const includeTrash = searchParams.get("trash") === "true";

    await connectToDatabase();
    const query: Record<string, unknown> = { userId: session.userId };

    if (!includeTrash) {
      query.isTrash = { $ne: true };
    } else {
      query.isTrash = true;
    }

    if (folderId !== null && folderId !== undefined) {
      query.folderId = folderId === "null" || folderId === "" ? null : folderId;
    }
    if (projectId !== null && projectId !== undefined) {
      query.projectId = projectId === "null" || projectId === "" ? null : projectId;
    }
    if (tag) {
      query.tags = tag;
    }
    if (isPinned === "true") {
      query.isPinned = true;
    }
    if (isFavorite === "true") {
      query.isFavorite = true;
    }

    const pages = await Page.find(query)
      .select("_id title folderId projectId type tags category isPinned isFavorite isTrash position createdAt updatedAt")
      .sort({ isPinned: -1, isFavorite: -1, position: 1, updatedAt: -1 });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("GET /api/pages Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
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
    const result = CreatePageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid page creation payload", details: result.error.format() },
        { status: 400 }
      );
    }

    const { title, folderId, projectId, type, tags, category, isFavorite } = result.data;
    await connectToDatabase();

    const page = await Page.create({
      userId: session.userId,
      title,
      folderId: folderId || null,
      projectId: projectId || null,
      type,
      tags: tags || [],
      category: category || "General",
      isFavorite: isFavorite || false,
      isTrash: false,
      elements: [],
      appState: {},
      files: {},
      textContent: "",
      versions: [],
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error("POST /api/pages Error:", error);
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}
