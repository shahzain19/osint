import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createChat = mutation({
  args: {
    clerkId: v.string(),
    title: v.string(),
    messages: v.array(v.object({
      role: v.string(),
      content: v.string(),
      attachments: v.optional(v.array(v.object({
        fileId: v.id("_storage"),
        name: v.string(),
        type: v.string(),
        url: v.string(),
      }))),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("nexusChats", {
      clerkId: args.clerkId,
      title: args.title,
      messages: args.messages,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateChat = mutation({
  args: {
    id: v.id("nexusChats"),
    messages: v.array(v.object({
      role: v.string(),
      content: v.string(),
      attachments: v.optional(v.array(v.object({
        fileId: v.id("_storage"),
        name: v.string(),
        type: v.string(),
        url: v.string(),
      }))),
    })),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = { messages: args.messages, updatedAt: Date.now() };
    if (args.title) patch.title = args.title;
    await ctx.db.patch(args.id, patch);
  },
});

export const deleteChat = mutation({
  args: { id: v.id("nexusChats") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const listChats = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("nexusChats")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .take(50);
  },
});

export const getChat = query({
  args: { id: v.id("nexusChats") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
