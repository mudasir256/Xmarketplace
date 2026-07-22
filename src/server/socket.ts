import type { Server as HttpServer } from "node:http";
import { createClient } from "@supabase/supabase-js";
import { Server, type Socket } from "socket.io";
import { getAppUrl, getPublicSupabaseAnonKey, getPublicSupabaseUrl } from "@/lib/env-public";
import { mapChatError } from "@/lib/chat/errors";
import { checkRateLimit } from "@/lib/chat/rate-limit";
import {
  conversationIdSchema,
  conversationSyncSchema,
  messageDeliveredSchema,
  messageReadSchema,
  sendMessageSchema,
} from "@/lib/chat/schema";
import {
  assertConversationAccess,
  createMessage,
  findAuthorizedConversation,
  getUnreadCount,
  markConversationRead,
  markMessageDelivered,
  syncMessages,
} from "@/lib/chat/service";
import type { ChatMessage } from "@/lib/chat/types";

type PresenceState = {
  sockets: Set<string>;
  lastSeenAt: number;
};

const presence = new Map<string, PresenceState>();

function userRoom(userId: string) {
  return `user:${userId}`;
}

function conversationRoom(conversationId: string) {
  return `conversation:${conversationId}`;
}

function setOnline(userId: string, socketId: string) {
  const current = presence.get(userId) ?? { sockets: new Set(), lastSeenAt: Date.now() };
  current.sockets.add(socketId);
  current.lastSeenAt = Date.now();
  presence.set(userId, current);
  return current.sockets.size === 1;
}

function setOffline(userId: string, socketId: string) {
  const current = presence.get(userId);
  if (!current) return true;
  current.sockets.delete(socketId);
  current.lastSeenAt = Date.now();
  if (current.sockets.size === 0) {
    presence.set(userId, current);
    return true;
  }
  return false;
}

function isOnline(userId: string) {
  return (presence.get(userId)?.sockets.size ?? 0) > 0;
}

async function verifyAccessToken(token: string) {
  const url = getPublicSupabaseUrl();
  const anon = getPublicSupabaseAnonKey();
  if (!url || !anon) throw new Error("Missing Supabase env");

  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error("UNAUTHORIZED");
  return data.user;
}

async function emitUnread(io: Server, userId: string) {
  const unread = await getUnreadCount(userId);
  io.to(userRoom(userId)).emit("unread:updated", unread);
}

let chatIo: Server | null = null;

type GlobalChatIo = typeof globalThis & { __xmarketplaceChatIo?: Server | null };

function setChatIo(io: Server | null) {
  chatIo = io;
  (globalThis as GlobalChatIo).__xmarketplaceChatIo = io;
}

export function getChatIo() {
  return chatIo ?? (globalThis as GlobalChatIo).__xmarketplaceChatIo ?? null;
}

function emitMessageToParticipants(
  io: Server,
  message: ChatMessage,
  buyerId: string,
  sellerId: string,
) {
  const updatePayload = {
    conversationId: message.conversationId,
    lastMessage: message,
  };

  // Same channel for both sides: user:{buyerId} and user:{sellerId}.
  // Do not also emit to conversation room here — sockets in both rooms would get duplicates.
  for (const participantId of [buyerId, sellerId]) {
    io.to(userRoom(participantId)).emit("message:new", message);
    io.to(userRoom(participantId)).emit("conversation:updated", updatePayload);
  }
}

export function createChatSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    path: "/api/socketio",
    cors: {
      origin: getAppUrl() || true,
      credentials: true,
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
  });
  setChatIo(io);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("UNAUTHORIZED"));
      const user = await verifyAccessToken(token);
      socket.data.userId = user.id;
      next();
    } catch {
      next(new Error("UNAUTHORIZED"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    void socket.join(userRoom(userId));

    const becameOnline = setOnline(userId, socket.id);
    if (becameOnline) {
      socket.broadcast.emit("presence:update", {
        userId,
        status: "online",
      });
    }

    socket.on("conversation:join", async (payload, ack) => {
      try {
        const parsed = conversationIdSchema.safeParse(payload);
        if (!parsed.success) {
          return ack?.({ ok: false, error: "INVALID_PAYLOAD" });
        }

        const conversation = await findAuthorizedConversation(
          parsed.data.conversationId,
          userId,
        );
        if (!conversation) {
          return ack?.({ ok: false, error: "CONVERSATION_ACCESS_DENIED" });
        }

        await socket.join(conversationRoom(parsed.data.conversationId));
        ack?.({ ok: true, conversationId: parsed.data.conversationId });
      } catch (error) {
        const mapped = mapChatError(error);
        ack?.({ ok: false, error: mapped.error, message: mapped.message });
      }
    });

    socket.on("conversation:leave", async (payload, ack) => {
      try {
        const parsed = conversationIdSchema.safeParse(payload);
        if (!parsed.success) {
          return ack?.({ ok: false, error: "INVALID_PAYLOAD" });
        }
        await socket.leave(conversationRoom(parsed.data.conversationId));
        ack?.({ ok: true });
      } catch (error) {
        const mapped = mapChatError(error);
        ack?.({ ok: false, error: mapped.error, message: mapped.message });
      }
    });

    socket.on("message:send", async (payload, ack) => {
      try {
        const parsed = sendMessageSchema.safeParse(payload);
        if (!parsed.success) {
          return ack?.({ ok: false, error: "INVALID_PAYLOAD" });
        }

        const result = await createMessage({
          ...parsed.data,
          senderId: userId,
        });

        const message = result.message;
        emitMessageToParticipants(
          io,
          message,
          result.conversation.buyer_id,
          result.conversation.seller_id,
        );

        const peerId =
          result.conversation.buyer_id === userId
            ? result.conversation.seller_id
            : result.conversation.buyer_id;
        await emitUnread(io, peerId);

        ack?.({ ok: true, message });
      } catch (error) {
        const mapped = mapChatError(error);
        ack?.({ ok: false, error: mapped.error, message: mapped.message });
        socket.emit("chat:error", mapped);
      }
    });

    socket.on("message:delivered", async (payload) => {
      try {
        const parsed = messageDeliveredSchema.safeParse(payload);
        if (!parsed.success) return;

        const result = await markMessageDelivered({
          ...parsed.data,
          userId,
        });
        if (!result.changed) return;

        io.to(conversationRoom(parsed.data.conversationId)).emit("message:status", {
          conversationId: parsed.data.conversationId,
          messageId: result.message.id,
          status: "delivered",
          deliveredAt: result.message.deliveredAt,
          readAt: result.message.readAt,
        });
      } catch {
        // ignore delivery ack failures
      }
    });

    socket.on("message:read", async (payload, ack) => {
      try {
        const parsed = messageReadSchema.safeParse(payload);
        if (!parsed.success) {
          return ack?.({ ok: false, error: "INVALID_PAYLOAD" });
        }

        const result = await markConversationRead({
          ...parsed.data,
          userId,
        });

        io.to(conversationRoom(parsed.data.conversationId)).emit("message:status", {
          conversationId: parsed.data.conversationId,
          messageId: result.messageId,
          status: "read",
          readAt: result.readAt,
        });

        await emitUnread(io, userId);
        ack?.({ ok: true, unreadCount: result.unreadCount });
      } catch (error) {
        const mapped = mapChatError(error);
        ack?.({ ok: false, error: mapped.error, message: mapped.message });
      }
    });

    socket.on("typing:start", async (payload) => {
      try {
        const rate = checkRateLimit(`typing:${userId}`, 20, 5_000);
        if (!rate.ok) return;
        const parsed = conversationIdSchema.safeParse(payload);
        if (!parsed.success) return;
        await assertConversationAccess(parsed.data.conversationId, userId);
        socket
          .to(conversationRoom(parsed.data.conversationId))
          .volatile.emit("typing:update", {
            conversationId: parsed.data.conversationId,
            userId,
            isTyping: true,
          });
      } catch {
        // ignore
      }
    });

    socket.on("typing:stop", async (payload) => {
      try {
        const parsed = conversationIdSchema.safeParse(payload);
        if (!parsed.success) return;
        await assertConversationAccess(parsed.data.conversationId, userId);
        socket
          .to(conversationRoom(parsed.data.conversationId))
          .volatile.emit("typing:update", {
            conversationId: parsed.data.conversationId,
            userId,
            isTyping: false,
          });
      } catch {
        // ignore
      }
    });

    socket.on("conversation:sync", async (payload, ack) => {
      try {
        const parsed = conversationSyncSchema.safeParse(payload);
        if (!parsed.success) {
          return ack?.({ ok: false, error: "INVALID_PAYLOAD" });
        }
        const messages: ChatMessage[] = await syncMessages({
          conversationId: parsed.data.conversationId,
          userId,
          lastReceivedMessageId: parsed.data.lastReceivedMessageId,
        });
        ack?.({ ok: true, messages });
      } catch (error) {
        const mapped = mapChatError(error);
        ack?.({ ok: false, error: mapped.error, message: mapped.message });
      }
    });

    socket.on("presence:query", (payload, ack) => {
      const peerId = (payload as { userId?: string } | undefined)?.userId;
      if (!peerId) return ack?.({ ok: false, error: "INVALID_PAYLOAD" });
      const online = isOnline(peerId);
      ack?.({
        ok: true,
        userId: peerId,
        status: online ? "online" : "offline",
        lastSeenAt: presence.get(peerId)?.lastSeenAt ?? null,
      });
    });

    socket.on("disconnect", () => {
      const wentOffline = setOffline(userId, socket.id);
      if (wentOffline) {
        socket.broadcast.emit("presence:update", {
          userId,
          status: "offline",
          lastSeenAt: Date.now(),
        });
      }
    });
  });

  return io;
}
