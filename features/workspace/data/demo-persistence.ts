import { createInitialWorkspaceData, type WorkspaceData } from "@/features/workspace/model/workspace-data";

const storageKey = "zebra-demo-workspace";
const version = 1;
type StoredWorkspace = { version: number; data: WorkspaceData };

function browserStorage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function readDemoWorkspace(storage: Storage | null = browserStorage()): WorkspaceData {
  const fallback = createInitialWorkspaceData();
  if (!storage) return fallback;
  try {
    const value = storage.getItem(storageKey);
    if (!value) return fallback;
    const parsed = JSON.parse(value) as Partial<StoredWorkspace>;
    if (parsed.version !== version || !parsed.data || !Array.isArray(parsed.data.products) || !Array.isArray(parsed.data.sales) || !Array.isArray(parsed.data.sellers) || !Array.isArray(parsed.data.activities)) throw new Error("Invalid demo workspace");
    return parsed.data;
  } catch {
    storage.removeItem(storageKey);
    return fallback;
  }
}

export function writeDemoWorkspace(data: WorkspaceData, storage: Storage | null = browserStorage()) {
  storage?.setItem(storageKey, JSON.stringify({ version, data } satisfies StoredWorkspace));
}

export function resetDemoWorkspace(storage: Storage | null = browserStorage()) {
  storage?.removeItem(storageKey);
  return createInitialWorkspaceData();
}

export const demoWorkspaceStorageKey = storageKey;
