"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Ban,
  Check,
  CheckCheck,
  ChevronLeft,
  ImagePlus,
  MessageCircle,
  Search,
  SendHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { CHAT_QUICK_REPLIES } from "@/lib/chat/types";
import { useChat } from "@/providers/chat-provider";

export type ChatProductContext = {
  productId: string;
  productTitle: string;
  productImage: string;
  sellerName: string;
  listingSlug?: string;
};

function DeliveryTicks({
  status,
}: {
  status?: "sending" | "sent" | "delivered" | "read" | "failed";
}) {
  if (status === "failed") {
    return <span className="text-[10px] font-bold text-[#ffe0d8]">Failed · tap to retry</span>;
  }
  if (status === "sending") {
    return <span className="text-[10px] opacity-80">Sending…</span>;
  }
  if (status === "read") {
    return <CheckCheck size={14} className="text-[#d7ecff]" />;
  }
  if (status === "delivered") {
    return <CheckCheck size={14} className="opacity-90" />;
  }
  return <Check size={14} className="opacity-90" />;
}

export function ChatWorkspace({
  initialProduct,
}: {
  initialProduct?: ChatProductContext | null;
}) {
  const {
    conversations,
    activeConversationId,
    messagesByConversation,
    unreadByConversation,
    typingUsers,
    connectionStatus,
    presenceByUser,
    currentUserId,
    loading,
    error,
    setActiveConversationId,
    ensureConversationForListing,
    sendMessage,
    retryMessage,
    markRead,
    setTyping,
    blockPeer,
    uploadAttachment,
    deleteConversation,
  } = useChat();

  const [tab, setTab] = useState<"products" | "buyers">("products");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [bootError, setBootError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const typingStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const startedListingRef = useRef<string | null>(null);
  const lastMarkedRef = useRef<string | null>(null);
  const stickToBottomRef = useRef(true);
  const lastMessageKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const slug = initialProduct?.listingSlug || initialProduct?.productId;
    if (!slug || startedListingRef.current === slug) return;
    startedListingRef.current = slug;
    setBusy(true);
    ensureConversationForListing(slug)
      .then((conversation) => {
        if (conversation) {
          setTab(conversation.tab);
          setActiveConversationId(conversation.id);
        }
      })
      .catch((err: unknown) => {
        setBootError(err instanceof Error ? err.message : "Could not start chat");
      })
      .finally(() => setBusy(false));
  }, [ensureConversationForListing, initialProduct, setActiveConversationId]);

  const hasUnreadProducts = useMemo(
    () =>
      conversations.some(
        (item) =>
          item.tab === "products" && (unreadByConversation[item.id] ?? item.unreadCount) > 0,
      ),
    [conversations, unreadByConversation],
  );
  const hasUnreadBuyers = useMemo(
    () =>
      conversations.some(
        (item) =>
          item.tab === "buyers" && (unreadByConversation[item.id] ?? item.unreadCount) > 0,
      ),
    [conversations, unreadByConversation],
  );

  const focusedSlug = initialProduct?.listingSlug || initialProduct?.productId || null;
  const searchQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    const matchesSearch = (item: (typeof conversations)[number]) => {
      if (!searchQuery) return true;
      const fields = [
        item.peerName,
        item.listingTitle,
        item.listingSlug,
        item.lastMessage?.body,
        item.lastMessage?.messageType === "image" ? "photo image" : "",
        item.lastMessage?.messageType === "file" ? "file attachment" : "",
      ];
      return fields.some((field) => (field || "").toLowerCase().includes(searchQuery));
    };

    return conversations
      .filter((item) => item.tab === tab)
      .filter((item) => {
        // While searching, look across the full tab inbox.
        if (searchQuery || !focusedSlug) return true;
        return item.listingSlug === focusedSlug || item.listingId === focusedSlug;
      })
      .filter(matchesSearch);
  }, [conversations, focusedSlug, searchQuery, tab]);

  // If the active tab has no hits but the other tab does, surface a hint.
  const otherTabHitCount = useMemo(() => {
    if (!searchQuery) return 0;
    const other = tab === "products" ? "buyers" : "products";
    return conversations.filter((item) => {
      if (item.tab !== other) return false;
      const fields = [item.peerName, item.listingTitle, item.lastMessage?.body];
      return fields.some((field) => (field || "").toLowerCase().includes(searchQuery));
    }).length;
  }, [conversations, searchQuery, tab]);

  const active = conversations.find((item) => item.id === activeConversationId) ?? null;
  const messages = useMemo(
    () => (activeConversationId ? messagesByConversation[activeConversationId] ?? [] : []),
    [activeConversationId, messagesByConversation],
  );
  const typing = active ? (typingUsers[active.id] ?? []).length > 0 : false;
  const peerOnline = active ? presenceByUser[active.peerId] === "online" : false;
  const lastMessage = messages[messages.length - 1];
  const lastMessageKey = lastMessage
    ? `${lastMessage.id}:${lastMessage.clientMessageId}:${lastMessage.status ?? ""}`
    : null;

  function scrollMessagesToBottom() {
    const container = messagesScrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }

  function onMessagesScroll() {
    const container = messagesScrollRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 100;
  }

  useEffect(() => {
    stickToBottomRef.current = true;
    lastMessageKeyRef.current = null;
    requestAnimationFrame(scrollMessagesToBottom);
  }, [activeConversationId]);

  useEffect(() => {
    if (!lastMessageKey || lastMessageKey === lastMessageKeyRef.current) return;
    lastMessageKeyRef.current = lastMessageKey;
    if (!stickToBottomRef.current) return;
    requestAnimationFrame(scrollMessagesToBottom);
  }, [lastMessageKey, typing]);

  useEffect(() => {
    if (!activeConversationId || !messages.length || !currentUserId) return;
    const lastIncoming = [...messages].reverse().find((item) => item.senderId !== currentUserId);
    if (!lastIncoming) return;
    const key = `${activeConversationId}:${lastIncoming.id}`;
    if (lastMarkedRef.current === key) return;
    lastMarkedRef.current = key;
    markRead(activeConversationId, lastIncoming.id);
  }, [activeConversationId, currentUserId, markRead, messages]);

  function onDraftChange(value: string) {
    setDraft(value);
    if (!active) return;
    setTyping(active.id, true);
    if (typingStopRef.current) clearTimeout(typingStopRef.current);
    typingStopRef.current = setTimeout(() => setTyping(active.id, false), 1800);
  }

  async function handleSend(text: string) {
    if (!active || !text.trim()) return;
    stickToBottomRef.current = true;
    setDraft("");
    setTyping(active.id, false);
    await sendMessage(active.id, text);
    requestAnimationFrame(scrollMessagesToBottom);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void handleSend(draft);
  }

  async function onPickFile(file: File | null) {
    if (!file || !active) return;
    try {
      await uploadAttachment(active.id, file);
    } catch (err) {
      setBootError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  if (loading || busy) {
    return (
      <div className="grid h-[min(720px,calc(100vh-180px))] min-h-[520px] place-items-center rounded-2xl border border-line bg-white text-sm text-muted max-[760px]:h-full max-[760px]:min-h-[320px] max-[760px]:rounded-xl">
        Loading chat…
      </div>
    );
  }

  const mobileChatOpen = Boolean(active);

  return (
    <div className="flex h-[min(720px,calc(100vh-180px))] min-h-[520px] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_12px_30px_#04182f0d] max-[760px]:h-full max-[760px]:min-h-0 max-[760px]:rounded-xl max-[760px]:shadow-none">
      <div className="flex shrink-0 items-center justify-between border-b border-line bg-[#f7f9fc] px-4 py-2 text-xs text-muted max-[760px]:hidden">
        <span>
          {connectionStatus === "connected"
            ? "Live"
            : connectionStatus === "connecting"
              ? "Connecting…"
              : "Reconnecting…"}
        </span>
        {(bootError || error) && (
          <span className="font-semibold text-[#d14343]">{bootError || error}</span>
        )}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[320px_1fr] overflow-hidden max-[960px]:grid-cols-1">
        <aside
          className={`flex min-h-0 flex-col border-r border-line bg-[#f7f9fc] p-4 max-[960px]:border-r-0 ${
            mobileChatOpen ? "max-[960px]:hidden" : ""
          }`}
        >
          <div className="mb-3 hidden shrink-0 items-center gap-1 max-[960px]:flex">
            <Link
              href="/"
              className="grid size-10 shrink-0 place-items-center rounded-full text-navy"
              aria-label="Back"
            >
              <ChevronLeft size={22} />
            </Link>
            <p className="m-0 text-base font-extrabold text-navy">Messages</p>
          </div>
          <div className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-line bg-white px-3 focus-within:border-navy/30 focus-within:shadow-[0_0_0_3px_#00304914]">
            <Search size={16} className="shrink-0 text-[#9aa6b5]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
              placeholder="Search by name, ad, or message..."
              aria-label="Search conversations"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {query ? (
              <button
                type="button"
                className="grid size-7 shrink-0 place-items-center rounded-full text-[#8a97a8] hover:bg-[#eef2f6] hover:text-navy"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                <X size={15} />
              </button>
            ) : null}
          </div>

          <div className="mt-3 grid shrink-0 grid-cols-2 gap-2 rounded-xl bg-[#e8edf3] p-1">
            <button
              type="button"
              onClick={() => setTab("products")}
              className={`relative rounded-lg px-3 py-2.5 text-xs font-extrabold ${
                tab === "products" ? "bg-navy text-white" : "text-[#526177]"
              }`}
            >
              PRODUCTS
              {hasUnreadProducts ? (
                <span className="absolute top-1.5 right-2 size-2 rounded-full bg-[#e11d48] ring-2 ring-white" aria-hidden />
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setTab("buyers")}
              className={`relative rounded-lg px-3 py-2.5 text-xs font-extrabold ${
                tab === "buyers" ? "bg-navy text-white" : "text-[#526177]"
              }`}
            >
              BUYERS
              {hasUnreadBuyers ? (
                <span className="absolute top-1.5 right-2 size-2 rounded-full bg-[#e11d48] ring-2 ring-white" aria-hidden />
              ) : null}
            </button>
          </div>

          {(bootError || error) ? (
            <p className="mt-2 mb-0 hidden text-xs font-semibold text-[#d14343] max-[760px]:block">
              {bootError || error}
            </p>
          ) : null}

          <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
            {filtered.length === 0 ? (
              <div className="grid place-items-center px-4 py-16 text-center">
                <span className="mb-3 grid size-14 place-items-center rounded-2xl bg-[#e8edf3] text-[#8a97a8]">
                  {searchQuery ? <Search size={26} /> : <MessageCircle size={26} />}
                </span>
                <p className="m-0 text-sm font-extrabold text-navy">
                  {searchQuery ? "No matches" : "No conversations"}
                </p>
                <p className="mt-1 mb-0 text-xs text-muted">
                  {searchQuery
                    ? `Nothing matched “${query.trim()}” in ${tab === "products" ? "Products" : "Buyers"}`
                    : "Start a chat from a product detail page"}
                </p>
                {searchQuery && otherTabHitCount > 0 ? (
                  <button
                    type="button"
                    className="mt-3 rounded-full bg-navy px-3.5 py-2 text-xs font-extrabold text-white"
                    onClick={() => setTab(tab === "products" ? "buyers" : "products")}
                  >
                    Show {otherTabHitCount} in {tab === "products" ? "Buyers" : "Products"}
                  </button>
                ) : null}
                {searchQuery ? (
                  <button
                    type="button"
                    className="mt-2 text-xs font-bold text-muted underline-offset-2 hover:text-navy hover:underline"
                    onClick={() => setQuery("")}
                  >
                    Clear search
                  </button>
                ) : null}
              </div>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveConversationId(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                    item.id === activeConversationId
                      ? "border-orange/40 bg-white shadow-[0_6px_16px_#04182f10]"
                      : "border-transparent bg-transparent hover:bg-white"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.listingImage || "/placeholder-listing.svg"}
                    alt=""
                    className="size-11 rounded-lg object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm text-navy">{item.peerName}</strong>
                    {searchQuery ? (
                      <small className="mt-0.5 block truncate text-[11px] font-semibold text-[#718696]">
                        {item.listingTitle}
                      </small>
                    ) : null}
                    <small className="mt-0.5 block truncate text-xs text-muted">
                      {item.lastMessage?.deletedAt
                        ? "Message deleted"
                        : item.lastMessage?.body || item.listingTitle}
                    </small>
                  </span>
                  {(unreadByConversation[item.id] ?? item.unreadCount) > 0 ? (
                    <span className="grid min-w-5 place-items-center rounded-full bg-orange px-1.5 text-[10px] font-extrabold text-white">
                      {unreadByConversation[item.id] ?? item.unreadCount}
                    </span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </aside>

        <section
          className={`relative flex min-h-0 flex-col overflow-hidden bg-[#eef2f6] ${
            mobileChatOpen ? "" : "max-[960px]:hidden"
          }`}
        >
          <div className="chat-doodle absolute inset-0 opacity-[0.35]" />

          {!active ? (
            <div className="relative z-2 grid flex-1 place-items-center px-6 text-center">
              <div>
                <span className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-white text-[#8a97a8] shadow-sm">
                  <MessageCircle size={26} />
                </span>
                <p className="m-0 text-sm font-extrabold text-navy">Select a conversation</p>
                <p className="mt-1 mb-0 text-xs text-muted">
                  Or open Chat from any product detail page to talk with the seller.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="relative z-2 flex shrink-0 items-center gap-1 border-b border-line bg-white/95 px-2 py-2 backdrop-blur sm:gap-2 sm:px-4 sm:py-3">
                <button
                  type="button"
                  className="grid size-10 shrink-0 place-items-center rounded-full text-navy min-[961px]:hidden"
                  aria-label="Back to conversations"
                  onClick={() => setActiveConversationId(null)}
                >
                  <ChevronLeft size={22} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-sm font-extrabold text-navy">{active.peerName}</p>
                  <p className="m-0 truncate text-xs text-muted">
                    {active.listingTitle}
                    {peerOnline ? " · Online" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    className="inline-flex size-9 items-center justify-center gap-1 rounded-full border border-line bg-white text-xs font-bold text-[#e11d48] sm:h-auto sm:w-auto sm:px-3 sm:py-1.5"
                    aria-label="Block user"
                    onClick={() => {
                      void blockPeer(active.peerId)
                        .then(() => setBootError("User blocked. New messages are stopped."))
                        .catch((err: unknown) =>
                          setBootError(err instanceof Error ? err.message : "Could not block"),
                        );
                    }}
                  >
                    <Ban size={13} />
                    <span className="hidden sm:inline">Block</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex size-9 items-center justify-center gap-1 rounded-full border border-line bg-white text-xs font-bold text-[#c2410c] sm:h-auto sm:w-auto sm:px-3 sm:py-1.5"
                    aria-label="Delete chat"
                    onClick={() => {
                      const ok = window.confirm(
                        "Delete this chat from your inbox? You can still get new messages if the other person writes again.",
                      );
                      if (!ok) return;
                      void deleteConversation(active.id)
                        .then(() => setBootError(null))
                        .catch((err: unknown) =>
                          setBootError(err instanceof Error ? err.message : "Could not delete chat"),
                        );
                    }}
                  >
                    <Trash2 size={13} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                  <button
                    type="button"
                    className="hidden size-9 place-items-center rounded-full border border-line bg-white text-muted min-[961px]:grid"
                    aria-label="Close conversation"
                    onClick={() => setActiveConversationId(null)}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div
                ref={messagesScrollRef}
                onScroll={onMessagesScroll}
                className="relative z-2 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4 sm:py-5"
              >
                {messages.length === 0 ? (
                  <p className="m-0 rounded-xl bg-white/80 px-4 py-3 text-center text-xs text-muted">
                    No messages yet. Say hello to start the chat.
                  </p>
                ) : (
                  messages.map((message) => {
                    const mine = message.senderId === currentUserId;
                    return (
                      <div
                        key={message.clientMessageId || message.id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <button
                          type="button"
                          className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-left text-sm leading-[1.45] shadow-sm sm:max-w-[75%] ${
                            mine
                              ? "rounded-br-md bg-orange text-white"
                              : "rounded-bl-md bg-white text-navy"
                          }`}
                          onClick={() => {
                            if (mine && message.status === "failed") {
                              void retryMessage(active.id, message.clientMessageId);
                            }
                          }}
                        >
                          {message.deletedAt ? (
                            <em className="opacity-80">Message deleted</em>
                          ) : (
                            <>
                              {message.attachments.map((attachment) =>
                                attachment.mimeType.startsWith("image/") && attachment.url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    key={attachment.id}
                                    src={attachment.url}
                                    alt={attachment.originalName}
                                    className="mb-2 max-h-48 w-full rounded-lg object-cover"
                                  />
                                ) : (
                                  <span key={attachment.id} className="mb-1 block text-xs underline">
                                    {attachment.originalName}
                                  </span>
                                ),
                              )}
                              {message.body}
                            </>
                          )}
                          {mine ? (
                            <span className="mt-1 flex items-center justify-end gap-1">
                              <DeliveryTicks status={message.status} />
                            </span>
                          ) : null}
                        </button>
                      </div>
                    );
                  })
                )}
                {typing ? (
                  <p className="m-0 text-xs font-semibold text-muted">{active.peerName} is typing…</p>
                ) : null}
              </div>

              <div className="relative z-2 shrink-0 border-t border-line bg-white/95 p-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] backdrop-blur sm:p-3">
                <div className="mb-2 flex items-center gap-2.5 rounded-xl border border-line bg-white px-2.5 py-2 sm:mb-3 sm:gap-3 sm:px-3 sm:py-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={active.listingImage || "/placeholder-listing.svg"}
                    alt=""
                    className="size-9 rounded-lg object-cover sm:size-11"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[10px] font-extrabold tracking-[0.8px] text-muted uppercase">Product</p>
                    <p className="m-0 truncate text-sm font-extrabold text-navy">{active.listingTitle}</p>
                  </div>
                  <Link
                    href={`/product/${active.listingSlug}`}
                    className="rounded-lg bg-orange px-3 py-1.5 text-xs font-extrabold text-white sm:px-3.5 sm:py-2"
                  >
                    View
                  </Link>
                </div>

                <div className="mb-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mb-3">
                  {CHAT_QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => void handleSend(reply)}
                      className="shrink-0 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-[#526177] hover:border-orange hover:text-orange sm:py-2"
                    >
                      {reply}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={onSubmit}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-[#f4f7fa] px-1.5 py-1 sm:gap-2 sm:px-2 sm:py-1.5"
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(event) => {
                      void onPickFile(event.target.files?.[0] ?? null);
                      event.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    className="grid size-10 place-items-center rounded-full text-[#7b8798]"
                    aria-label="Attach image"
                    onClick={() => fileRef.current?.click()}
                  >
                    <ImagePlus size={18} />
                  </button>
                  <input
                    value={draft}
                    onChange={(event) => onDraftChange(event.target.value)}
                    className="min-w-0 flex-1 border-0 bg-transparent px-1 text-sm outline-none"
                    placeholder="Type a message"
                    aria-label="Type a message"
                    maxLength={4000}
                  />
                  <button
                    type="submit"
                    className="grid size-10 place-items-center rounded-full bg-orange text-white disabled:opacity-50"
                    disabled={!draft.trim()}
                    aria-label="Send message"
                  >
                    <SendHorizontal size={17} />
                  </button>
                </form>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
