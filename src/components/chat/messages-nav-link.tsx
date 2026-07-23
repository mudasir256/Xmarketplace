"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type MessagesNavLinkProps = {
  href?: string;
  className?: string;
  label?: string;
  showLabel?: boolean;
  signedIn: boolean;
  /** Adjust red-dot position for denser icon buttons */
  badgeClassName?: string;
};

export function MessagesNavLink({
  href = "/messages",
  className = "",
  label = "Messages",
  showLabel = false,
  signedIn,
  badgeClassName = "top-1.5 right-1.5",
}: MessagesNavLinkProps) {
  const [unread, setUnread] = useState(0);
  const targetHref = signedIn ? href : `/login?next=${encodeURIComponent(href)}`;

  const refreshUnread = useCallback(async () => {
    if (!signedIn) {
      setUnread(0);
      return;
    }
    try {
      const response = await fetch("/api/chat/unread-count", { cache: "no-store" });
      const payload = (await response.json()) as { ok?: boolean; total?: number };
      if (response.ok && payload.ok) setUnread(payload.total ?? 0);
    } catch {
      // ignore
    }
  }, [signedIn]);

  useEffect(() => {
    void refreshUnread();
    if (!signedIn) return;

    const interval = window.setInterval(() => {
      void refreshUnread();
    }, 60_000);

    const onFocus = () => void refreshUnread();
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshUnread();
    };
    const onUnreadEvent = () => void refreshUnread();

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("xm-chat-unread", onUnreadEvent);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("xm-chat-unread", onUnreadEvent);
    };
  }, [refreshUnread, signedIn]);

  const hasUnread = unread > 0;

  return (
    <Link
      href={targetHref}
      className={`relative ${className}`}
      aria-label={hasUnread ? `${label}, ${unread} unread` : label}
    >
      <MessageCircle size={showLabel ? undefined : 19} />
      {showLabel ? <span>{label}</span> : null}
      {hasUnread ? (
        <span
          className={`absolute size-2.5 rounded-full bg-[#e11d48] ring-2 ring-white ${badgeClassName}`}
          aria-hidden
        />
      ) : null}
    </Link>
  );
}

/** Notify header badge to refresh after inbox changes on /messages. */
export function notifyChatUnreadChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("xm-chat-unread"));
  }
}
