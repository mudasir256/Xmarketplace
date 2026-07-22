import { requireApiUser, ensureProfile, jsonOk, jsonError } from "@/lib/account/api";
import { ChatError, mapChatError } from "@/lib/chat/errors";
import { broadcastChatMessage } from "@/lib/chat/broadcast";
import {
  ALLOWED_ATTACHMENT_MIME,
  CHAT_ATTACHMENT_BUCKET,
  MAX_ATTACHMENT_BYTES,
} from "@/lib/chat/types";
import { attachUploadedFile } from "@/lib/chat/service";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;

  try {
    await ensureProfile(auth.user);
    const form = await request.formData();
    const file = form.get("file");
    const conversationId = String(form.get("conversationId") ?? "");
    const clientMessageId = String(form.get("clientMessageId") ?? "");
    const body = form.get("body") ? String(form.get("body")) : undefined;

    if (!(file instanceof File)) return jsonError("file is required");
    if (!conversationId || !clientMessageId) {
      return jsonError("conversationId and clientMessageId are required");
    }
    if (!ALLOWED_ATTACHMENT_MIME.has(file.type)) {
      return jsonError("Unsupported file type. Use JPEG, PNG, WebP, or GIF.");
    }
    if (file.size <= 0 || file.size > MAX_ATTACHMENT_BYTES) {
      return jsonError("Each attachment must be 5 MB or smaller.");
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
    const storageKey = `${auth.user.id}/${crypto.randomUUID()}.${extension}`;
    const admin = createAdminClient();
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(CHAT_ATTACHMENT_BUCKET)
      .upload(storageKey, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return jsonError(uploadError.message || "Upload failed", 500);
    }

    const result = await attachUploadedFile({
      userId: auth.user.id,
      conversationId,
      clientMessageId,
      body,
      storageKey,
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    });

    await broadcastChatMessage(result.message, result.conversation);

    return jsonOk({ message: result.message }, 201);
  } catch (error) {
    const mapped = mapChatError(error);
    const status = error instanceof ChatError ? error.status : 500;
    return jsonError(mapped.message, status);
  }
}
