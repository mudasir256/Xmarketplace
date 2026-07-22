"use client";

import { io, type Socket } from "socket.io-client";
import { createClient } from "@/lib/supabase/client";

let socket: Socket | null = null;
let connecting: Promise<Socket> | null = null;

async function getAccessToken() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

function waitUntilConnected(target: Socket, timeoutMs = 8_000) {
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
    // Don't reject on transient connect_error — wait for connect or timeout.
    const cleanup = () => {
      clearTimeout(timer);
      target.off("connect", onConnect);
    };

    target.on("connect", onConnect);
  });
}

export async function getChatSocket() {
  if (socket?.connected) return socket;
  if (connecting) return connecting;

  connecting = (async () => {
    const token = await getAccessToken();
    if (!token) {
      throw new Error("UNAUTHORIZED");
    }

    if (socket) {
      socket.auth = { token };
      if (!socket.connected) socket.connect();
      return waitUntilConnected(socket);
    }

    socket = io({
      path: "/api/socketio",
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 12,
      reconnectionDelay: 800,
      // Do not set retries/ackTimeout here — they change ack callbacks to (err, data)
      // and mark successful sends as failed in the UI.
    });

    socket.on("connect_error", async (error) => {
      if (error.message === "UNAUTHORIZED") {
        const nextToken = await getAccessToken();
        if (nextToken && socket) {
          socket.auth = { token: nextToken };
          socket.connect();
        }
      }
    });

    return waitUntilConnected(socket);
  })();

  try {
    return await connecting;
  } finally {
    connecting = null;
  }
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
