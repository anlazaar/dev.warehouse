import dotenv from "dotenv";
import path from "path";

// Load environment variables before importing database models
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function seed() {
  console.log("🌱 DEV.WAREHOUSE - Initializing admin credentials...");

  const email = (process.env.DEV_WAREHOUSE_EMAIL || "admin@devwarehouse.local").toLowerCase().trim();
  const password = process.env.DEV_WAREHOUSE_PASSWORD || "DevWarehouse2026!Secret";

  if (!email || !password) {
    console.error("❌ Error: Missing DEV_WAREHOUSE_EMAIL or DEV_WAREHOUSE_PASSWORD in environment variables.");
    process.exit(1);
  }

  try {
    // Dynamic import to ensure dotenv has populated process.env
    const { connectToDatabase } = await import("../lib/db");
    const { User } = await import("../lib/models/User");
    const { hashPassword } = await import("../lib/auth");

    await connectToDatabase();
    console.log("🔌 Connected to MongoDB database.");

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Overwrite/update password for admin user to guarantee login works with configured credentials
      const hashedPassword = await hashPassword(password);
      existingUser.passwordHash = hashedPassword;
      await existingUser.save();
      console.log(`✅ Admin account updated/verified for email: ${email}`);
      console.log(`🔐 Credentials: Email = ${email} | Password = [CONFIGURED_IN_ENV]`);
      process.exit(0);
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email,
      passwordHash: hashedPassword,
    });

    console.log("✅ Admin account created successfully!");
    console.log(`   User ID: ${user._id}`);
    console.log(`   Email:   ${user.email}`);
    console.log("🔐 Store your credentials safely. You can now log into DEV.WAREHOUSE.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during database seed:", error);
    process.exit(1);
  }
}

seed();
