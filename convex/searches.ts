import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const saveSearch = internalMutation({
  args: {
    clerkId: v.string(),
    caseId: v.optional(v.string()),
    query: v.string(),
    name: v.string(),
    location: v.optional(v.string()),
    keywords: v.optional(v.string()),
    dossier: v.optional(v.string()),
    tool: v.string(),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("searches", {
      clerkId: args.clerkId,
      caseId: args.caseId as any,
      query: args.query,
      name: args.name,
      location: args.location,
      keywords: args.keywords,
      dossier: args.dossier,
      tool: args.tool,
      status: args.status,
      createdAt: Date.now(),
    });
  },
});

export const listUserSearches = query({
  args: { 
    clerkId: v.optional(v.string()),
    tool: v.optional(v.string()),
    status: v.optional(v.string()),
    searchQuery: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const clerkId = args.clerkId;
    if (!clerkId) {
      return [];
    }
    let searches = await ctx.db
      .query("searches")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .order("desc")
      .collect();

    if (args.tool && args.tool !== "all") {
      searches = searches.filter(s => s.tool === args.tool);
    }
    if (args.status && args.status !== "all") {
      searches = searches.filter(s => s.status === args.status);
    }
    if (args.searchQuery) {
      const q = args.searchQuery.toLowerCase();
      searches = searches.filter(s => 
        s.query.toLowerCase().includes(q) || 
        s.name.toLowerCase().includes(q) ||
        (s.dossier && s.dossier.toLowerCase().includes(q))
      );
    }

    return searches;
  },
});

export const getSearch = query({
  args: { id: v.id("searches"), clerkId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const clerkId = args.clerkId;
    if (!clerkId) {
      return null;
    }
    const search = await ctx.db.get(args.id);
    if (!search || search.clerkId !== clerkId) {
      return null;
    }
    return search;
  },
});
