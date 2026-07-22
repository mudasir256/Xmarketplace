export const CHAT_ATTACHMENT_BUCKET = "chat-attachments";
export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type MessageType = "text" | "image" | "file" | "system";
export type MessageDeliveryStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export type ChatAttachment = {
  id: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string | null;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  clientMessageId: string;
  messageType: MessageType;
  body: string | null;
  replyToMessageId: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  attachments: ChatAttachment[];
  status?: MessageDeliveryStatus;
};

export type ConversationSummary = {
  id: string;
  listingId: string;
  listingSlug: string;
  listingTitle: string;
  listingImage: string;
  buyerId: string;
  sellerId: string;
  peerId: string;
  peerName: string;
  peerAvatarUrl: string | null;
  lastMessage: ChatMessage | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  tab: "products" | "buyers";
};

export type ConversationDetail = ConversationSummary & {
  buyerArchivedAt: string | null;
  sellerArchivedAt: string | null;
};

export const CHAT_QUICK_REPLIES = [
  "Assalam o alaikum",
  "Is this still available?",
  "What is your final price?",
  "Can we meet today?",
] as const;

export type SocketAck<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string; message?: string };

export type SendMessagePayload = {
  conversationId: string;
  clientMessageId: string;
  body: string;
  replyToMessageId?: string;
  messageType?: MessageType;
};

export type ChatErrorCode =
  | "UNAUTHORIZED"
  | "CONVERSATION_ACCESS_DENIED"
  | "CONVERSATION_NOT_FOUND"
  | "CANNOT_CHAT_SELF"
  | "USER_BLOCKED"
  | "LISTING_NOT_FOUND"
  | "INVALID_PAYLOAD"
  | "MESSAGE_TOO_LONG"
  | "RATE_LIMITED"
  | "MESSAGE_NOT_FOUND"
  | "INTERNAL_ERROR";
