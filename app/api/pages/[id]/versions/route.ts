import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Page } from "@/lib/models/Page";
import { getSession } from "@/lib/auth";

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

    const page = await Page.findOne({ _id: id, userId: session.userId }).select("title versions");
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ versions: page.versions || [] });
  } catch (error) {
    console.error("GET /api/pages/[id]/versions Error:", error);
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { versionIndex } = await req.json();

    if (typeof versionIndex !== "number") {
      return NextResponse.json({ error: "versionIndex must be a number" }, { status: 400 });
    }

    await connectToDatabase();

    const page = await Page.findOne({ _id: id, userId: session.userId });
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const versions = page.versions || [];
    if (versionIndex < 0 || versionIndex >= versions.length) {
      return NextResponse.json({ error: "Invalid version index" }, { status: 400 });
    }

    const selectedVersion = versions[versionIndex];

    // Snapshot current before restoring
    const backupVersion = {
      title: page.title,
      textContent: page.textContent || "",
      createdAt: new Date(),
    };

    page.title = selectedVersion.title;
    page.textContent = selectedVersion.textContent;
    page.versions = [backupVersion, ...versions].slice(0, 20);

    await page.save();

    return NextResponse.json({
      success: true,
      message: "Version restored successfully",
      page: {
        _id: page._id,
        title: page.title,
        textContent: page.textContent,
        versions: page.versions,
      },
    });
  } catch (error) {
    console.error("POST /api/pages/[id]/versions Error:", error);
    return NextResponse.json({ error: "Failed to restore version" }, { status: 500 });
  }
}
