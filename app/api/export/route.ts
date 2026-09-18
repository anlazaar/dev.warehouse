import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Folder } from "@/lib/models/Folder";
import { Page } from "@/lib/models/Page";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const [folders, pages] = await Promise.all([
      Folder.find({ userId: session.userId }).lean(),
      Page.find({ userId: session.userId }).lean(),
    ]);

    const backupData = {
      app: "DEV.WAREHOUSE",
      version: 1,
      userEmail: session.email,
      exportedAt: new Date().toISOString(),
      folders,
      pages,
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="dev-warehouse-backup-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export Error:", error);
    return NextResponse.json(
      { error: "Failed to generate workspace export" },
      { status: 500 }
    );
  }
}
