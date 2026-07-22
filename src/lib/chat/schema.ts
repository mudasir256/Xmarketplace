import { z } from "zod";
import { MAX_MESSAGE_LENGTH } from "@/lib/chat/types";

export const createConversationSchema = z.object({
  listingId: z.string().uuid().optional(),
  listingSlug: z.string().min(1).max(200).optional(),
}).refine((value) => Boolean(value.listingId || value.listingSlug), {
  message: "listingId or listingSlug is required",
});

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  clientMessageId: z.string().uuid(),
  body: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
  replyToMessageId: z.string().uuid().optional(),
  messageType: z.enum(["text", "image", "file"]).optional(),
});

export const conversationIdSchema = z.object({
  conversationId: z.string().uuid(),
});

export const messageDeliveredSchema = z.object({
  conversationId: z.string().uuid(),
  messageId: z.string().uuid(),
});

export const messageReadSchema = z.object({
  conversationId: z.string().uuid(),
  messageId: z.string().uuid(),
});

export const conversationSyncSchema = z.object({
  conversationId: z.string().uuid(),
  lastReceivedMessageId: z.string().uuid().nullable().optional(),
});

export const editMessageSchema = z.object({
  body: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
});

export const blockUserSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const reportSchema = z.object({
  reportedUserId: z.string().uuid(),
  conversationId: z.string().uuid().optional(),
  messageId: z.string().uuid().optional(),
  reason: z.string().trim().min(3).max(200),
  details: z.string().trim().max(2000).optional(),
});
