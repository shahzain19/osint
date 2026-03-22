import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createDocument = mutation({
  args: {
    clerkId: v.string(),
    caseId: v.id("cases"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      clerkId: args.clerkId,
      caseId: args.caseId,
      title: args.title,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const listDocuments = query({
  args: { caseId: v.id("cases"), clerkId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const caseObj = await ctx.db.get(args.caseId);
    if (!caseObj || (args.clerkId && caseObj.clerkId !== args.clerkId)) return [];

    return await ctx.db
      .query("documents")
      .withIndex("by_caseId", (q) => q.eq("caseId", args.caseId))
      .order("desc")
      .collect();
  },
});

export const getDocument = query({
  args: { id: v.id("documents"), clerkId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc || (args.clerkId && doc.clerkId !== args.clerkId)) return null;
    return doc;
  },
});

export const updateDocument = mutation({
  args: {
    id: v.id("documents"),
    clerkId: v.string(),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.clerkId !== args.clerkId) {
      throw new Error("Unauthorized or not found");
    }

    const { id, clerkId, ...updates } = args;
    await ctx.db.patch(args.id, updates);
  },
});

export const deleteDocument = mutation({
  args: { id: v.id("documents"), clerkId: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.clerkId !== args.clerkId) {
      throw new Error("Unauthorized or not found");
    }
    await ctx.db.delete(args.id);
  },
});
