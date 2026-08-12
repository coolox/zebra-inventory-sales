import { describe, expect, it } from "vitest";
import { paginateInventoryProducts } from "./filter-products";
describe("inventory pagination", () => it("clamps a stale page", () => expect(paginateInventoryProducts([{ id: 1 }] as never[], 4, 10)).toMatchObject({ page: 1, pageCount: 1 })));
