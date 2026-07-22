"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getChatSocket, getExistingChatSocket } from "@/lib/chat/socket-client";
import { notifyChatUnreadChanged } from "@/components/chat/messages-nav-link";
import type {
  ChatMessage,
  ConversationSummary,
  MessageDeliveryStatus,
} from "@/lib/chat/types";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

type ChatState = {
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  messagesByConversation: Record<string, ChatMessage[]>;
  unreadByConversation: Record<string, number>;
  typingUsers: Record<string, string[]>;
  connectionStatus: ConnectionStatus;
  presenceByUser: Record<string, "online" | "offline">;
  currentUserId: string | null;
  loading: boolean;
  error: string | null;
};

type ChatActions = {
  setActiveConversationId: (id: string | null) => void;
  refreshConversations: () => Promise<void>;
  ensureConversationForListing: (listingSlug: string) => Promise<ConversationSummary | null>;
  loadMessages: (conversationId: string, options?: { before?: string }) => Promise<void>;
  sendMessage: (conversationId: string, body: string) => Promise<void>;
  retryMessage: (conversationId: string, clientMessageId: string) => Promise<void>;
  markRead: (conversationId: string, messageId: string) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  blockPeer: (peerId: string) => Promise<void>;
  uploadAttachment: (conversationId: string, file: File) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
};

const ChatContext = createContext<(ChatState & ChatActions) | null>(null);

function upsertMessage(list: ChatMessage[], message: ChatMessage) {
  const byClient = list.findIndex((item) => item.clientMessageId === message.clientMessageId);
  if (byClient >= 0) {
    const next = [...list];
    next[byClient] = { ...next[byClient], ...message };
    return next;
  }
  const byId = list.findIndex((item) => item.id === message.id);
  if (byId >= 0) {
    const next = [...list];
    next[byId] = { ...next[byId], ...message };
    return next;
  }
  return [...list, message].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function applyStatus(
  list: ChatMessage[],
  messageId: string,
  status: MessageDeliveryStatus,
  patch: Partial<ChatMessage>,
): ChatMessage[] {
  return list.map((item) => {
    if (item.id === messageId || item.clientMessageId === messageId) {
      return { ...item, status, ...patch };
    }
    if (
      status === "read" &&
      item.status === "sent" &&
      patch.readAt &&
      item.createdAt <= patch.readAt
    ) {
      return { ...item, status: "read" as const, readAt: patch.readAt };
    }
    return item;
  });
}

export function ChatProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string | null;
}) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatMessage[]>>({});
  const [unreadByConversation, setUnreadByConversation] = useState<Record<string, number>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [presenceByUser, setPresenceByUser] = useState<Record<string, "online" | "offline">>({});
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);
  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    activeRef.current = activeConversationId;
  }, [activeConversationId]);

  const refreshConversations = useCallback(async () => {
    const response = await fetch("/api/conversations");
    const payload = (await response.json()) as {
      ok?: boolean;
      conversations?: ConversationSummary[];
      message?: string;
    };
    if (!response.ok || !payload.ok) {
      throw new Error(payload.message || "Could not load conversations");
    }
    const list = payload.conversations ?? [];
    setConversations(list);
    const unread: Record<string, number> = {};
    for (const item of list) unread[item.id] = item.unreadCount;
    setUnreadByConversation(unread);

    const socket = getExistingChatSocket();
    if (socket?.connected) {
      for (const item of list) {
        socket.emit("conversation:join", { conversationId: item.id });
      }
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string, options?: { before?: string }) => {
    const params = new URLSearchParams({ limit: "40" });
    if (options?.before) params.set("before", options.before);
    const response = await fetch(`/api/conversations/${conversationId}/messages?${params}`);
    const payload = (await response.json()) as {
      ok?: boolean;
      messages?: ChatMessage[];
      message?: string;
    };
    if (!response.ok || !payload.ok) {
      throw new Error(payload.message || "Could not load messages");
    }

    setMessagesByConversation((prev) => {
      const existing = prev[conversationId] ?? [];
      const incoming = payload.messages ?? [];
      const merged = options?.before
        ? [...incoming, ...existing]
        : incoming;
      const deduped = merged.reduce<ChatMessage[]>((acc, message) => upsertMessage(acc, message), []);
      return { ...prev, [conversationId]: deduped };
    });
  }, []);

  const ensureConversationForListing = useCallback(async (listingSlug: string) => {
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingSlug }),
    });
    const payload = (await response.json()) as {
      ok?: boolean;
      conversation?: ConversationSummary;
      message?: string;
    };
    if (!response.ok || !payload.ok || !payload.conversation) {
      throw new Error(payload.message || "Could not start conversation");
    }
    setConversations((prev) => {
      const without = prev.filter((item) => item.id !== payload.conversation!.id);
      return [payload.conversation!, ...without];
    });
    setActiveConversationId(payload.conversation.id);
    return payload.conversation;
  }, []);

  const markRead = useCallback((conversationId: string, messageId: string) => {
    const socket = getExistingChatSocket();
    socket?.emit("message:read", { conversationId, messageId });

    setUnreadByConversation((prev) => {
      if ((prev[conversationId] ?? 0) === 0) return prev;
      return { ...prev, [conversationId]: 0 };
    });
    setConversations((prev) => {
      const current = prev.find((item) => item.id === conversationId);
      if (!current || current.unreadCount === 0) return prev;
      return prev.map((item) =>
        item.id === conversationId ? { ...item, unreadCount: 0 } : item,
      );
    });
    notifyChatUnreadChanged();
  }, []);

  const setTyping = useCallback((conversationId: string, isTyping: boolean) => {
    const socket = getExistingChatSocket();
    if (!socket) return;
    socket.emit(isTyping ? "typing:start" : "typing:stop", { conversationId });
  }, []);

  const sendMessage = useCallback(async (conversationId: string, body: string) => {
    const text = body.trim();
    if (!text || !userId) return;

    const clientMessageId = crypto.randomUUID();
    const optimistic: ChatMessage = {
      id: clientMessageId,
      conversationId,
      senderId: userId,
      clientMessageId,
      messageType: "text",
      body: text,
      replyToMessageId: null,
      deliveredAt: null,
      readAt: null,
      editedAt: null,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      attachments: [],
      status: "sending",
    };

    setMessagesByConversation((prev) => ({
      ...prev,
      [conversationId]: upsertMessage(prev[conversationId] ?? [], optimistic),
    }));
    setConversations((prev) => {
      const next = prev.map((item) =>
        item.id === conversationId
          ? {
              ...item,
              lastMessage: optimistic,
              lastMessageAt: optimistic.createdAt,
              updatedAt: optimistic.createdAt,
            }
          : item,
      );
      return next.sort((a, b) => (b.lastMessageAt || "").localeCompare(a.lastMessageAt || ""));
    });

    try {
      // Prefer REST so replies work even while Socket.IO is reconnecting.
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientMessageId, body: text }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        message?: ChatMessage | string;
      };

      if (
        !response.ok ||
        !payload.ok ||
        !payload.message ||
        typeof payload.message === "string"
      ) {
        throw new Error(
          typeof payload.message === "string" ? payload.message : "Could not send message",
        );
      }

      const saved = payload.message;
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: upsertMessage(prev[conversationId] ?? [], {
          ...saved,
          status: "sent",
        }),
      }));
      setConversations((prev) => {
        const next = prev.map((item) =>
          item.id === conversationId
            ? {
                ...item,
                lastMessage: saved,
                lastMessageAt: saved.createdAt,
                updatedAt: saved.createdAt,
              }
            : item,
        );
        return next.sort((a, b) => (b.lastMessageAt || "").localeCompare(a.lastMessageAt || ""));
      });
      notifyChatUnreadChanged();
    } catch {
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] ?? []).map((item) =>
          item.clientMessageId === clientMessageId ? { ...item, status: "failed" } : item,
        ),
      }));
    }
  }, [userId]);

  const retryMessage = useCallback(async (conversationId: string, clientMessageId: string) => {
    const existing = messagesByConversation[conversationId]?.find(
      (item) => item.clientMessageId === clientMessageId,
    );
    if (!existing?.body) return;

    setMessagesByConversation((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] ?? []).map((item) =>
        item.clientMessageId === clientMessageId ? { ...item, status: "sending" } : item,
      ),
    }));

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientMessageId,
          body: existing.body,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        message?: ChatMessage;
      };
      if (!response.ok || !payload.ok || !payload.message) {
        throw new Error("retry failed");
      }
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: upsertMessage(prev[conversationId] ?? [], {
          ...payload.message!,
          status: "sent",
        }),
      }));
    } catch {
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] ?? []).map((item) =>
          item.clientMessageId === clientMessageId ? { ...item, status: "failed" } : item,
        ),
      }));
    }
  }, [messagesByConversation]);

  const blockPeer = useCallback(async (peerId: string) => {
    const response = await fetch(`/api/users/${peerId}/block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const payload = (await response.json()) as { ok?: boolean; message?: string };
    if (!response.ok || !payload.ok) {
      throw new Error(payload.message || "Could not block user");
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    const response = await fetch(`/api/conversations/${conversationId}`, {
      method: "DELETE",
    });
    const payload = (await response.json()) as { ok?: boolean; message?: string };
    if (!response.ok || !payload.ok) {
      throw new Error(payload.message || "Could not delete conversation");
    }

    setConversations((prev) => prev.filter((item) => item.id !== conversationId));
    setMessagesByConversation((prev) => {
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });
    setUnreadByConversation((prev) => {
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });
    setActiveConversationId((current) => (current === conversationId ? null : current));
    notifyChatUnreadChanged();
  }, []);

  const uploadAttachment = useCallback(async (conversationId: string, file: File) => {
    const clientMessageId = crypto.randomUUID();
    const form = new FormData();
    form.set("file", file);
    form.set("conversationId", conversationId);
    form.set("clientMessageId", clientMessageId);

    const response = await fetch("/api/chat/attachments", {
      method: "POST",
      body: form,
    });
    const payload = (await response.json()) as {
      ok?: boolean;
      message?: ChatMessage;
      errorMessage?: string;
    } & { message?: ChatMessage | string };

    if (!response.ok || !payload.ok) {
      throw new Error(
        typeof payload.message === "string" ? payload.message : "Upload failed",
      );
    }

    if (!payload.message || typeof payload.message === "string") {
      throw new Error("Upload failed");
    }

    const saved = payload.message;
    setMessagesByConversation((prev) => ({
      ...prev,
      [conversationId]: upsertMessage(prev[conversationId] ?? [], { ...saved, status: "sent" }),
    }));
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;
    let socketCleanup: (() => void) | undefined;

    async function boot() {
      setLoading(true);
      setError(null);
      setConnectionStatus("connecting");
      try {
        await refreshConversations();
        if (cancelled) return;
        // Show the inbox immediately — don't block the UI on Socket.IO.
        setLoading(false);

        try {
          const socket = await getChatSocket();
          if (cancelled) return;

          const onConnect = () => {
            setConnectionStatus("connected");
            const active = activeRef.current;
            if (active) {
              socket.emit("conversation:join", { conversationId: active });
              socket.emit(
                "conversation:sync",
                { conversationId: active, lastReceivedMessageId: null },
                (ack: { ok?: boolean; messages?: ChatMessage[] }) => {
                  if (!ack?.ok || !ack.messages?.length) return;
                  setMessagesByConversation((prev) => ({
                    ...prev,
                    [active]: ack.messages!.reduce(
                      (list, message) => upsertMessage(list, message),
                      prev[active] ?? [],
                    ),
                  }));
                },
              );
            }
            void refreshConversations().catch(() => undefined);
          };

          const onDisconnect = () => setConnectionStatus("disconnected");

          socket.on("connect", onConnect);
          socket.on("disconnect", onDisconnect);
          if (socket.connected) onConnect();
          else setConnectionStatus("connecting");

          socket.on("message:new", (message: ChatMessage) => {
            setMessagesByConversation((prev) => ({
              ...prev,
              [message.conversationId]: upsertMessage(prev[message.conversationId] ?? [], {
                ...message,
                status: message.senderId === userId ? message.status ?? "sent" : "delivered",
              }),
            }));

            if (message.senderId !== userId) {
              socket.emit("message:delivered", {
                conversationId: message.conversationId,
                messageId: message.id,
              });
              socket.emit("conversation:join", { conversationId: message.conversationId });
              if (activeRef.current === message.conversationId) {
                markRead(message.conversationId, message.id);
              } else {
                setUnreadByConversation((prev) => ({
                  ...prev,
                  [message.conversationId]: (prev[message.conversationId] ?? 0) + 1,
                }));
                notifyChatUnreadChanged();
              }
            }

            setConversations((prev) => {
              const exists = prev.some((item) => item.id === message.conversationId);
              if (!exists) {
                void refreshConversations().catch(() => undefined);
                return prev;
              }
              const next = prev.map((item) =>
                item.id === message.conversationId
                  ? {
                      ...item,
                      lastMessage: message,
                      lastMessageAt: message.createdAt,
                      updatedAt: message.createdAt,
                      unreadCount:
                        activeRef.current === message.conversationId || message.senderId === userId
                          ? item.unreadCount
                          : Math.max(item.unreadCount, 0) + 1,
                    }
                  : item,
              );
              return next.sort((a, b) =>
                (b.lastMessageAt || "").localeCompare(a.lastMessageAt || ""),
              );
            });
          });

          socket.on(
            "message:status",
            (payload: {
              conversationId: string;
              messageId: string;
              status: MessageDeliveryStatus;
              deliveredAt?: string | null;
              readAt?: string | null;
            }) => {
              setMessagesByConversation((prev) => ({
                ...prev,
                [payload.conversationId]: applyStatus(
                  prev[payload.conversationId] ?? [],
                  payload.messageId,
                  payload.status,
                  {
                    deliveredAt: payload.deliveredAt ?? undefined,
                    readAt: payload.readAt ?? undefined,
                  },
                ),
              }));
            },
          );

          socket.on(
            "conversation:updated",
            (payload: { conversationId: string; lastMessage: ChatMessage }) => {
              setConversations((prev) => {
                const exists = prev.some((item) => item.id === payload.conversationId);
                if (!exists) {
                  void refreshConversations().catch(() => undefined);
                  return prev;
                }
                return prev
                  .map((item) =>
                    item.id === payload.conversationId
                      ? {
                          ...item,
                          lastMessage: payload.lastMessage,
                          lastMessageAt: payload.lastMessage.createdAt,
                          updatedAt: payload.lastMessage.createdAt,
                        }
                      : item,
                  )
                  .sort((a, b) => (b.lastMessageAt || "").localeCompare(a.lastMessageAt || ""));
              });
            },
          );

          socket.on(
            "unread:updated",
            (payload: { total?: number; byConversation?: Record<string, number> }) => {
              if (payload.byConversation) setUnreadByConversation(payload.byConversation);
              notifyChatUnreadChanged();
            },
          );

          socket.on(
            "typing:update",
            (payload: { conversationId: string; userId: string; isTyping: boolean }) => {
              if (payload.userId === userId) return;
              setTypingUsers((prev) => {
                const current = new Set(prev[payload.conversationId] ?? []);
                if (payload.isTyping) current.add(payload.userId);
                else current.delete(payload.userId);
                return { ...prev, [payload.conversationId]: [...current] };
              });
              if (payload.isTyping) {
                clearTimeout(typingTimers.current[payload.conversationId]);
                typingTimers.current[payload.conversationId] = setTimeout(() => {
                  setTypingUsers((prev) => ({
                    ...prev,
                    [payload.conversationId]: (prev[payload.conversationId] ?? []).filter(
                      (id) => id !== payload.userId,
                    ),
                  }));
                }, 2500);
              }
            },
          );

          socket.on(
            "presence:update",
            (payload: { userId: string; status: "online" | "offline" }) => {
              setPresenceByUser((prev) => ({ ...prev, [payload.userId]: payload.status }));
            },
          );

          socket.on("chat:error", (payload: { message?: string }) => {
            setError(payload.message || "Chat error");
          });

          socketCleanup = () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("message:new");
            socket.off("message:status");
            socket.off("conversation:updated");
            socket.off("unread:updated");
            socket.off("typing:update");
            socket.off("presence:update");
            socket.off("chat:error");
          };
        } catch (socketError) {
          setConnectionStatus("disconnected");
          setError(
            socketError instanceof Error
              ? socketError.message
              : "Live connection unavailable — messages still work",
          );
        }
      } catch (bootError) {
        setConnectionStatus("disconnected");
        setError(bootError instanceof Error ? bootError.message : "Could not load chat");
        if (!cancelled) setLoading(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
      socketCleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    const socket = getExistingChatSocket();
    if (!socket || !activeConversationId || connectionStatus !== "connected") return;
    socket.emit("conversation:join", { conversationId: activeConversationId }, () => {
      void loadMessages(activeConversationId).catch(() => undefined);
    });
  }, [activeConversationId, connectionStatus, loadMessages]);

  const value = useMemo(
    () => ({
      conversations,
      activeConversationId,
      messagesByConversation,
      unreadByConversation,
      typingUsers,
      connectionStatus,
      presenceByUser,
      currentUserId: userId,
      loading,
      error,
      setActiveConversationId,
      refreshConversations,
      ensureConversationForListing,
      loadMessages,
      sendMessage,
      retryMessage,
      markRead,
      setTyping,
      blockPeer,
      uploadAttachment,
      deleteConversation,
    }),
    [
      conversations,
      activeConversationId,
      messagesByConversation,
      unreadByConversation,
      typingUsers,
      connectionStatus,
      presenceByUser,
      userId,
      loading,
      error,
      refreshConversations,
      ensureConversationForListing,
      loadMessages,
      sendMessage,
      retryMessage,
      markRead,
      setTyping,
      blockPeer,
      uploadAttachment,
      deleteConversation,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
}
