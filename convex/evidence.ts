import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

export const generateUploadUrl = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const addEvidence = mutation({
  args: {
    clerkId: v.string(),
    caseId: v.optional(v.id("cases")),
    searchId: v.optional(v.id("searches")),
    type: v.union(v.literal("image"), v.literal("document"), v.literal("qr"), v.literal("other")),
    url: v.optional(v.string()),
    fileId: v.optional(v.id("_storage")),
    name: v.string(),
    tags: v.array(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    let finalUrl = args.url;
    
    // If we have a fileId but no URL, generate a URL for it
    if (args.fileId && !finalUrl) {
      const storageUrl = await ctx.storage.getUrl(args.fileId);
      if (storageUrl) {
        finalUrl = storageUrl;
      }
    }

    return await ctx.db.insert("evidence", {
      ...args,
      url: finalUrl || "",
      createdAt: Date.now(),
    });
  },
});

export const listEvidence = query({
  args: { clerkId: v.optional(v.string()), caseId: v.optional(v.id("cases")) },
  handler: async (ctx, args) => {
    if (!args.clerkId) return [];
    
    if (args.caseId) {
      return await ctx.db
        .query("evidence")
        .withIndex("by_caseId", (q) => q.eq("caseId", args.caseId))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("evidence")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId!))
      .order("desc")
      .collect();
  },
});

export const deleteEvidence = mutation({
  args: { id: v.id("evidence"), clerkId: v.string() },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item || item.clerkId !== args.clerkId) {
      throw new Error("Unauthorized or not found");
    }
    await ctx.db.delete(args.id);
  },
});
