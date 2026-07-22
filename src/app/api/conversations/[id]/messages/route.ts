import { z } from "zod";
import { requireApiUser, ensureProfile, jsonOk, jsonError } from "@/lib/account/api";
import { broadcastChatMessage } from "@/lib/chat/broadcast";
import { ChatError, mapChatError } from "@/lib/chat/errors";
import { createMessage, listMessages } from "@/lib/chat/service";
import { MAX_MESSAGE_LENGTH } from "@/lib/chat/types";

const sendBodySchema = z.object({
  clientMessageId: z.string().uuid(),
  body: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
  replyToMessageId: z.string().uuid().optional(),
});

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;

  try {
    await ensureProfile(auth.user);
    const { id } = await context.params;
    const url = new URL(request.url);
    const before = url.searchParams.get("before") ?? undefined;
    const limit = Number(url.searchParams.get("limit") ?? "30");

    const result = await listMessages({
      conversationId: id,
      userId: auth.user.id,
      before,
      limit: Number.isFinite(limit) ? limit : 30,
    });

    return jsonOk(result);
  } catch (error) {
    const mapped = mapChatError(error);
    const status = error instanceof ChatError ? error.status : 500;
    return jsonError(mapped.message, status);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;

  try {
    await ensureProfile(auth.user);
    const { id: conversationId } = await context.params;
    const json = await request.json().catch(() => null);
    const parsed = sendBodySchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid payload", 400);
    }

    const result = await createMessage({
      conversationId,
      senderId: auth.user.id,
      clientMessageId: parsed.data.clientMessageId,
      body: parsed.data.body,
      replyToMessageId: parsed.data.replyToMessageId,
    });

    await broadcastChatMessage(result.message, result.conversation);
    return jsonOk({ message: result.message }, result.duplicate ? 200 : 201);
  } catch (error) {
    const mapped = mapChatError(error);
    const status = error instanceof ChatError ? error.status : 500;
    return Response.json(
      { ok: false, error: mapped.error, message: mapped.message },
      { status },
    );
  }
}
