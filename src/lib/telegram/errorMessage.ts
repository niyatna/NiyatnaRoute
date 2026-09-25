import { sanitizeErrorMessage } from "@niyatna/open-sse/utils/error.ts";

export function formatTelegramGatewayError(error: unknown): string {
  return `⚠️ Gateway error: ${sanitizeErrorMessage(error)}`;
}
