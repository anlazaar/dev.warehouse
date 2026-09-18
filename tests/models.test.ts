import { describe, it, expect } from "vitest";
import { User } from "../lib/models/User";
import { Page } from "../lib/models/Page";
import { Folder } from "../lib/models/Folder";
import { Project } from "../lib/models/Project";
import { Snippet } from "../lib/models/Snippet";
import { Cheatsheet } from "../lib/models/Cheatsheet";
import { UserSettings } from "../lib/models/UserSettings";

describe("Database Model Schemas", () => {
  it("should define User model with required email and passwordHash fields", () => {
    const schema = User.schema;
    expect(schema.path("email")).toBeDefined();
    expect(schema.path("passwordHash")).toBeDefined();
    expect(schema.path("name")).toBeDefined();
  });

  it("should define Page model with userId, projectId, isTrash, isFavorite, and versions", () => {
    const schema = Page.schema;
    expect(schema.path("userId")).toBeDefined();
    expect(schema.path("title")).toBeDefined();
    expect(schema.path("projectId")).toBeDefined();
    expect(schema.path("isTrash")).toBeDefined();
    expect(schema.path("isFavorite")).toBeDefined();
    expect(schema.path("versions")).toBeDefined();
    expect(schema.path("tags")).toBeDefined();
  });

  it("should define Project model with userId, name, and isTrash fields", () => {
    const schema = Project.schema;
    expect(schema.path("userId")).toBeDefined();
    expect(schema.path("name")).toBeDefined();
    expect(schema.path("isFavorite")).toBeDefined();
    expect(schema.path("isTrash")).toBeDefined();
  });

  it("should define Snippet and Cheatsheet models with projectId, isFavorite, and isTrash fields", () => {
    expect(Snippet.schema.path("projectId")).toBeDefined();
    expect(Snippet.schema.path("isTrash")).toBeDefined();
    expect(Snippet.schema.path("isFavorite")).toBeDefined();

    expect(Cheatsheet.schema.path("projectId")).toBeDefined();
    expect(Cheatsheet.schema.path("isTrash")).toBeDefined();
    expect(Cheatsheet.schema.path("isFavorite")).toBeDefined();
  });

  it("should define Folder model with userId field", () => {
    const schema = Folder.schema;
    expect(schema.path("userId")).toBeDefined();
    expect(schema.path("name")).toBeDefined();
  });

  it("should define UserSettings model with theme and autoSave options", () => {
    const schema = UserSettings.schema;
    expect(schema.path("userId")).toBeDefined();
    expect(schema.path("theme")).toBeDefined();
    expect(schema.path("autoSave")).toBeDefined();
  });
});
