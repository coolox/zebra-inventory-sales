import { describe, expect, it } from "vitest";
import { businessDate, businessDateDaysAgo, businessDayOffset } from "./business-date";

describe("Istanbul business date", () => {
  it("separates sales on opposite sides of Istanbul midnight", () => {
    const now = new Date("2026-08-20T21:27:00.000Z"); // 00:27 on 21 Aug in Istanbul
    const beforeMidnight = new Date("2026-08-20T20:40:00.000Z"); // 23:40 on 20 Aug
    const afterMidnight = new Date("2026-08-20T21:11:00.000Z"); // 00:11 on 21 Aug

    expect(businessDate(now)).toBe("2026-08-21");
    expect(businessDate(beforeMidnight)).toBe("2026-08-20");
    expect(businessDate(afterMidnight)).toBe("2026-08-21");
    expect(businessDayOffset(beforeMidnight, now)).toBe(1);
    expect(businessDayOffset(afterMidnight, now)).toBe(0);
  });

  it("moves report/demo calendar days without using the device timezone", () => {
    const now = new Date("2026-08-20T21:27:00.000Z");
    expect(businessDateDaysAgo(0, now)).toBe("2026-08-21");
    expect(businessDateDaysAgo(1, now)).toBe("2026-08-20");
  });
});
