import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Page } from "@/lib/models/Page";
import { UserSettings } from "@/lib/models/UserSettings";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";

const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid input data";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email, password, name } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    await connectToDatabase();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      email: cleanEmail,
      passwordHash,
      name: name?.trim() || cleanEmail.split("@")[0],
    });

    // Initialize user settings
    await UserSettings.create({
      userId: user._id,
      theme: "dark",
      autoSave: true,
      defaultView: "dashboard",
    });

    // Initialize a welcome note for the new user
    await Page.create({
      userId: user._id,
      title: "🚀 Welcome to Dev.Warehouse",
      type: "doc",
      textContent: `# Welcome to your personal Dev.Warehouse!

Here is what you can do:
- **Markdown Notes:** Write and store technical documentation with live preview.
- **Excalidraw Canvas:** Draw architecture diagrams, mockups, and flowcharts.
- **Developer Tools:** Pomodoro timer, JSON formatter, JWT decoder, Regex tester, Epoch converter, and more.
- **Developer Hub:** Stay updated with Hacker News, DEV Community posts, and official developer roadmaps.

Use **Ctrl + K** (or **Cmd + K**) at any time to open the **Command Palette**.
`,
      isPinned: true,
    });

    const token = await createSessionToken({
      userId: user._id.toString(),
      email: user.email,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Register API Error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating your account" },
      { status: 500 }
    );
  }
}
