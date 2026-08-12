import { describe, expect, it } from "vitest";
import { createInitialWorkspaceData } from "@/features/workspace/model/workspace-data";
import { demoWorkspaceStorageKey, readDemoWorkspace, resetDemoWorkspace, writeDemoWorkspace } from "./demo-persistence";

function storage(): Storage {
  const values = new Map<string, string>();
  return { get length() { return values.size; }, clear: () => values.clear(), getItem: (key) => values.get(key) ?? null, key: () => null, removeItem: (key) => values.delete(key), setItem: (key, value) => values.set(key, value) };
}

describe("demo persistence", () => {
  it("round-trips a versioned workspace and resets it", () => {
    const target = storage(); const data = createInitialWorkspaceData(); data.products[0].stock = 99; data.sellers[0].name = "Persisted seller"; data.activities[0].title = "Persisted receipt";
    writeDemoWorkspace(data, target);
    expect(readDemoWorkspace(target).products[0].stock).toBe(99);
    expect(readDemoWorkspace(target).sellers[0].name).toBe("Persisted seller");
    expect(readDemoWorkspace(target).activities[0].title).toBe("Persisted receipt");
    expect(resetDemoWorkspace(target).products[0].stock).not.toBe(99);
    expect(target.getItem(demoWorkspaceStorageKey)).toBeNull();
  });

  it("drops corrupt or old stored data and returns the mock baseline", () => {
    const target = storage(); target.setItem(demoWorkspaceStorageKey, "not-json");
    expect(readDemoWorkspace(target).products).toHaveLength(createInitialWorkspaceData().products.length);
    expect(target.getItem(demoWorkspaceStorageKey)).toBeNull();
    target.setItem(demoWorkspaceStorageKey, JSON.stringify({ version: 0, data: {} }));
    expect(readDemoWorkspace(target).sales).toHaveLength(createInitialWorkspaceData().sales.length);
  });
});
