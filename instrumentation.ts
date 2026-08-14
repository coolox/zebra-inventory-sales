import { captureServerError } from "@/lib/observability/server";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  process.on("unhandledRejection", (error) => captureServerError({ operation: "runtime.unhandled_rejection", error }));
  process.on("uncaughtException", (error) => captureServerError({ operation: "runtime.uncaught_exception", error }));
}
