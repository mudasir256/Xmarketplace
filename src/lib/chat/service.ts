import { createAdminClient } from "@/lib/supabase/admin";
import { LISTING_IMAGE_BUCKET } from "@/lib/marketplace";
import { ChatError } from "@/lib/chat/errors";
import { checkRateLimit } from "@/lib/chat/rate-limit";
import {
  CHAT_ATTACHMENT_BUCKET,
  MAX_MESSAGE_LENGTH,
  type ChatAttachment,
  type ChatMessage,
  type ConversationDetail,
  type ConversationSummary,
  type MessageType,
} from "@/lib/chat/types";
import { getInitialsAvatarDataUrl, normalizeAvatarUrl } from "@/lib/user-display";

type Admin = ReturnType<typeof createAdminClient>;

function listingImageUrl(storagePath: string | null | undefined) {
  if (!storagePath) return "/placeholder-listing.svg";
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "/placeholder-listing.svg";
  return `${base}/storage/v1/object/public/${LISTING_IMAGE_BUCKET}/${storagePath}`;
}

type ConversationRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_id: string | null;
  last_message_at: string | null;
  buyer_archived_at: string | null;
  seller_archived_at: string | null;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  client_message_id: string;
  message_type: string;
  body: string | null;
  reply_to_message_id: string | null;
  delivered_at: string | null;
  read_at: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
};

type AttachmentRow = {
  id: string;
  message_id: string;
  storage_key: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
};

function db() {
  return createAdminClient();
}

function attachmentUrl(storageKey: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${CHAT_ATTACHMENT_BUCKET}/${storageKey}`;
}

function mapAttachment(row: AttachmentRow): ChatAttachment {
  return {
    id: row.id,
    storageKey: row.storage_key,
    originalName: row.original_name,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes),
    url: attachmentUrl(row.storage_key),
  };
}

function mapMessage(row: MessageRow, attachments: AttachmentRow[] = []): ChatMessage {
  const deleted = Boolean(row.deleted_at);
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    clientMessageId: row.client_message_id,
    messageType: (row.message_type as MessageType) || "text",
    body: deleted ? null : row.body,
    replyToMessageId: row.reply_to_message_id,
    deliveredAt: row.delivered_at,
    readAt: row.read_at,
    editedAt: row.edited_at,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    attachments: deleted ? [] : attachments.map(mapAttachment),
    status: row.read_at ? "read" : row.delivered_at ? "delivered" : "sent",
  };
}

async function loadAttachments(admin: Admin, messageIds: string[]) {
  if (!messageIds.length) return new Map<string, AttachmentRow[]>();
  const { data } = await admin
    .from("message_attachments")
    .select("id, message_id, storage_key, original_name, mime_type, size_bytes")
    .in("message_id", messageIds);

  const map = new Map<string, AttachmentRow[]>();
  for (const row of (data ?? []) as AttachmentRow[]) {
    const list = map.get(row.message_id) ?? [];
    list.push(row);
    map.set(row.message_id, list);
  }
  return map;
}

export async function isBlockedEitherWay(userA: string, userB: string) {
  const admin = db();
  const { data } = await admin
    .from("user_blocks")
    .select("blocker_id")
    .or(
      `and(blocker_id.eq.${userA},blocked_id.eq.${userB}),and(blocker_id.eq.${userB},blocked_id.eq.${userA})`,
    )
    .limit(1);
  return Boolean(data?.length);
}

export async function findAuthorizedConversation(conversationId: string, userId: string) {
  const admin = db();
  const { data, error } = await admin
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .maybeSingle();

  if (error) throw new ChatError("INTERNAL_ERROR", error.message, 500);
  return (data as ConversationRow | null) ?? null;
}

export async function assertConversationAccess(conversationId: string, userId: string) {
  const conversation = await findAuthorizedConversation(conversationId, userId);
  if (!conversation) {
    throw new ChatError("CONVERSATION_ACCESS_DENIED", "Conversation access denied", 403);
  }

  const peerId = conversation.buyer_id === userId ? conversation.seller_id : conversation.buyer_id;
  if (await isBlockedEitherWay(userId, peerId)) {
    throw new ChatError("USER_BLOCKED", "Messaging is blocked with this user", 403);
  }

  return conversation;
}

async function resolveListing(listingId?: string, listingSlug?: string) {
  const admin = db();
  let query = admin
    .from("marketplace_listings")
    .select("id, user_id, title, slug, status");

  if (listingId) query = query.eq("id", listingId);
  else if (listingSlug) query = query.eq("slug", listingSlug);
  else throw new ChatError("INVALID_PAYLOAD", "listingId or listingSlug is required");

  const { data, error } = await query.maybeSingle();
  if (error) throw new ChatError("INTERNAL_ERROR", error.message, 500);
  if (!data) throw new ChatError("LISTING_NOT_FOUND", "Listing not found", 404);

  const { data: images } = await admin
    .from("marketplace_listing_images")
    .select("storage_path, is_primary, display_order")
    .eq("listing_id", data.id)
    .order("display_order", { ascending: true });

  return {
    id: data.id,
    user_id: data.user_id,
    title: data.title,
    slug: data.slug,
    status: data.status,
    marketplace_listing_images:
      (images as { storage_path: string; is_primary: boolean; display_order: number }[] | null) ??
      [],
  };
}

function primaryListingImage(
  images: { storage_path: string; is_primary: boolean; display_order: number }[] | null,
) {
  const sorted = [...(images ?? [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.display_order - b.display_order;
  });
  return listingImageUrl(sorted[0]?.storage_path);
}

async function getProfiles(ids: string[]) {
  const unique = [...new Set(ids)];
  if (!unique.length) return new Map<string, { full_name: string | null; avatar_path: string | null }>();
  const admin = db();
  const { data } = await admin.from("profiles").select("id, full_name, avatar_path").in("id", unique);
  const map = new Map<string, { full_name: string | null; avatar_path: string | null }>();
  for (const row of data ?? []) {
    map.set(row.id, { full_name: row.full_name, avatar_path: row.avatar_path });
  }
  return map;
}

async function unreadCountFor(admin: Admin, conversationId: string, userId: string) {
  const { data: readState } = await admin
    .from("conversation_read_state")
    .select("last_read_at")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  let query = admin
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("deleted_at", null);

  if (readState?.last_read_at) {
    query = query.gt("created_at", readState.last_read_at);
  }

  const { count } = await query;
  return count ?? 0;
}

async function mapConversationSummary(
  row: ConversationRow,
  userId: string,
  extras: {
    listing?: { title: string; slug: string; image: string };
    lastMessage?: ChatMessage | null;
    peer?: { full_name: string | null; avatar_path: string | null };
    unreadCount?: number;
  } = {},
): Promise<ConversationSummary> {
  const admin = db();
  const peerId = row.buyer_id === userId ? row.seller_id : row.buyer_id;
  const tab = row.seller_id === userId ? "buyers" : "products";

  let listing = extras.listing;
  if (!listing) {
    const resolved = await resolveListing(row.listing_id);
    listing = {
      title: resolved.title,
      slug: resolved.slug,
      image: primaryListingImage(resolved.marketplace_listing_images),
    };
  }

  let lastMessage = extras.lastMessage;
  if (lastMessage === undefined && row.last_message_id) {
    const { data: message } = await admin.from("messages").select("*").eq("id", row.last_message_id).maybeSingle();
    if (message) {
      const attachments = await loadAttachments(admin, [message.id]);
      lastMessage = mapMessage(message as MessageRow, attachments.get(message.id) ?? []);
    } else {
      lastMessage = null;
    }
  }

  let peer = extras.peer;
  if (!peer) {
    const profiles = await getProfiles([peerId]);
    peer = profiles.get(peerId) ?? { full_name: null, avatar_path: null };
  }

  const unreadCount =
    extras.unreadCount ?? (await unreadCountFor(admin, row.id, userId));

  const peerName = peer.full_name?.trim() || (tab === "buyers" ? "Buyer" : "Seller");

  return {
    id: row.id,
    listingId: row.listing_id,
    listingSlug: listing.slug,
    listingTitle: listing.title,
    listingImage: listing.image,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    peerId,
    peerName,
    peerAvatarUrl:
      normalizeAvatarUrl(peer.avatar_path) || getInitialsAvatarDataUrl(peerName),
    lastMessage: lastMessage ?? null,
    lastMessageAt: row.last_message_at,
    unreadCount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tab,
  };
}

export async function findOrCreateConversation(input: {
  userId: string;
  listingId?: string;
  listingSlug?: string;
}) {
  const listing = await resolveListing(input.listingId, input.listingSlug);
  const sellerId = listing.user_id;

  if (sellerId === input.userId) {
    throw new ChatError("CANNOT_CHAT_SELF", "You cannot chat with yourself about your own listing");
  }

  if (await isBlockedEitherWay(input.userId, sellerId)) {
    throw new ChatError("USER_BLOCKED", "Messaging is blocked with this user", 403);
  }

  const admin = db();
  const { data: existing } = await admin
    .from("conversations")
    .select("*")
    .eq("listing_id", listing.id)
    .eq("buyer_id", input.userId)
    .eq("seller_id", sellerId)
    .maybeSingle();

  if (existing) {
    await unarchiveConversation(existing.id, input.userId);
    return mapConversationSummary(existing as ConversationRow, input.userId, {
      listing: {
        title: listing.title,
        slug: listing.slug,
        image: primaryListingImage(listing.marketplace_listing_images),
      },
    });
  }

  const { data: created, error } = await admin
    .from("conversations")
    .insert({
      listing_id: listing.id,
      buyer_id: input.userId,
      seller_id: sellerId,
    })
    .select("*")
    .single();

  if (error) {
    // Unique race: fetch existing
    const { data: raced } = await admin
      .from("conversations")
      .select("*")
      .eq("listing_id", listing.id)
      .eq("buyer_id", input.userId)
      .eq("seller_id", sellerId)
      .maybeSingle();
    if (raced) {
      return mapConversationSummary(raced as ConversationRow, input.userId, {
        listing: {
          title: listing.title,
          slug: listing.slug,
          image: primaryListingImage(listing.marketplace_listing_images),
        },
      });
    }
    throw new ChatError("INTERNAL_ERROR", error.message, 500);
  }

  return mapConversationSummary(created as ConversationRow, input.userId, {
    listing: {
      title: listing.title,
      slug: listing.slug,
      image: primaryListingImage(listing.marketplace_listing_images),
    },
    lastMessage: null,
    unreadCount: 0,
  });
}

export async function listConversations(userId: string) {
  const admin = db();
  const { data, error } = await admin
    .from("conversations")
    .select("*")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) throw new ChatError("INTERNAL_ERROR", error.message, 500);
  const rows = ((data ?? []) as ConversationRow[]).filter((row) => {
    if (row.buyer_id === userId) return !row.buyer_archived_at;
    if (row.seller_id === userId) return !row.seller_archived_at;
    return false;
  });
  return Promise.all(rows.map((row) => mapConversationSummary(row, userId)));
}

export async function archiveConversation(conversationId: string, userId: string) {
  const conversation = await assertConversationAccess(conversationId, userId);
  const admin = db();
  const now = new Date().toISOString();
  const patch =
    conversation.buyer_id === userId
      ? { buyer_archived_at: now, updated_at: now }
      : { seller_archived_at: now, updated_at: now };

  const { error } = await admin.from("conversations").update(patch).eq("id", conversationId);
  if (error) throw new ChatError("INTERNAL_ERROR", error.message, 500);
  return { ok: true as const, conversationId };
}

export async function unarchiveConversation(conversationId: string, userId: string) {
  const conversation = await findAuthorizedConversation(conversationId, userId);
  if (!conversation) return;
  const admin = db();
  const now = new Date().toISOString();
  const patch =
    conversation.buyer_id === userId
      ? { buyer_archived_at: null, updated_at: now }
      : { seller_archived_at: null, updated_at: now };
  await admin.from("conversations").update(patch).eq("id", conversationId);
}

export async function getConversation(conversationId: string, userId: string): Promise<ConversationDetail> {
  const row = await assertConversationAccess(conversationId, userId);
  const summary = await mapConversationSummary(row, userId);
  return {
    ...summary,
    buyerArchivedAt: row.buyer_archived_at,
    sellerArchivedAt: row.seller_archived_at,
  };
}

export async function listMessages(input: {
  conversationId: string;
  userId: string;
  before?: string;
  limit?: number;
}) {
  await assertConversationAccess(input.conversationId, input.userId);
  const admin = db();
  const limit = Math.min(Math.max(input.limit ?? 30, 1), 100);

  let query = admin
    .from("messages")
    .select("*")
    .eq("conversation_id", input.conversationId)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (input.before) {
    const { data: cursor } = await admin
      .from("messages")
      .select("created_at")
      .eq("id", input.before)
      .eq("conversation_id", input.conversationId)
      .maybeSingle();
    if (cursor?.created_at) {
      query = query.lt("created_at", cursor.created_at);
    }
  }

  const { data, error } = await query;
  if (error) throw new ChatError("INTERNAL_ERROR", error.message, 500);

  const rows = (data ?? []) as MessageRow[];
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const attachments = await loadAttachments(
    admin,
    page.map((row) => row.id),
  );

  const messages = page
    .map((row) => mapMessage(row, attachments.get(row.id) ?? []))
    .reverse();

  return {
    messages,
    nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
  };
}

export async function createMessage(input: {
  conversationId: string;
  senderId: string;
  clientMessageId: string;
  body: string;
  replyToMessageId?: string;
  messageType?: MessageType;
}) {
  const rate = checkRateLimit(`msg:${input.senderId}:${input.conversationId}`, 30, 60_000);
  if (!rate.ok) {
    throw new ChatError("RATE_LIMITED", "Too many messages. Please wait a moment.", 429);
  }

  const body = input.body.trim();
  if (!body) throw new ChatError("INVALID_PAYLOAD", "Message body is required");
  if (body.length > MAX_MESSAGE_LENGTH) {
    throw new ChatError("MESSAGE_TOO_LONG", `Message must be at most ${MAX_MESSAGE_LENGTH} characters`);
  }

  const conversation = await assertConversationAccess(input.conversationId, input.senderId);
  const admin = db();

  if (input.replyToMessageId) {
    const { data: reply } = await admin
      .from("messages")
      .select("id")
      .eq("id", input.replyToMessageId)
      .eq("conversation_id", input.conversationId)
      .maybeSingle();
    if (!reply) throw new ChatError("MESSAGE_NOT_FOUND", "Reply target not found", 404);
  }

  const { data: existing } = await admin
    .from("messages")
    .select("*")
    .eq("conversation_id", input.conversationId)
    .eq("client_message_id", input.clientMessageId)
    .maybeSingle();

  if (existing) {
    const attachments = await loadAttachments(admin, [existing.id]);
    return {
      message: mapMessage(existing as MessageRow, attachments.get(existing.id) ?? []),
      conversation,
      duplicate: true,
    };
  }

  const { data: inserted, error } = await admin
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      client_message_id: input.clientMessageId,
      message_type: input.messageType ?? "text",
      body,
      reply_to_message_id: input.replyToMessageId ?? null,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: raced } = await admin
        .from("messages")
        .select("*")
        .eq("conversation_id", input.conversationId)
        .eq("client_message_id", input.clientMessageId)
        .maybeSingle();
      if (raced) {
        const attachments = await loadAttachments(admin, [raced.id]);
        return {
          message: mapMessage(raced as MessageRow, attachments.get(raced.id) ?? []),
          conversation,
          duplicate: true,
        };
      }
    }
    throw new ChatError("INTERNAL_ERROR", error.message, 500);
  }

  const now = new Date().toISOString();
  await admin
    .from("conversations")
    .update({
      last_message_id: inserted.id,
      last_message_at: inserted.created_at ?? now,
      updated_at: now,
      // New activity brings the chat back for both sides.
      buyer_archived_at: null,
      seller_archived_at: null,
    })
    .eq("id", input.conversationId);

  // Sender has read up to their own message
  await admin.from("conversation_read_state").upsert(
    {
      conversation_id: input.conversationId,
      user_id: input.senderId,
      last_read_message_id: inserted.id,
      last_read_at: inserted.created_at ?? now,
    },
    { onConflict: "conversation_id,user_id" },
  );

  const message = mapMessage(inserted as MessageRow, []);
  return { message, conversation, duplicate: false };
}

export async function markMessageDelivered(input: {
  conversationId: string;
  messageId: string;
  userId: string;
}) {
  const conversation = await assertConversationAccess(input.conversationId, input.userId);
  const admin = db();
  const { data: message } = await admin
    .from("messages")
    .select("*")
    .eq("id", input.messageId)
    .eq("conversation_id", input.conversationId)
    .maybeSingle();

  if (!message) throw new ChatError("MESSAGE_NOT_FOUND", "Message not found", 404);
  if (message.sender_id === input.userId) {
    return { message: mapMessage(message as MessageRow), conversation, changed: false };
  }

  if (message.delivered_at) {
    return { message: mapMessage(message as MessageRow), conversation, changed: false };
  }

  const deliveredAt = new Date().toISOString();
  const { data: updated, error } = await admin
    .from("messages")
    .update({ delivered_at: deliveredAt })
    .eq("id", input.messageId)
    .is("delivered_at", null)
    .select("*")
    .maybeSingle();

  if (error) throw new ChatError("INTERNAL_ERROR", error.message, 500);
  const row = (updated as MessageRow | null) ?? (message as MessageRow);
  return { message: mapMessage(row), conversation, changed: Boolean(updated) };
}

export async function markConversationRead(input: {
  conversationId: string;
  messageId: string;
  userId: string;
}) {
  const conversation = await assertConversationAccess(input.conversationId, input.userId);
  const admin = db();
  const { data: message } = await admin
    .from("messages")
    .select("*")
    .eq("id", input.messageId)
    .eq("conversation_id", input.conversationId)
    .maybeSingle();

  if (!message) throw new ChatError("MESSAGE_NOT_FOUND", "Message not found", 404);

  const readAt = message.created_at;
  await admin.from("conversation_read_state").upsert(
    {
      conversation_id: input.conversationId,
      user_id: input.userId,
      last_read_message_id: input.messageId,
      last_read_at: readAt,
    },
    { onConflict: "conversation_id,user_id" },
  );

  // Mark peer-sent messages up to this point as read
  await admin
    .from("messages")
    .update({ read_at: readAt, delivered_at: message.delivered_at ?? readAt })
    .eq("conversation_id", input.conversationId)
    .neq("sender_id", input.userId)
    .is("deleted_at", null)
    .lte("created_at", readAt)
    .is("read_at", null);

  const unreadCount = await unreadCountFor(admin, input.conversationId, input.userId);
  return {
    conversation,
    messageId: input.messageId,
    readAt,
    unreadCount,
    peerId: conversation.buyer_id === input.userId ? conversation.seller_id : conversation.buyer_id,
  };
}

export async function syncMessages(input: {
  conversationId: string;
  userId: string;
  lastReceivedMessageId?: string | null;
}) {
  await assertConversationAccess(input.conversationId, input.userId);
  const admin = db();

  let query = admin
    .from("messages")
    .select("*")
    .eq("conversation_id", input.conversationId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (input.lastReceivedMessageId) {
    const { data: cursor } = await admin
      .from("messages")
      .select("created_at")
      .eq("id", input.lastReceivedMessageId)
      .eq("conversation_id", input.conversationId)
      .maybeSingle();
    if (cursor?.created_at) {
      query = query.gt("created_at", cursor.created_at);
    }
  }

  const { data, error } = await query;
  if (error) throw new ChatError("INTERNAL_ERROR", error.message, 500);
  const rows = (data ?? []) as MessageRow[];
  const attachments = await loadAttachments(
    admin,
    rows.map((row) => row.id),
  );

  return rows.map((row) => mapMessage(row, attachments.get(row.id) ?? []));
}

export async function softDeleteMessage(messageId: string, userId: string) {
  const admin = db();
  const { data: message } = await admin.from("messages").select("*").eq("id", messageId).maybeSingle();
  if (!message) throw new ChatError("MESSAGE_NOT_FOUND", "Message not found", 404);
  if (message.sender_id !== userId) {
    throw new ChatError("CONVERSATION_ACCESS_DENIED", "Only the sender can delete this message", 403);
  }
  await assertConversationAccess(message.conversation_id, userId);

  const deletedAt = new Date().toISOString();
  const { data: updated, error } = await admin
    .from("messages")
    .update({ deleted_at: deletedAt, body: null })
    .eq("id", messageId)
    .select("*")
    .single();

  if (error) throw new ChatError("INTERNAL_ERROR", error.message, 500);
  return mapMessage(updated as MessageRow, []);
}

export async function editMessage(messageId: string, userId: string, body: string) {
  const trimmed = body.trim();
  if (!trimmed) throw new ChatError("INVALID_PAYLOAD", "Message body is required");
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new ChatError("MESSAGE_TOO_LONG", `Message must be at most ${MAX_MESSAGE_LENGTH} characters`);
  }

  const admin = db();
  const { data: message } = await admin.from("messages").select("*").eq("id", messageId).maybeSingle();
  if (!message) throw new ChatError("MESSAGE_NOT_FOUND", "Message not found", 404);
  if (message.sender_id !== userId) {
    throw new ChatError("CONVERSATION_ACCESS_DENIED", "Only the sender can edit this message", 403);
  }
  if (message.deleted_at) throw new ChatError("MESSAGE_NOT_FOUND", "Message was deleted", 404);
  await assertConversationAccess(message.conversation_id, userId);

  const editedAt = new Date().toISOString();
  const { data: updated, error } = await admin
    .from("messages")
    .update({ body: trimmed, edited_at: editedAt })
    .eq("id", messageId)
    .select("*")
    .single();

  if (error) throw new ChatError("INTERNAL_ERROR", error.message, 500);
  const attachments = await loadAttachments(admin, [messageId]);
  return mapMessage(updated as MessageRow, attachments.get(messageId) ?? []);
}

export async function getUnreadCount(userId: string) {
  const conversations = await listConversations(userId);
  const byConversation: Record<string, number> = {};
  let total = 0;
  for (const conversation of conversations) {
    byConversation[conversation.id] = conversation.unreadCount;
    total += conversation.unreadCount;
  }
  return { total, byConversation };
}

export async function blockUser(blockerId: string, blockedId: string, reason?: string) {
  if (blockerId === blockedId) {
    throw new ChatError("INVALID_PAYLOAD", "You cannot block yourself");
  }
  const admin = db();
  const { error } = await admin.from("user_blocks").upsert(
    {
      blocker_id: blockerId,
      blocked_id: blockedId,
      reason: reason ?? null,
    },
    { onConflict: "blocker_id,blocked_id" },
  );
  if (error) throw new ChatError("INTERNAL_ERROR", error.message, 500);
  return { ok: true as const };
}

export async function unblockUser(blockerId: string, blockedId: string) {
  const admin = db();
  const { error } = await admin
    .from("user_blocks")
    .delete()
    .eq("blocker_id", blockerId)
    .eq("blocked_id", blockedId);
  if (error) throw new ChatError("INTERNAL_ERROR", error.message, 500);
  return { ok: true as const };
}

export async function reportUser(input: {
  reporterId: string;
  reportedUserId: string;
  conversationId?: string;
  messageId?: string;
  reason: string;
  details?: string;
}) {
  if (input.reporterId === input.reportedUserId) {
    throw new ChatError("INVALID_PAYLOAD", "You cannot report yourself");
  }
  const admin = db();
  const { error } = await admin.from("chat_reports").insert({
    reporter_id: input.reporterId,
    reported_user_id: input.reportedUserId,
    conversation_id: input.conversationId ?? null,
    message_id: input.messageId ?? null,
    reason: input.reason,
    details: input.details ?? null,
  });
  if (error) throw new ChatError("INTERNAL_ERROR", error.message, 500);
  return { ok: true as const };
}

export async function attachUploadedFile(input: {
  userId: string;
  conversationId: string;
  clientMessageId: string;
  body?: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}) {
  const result = await createMessage({
    conversationId: input.conversationId,
    senderId: input.userId,
    clientMessageId: input.clientMessageId,
    body: input.body?.trim() || input.originalName,
    messageType: input.mimeType.startsWith("image/") ? "image" : "file",
  });

  const admin = db();
  const { data: attachment, error } = await admin
    .from("message_attachments")
    .insert({
      message_id: result.message.id,
      storage_key: input.storageKey,
      original_name: input.originalName,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
    })
    .select("*")
    .single();

  if (error) throw new ChatError("INTERNAL_ERROR", error.message, 500);

  return {
    ...result,
    message: {
      ...result.message,
      attachments: [mapAttachment(attachment as AttachmentRow)],
    },
  };
}
