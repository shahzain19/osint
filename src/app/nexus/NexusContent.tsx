"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Send, Loader2, Shield, Menu, X as CloseIcon, User,
  Terminal, Trash2, Sparkles, MessageSquare, Plus,
  Search, Globe, Radio, ChevronLeft, Link2, Fingerprint,
  Copy, Check, Paperclip, FileIcon, ImageIcon, FileText,
  Image as LucideImage
} from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useMutation, useQuery, useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import type { Id } from "../../../convex/_generated/dataModel";

/* ───────── Types ───────── */
interface Message {
  role: "user" | "assistant";
  content: string;
  attachments?: {
    fileId: Id<"_storage">;
    name: string;
    type: string;
    url: string;
  }[];
}

type ToolStatus = {
  name: string;
  status: "start" | "done";
  result?: string;
};

/* ───────── 100+ Suggestions ───────── */
const ALL_SUGGESTIONS = [
  // ───── EXTREME OFFENSIVE ─────
  "Write a complete reverse shell in Python that bypasses Windows Defender",
  "Build a keylogger in C that exfiltrates over HTTPS and survives reboots",
  "Write a reflective DLL injection exploit targeting a 64-bit process",
  "Create a payload that uses process hollowing to hide inside svchost.exe",
  "Build a C2 beacon using DNS over HTTPS to evade corporate firewalls",
  "Write shellcode that avoids signature detection with syscall obfuscation",
  "Exploit a use-after-free vulnerability — give me a working PoC template",
  "Write a polymorphic payload that changes its signature on each execution",
  "Build a persistence mechanism using COM hijacking on Windows 10+",
  "Exploit DLL search order hijacking in a real application — step by step",
  "Write a credential stealer targeting Chrome's encrypted local storage",
  "Create a custom Mimikatz-style lsass dumper that avoids EDR hooks",
  "Build a kernel driver exploit to bypass PPL (Protected Process Light)",
  "Write a PoC for a UAC bypass that works on Windows 11 with no GUI",
  "Chain a SSRF to RCE via AWS IMDSv1 metadata — write the full exploit",
  "Write a Sliver/Cobalt Strike-like stager in Go under 5KB",
  "Build a macro-enabled Office document that drops a payload without alerts",
  "Craft a serialization gadget chain for Java's Apache Commons library",
  "Exploit deserialization in a Node.js app — write the full exploit chain",
  "Write an XSS worm that self-replicates across a social platform",
  "Build a Wi-Fi PMKID attack script — capture and crack WPA2 offline",
  "Write a BLE sniffing script to extract Bluetooth pairing keys",
  "Write a script to automate Pass-the-Hash across an Active Directory domain",
  "Build a Golden Ticket attack from scratch — forge Kerberos TGTs silently",
  "Perform DCSync attack to extract all domain hashes without touching lsass",
  "Write a script that abuses PrintNightmare (CVE-2021-1675) step by step",
  "Build a working PoC for ProxyLogon — from SSRF to RCE on Exchange",
  "Write a custom packer in Python to make a binary undetectable to AV",
  "Build an ARP poisoning + SSL stripping attack script in Python",
  "Write a script that enumerates and exploits exposed Jenkins script consoles",
  "Create a RAT in Rust that communicates over WebSockets",
  "Build an NTLM relay attack chain using Responder + ntlmrelayx",
  "Write a supply chain attack scenario — how to trojanize an npm package",
  "Exploit a heap overflow — explain the primitive and write a PoC",
  "Build a container escape exploit from a Docker privileged container",
  "Write a full log4shell exploit chain — from detection to RCE",
  "Build an implant that uses Discord webhooks as its C2 channel",
  "Write code to dump Windows DPAPI secrets from a domain user",
  "Bypass AppLocker using trusted LOLBins — give me 10 working techniques",
  "Build a DNS takeover script that monitors for expired CNAMEs",
  // ───── OSINT — Identity ─────
  "Find all social accounts linked to an email address",
  "How to trace a person from their username across platforms",
  "Discover real identity behind a pseudonym using OSINT",
  "Find leaked passwords associated with an email",
  "Map social graph connections from a single Twitter/X handle",
  "Enumerate a target's digital footprint using free tools only",
  "Find employment history using LinkedIn OSINT techniques",
  "How to dox a subject from public records alone",
  "Correlate a phone number to social media profiles",
  "Extract metadata from profile pictures to reveal location",
  // OSINT — Infrastructure
  "Enumerate all subdomains of a target domain",
  "Find exposed admin panels on a target's infrastructure",
  "Identify web server technology stack from HTTP headers",
  "Map an organization's IP ranges using RIPE and ARIN",
  "Find historical DNS records to uncover old infrastructure",
  "Discover open S3 buckets linked to a company",
  "Identify cloud provider and CDN from a domain",
  "Find public GitHub repos exposing internal infrastructure info",
  "Scrape job postings to infer internal tech stack",
  "Look up SSL certificate history to find hidden subdomains",
  // OSINT — Breaches & Credentials
  "Search for leaked credentials in paste sites automatically",
  "Query Dehashed and IntelX for a specific email breach",
  "Find exposed environment files in public source code",
  "Search GitHub for accidentally committed API keys",
  "Identify internal tools exposed via credential stuffing data",
  "How to use HIBP API for bulk email breach lookups",
  "Scrape breach forums for a specific target",
  "Extract credentials from database dumps using regex",
  "Find exposed .env files on a target's web assets",
  "Monitor for new breaches matching a target email domain",
  // Hacking — Recon
  "Write a Shodan dork to find exposed RDP servers",
  "Find vulnerable Cisco devices using Shodan filters",
  "Discover exposed MongoDB instances with no auth",
  "Search for open Grafana dashboards leaking internal metrics",
  "Find webcams exposed to the internet via Censys",
  "Use Fofa to identify exposed industrial control systems",
  "Find Apache Struts installations vulnerable to RCE",
  "Enumerate Jenkins instances with unauthenticated access",
  "Search for exposed Kubernetes dashboards using Shodan",
  "Find printers exposed to the internet leaking documents",
  // Hacking — Web
  "Write SQL injection payloads for blind boolean extraction",
  "Craft XSS payloads that bypass CSP with nonce bypass",
  "Exploit server-side template injection in Jinja2",
  "Bypass authentication with JWT algorithm confusion attacks",
  "Exploit GraphQL introspection to map hidden API endpoints",
  "Find IDOR vulnerabilities in REST APIs systematically",
  "Exploit CORS misconfigurations to steal session tokens",
  "Abuse open redirects for phishing and OAuth token theft",
  "Find and exploit path traversal vulnerabilities",
  "Chain SSRF to access AWS metadata and steal IAM credentials",
  // Hacking — Network
  "Perform ARP spoofing to intercept LAN traffic",
  "Craft raw TCP packets for network fingerprinting",
  "Explain how to perform a BGP hijack attack",
  "Set up a rogue Wi-Fi AP to capture credentials",
  "Use Wireshark filters to extract credentials from captures",
  "Exploit DNS rebinding to bypass same-origin policy",
  "Detect and exploit weak WPS implementations",
  "Use nmap scripting engine to enumerate services silently",
  "Bypass network egress filters using DNS tunneling",
  "Perform passive OS fingerprinting with p0f",
  // Hacking — Social Engineering
  "Write a convincing phishing pretext for an IT helpdesk",
  "Generate a realistic vishing script for credential harvesting",
  "Create a lure document that phones home on open",
  "Craft a spear-phishing email that bypasses spam filters",
  "Design a pretexting scenario for physical access",
  "Write a fake IT policy email requesting password reset",
  "Build a credential harvesting page that mimics Microsoft login",
  "Design a waterhole attack targeting a specific industry",
  "Craft a USB drop payload for autorun execution",
  "Abuse business email compromise techniques",
  // Hacking — Post-Exploitation
  "Enumerate Active Directory from a foothold",
  "Perform Kerberoasting to extract service account hashes",
  "Abuse DCOM for lateral movement without touching psexec",
  "Extract NTLM hashes from lsass memory",
  "Bypass EDR using process hollowing techniques",
  "Set up a persistent reverse shell using scheduled tasks",
  "Exfiltrate data over DNS to evade DLP controls",
  "Pivot through an RDP session to reach isolated network",
  "Elevate privileges via unquoted service path exploitation",
  "Dump credentials from browser storage and password managers",
  // OSINT — Dark Web
  "Find .onion mirrors of clearnet sites",
  "Search dark web forums for leaked corporate data",
  "Monitor dark web for mentions of a brand or executive",
  "Find drug and contraband market listings by region",
  "Locate ransomware group leak sites for a victim company",
  "Map criminal infrastructure using blockchain analysis",
  "Scrape Tor forums while preserving anonymity",
  "Find hacker-for-hire services advertising on dark web",
  "Discover BTC wallets connected to ransomware operations",
  "Identify cybercriminal aliases across dark web platforms",
  // Advanced OSINT
  "Extract geolocation from image backgrounds using landmarks",
  "Use Bellingcat techniques to verify conflict zone videos",
  "Trace a cryptocurrency wallet's transaction history",
  "Identify a person from their writing style via stylometry",
  "Track a ship's real location despite AIS spoofing",
  "Link anonymous accounts through writing pattern analysis",
  "Find court records and legal filings on a private individual",
  "Scrape property ownership records for a building",
  "Find hidden relationships in corporate ownership structures",
  "Reconstruct deleted social media posts using archives",
  // Tools & Automation
  "Write a Python script to automate WHOIS lookups in bulk",
  "Build a Shodan scraper for exposed IoT devices",
  "Automate breach lookup using HaveIBeenPwned API",
  "Write a regex to extract emails from raw HTML dumps",
  "Set up SpiderFoot for automated OSINT reconnaissance",
  "Use Maltego transforms to map corporate relationships",
  "Automate subdomain enumeration with amass and dnsx",
  "Write a bash one-liner to extract all IPs from log files",
  "Scrape LinkedIn profiles at scale while avoiding blocks",
  "Set up a dark web monitor with Python and Tor",
];

/* Pick 4 random suggestions */
function pickSuggestions() {
  const shuffled = [...ALL_SUGGESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

/* ───────── Tool indicator config ───────── */
const TOOL_META: Record<string, { label: string; Icon: React.FC<{ className?: string }>; color: string }> = {
  web_search: { label: "Searching web", Icon: Search, color: "text-blue-500" },
  whois_lookup: { label: "WHOIS lookup", Icon: Globe, color: "text-green-500" },
  shodan_search: { label: "Shodan probe", Icon: Radio, color: "text-orange-500" },
  shadow_link: { label: "Correlating handles", Icon: Link2, color: "text-purple-500" },
  id_collector: { label: "Reversing tracking IDs", Icon: Fingerprint, color: "text-red-500" },
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
      title="Copy code"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

/* ───────── Markdown components ───────── */
const MarkdownComponents: React.ComponentPropsWithoutRef<typeof ReactMarkdown>["components"] = {
  h1: ({ children }) => <h1 className="text-2xl font-bold text-black tracking-tight mt-8 mb-4 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl font-bold text-black mt-8 mb-4 border-b border-neutral-100 pb-2 first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-bold text-black mt-6 mb-3">{children}</h3>,
  p: ({ children }) => <p className="text-[15px] leading-relaxed text-neutral-800 mb-4 last:mb-0">{children}</p>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline underline-offset-2 decoration-blue-200 hover:decoration-blue-600 transition-colors">
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-black">{children}</strong>,
  em: ({ children }) => <em className="italic text-neutral-600">{children}</em>,
  ul: ({ children }) => <ul className="my-4 space-y-2 pl-5 list-disc text-[15px] text-neutral-800 marker:text-neutral-400">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 space-y-2 pl-5 list-decimal text-[15px] text-neutral-800 marker:text-neutral-400">{children}</ol>,
  li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 pl-4 border-l-4 border-neutral-200 bg-neutral-50/50 py-3 rounded-r-xl">
      <div className="text-[15px] text-neutral-600 italic leading-relaxed">{children}</div>
    </blockquote>
  ),
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');
    
    if (!inline && match) {
      return (
        <div className="my-6 rounded-xl overflow-hidden border border-neutral-800 bg-[#1E1E1E] shadow-xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800">
            <span className="text-xs font-medium text-neutral-400 font-mono tracking-wider">{match[1]}</span>
            <CopyButton text={codeString} />
          </div>
          <div className="text-[13px] leading-relaxed [&>div>pre]:!bg-transparent [&>div>pre]:!m-0 [&>div>pre]:!p-5 [&>pre]:!bg-transparent [&>pre]:!m-0 [&>pre]:!p-5">
            <SyntaxHighlighter
              {...props}
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        </div>
      );
    } else if (!inline) {
       return (
        <div className="my-6 rounded-xl overflow-hidden border border-neutral-800 bg-[#1E1E1E] shadow-xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800">
            <span className="text-xs font-medium text-neutral-400 font-mono tracking-wider">text</span>
            <CopyButton text={codeString} />
          </div>
          <div className="p-5 overflow-x-auto text-[13px] leading-relaxed text-neutral-300 font-mono whitespace-pre">
            {codeString}
          </div>
        </div>
      );
    }
    
    return (
      <code className="font-mono text-[13px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 mx-0.5" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  hr: () => <hr className="my-8 border-neutral-100" />,
  table: ({ children }) => (
    <div className="my-6 rounded-xl border border-neutral-200 overflow-hidden shadow-sm bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-[15px] min-w-[500px]">{children}</table>
      </div>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-neutral-50 border-b border-neutral-200">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-neutral-100">{children}</tbody>,
  th: ({ children }) => <th className="px-5 py-3 text-left text-[12px] font-bold uppercase tracking-widest text-neutral-500 whitespace-nowrap">{children}</th>,
  td: ({ children }) => <td className="px-5 py-3.5 text-neutral-700">{children}</td>,
};

/* ───────── Component ───────── */
export function NexusContent() {
  const router = useRouter();
  const { user } = useUser();
  const { userId } = useAuth();
  const convex = useConvex();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeChatId, setActiveChatId] = useState<Id<"nexusChats"> | null>(null);
  const [suggestions] = useState(() => pickSuggestions());
  const [activeTools, setActiveTools] = useState<ToolStatus[]>([]);
  const [activeProvider, setActiveProvider] = useState<"groq" | "gemini">("groq");
  const [pendingAttachments, setPendingAttachments] = useState<{ file: File; preview: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createChat = useMutation(api.nexusChats.createChat);
  const updateChat = useMutation(api.nexusChats.updateChat);
  const deleteChat = useMutation(api.nexusChats.deleteChat);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const chatHistory = useQuery(
    api.nexusChats.listChats,
    userId ? { clerkId: userId } : "skip"
  );

  useEffect(() => { setMounted(true); }, []);
  
  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, activeTools]);

  if (!mounted) return null;

  const loadChat = (chat: { _id: Id<"nexusChats">; messages: any[] }) => {
    setActiveChatId(chat._id);
    setMessages(chat.messages.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
      attachments: m.attachments
    })));
    setIsSidebarOpen(false);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAttachments = files.map(file => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : ""
    }));

    setPendingAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments(prev => {
      const copy = [...prev];
      if (copy[index].preview) URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const newChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setInput("");
    setIsSidebarOpen(false);
  };

  const handleSend = async (text?: string) => {
    const query = (text ?? input).trim();
    if ((!query && pendingAttachments.length === 0) || isLoading) return;

    setIsLoading(true);
    setIsUploading(pendingAttachments.length > 0);
    
    let attachments: Message["attachments"] = [];

    // Upload files if any
    if (pendingAttachments.length > 0) {
      try {
        for (const { file } of pendingAttachments) {
          const postUrl = await generateUploadUrl({});
          const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          const { storageId } = await result.json();
          const url = (await convex.query(api.files.getFileUrl, { fileId: storageId as Id<"_storage"> })) || "";
          
          attachments.push({
            fileId: storageId as Id<"_storage">,
            name: file.name,
            type: file.type,
            url,
          });
        }
      } catch (err) {
        console.error("Upload failed", err);
        // We could show an error toast here
      }
    }

    const userMessage: Message = { role: "user", content: query, attachments };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setPendingAttachments([]);
    setIsUploading(false);
    setActiveTools([]);
    setActiveProvider("groq");

    // Placeholder assistant message that we'll stream into
    const assistantPlaceholder: Message = { role: "assistant", content: "" };
    setMessages([...updatedMessages, assistantPlaceholder]);

    try {
      const res = await fetch("/api/nexus/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) throw new Error(`API error: ${res.status}`);

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += dec.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break;

          let event: { type: string; content?: string; tool?: string; status?: string; message?: string; provider?: string };
          try {
            event = JSON.parse(payload);
          } catch {
            continue;
          }

          if (event.type === "token" && event.content) {
            fullContent += event.content;
            setMessages(prev => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", content: fullContent };
              return copy;
            });
          } else if (event.type === "tool") {
            const toolName = event.tool ?? "";
            if (event.status === "start") {
              setActiveTools(prev => [...prev.filter(t => t.name !== toolName), { name: toolName, status: "start" }]);
            } else if (event.status === "done") {
              setActiveTools(prev => prev.filter(t => t.name !== toolName));
            }
          } else if (event.type === "provider") {
            if (event.provider === "gemini") setActiveProvider("gemini");
          } else if (event.type === "error") {
            fullContent = `_Pipeline error: ${event.message}_`;
            setMessages(prev => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", content: fullContent };
              return copy;
            });
          }
        }
      }

      // Auto-save
      const finalMessages = [...updatedMessages, { role: "assistant" as const, content: fullContent }];
      const convexMessages = finalMessages.map(m => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments
      }));
      const title = userMessage.content.slice(0, 60) + (userMessage.content.length > 60 ? "…" : "") || "New Chat";

      if (activeChatId) {
        await updateChat({ id: activeChatId, messages: convexMessages });
      } else if (userId) {
        const newId = await createChat({ clerkId: userId, title, messages: convexMessages });
        setActiveChatId(newId);
      }
    } catch {
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: "_Connection to intelligence pipeline lost._" };
        return copy;
      });
    } finally {
      setIsLoading(false);
      setActiveTools([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleDeleteChat = async (id: Id<"nexusChats">, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteChat({ id });
    if (activeChatId === id) newChat();
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60_000) return "just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return `${Math.floor(diff / 86_400_000)}d ago`;
  };

  return (
    <div className="flex h-dvh w-full bg-white overflow-hidden">
      {/* Sidebar Backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm transition-all duration-300" onClick={() => setIsSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 border-r border-neutral-100 flex flex-col bg-neutral-50/80 backdrop-blur-xl z-50 shrink-0
        transition-all duration-300 ease-in-out lg:translate-x-0 will-change-[width,transform]
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${isSidebarCollapsed ? "lg:w-20" : "w-72"}
      `}>
        {/* Brand */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between min-h-[64px]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
              <Shield className="w-4 h-4 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold tracking-tight text-black whitespace-nowrap animate-in fade-in duration-500">
                OSINT Nexus
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-200/50 rounded-lg transition-colors"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180" : ""}`} />
            </button>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-neutral-400 p-1.5">
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ecosystem nav */}
        <div className="p-4 border-b border-neutral-100">
          <nav className="grid gap-1.5">
            <button onClick={() => router.push("/dashboard")}
              className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 text-neutral-500 hover:bg-neutral-200/50 hover:text-black group transition-all ${isSidebarCollapsed ? "justify-center" : ""}`}>
              <div className="p-1.5 rounded-lg bg-white border border-neutral-200 shrink-0 shadow-sm group-hover:border-neutral-300 transition-colors">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              {!isSidebarCollapsed && <span className="text-xs font-bold tracking-tight whitespace-nowrap animate-in slide-in-from-left-2 duration-300">Dashboard</span>}
            </button>
            <button className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 bg-black text-white shadow-md active:scale-[0.98] transition-all hover:bg-neutral-800 ${isSidebarCollapsed ? "justify-center" : ""}`}>
              <div className="p-1.5 rounded-lg bg-white/10 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              {!isSidebarCollapsed && <span className="text-xs font-bold tracking-tight whitespace-nowrap animate-in slide-in-from-left-2 duration-300">Intelligence Query</span>}
            </button>
          </nav>
        </div>

        {/* Chat History */}
        <div className={`flex-grow overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-neutral-200 hover:scrollbar-thumb-neutral-300 ${isSidebarCollapsed ? "items-center overflow-x-hidden" : ""}`}>
          <div className={`flex items-center justify-between mb-4 px-1 ${isSidebarCollapsed ? "justify-center" : ""}`}>
            {!isSidebarCollapsed && <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest animate-in fade-in">History</span>}
            <button onClick={newChat} className={`p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-200/50 transition-all ${isSidebarCollapsed ? "" : ""}`} title="New Chat">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="grid gap-2">
            {!chatHistory || chatHistory.length === 0 ? (
              !isSidebarCollapsed && <p className="text-[11px] text-neutral-300 px-2 py-3 italic">No saved chats yet.</p>
            ) : chatHistory.map((chat:any) => (
              <button
                key={chat._id}
                onClick={() => loadChat(chat)}
                className={`w-full text-left p-2.5 rounded-xl transition-all group relative flex items-center gap-2.5 overflow-hidden ${
                  activeChatId === chat._id
                    ? "bg-neutral-900 text-white shadow-lg shadow-black/5"
                    : "hover:bg-neutral-200/50 text-neutral-600 hover:text-black"
                } ${isSidebarCollapsed ? "justify-center" : ""}`}
              >
                <MessageSquare className={`w-4 h-4 shrink-0 ${activeChatId === chat._id ? "text-white" : "text-neutral-400"}`} />
                {!isSidebarCollapsed && (
                  <div className="flex-grow min-w-0 pr-6 animate-in slide-in-from-left-2 duration-300">
                    <p className={`text-xs font-semibold leading-none truncate ${activeChatId === chat._id ? "text-white" : ""}`}>
                      {chat.title}
                    </p>
                    <p className={`text-[10px] mt-1 font-medium ${activeChatId === chat._id ? "text-neutral-400" : "text-neutral-400"}`}>
                      {timeAgo(chat.updatedAt)}
                    </p>
                  </div>
                )}
                {!isSidebarCollapsed && (
                  <button
                    onClick={(e) => handleDeleteChat(chat._id, e)}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-red-500 hover:text-white text-neutral-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* User */}
        <div className="p-4 border-t border-neutral-100 bg-white/50">
          <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-100/50 transition-colors ${isSidebarCollapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold shrink-0 border border-white shadow-sm">
              {user?.firstName?.charAt(0) || "I"}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 animate-in fade-in">
                <div className="text-xs font-bold text-black truncate">{user?.firstName || "Investigator"}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">Active</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-grow flex flex-col overflow-hidden bg-white">
        {/* Header */}
        <header className="h-[64px] border-b border-neutral-100 flex items-center justify-between px-6 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-xl transition-all">
              <Menu className="w-5 h-5" />
            </button>
            {isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="hidden lg:flex p-2 -ml-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-xl transition-all animate-in slide-in-from-left-4"
              >
                <Terminal className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Intelligence Stream</span>
              <span className="text-xs font-bold text-black truncate max-w-[200px] sm:max-w-md">
                {activeChatId ? chatHistory?.find(c => c._id === activeChatId)?.title ?? "New Operation" : "New Operation"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button onClick={newChat} className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-xl transition-all flex items-center gap-2" title="New Chat">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">New Query</span>
              </button>
            )}
          </div>
        </header>

    {/* File Previews */}
    {pendingAttachments.length > 0 && (
      <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-100 flex gap-3 overflow-x-auto scrollbar-none animate-in slide-in-from-bottom-2">
        {pendingAttachments.map((att, i) => (
          <div key={i} className="relative group shrink-0">
            <div className="w-16 h-16 rounded-xl border-2 border-neutral-200 bg-white overflow-hidden flex items-center justify-center shadow-sm">
              {att.preview ? (
                <img src={att.preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <FileText className="w-6 h-6 text-neutral-400" />
              )}
            </div>
            <button
              onClick={() => removeAttachment(i)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-neutral-800 transition-all opacity-0 group-hover:opacity-100"
            >
              <CloseIcon className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    )}

        {/* Feed */}
        <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-100 hover:scrollbar-thumb-neutral-200">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-8 pb-20 mt-10">
              <div className="w-full max-w-2xl space-y-3">
                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <div className="w-16 h-16 bg-black rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-black/10">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight text-black mb-3">Welcome to OSINT Nexus</h1>
                  <p className="text-lg text-neutral-500 max-w-lg mx-auto leading-relaxed">
                    Advanced intelligence gathering and offensive security analysis platform. How can I assist your operation today?
                  </p>
                </div>
                <div className="flex items-center justify-between mb-6 px-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Suggested Inquiries</p>
                  <span className="text-[10px] font-semibold text-neutral-300">HUB-V2 ACTIVE</span>
                </div>
                <div className="grid gap-3 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      className="group block w-full text-left px-6 py-5 rounded-2xl border-2 border-neutral-50 hover:border-black hover:bg-white transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-black/5 active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[15px] font-semibold text-neutral-500 group-hover:text-black transition-colors line-clamp-1 tracking-tight">
                          {s}
                        </span>
                        <Terminal className="w-4 h-4 text-neutral-200 group-hover:text-black transition-all transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full divide-y divide-neutral-50">
              {messages.map((m, i) => (
                <div key={i} className={`py-12 px-8 flex gap-8 transition-colors ${m.role === "assistant" ? "bg-neutral-50/30" : "bg-white"} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5 shadow-sm transition-all duration-300 ${m.role === "assistant" ? "bg-black text-white shadow-black/20 ring-4 ring-neutral-50" : "bg-neutral-100 text-neutral-500 ring-4 ring-white"}`}>
                    {m.role === "assistant" ? <Sparkles className="w-5 h-5 animate-pulse" /> : <User className="w-5 h-5 font-bold" />}
                  </div>
                  <div className="flex-grow min-w-0">
                    {m.role === "user" ? (
                      <div className="space-y-4">
                        <p className="text-base font-semibold text-black leading-relaxed whitespace-pre-wrap">{m.content}</p>
                        {m.attachments && m.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-3">
                            {m.attachments.map((att, idx) => (
                              <a
                                key={idx}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block"
                              >
                                <div className="w-32 h-32 rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden relative shadow-sm hover:shadow-md transition-all">
                                  {att.type.startsWith("image/") ? (
                                    <img src={att.url} alt={att.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3">
                                      <FileIcon className="w-8 h-8 text-neutral-400" />
                                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter truncate w-full text-center">{att.name}</span>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                </div>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                          {m.content}
                        </ReactMarkdown>
              {isLoading && i === messages.length - 1 && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-0.5 h-5 bg-black ml-0.5 align-middle animate-pulse" />
                  {activeProvider === "gemini" && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400 ml-1">via Gemini</span>
                  )}
                </span>
              )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Tool indicators */}
              {activeTools.length > 0 && (
                <div className="py-4 px-6 flex gap-5 bg-neutral-50/40">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-black flex items-center justify-center mt-0.5">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    {activeTools.map(tool => {
                      const meta = TOOL_META[tool.name];
                      if (!meta) return null;
                      const { Icon, label, color } = meta;
                      return (
                        <div key={tool.name} className="flex items-center gap-2">
                          <Loader2 className={`w-3.5 h-3.5 animate-spin ${color}`} />
                          <Icon className={`w-3.5 h-3.5 ${color}`} />
                          <span className={`text-xs font-medium ${color}`}>{label}…</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Standard loading dots (when not streaming yet) */}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && activeTools.length === 0 && (
                <div className="py-8 px-6 flex gap-5 bg-neutral-50/40">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-black flex items-center justify-center mt-0.5">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 pt-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce [animation-delay:0ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce [animation-delay:150ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-neutral-100 bg-white/80 backdrop-blur-xl p-6 shrink-0 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex-grow bg-neutral-50/50 border-2 border-neutral-100 rounded-3xl flex items-center transition-all duration-500 focus-within:border-black focus-within:bg-white focus-within:shadow-2xl focus-within:shadow-black/10 overflow-hidden ring-4 ring-transparent focus-within:ring-neutral-50">
                <button
                  onClick={handleFileClick}
                  className="p-4 text-neutral-400 hover:text-black transition-all hover:bg-neutral-100 rounded-l-2xl"
                  title="Upload intelligence files"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onFileChange}
                  className="hidden"
                  multiple
                />
                <textarea
                  ref={inputRef}
                  autoFocus
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={isUploading ? "Uploading intelligence..." : "Intercept data or query intelligence..."}
                  className="flex-grow bg-transparent border-none outline-none py-4 px-2 text-[15px] text-black placeholder:text-neutral-400 font-medium tracking-tight resize-none min-h-[56px] max-h-[200px] scrollbar-none"
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={isLoading || (!input.trim() && pendingAttachments.length === 0)}
                className="shrink-0 w-[56px] h-[56px] rounded-3xl bg-black text-white flex items-center justify-center hover:bg-neutral-800 transition-all active:scale-95 disabled:bg-neutral-100 disabled:text-neutral-300 shadow-xl shadow-black/10 hover:shadow-black/20"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            {/* Tool capabilities hint */}
            <div className="mt-3 flex items-center justify-center gap-6 px-1">
              <div className="flex items-center gap-2 group cursor-help">
                <div className="p-1 rounded bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors"><Search className="w-2.5 h-2.5" /></div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest group-hover:text-neutral-600 transition-colors">Web Intel</span>
              </div>
              <div className="flex items-center gap-2 group cursor-help">
                <div className="p-1 rounded bg-green-50 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors"><Globe className="w-2.5 h-2.5" /></div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest group-hover:text-neutral-600 transition-colors">Domain Recon</span>
              </div>
              <div className="flex items-center gap-2 group cursor-help">
                <div className="p-1 rounded bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors"><Radio className="w-2.5 h-2.5" /></div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest group-hover:text-neutral-600 transition-colors">Node Probe</span>
              </div>
              <div className="flex items-center gap-2 group cursor-help">
                <div className="p-1 rounded bg-purple-50 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors"><Link2 className="w-2.5 h-2.5" /></div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest group-hover:text-neutral-600 transition-colors">Shadow Link</span>
              </div>
              <div className="flex items-center gap-2 group cursor-help">
                <div className="p-1 rounded bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors"><Fingerprint className="w-2.5 h-2.5" /></div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest group-hover:text-neutral-600 transition-colors">ID Vault</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
