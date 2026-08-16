import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Page } from "@/lib/models/Page";

const CreatePageSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  folderId: z.string().nullable().optional(),
  type: z.enum(["canvas", "doc"]).default("canvas"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");

    await connectToDatabase();
    const query: Record<string, unknown> = {};

    if (folderId !== null && folderId !== undefined) {
      query.folderId = folderId === "null" || folderId === "" ? null : folderId;
    }

    // Select light fields for sidebar listing
    const pages = await Page.find(query)
      .select("_id title folderId type isPinned position createdAt updatedAt")
      .sort({ isPinned: -1, position: 1, updatedAt: -1 });

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
    const body = await req.json();
    const result = CreatePageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid page creation payload", details: result.error.format() },
        { status: 400 }
      );
    }

    const { title, folderId, type } = result.data;
    await connectToDatabase();

    const page = await Page.create({
      title,
      folderId: folderId || null,
      type,
      elements: [],
      appState: {},
      files: {},
      textContent: "",
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
