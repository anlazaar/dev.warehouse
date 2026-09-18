import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Page } from "@/lib/models/Page";
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

    await connectToDatabase();
    const query = { userId: session.userId, isTrash: true };

    const [pages, snippets, cheatsheets, projects] = await Promise.all([
      Page.find(query).select("_id title type updatedAt").sort({ updatedAt: -1 }),
      Snippet.find(query).select("_id title language updatedAt").sort({ updatedAt: -1 }),
      Cheatsheet.find(query).select("_id title category updatedAt").sort({ updatedAt: -1 }),
      Project.find(query).select("_id name color updatedAt").sort({ updatedAt: -1 }),
    ]);

    const items = [
      ...pages.map((p) => ({ id: p._id, title: p.title, itemType: "page", subType: p.type, updatedAt: p.updatedAt })),
      ...snippets.map((s) => ({ id: s._id, title: s.title, itemType: "snippet", subType: s.language, updatedAt: s.updatedAt })),
      ...cheatsheets.map((c) => ({ id: c._id, title: c.title, itemType: "cheatsheet", subType: c.category, updatedAt: c.updatedAt })),
      ...projects.map((pr) => ({ id: pr._id, title: pr.name, itemType: "project", subType: pr.color, updatedAt: pr.updatedAt })),
    ];

    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET /api/trash Error:", error);
    return NextResponse.json({ error: "Failed to fetch trash items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, id, itemType } = await req.json();
    await connectToDatabase();

    const query = { userId: session.userId };

    if (action === "empty") {
      await Promise.all([
        Page.deleteMany({ ...query, isTrash: true }),
        Snippet.deleteMany({ ...query, isTrash: true }),
        Cheatsheet.deleteMany({ ...query, isTrash: true }),
        Project.deleteMany({ ...query, isTrash: true }),
      ]);
      return NextResponse.json({ success: true, message: "Trash emptied successfully" });
    }

    if (!id || !itemType) {
      return NextResponse.json({ error: "Missing id or itemType parameter" }, { status: 400 });
    }

    let Model: any;
    if (itemType === "page") Model = Page;
    else if (itemType === "snippet") Model = Snippet;
    else if (itemType === "cheatsheet") Model = Cheatsheet;
    else if (itemType === "project") Model = Project;
    else return NextResponse.json({ error: "Invalid itemType" }, { status: 400 });

    if (action === "restore") {
      const item = await Model.findOneAndUpdate(
        { _id: id, userId: session.userId },
        { isTrash: false },
        { new: true }
      );
      if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
      return NextResponse.json({ success: true, message: "Item restored", item });
    }

    if (action === "delete") {
      const item = await Model.findOneAndDelete({ _id: id, userId: session.userId });
      if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
      return NextResponse.json({ success: true, message: "Item permanently deleted" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/trash Error:", error);
    return NextResponse.json({ error: "Failed to process trash action" }, { status: 500 });
  }
}
