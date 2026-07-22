export type ChatTab = "products" | "buyers";

export type ChatMessage = {
  id: string;
  text: string;
  sender: "me" | "them";
  createdAt: string;
};

export type ChatConversation = {
  id: string;
  tab: ChatTab;
  peerName: string;
  productId: string;
  productTitle: string;
  productImage: string;
  lastMessage?: string;
  updatedAt: string;
  messages: ChatMessage[];
};

export const CHAT_QUICK_REPLIES = [
  "Assalam o alaikum",
  "Is this still available?",
  "What is your final price?",
  "Can we meet today?",
] as const;

export const CHAT_STORAGE_KEY = "xm-marketplace-chat-v1";
