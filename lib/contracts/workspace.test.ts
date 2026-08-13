import { describe, expect, it } from "vitest";
import { createInitialWorkspaceData } from "@/features/workspace/model/workspace-data";
import { toWorkspaceSnapshot } from "./workspace";

describe("toWorkspaceSnapshot", () => {
  it("returns detached normalized data for a transport boundary", () => {
    const source = createInitialWorkspaceData();
    const snapshot = toWorkspaceSnapshot(source);
    snapshot.products[0].stock = 99;

    expect(source.products[0].stock).not.toBe(99);
    expect(snapshot.sales).toEqual(source.sales);
    expect(snapshot.sellers).toEqual(source.sellers);
    expect(snapshot.activities).toEqual(source.activities);
    expect(snapshot.exchanges).toEqual(source.exchanges);
  });
});
