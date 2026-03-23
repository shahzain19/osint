import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { caseData } = await req.json();

    if (!caseData) {
      return NextResponse.json({ error: "Missing case data" }, { status: 400 });
    }

    const { name, description, summary, searches, evidence, documents } = caseData;

    let markdown = `# 🛡️ BAYNAQAB INTELLIGENCE DOSSIER\n\n`;
    markdown += `**CASE NAME:** ${name}\n`;
    markdown += `**DATE:** ${new Date().toUTCString()}\n`;
    markdown += `**CASE ID:** ${caseData._id}\n\n`;

    markdown += `## 📋 EXECUTIVE SUMMARY\n\n`;
    markdown += `${summary || "No automated summary generated yet."}\n\n`;

    markdown += `## 📜 CASE DESCRIPTION\n\n`;
    markdown += `${description || "No description provided."}\n\n`;

    markdown += `## 🔍 INTELLIGENCE INVENTORY (SEARCHES)\n\n`;
    if (searches && searches.length > 0) {
      searches.forEach((s: any, i: number) => {
        markdown += `### Search #${i + 1}: ${s.query}\n`;
        markdown += `- **Tool:** ${(s.tool || "ORACLE").toUpperCase()}\n`;
        markdown += `- **Status:** ${s.status?.toUpperCase() || "COMPLETED"}\n`;
        markdown += `- **Timestamp:** ${new Date(s.createdAt).toUTCString()}\n\n`;
        markdown += `#### DOSSIER\n\n${s.dossier || "No data collected."}\n\n---\n\n`;
      });
    } else {
      markdown += `No searches recorded for this case.\n\n`;
    }

    markdown += `## 📁 EVIDENCE VAULT\n\n`;
    if (evidence && evidence.length > 0) {
      evidence.forEach((e: any, i: number) => {
        markdown += `### Evidence #${i + 1}: ${e.name}\n`;
        markdown += `- **Type:** ${e.type?.toUpperCase()}\n`;
        markdown += `- **Capture Date:** ${new Date(e.createdAt).toUTCString()}\n`;
        if (e.url) markdown += `- **Link:** [View Evidence](${e.url})\n`;
        markdown += `- **Tags:** ${e.tags?.join(", ") || "None"}\n\n`;
      });
    } else {
      markdown += `No evidence collected for this case.\n\n`;
    }

    markdown += `## 📝 INTERNAL CASE DOCUMENTS\n\n`;
    if (documents && documents.length > 0) {
      documents.forEach((d: any, i: number) => {
        markdown += `### Document: ${d.title}\n`;
        markdown += `---\n${d.content}\n\n---\n\n`;
      });
    } else {
      markdown += `No internal documents drafted.\n\n`;
    }

    markdown += `\n---\n*This report was automatically synthesized by the Baynaqab OSINT Engine. Verification Log: SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}*`;

    // Return the markdown content with appropriate headers for download
    return new Response(markdown, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="Dossier_${name.replace(/\s+/g, '_')}.md"`,
      },
    });

  } catch (error: any) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
