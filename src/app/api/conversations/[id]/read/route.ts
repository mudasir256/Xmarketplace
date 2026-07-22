import { z } from "zod";
import { requireApiUser, ensureProfile, jsonOk, jsonError } from "@/lib/account/api";
import { ChatError, mapChatError } from "@/lib/chat/errors";
import { markConversationRead } from "@/lib/chat/service";

const bodySchema = z.object({
  messageId: z.string().uuid(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;

  try {
    await ensureProfile(auth.user);
    const { id } = await context.params;
    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return jsonError("messageId is required");

    const result = await markConversationRead({
      conversationId: id,
      messageId: parsed.data.messageId,
      userId: auth.user.id,
    });

    return jsonOk({
      conversationId: id,
      messageId: result.messageId,
      readAt: result.readAt,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    const mapped = mapChatError(error);
    const status = error instanceof ChatError ? error.status : 500;
    return jsonError(mapped.message, status);
  }
}
