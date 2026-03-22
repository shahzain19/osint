import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    clerkId: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
  }).index("by_clerkId", ["clerkId"]),

  searches: defineTable({
    clerkId: v.string(),
    caseId: v.optional(v.id("cases")),
    query: v.string(),
    name: v.string(),
    location: v.optional(v.string()),
    keywords: v.optional(v.string()),
    dossier: v.optional(v.string()),
    tool: v.optional(v.string()), // "oracle" | "exif" | "footprint"
    status: v.optional(v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed"))),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"])
    .index("by_caseId", ["caseId"]),

  cases: defineTable({
    clerkId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    summary: v.optional(v.string()), // AI generated
    status: v.union(v.literal("active"), v.literal("closed")),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  evidence: defineTable({
    clerkId: v.string(),
    caseId: v.optional(v.id("cases")),
    searchId: v.optional(v.id("searches")),
    type: v.union(v.literal("image"), v.literal("document"), v.literal("qr"), v.literal("other")),
    url: v.optional(v.string()),
    fileId: v.optional(v.id("_storage")),
    name: v.string(),
    tags: v.array(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"])
    .index("by_caseId", ["caseId"]),

  documents: defineTable({
    clerkId: v.string(),
    caseId: v.id("cases"),
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_caseId", ["caseId"])
    .index("by_clerkId", ["clerkId"]),

  results: defineTable({
    searchId: v.id("searches"),
    type: v.union(v.literal("profile"), v.literal("news"), v.literal("organization"), v.literal("misc")),
    title: v.string(),
    link: v.string(),
    snippet: v.string(),
    confidence: v.number(), // 0-1
    metadata: v.optional(v.any()),
  }).index("by_searchId", ["searchId"]),

  timeline: defineTable({
    searchId: v.id("searches"),
    date: v.optional(v.string()),
    title: v.string(),
    link: v.string(),
    description: v.optional(v.string()),
    timestamp: v.optional(v.number()),
  }).index("by_searchId", ["searchId"]),
});
