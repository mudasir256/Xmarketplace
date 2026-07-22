import { requireApiUser, ensureProfile, jsonOk, jsonError } from "@/lib/account/api";
import { ChatError, mapChatError } from "@/lib/chat/errors";
import { getUnreadCount } from "@/lib/chat/service";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;

  try {
    await ensureProfile(auth.user);
    const unread = await getUnreadCount(auth.user.id);
    return jsonOk(unread);
  } catch (error) {
    const mapped = mapChatError(error);
    const status = error instanceof ChatError ? error.status : 500;
    return jsonError(mapped.message, status);
  }
}
