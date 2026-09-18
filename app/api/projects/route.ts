import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Project } from "@/lib/models/Project";
import { getSession } from "@/lib/auth";

const CreateProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  color: z.string().optional(),
  isFavorite: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const favorite = searchParams.get("favorite");
    const includeTrash = searchParams.get("trash") === "true";

    await connectToDatabase();
    const query: Record<string, unknown> = { userId: session.userId };

    if (!includeTrash) {
      query.isTrash = { $ne: true };
    } else {
      query.isTrash = true;
    }

    if (favorite === "true") {
      query.isFavorite = true;
    }

    const projects = await Project.find(query).sort({ isFavorite: -1, updatedAt: -1 });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("GET /api/projects Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
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
    const result = CreateProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: result.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const project = await Project.create({
      userId: session.userId,
      name: result.data.name,
      description: result.data.description || "",
      color: result.data.color || "#6366f1",
      isFavorite: result.data.isFavorite || false,
      tags: result.data.tags || [],
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects Error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
