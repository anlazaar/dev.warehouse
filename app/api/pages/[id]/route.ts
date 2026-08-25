import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Page } from "@/lib/models/Page";

const UpdatePageSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  folderId: z.string().nullable().optional(),
  type: z.enum(["canvas", "doc"]).optional(),
  elements: z.array(z.record(z.string(), z.unknown())).optional(),
  appState: z.record(z.string(), z.unknown()).optional(),
  files: z.record(z.string(), z.unknown()).optional(),
  textContent: z.string().optional(),
  isPinned: z.boolean().optional(),
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
    const { id } = await params;
    await connectToDatabase();

    // Use .lean() to ensure plain JS object serialization without Mongoose getters
    const page = await Page.findById(id).lean();
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

    const page = await Page.findByIdAndUpdate(id, result.data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

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
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const page = await Page.findByIdAndDelete(id);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/pages/[id] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
