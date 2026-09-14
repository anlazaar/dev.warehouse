import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Page } from "@/lib/models/Page";
import { Folder } from "@/lib/models/Folder";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ pages: [], folders: [] });
    }

    await connectToDatabase();
    const searchRegex = new RegExp(query.trim(), "i");

    const [pages, folders] = await Promise.all([
      Page.find({
        $or: [{ title: searchRegex }, { textContent: searchRegex }],
      })
        .select("_id title folderId type textContent updatedAt")
        .limit(20),
      Folder.find({ name: searchRegex }).select("_id name icon color").limit(10),
    ]);

    return NextResponse.json({ pages, folders });
  } catch (error) {
    console.error("GET /api/search Error:", error);
    return NextResponse.json(
      { error: "Failed to perform workspace search" },
      { status: 500 }
    );
  }
}
