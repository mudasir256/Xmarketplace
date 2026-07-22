import type { ChatMessage } from "@/lib/chat/types";

type ConversationRow = {
  buyer_id: string;
  seller_id: string;
};

/** Broadcast a persisted message over Socket.IO when the custom server is running. */
export async function broadcastChatMessage(
  message: ChatMessage,
  conversation: ConversationRow,
) {
  try {
    const { getChatIo } = await import("@/server/socket");
    const io = getChatIo();
    if (!io) {
      console.warn("[chat] Socket.IO server not ready; message saved but not broadcast live");
      return;
    }

    const updatePayload = {
      conversationId: message.conversationId,
      lastMessage: message,
    };

    for (const participantId of [conversation.buyer_id, conversation.seller_id]) {
      io.to(`user:${participantId}`).emit("message:new", message);
      io.to(`user:${participantId}`).emit("conversation:updated", updatePayload);
    }
  } catch (error) {
    console.warn("[chat] broadcast failed", error);
  }
}
