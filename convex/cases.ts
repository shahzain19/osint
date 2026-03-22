import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createCase = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cases", {
      clerkId: args.clerkId,
      name: args.name,
      description: args.description,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

export const listCases = query({
  args: { clerkId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.clerkId) return [];
    return await ctx.db
      .query("cases")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId!))
      .order("desc")
      .collect();
  },
});

export const getCaseWithSearches = query({
  args: { caseId: v.id("cases"), clerkId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const caseObj = await ctx.db.get(args.caseId);
    if (!caseObj || (args.clerkId && caseObj.clerkId !== args.clerkId)) return null;

    const searches = await ctx.db
      .query("searches")
      .withIndex("by_caseId", (q) => q.eq("caseId", args.caseId))
      .collect();

    const evidence = await ctx.db
      .query("evidence")
      .withIndex("by_caseId", (q) => q.eq("caseId", args.caseId))
      .collect();

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_caseId", (q) => q.eq("caseId", args.caseId))
      .collect();

    return { ...caseObj, searches, evidence, documents };
  },
});

export const assignSearchToCase = mutation({
  args: { searchId: v.id("searches"), caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const search = await ctx.db.get(args.searchId);
    if (!search) return;

    await ctx.db.patch(args.searchId, { caseId: args.caseId });

    // Also link any evidence from this search to the case
    const evidence = await ctx.db
      .query("evidence")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", search.clerkId))
      .filter(q => q.eq(q.field("searchId"), args.searchId))
      .collect();
    
    for (const item of evidence) {
      await ctx.db.patch(item._id, { caseId: args.caseId });
    }
  },
});
