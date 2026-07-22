import { requireApiUser, ensureProfile, jsonOk, jsonError } from "@/lib/account/api";
import { ChatError, mapChatError } from "@/lib/chat/errors";
import { editMessageSchema } from "@/lib/chat/schema";
import { editMessage, softDeleteMessage } from "@/lib/chat/service";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;

  try {
    await ensureProfile(auth.user);
    const { id } = await context.params;
    const json = await request.json().catch(() => null);
    const parsed = editMessageSchema.safeParse(json);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid payload");

    const message = await editMessage(id, auth.user.id, parsed.data.body);
    return jsonOk({ message });
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
    const message = await softDeleteMessage(id, auth.user.id);
    return jsonOk({ message });
  } catch (error) {
    const mapped = mapChatError(error);
    const status = error instanceof ChatError ? error.status : 500;
    return jsonError(mapped.message, status);
  }
}
