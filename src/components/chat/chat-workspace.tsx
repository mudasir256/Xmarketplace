"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ImagePlus,
  MessageCircle,
  Search,
  SendHorizontal,
  X,
} from "lucide-react";
import {
  CHAT_QUICK_REPLIES,
  CHAT_STORAGE_KEY,
  type ChatConversation,
  type ChatTab,
} from "@/lib/chat-types";

export type ChatProductContext = {
  productId: string;
  productTitle: string;
  productImage: string;
  sellerName: string;
};

function loadConversations(): ChatConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatConversation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveConversations(conversations: ChatConversation[]) {
  window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
}

function createId() {
  return crypto.randomUUID();
}

export function ChatWorkspace({
  initialProduct,
}: {
  initialProduct?: ChatProductContext | null;
}) {
  const [tab, setTab] = useState<ChatTab>("products");
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [ready, setReady] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing = loadConversations();
    setConversations(existing);

    if (initialProduct?.productId) {
      const found = existing.find(
        (item) => item.tab === "products" && item.productId === initialProduct.productId,
      );
      if (found) {
        setActiveId(found.id);
        setTab("products");
      } else {
        const created: ChatConversation = {
          id: createId(),
          tab: "products",
          peerName: initialProduct.sellerName || "Seller",
          productId: initialProduct.productId,
          productTitle: initialProduct.productTitle,
          productImage: initialProduct.productImage,
          updatedAt: new Date().toISOString(),
          messages: [],
        };
        const next = [created, ...existing];
        setConversations(next);
        saveConversations(next);
        setActiveId(created.id);
        setTab("products");
      }
    }

    setReady(true);
  }, [initialProduct]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, conversations]);

  const focusedProductId = initialProduct?.productId ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations
      .filter((item) => item.tab === tab)
      // When opened from a product Chat button, only show that product.
      .filter((item) => (focusedProductId ? item.productId === focusedProductId : true))
      .filter((item) => {
        if (!q) return true;
        return (
          item.peerName.toLowerCase().includes(q) ||
          item.productTitle.toLowerCase().includes(q) ||
          item.lastMessage?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [conversations, focusedProductId, query, tab]);

  const active = conversations.find((item) => item.id === activeId) ?? null;

  function upsertConversations(next: ChatConversation[]) {
    setConversations(next);
    saveConversations(next);
  }

  function sendMessage(text: string) {
    const value = text.trim();
    if (!value || !active) return;

    const message = {
      id: createId(),
      text: value,
      sender: "me" as const,
      createdAt: new Date().toISOString(),
    };

    const next = conversations.map((item) => {
      if (item.id !== active.id) return item;
      return {
        ...item,
        messages: [...item.messages, message],
        lastMessage: value,
        updatedAt: message.createdAt,
      };
    });

    upsertConversations(next);
    setDraft("");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    sendMessage(draft);
  }

  if (!ready) {
    return (
      <div className="grid min-h-[70vh] place-items-center rounded-2xl border border-line bg-white text-sm text-muted">
        Loading chat…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_12px_30px_#04182f0d]">
      <div className="grid min-h-[calc(100vh-180px)] grid-cols-[320px_1fr] max-[960px]:min-h-[70vh] max-[960px]:grid-cols-1">
        <aside className="border-r border-line bg-[#f7f9fc] p-4 max-[960px]:border-r-0 max-[960px]:border-b">
          <label className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-3">
            <Search size={16} className="text-[#9aa6b5]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full border-0 bg-transparent text-sm outline-none"
              placeholder="Search conversations..."
              aria-label="Search conversations"
            />
          </label>

          <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-[#e8edf3] p-1">
            <button
              type="button"
              onClick={() => setTab("products")}
              className={`rounded-lg px-3 py-2.5 text-xs font-extrabold ${
                tab === "products" ? "bg-navy text-white" : "text-[#526177]"
              }`}
            >
              PRODUCTS
            </button>
            <button
              type="button"
              onClick={() => setTab("buyers")}
              className={`rounded-lg px-3 py-2.5 text-xs font-extrabold ${
                tab === "buyers" ? "bg-navy text-white" : "text-[#526177]"
              }`}
            >
              BUYERS
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {filtered.length === 0 ? (
              <div className="grid place-items-center px-4 py-16 text-center">
                <span className="mb-3 grid size-14 place-items-center rounded-2xl bg-[#e8edf3] text-[#8a97a8]">
                  <MessageCircle size={26} />
                </span>
                <p className="m-0 text-sm font-extrabold text-navy">No conversations</p>
                <p className="mt-1 mb-0 text-xs text-muted">
                  Start a chat from a product or buyer request
                </p>
              </div>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                    item.id === activeId
                      ? "border-orange/40 bg-white shadow-[0_6px_16px_#04182f10]"
                      : "border-transparent bg-transparent hover:bg-white"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.productImage || "/placeholder-listing.svg"}
                    alt=""
                    className="size-11 rounded-lg object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm text-navy">{item.peerName}</strong>
                    <small className="mt-0.5 block truncate text-xs text-muted">
                      {item.lastMessage || item.productTitle}
                    </small>
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="relative flex min-h-[560px] flex-col bg-[#eef2f6]">
          <div className="chat-doodle absolute inset-0 opacity-[0.35]" />

          {!active ? (
            <div className="relative z-2 grid flex-1 place-items-center px-6 text-center">
              <div>
                <span className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-white text-[#8a97a8] shadow-sm">
                  <MessageCircle size={26} />
                </span>
                <p className="m-0 text-sm font-extrabold text-navy">Select a conversation</p>
                <p className="mt-1 mb-0 text-xs text-muted">
                  Or open Chat from any product detail page to start talking with the seller.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="relative z-2 flex items-center justify-between border-b border-line bg-white/90 px-4 py-3 backdrop-blur">
                <div>
                  <p className="m-0 text-sm font-extrabold text-navy">{active.peerName}</p>
                  <p className="m-0 text-xs text-muted">{active.productTitle}</p>
                </div>
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-full border border-line bg-white text-muted"
                  aria-label="Close conversation"
                  onClick={() => setActiveId(null)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="relative z-2 flex-1 space-y-3 overflow-y-auto px-4 py-5">
                {active.messages.length === 0 ? (
                  <p className="m-0 rounded-xl bg-white/80 px-4 py-3 text-center text-xs text-muted">
                    No messages yet. Say hello to start the chat.
                  </p>
                ) : (
                  active.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-[1.45] shadow-sm ${
                          message.sender === "me"
                            ? "rounded-br-md bg-orange text-white"
                            : "rounded-bl-md bg-white text-navy"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={endRef} />
              </div>

              <div className="relative z-2 border-t border-line bg-white/95 p-3 backdrop-blur">
                <div className="mb-3 flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={active.productImage || "/placeholder-listing.svg"}
                    alt=""
                    className="size-11 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[10px] font-extrabold tracking-[0.8px] text-muted uppercase">Product</p>
                    <p className="m-0 truncate text-sm font-extrabold text-navy">{active.productTitle}</p>
                  </div>
                  <Link
                    href={`/product/${active.productId}`}
                    className="rounded-lg bg-orange px-3.5 py-2 text-xs font-extrabold text-white"
                  >
                    View
                  </Link>
                </div>

                <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                  {CHAT_QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => sendMessage(reply)}
                      className="shrink-0 rounded-full border border-line bg-white px-3 py-2 text-xs font-bold text-[#526177] hover:border-orange hover:text-orange"
                    >
                      {reply}
                    </button>
                  ))}
                </div>

                <form onSubmit={onSubmit} className="flex items-center gap-2 rounded-full border border-line bg-[#f4f7fa] px-2 py-1.5">
                  <button
                    type="button"
                    className="grid size-10 place-items-center rounded-full text-[#7b8798]"
                    aria-label="Attach image"
                    title="Image upload will connect with sockets later"
                  >
                    <ImagePlus size={18} />
                  </button>
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    className="min-w-0 flex-1 border-0 bg-transparent px-1 text-sm outline-none"
                    placeholder="Type a message"
                    aria-label="Type a message"
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
                <p className="mt-2 mb-0 text-center text-[11px] text-muted">
                  Local chat UI ready — sockets can be wired later for live delivery.
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
