import { NextResponse } from "next/server";

type ErrorCode = "invalid_json" | "invalid_request" | "unauthorized" | "forbidden" | "rate_limited" | "unavailable";

const messages: Record<ErrorCode, string> = {
  invalid_json: "Invalid request body.",
  invalid_request: "Request data is invalid.",
  unauthorized: "Unauthorized.",
  forbidden: "You do not have permission to perform this action.",
  rate_limited: "Too many requests. Try again later.",
  unavailable: "This service is temporarily unavailable.",
};

export function domainError(code: ErrorCode, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error: messages[code], code }, { status, headers });
}
