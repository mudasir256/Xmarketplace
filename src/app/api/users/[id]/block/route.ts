import { requireApiUser, ensureProfile, jsonOk, jsonError } from "@/lib/account/api";
import { ChatError, mapChatError } from "@/lib/chat/errors";
import { blockUserSchema } from "@/lib/chat/schema";
import { blockUser, unblockUser } from "@/lib/chat/service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;

  try {
    await ensureProfile(auth.user);
    const { id } = await context.params;
    const json = await request.json().catch(() => ({}));
    const parsed = blockUserSchema.safeParse(json ?? {});
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid payload");

    await blockUser(auth.user.id, id, parsed.data.reason);
    return jsonOk({ blocked: true });
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
    await unblockUser(auth.user.id, id);
    return jsonOk({ blocked: false });
  } catch (error) {
    const mapped = mapChatError(error);
    const status = error instanceof ChatError ? error.status : 500;
    return jsonError(mapped.message, status);
  }
}
