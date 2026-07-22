import { requireApiUser, ensureProfile, jsonOk, jsonError } from "@/lib/account/api";
import { ChatError, mapChatError } from "@/lib/chat/errors";
import { archiveConversation, getConversation } from "@/lib/chat/service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;

  try {
    await ensureProfile(auth.user);
    const { id } = await context.params;
    const conversation = await getConversation(id, auth.user.id);
    return jsonOk({ conversation });
  } catch (error) {
    const mapped = mapChatError(error);
    const status = error instanceof ChatError ? error.status : 500;
    return jsonError(mapped.message, status);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;

  try {
    await ensureProfile(auth.user);
    const { id } = await context.params;
    await archiveConversation(id, auth.user.id);
    return jsonOk({ deleted: true, conversationId: id });
  } catch (error) {
    const mapped = mapChatError(error);
    const status = error instanceof ChatError ? error.status : 500;
    return jsonError(mapped.message, status);
  }
}
