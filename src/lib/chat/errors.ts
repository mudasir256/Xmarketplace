import type { ChatErrorCode } from "@/lib/chat/types";

export class ChatError extends Error {
  code: ChatErrorCode;
  status: number;

  constructor(code: ChatErrorCode, message: string, status = 400) {
    super(message);
    this.name = "ChatError";
    this.code = code;
    this.status = status;
  }
}

export function mapChatError(error: unknown): { error: ChatErrorCode; message: string } {
  if (error instanceof ChatError) {
    return { error: error.code, message: error.message };
  }

  const raw =
    error && typeof error === "object" && "message" in error
      ? String((error as { message?: string }).message ?? "")
      : error instanceof Error
        ? error.message
        : "";

  if (/Could not find the table .*conversations/i.test(raw) || /schema cache/i.test(raw)) {
    return {
      error: "INTERNAL_ERROR",
      message:
        "Chat tables are missing. Run supabase/setup_chat_tables.sql in the Supabase SQL Editor (project matching NEXT_PUBLIC_SUPABASE_URL), or set SUPABASE_DB_PASSWORD and run npm run db:chat.",
    };
  }

  console.error("[chat]", error);
  return { error: "INTERNAL_ERROR", message: raw || "Something went wrong" };
}
