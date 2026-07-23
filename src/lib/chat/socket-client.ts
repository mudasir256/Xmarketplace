"use client";

import { io, type Socket } from "socket.io-client";
import { createClient } from "@/lib/supabase/client";

let socket: Socket | null = null;
let bootPromise: Promise<Socket> | null = null;

type WiredSocket = Socket & { __authWired?: boolean };

async function getAccessToken() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

function wireAuthRefresh(target: WiredSocket) {
  if (target.__authWired) return;
  target.__authWired = true;

  target.on("connect_error", async (error) => {
    if (error.message !== "UNAUTHORIZED") return;
    const nextToken = await getAccessToken();
    if (nextToken && socket) {
      socket.auth = { token: nextToken };
      socket.connect();
    }
  });
}

/**
 * Create or reuse the Socket.IO client without waiting for the handshake.
 * Attach listeners immediately — connection can complete in the background.
 */
export async function ensureChatSocket(): Promise<Socket> {
  if (socket) {
    if (!socket.connected) {
      const token = await getAccessToken();
      if (!token) throw new Error("UNAUTHORIZED");
      socket.auth = { token };
      if (!socket.active) socket.connect();
    }
    return socket;
  }

  if (bootPromise) return bootPromise;

  bootPromise = (async () => {
    const token = await getAccessToken();
    if (!token) throw new Error("UNAUTHORIZED");

    socket = io({
      path: "/api/socketio",
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 400,
      reconnectionDelayMax: 4_000,
      randomizationFactor: 0.4,
      timeout: 20_000,
      transports: ["websocket", "polling"],
    });
    wireAuthRefresh(socket as WiredSocket);
    return socket;
  })();

  try {
    return await bootPromise;
  } finally {
    bootPromise = null;
  }
}

export function waitUntilConnected(target: Socket, timeoutMs = 12_000) {
  if (target.connected) return Promise.resolve(target);

  return new Promise<Socket>((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("SOCKET_CONNECT_TIMEOUT"));
    }, timeoutMs);

    const onConnect = () => {
      cleanup();
      resolve(target);
    };

    const cleanup = () => {
      clearTimeout(timer);
      target.off("connect", onConnect);
    };

    target.on("connect", onConnect);
  });
}

/** Ensure socket exists, then wait until connected (or timeout). */
export async function getChatSocket(timeoutMs = 12_000) {
  const target = await ensureChatSocket();
  if (target.connected) return target;
  return waitUntilConnected(target, timeoutMs);
}

export function getExistingChatSocket() {
  return socket;
}

export async function disconnectChatSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
