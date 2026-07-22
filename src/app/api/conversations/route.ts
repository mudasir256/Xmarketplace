import { requireApiUser, ensureProfile, jsonOk, jsonError } from "@/lib/account/api";
import { ChatError, mapChatError } from "@/lib/chat/errors";
import { createConversationSchema } from "@/lib/chat/schema";
import { findOrCreateConversation, listConversations } from "@/lib/chat/service";

function chatErrorResponse(error: unknown) {
  const mapped = mapChatError(error);
  const status = error instanceof ChatError ? error.status : 500;
  return Response.json(
    { ok: false, error: mapped.error, message: mapped.message },
    { status },
  );
}

export async function GET() {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;

  try {
    await ensureProfile(auth.user);
    const conversations = await listConversations(auth.user.id);
    return jsonOk({ conversations });
  } catch (error) {
    return chatErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;

  try {
    await ensureProfile(auth.user);
    const body = await request.json().catch(() => null);
    const parsed = createConversationSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid payload", 400);
    }

    const conversation = await findOrCreateConversation({
      userId: auth.user.id,
      listingId: parsed.data.listingId,
      listingSlug: parsed.data.listingSlug,
    });

    return jsonOk({ conversation }, 201);
  } catch (error) {
    return chatErrorResponse(error);
  }
}
