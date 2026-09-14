import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword, createSessionToken, verifySessionToken } from "../lib/auth";

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
