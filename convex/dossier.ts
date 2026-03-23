import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";

export const generateCaseSummary = action({
  args: {
    caseId: v.id("cases"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Fetch case data (searches, evidence, documents)
    const caseData = await ctx.runQuery(api.cases.getCaseWithSearches, {
      caseId: args.caseId,
      clerkId: args.clerkId,
    });

    if (!caseData) {
        throw new Error("Case not found or unauthorized");
    }

    // 2. Prepare context for AI
    const searchContext = caseData.searches
        .map(s => `[${s.tool}] ${s.query}: ${s.dossier?.substring(0, 500)}...`)
        .join("\n\n");
    
    const evidenceContext = caseData.evidence
        .map(e => `[${e.type}] ${e.name}: ${JSON.stringify(e.metadata || {})}`)
        .join("\n");

    const documentContext = caseData.documents
        .map(d => `${d.title}: ${d.content.substring(0, 500)}...`)
        .join("\n\n");

    const systemPrompt = `You are an elite OSINT Investigative Lead. Your task is to provide a high-level "Master Investigation Summary" for the provided case data.
    
CRITICAL OBJECTIVES:
- Synthesize findings across multiple searches (Oracle, Shadow Link, etc.)
- Identify key targets, aliases, and infrastructure links
- Highlight critical risks or breach exposures
- Suggest definitive "Next Steps" for the investigator
- Maintain a clinical, professional, and slightly aggressive investigative tone

FORMAT: Use professional Markdown with sections for EXECUTIVE SUMMARY, KEY FINDINGS, IDENTIFIED ENTITIES, and INVESTIGATIVE RECOMMENDATIONS.`;

    const userPrompt = `CASE NAME: ${caseData.name}
DESCRIPTION: ${caseData.description || "N/A"}

INTELLIGENCE DATA:
---
SEARCHES:
${searchContext || "No searches performed yet."}

EVIDENCE:
${evidenceContext || "No evidence collected yet."}

DOCUMENTS:
${documentContext || "No internal documents drafted."}
---

Provide a comprehensive synthesis report.`;

    // 3. Call Groq AI
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API Error: ${response.status}`);
      }

      const responseData = await response.json();
      const summary = responseData.choices[0].message.content;

      // 4. Save summary back to the case
      await ctx.runMutation(api.cases.updateCaseSummary, {
        caseId: args.caseId,
        summary,
      });

      return summary;
    } catch (error: any) {
      console.error("Case summary generation failed:", error);
      throw new Error(`Failed to generate case summary: ${error.message}`);
    }
  },
});
