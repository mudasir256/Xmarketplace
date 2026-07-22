import { requireApiUser, ensureProfile, jsonOk, jsonError } from "@/lib/account/api";
import { ChatError, mapChatError } from "@/lib/chat/errors";
import { reportSchema } from "@/lib/chat/schema";
import { reportUser } from "@/lib/chat/service";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;

  try {
    await ensureProfile(auth.user);
    const json = await request.json().catch(() => null);
    const parsed = reportSchema.safeParse(json);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid payload");

    await reportUser({
      reporterId: auth.user.id,
      ...parsed.data,
    });

    return jsonOk({ reported: true }, 201);
  } catch (error) {
    const mapped = mapChatError(error);
    const status = error instanceof ChatError ? error.status : 500;
    return jsonError(mapped.message, status);
  }
}
