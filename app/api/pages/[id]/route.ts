import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Page } from "@/lib/models/Page";
import { getSession } from "@/lib/auth";

const UpdatePageSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  folderId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  type: z.enum(["canvas", "doc"]).optional(),
  elements: z.array(z.record(z.string(), z.unknown())).optional(),
  appState: z.record(z.string(), z.unknown()).optional(),
  files: z.record(z.string(), z.unknown()).optional(),
  textContent: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  isPinned: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  isTrash: z.boolean().optional(),
  position: z.number().optional(),
});

function isValidElement(el: any): boolean {
  if (!el || typeof el !== "object") return false;
  if (typeof el.type !== "string" || !el.type) return false;
  if (typeof el.id !== "string" || !el.id) return false;
  if (typeof el.x !== "number" || Number.isNaN(el.x)) return false;
  if (typeof el.y !== "number" || Number.isNaN(el.y)) return false;
  if (typeof el.width !== "number" || Number.isNaN(el.width)) return false;
  if (typeof el.height !== "number" || Number.isNaN(el.height)) return false;

  if (["line", "arrow", "freedraw"].includes(el.type)) {
    if (!Array.isArray(el.points) || el.points.length === 0) return false;
    if (
      el.points.some(
        (p: any) =>
          !Array.isArray(p) ||
          p.length < 2 ||
          typeof p[0] !== "number" ||
          Number.isNaN(p[0]) ||
          typeof p[1] !== "number" ||
          Number.isNaN(p[1])
      )
    ) {
      return false;
    }
  }
  return true;
}

function sanitizeAppState(appState: any): any {
  if (!appState || typeof appState !== "object") return {};
  const clean = { ...appState };
  if (typeof clean.scrollX !== "number" || Number.isNaN(clean.scrollX)) clean.scrollX = 0;
  if (typeof clean.scrollY !== "number" || Number.isNaN(clean.scrollY)) clean.scrollY = 0;
  if (!clean.zoom || typeof clean.zoom !== "object" || typeof clean.zoom.value !== "number" || Number.isNaN(clean.zoom.value)) {
    clean.zoom = { value: 1 };
  }
  delete clean.newElement;
  delete clean.editingTextElement;
  delete clean.editingLinearElement;
  delete clean.resizingElement;
  delete clean.selectionElement;
  delete clean.collaborators;
  return clean;
}

export async function GET(
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

    const page = await Page.findOne({ _id: id, userId: session.userId }).lean();
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (Array.isArray(page.elements)) {
      page.elements = page.elements.filter(isValidElement);
    }
    if (page.appState) {
      page.appState = sanitizeAppState(page.appState);
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error("GET /api/pages/[id] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}

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
    const result = UpdatePageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid update payload", details: result.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    if (Array.isArray(result.data.elements)) {
      result.data.elements = result.data.elements.filter(isValidElement);
    }
    if (result.data.appState) {
      result.data.appState = sanitizeAppState(result.data.appState);
    }

    const existingPage = await Page.findOne({ _id: id, userId: session.userId });
    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check if we should push a version snapshot for doc notes
    if (
      existingPage.type === "doc" &&
      (result.data.textContent !== undefined || result.data.title !== undefined)
    ) {
      const newTitle = result.data.title ?? existingPage.title;
      const newContent = result.data.textContent ?? existingPage.textContent ?? "";
      if (
        existingPage.textContent !== newContent ||
        existingPage.title !== newTitle
      ) {
        const currentVersions = existingPage.versions || [];
        const newVersion = {
          title: existingPage.title,
          textContent: existingPage.textContent || "",
          createdAt: new Date(),
        };
        // Keep max 20 snapshots
        const updatedVersions = [newVersion, ...currentVersions].slice(0, 20);
        (result.data as any).versions = updatedVersions;
      }
    }

    const page = await Page.findOneAndUpdate(
      { _id: id, userId: session.userId },
      result.data,
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    return NextResponse.json({ page });
  } catch (error) {
    console.error("PUT /api/pages/[id] Error:", error);
    return NextResponse.json(
      { error: "Failed to save page changes" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    await connectToDatabase();

    if (permanent) {
      const page = await Page.findOneAndDelete({ _id: id, userId: session.userId });
      if (!page) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: "Page permanently deleted",
      });
    } else {
      const page = await Page.findOneAndUpdate(
        { _id: id, userId: session.userId },
        { isTrash: true },
        { new: true }
      );
      if (!page) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: "Page moved to trash",
        page,
      });
    }
  } catch (error) {
    console.error("DELETE /api/pages/[id] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
