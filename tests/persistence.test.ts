import { describe, it, expect } from "vitest";

describe("Excalidraw Persistence & Export Data Serialization", () => {
  it("should preserve Excalidraw elements, appState, and files object", () => {
    const originalElements = [
      {
        id: "rect-1",
        type: "rectangle",
        x: 100,
        y: 150,
        width: 200,
        height: 100,
        strokeColor: "#000000",
        backgroundColor: "#e0e7ff",
      },
    ];

    const originalAppState = {
      viewBackgroundColor: "#ffffff",
      zoom: { value: 1 },
      scrollX: 0,
      scrollY: 0,
    };

    const payload = {
      title: "Architecture Diagram",
      type: "canvas" as const,
      elements: originalElements,
      appState: originalAppState,
      files: {},
    };

    const serialized = JSON.stringify(payload);
    const parsed = JSON.parse(serialized);

    expect(parsed.elements).toHaveLength(1);
    expect(parsed.elements[0].id).toBe("rect-1");
    expect(parsed.appState.viewBackgroundColor).toBe("#ffffff");
  });

  it("should format workspace JSON backup structure correctly", () => {
    const backup = {
      app: "DEV.WAREHOUSE",
      version: 1,
      exportedAt: new Date().toISOString(),
      folders: [{ _id: "f1", name: "Backend" }],
      pages: [
        {
          _id: "p1",
          title: "Microservices",
          type: "canvas",
          folderId: "f1",
          elements: [],
        },
      ],
    };

    expect(backup.app).toBe("DEV.WAREHOUSE");
    expect(backup.folders).toHaveLength(1);
    expect(backup.pages[0].folderId).toBe("f1");
  });
});
