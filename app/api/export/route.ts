import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Folder } from "@/lib/models/Folder";
import { Page } from "@/lib/models/Page";

export async function GET() {
  try {
    await connectToDatabase();

    const [folders, pages] = await Promise.all([
      Folder.find({}).lean(),
      Page.find({}).lean(),
    ]);

    const backupData = {
      app: "DEV.WAREHOUSE",
      version: 1,
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
