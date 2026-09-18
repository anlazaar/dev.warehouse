import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Folder } from "@/lib/models/Folder";
import { getSession } from "@/lib/auth";

const CreateFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(100),
  parentId: z.string().nullable().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const folders = await Folder.find({ userId: session.userId }).sort({
      position: 1,
      createdAt: 1,
    });
    return NextResponse.json({ folders });
  } catch (error) {
    console.error("GET /api/folders Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
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
    const result = CreateFolderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid folder creation data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, parentId, icon, color } = result.data;
    await connectToDatabase();

    const folder = await Folder.create({
      userId: session.userId,
      name,
      parentId: parentId || null,
      icon: icon || "folder",
      color: color || "default",
    });

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error) {
    console.error("POST /api/folders Error:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}
