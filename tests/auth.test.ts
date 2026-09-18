import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { hashPassword, comparePassword, createSessionToken, verifySessionToken } from "../lib/auth";
import { proxy } from "../proxy";

describe("Authentication Utility Tests", () => {
  it("should securely hash passwords and correctly verify them", async () => {
    const rawPassword = "DevWarehouse2026!SecretPassword";
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toEqual(rawPassword);
    expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);

    const isValid = await comparePassword(rawPassword, hash);
    expect(isValid).toBe(true);

    const isInvalid = await comparePassword("WrongPassword123", hash);
    expect(isInvalid).toBe(false);
  });

  it("should create and verify session JWT tokens", async () => {
    const payload = {
      userId: "507f1f77bcf86cd799439011",
      email: "admin@devwarehouse.local",
    };

    const token = await createSessionToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
  });

  it("should reject invalid or tampered session tokens", async () => {
    const invalidToken = "invalid.jwt.token.string";
    const result = await verifySessionToken(invalidToken);
    expect(result).toBeNull();
  });
});

describe("Proxy Route Guard Tests", () => {
  it("should allow public access to /api/auth/register without session token", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/register", { method: "POST" });
    const res = await proxy(req);
    expect(res.status).not.toBe(401);
  });

  it("should allow public access to /api/auth/login without session token", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/login", { method: "POST" });
    const res = await proxy(req);
    expect(res.status).not.toBe(401);
  });

  it("should block unauthenticated access to protected API routes like /api/pages with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/pages", { method: "GET" });
    const res = await proxy(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized access");
  });

  it("should redirect unauthenticated request to /workspace to /login", async () => {
    const req = new NextRequest("http://localhost:3000/workspace", { method: "GET" });
    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });
});
