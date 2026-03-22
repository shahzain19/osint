"use client";

import { useState, Suspense, useEffect } from "react";
import { Search, Loader2, Camera, Sparkles, Shield, Phone, FileText, QrCode, Link, Globe, ShieldAlert, Menu, X as CloseIcon, ArrowRight, History, Check, MapPin, Tag } from "lucide-react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ReactMarkdown from "react-markdown";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { CaseManager } from "@/components/intelligence/CaseManager";
import { EvidenceVault } from "@/components/intelligence/EvidenceVault";
import { Briefcase, ChevronDown } from "lucide-react";

export function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  const { userId } = useAuth();
  const { user } = useUser();
  const idFromUrl = searchParams.get("id");

  if (!mounted) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-white w-full h-full">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-100" />
      </div>
    );
  }

  const [activeTool, setActiveTool] = useState<"oracle" | "exif" | "footprint" | "face" | "phone" | "document" | "qrcode" | "shadow" | "nexus" | "omni" | "breach">("omni");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [keywords, setKeywords] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState("");
  const [correlations, setCorrelations] = useState<any[]>([]);
  const [breaches, setBreaches] = useState<any[]>([]);
  const [isCaseSelectorOpen, setIsCaseSelectorOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);

  const view = searchParams.get("view");
  const projectId = searchParams.get("projectId");
  const activeCase = useQuery(api.cases.getCaseWithSearches, projectId ? { caseId: projectId as any, clerkId: userId ?? undefined } : "skip");
  
  const cases = useQuery(api.cases.listCases, { clerkId: userId ?? "" });
  const assignToCase = useMutation(api.cases.assignSearchToCase);

  const oracleAction = useAction(api.tools.intelOracle_v2);
  const exifAction = useAction(api.tools.exifHunter);
  const footprintAction = useAction(api.tools.footprintFinder_v2);
  const faceAction = useAction(api.tools.faceRecognition);
  const phoneAction = useAction(api.tools.phoneNumberLookup);
  const documentAction = useAction(api.tools.documentAnalysis);
  const qrcodeAction = useAction(api.tools.qrCodeAnalyzer);
  const shadowAction = useAction(api.tools.shadowLink);
  const nexusAction = useAction(api.tools.networkNexus);
  const omniAction = useAction(api.tools.omniSearch);
  const breachAction = useAction(api.tools.breachWatch);

  const historicalSearch = useQuery(api.searches.getSearch, idFromUrl ? { 
    id: idFromUrl as any,
    clerkId: userId ?? undefined
  } : "skip");

  const [scrapeStatus, setScrapeStatus] = useState("");

  const handleSearch = async () => {
    const needsQuery = ["oracle", "footprint", "shadow", "nexus", "omni", "breach"].includes(activeTool);
    if (needsQuery && !query) return;
    if ((activeTool === "exif" || activeTool === "face" || activeTool === "qrcode") && !imageUrl) return;
    if (activeTool === "document" && !documentUrl) return;
    if (activeTool === "phone" && !phoneNumber) return;
    
    setLoading(true);
    setDossier("");
    setCorrelations([]);
    setBreaches([]);
    setScrapeStatus("Initializing...");

    try {
      let rawScrapedData = "";
      
      if (activeTool === "oracle") {
        setScrapeStatus("Executing search...");
        const scrapeRes = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "search", query }),
        });
        const sData = await scrapeRes.json();
        rawScrapedData = sData.scrapedText;
      } else if (activeTool === "exif") {
        setScrapeStatus("Analyzing image...");
        const scrapeRes = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        });
        const sData = await scrapeRes.json();
        rawScrapedData = sData.scrapedText;
      } else if (activeTool === "footprint") {
        setScrapeStatus("Scanning deep web for breaches...");
        const scrapeRes = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "footprint", query }),
        });
        const sData = await scrapeRes.json();
        rawScrapedData = sData.scrapedText;
      } else if (activeTool === "face") {
        setScrapeStatus("Analyzing facial features...");
        const scrapeRes = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl, mode: "face" }),
        });
        const sData = await scrapeRes.json();
        rawScrapedData = sData.scrapedText;
      } else if (activeTool === "phone") {
        setScrapeStatus("Looking up phone number...");
        rawScrapedData = "";
      } else if (activeTool === "document") {
        setScrapeStatus("Analyzing document...");
        const scrapeRes = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentUrl }),
        });
        const sData = await scrapeRes.json();
        rawScrapedData = sData.scrapedText;
      } else if (activeTool === "qrcode") {
        setScrapeStatus("Decoding QR code...");
        const scrapeRes = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl, mode: "qrcode" }),
        });
        const sData = await scrapeRes.json();
        rawScrapedData = sData.scrapedText;
      } else if (activeTool === "shadow") {
        setScrapeStatus("Correlating identities...");
        const scrapeRes = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "shadow", query }),
        });
        const sData = await scrapeRes.json();
        rawScrapedData = sData.scrapedText;
        setCorrelations(sData.correlations || []);
        setBreaches(sData.breaches || []);
      } else if (activeTool === "nexus") {
        setScrapeStatus("Mapping infrastructure...");
        const scrapeRes = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "nexus", query }),
        });
        const sData = await scrapeRes.json();
        rawScrapedData = sData.scrapedText;
      } else if (activeTool === "omni") {
        setScrapeStatus("Engaging global intelligence synthesis...");
        const scrapeRes = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "omni", query }),
        });
        const sData = await scrapeRes.json();
        rawScrapedData = sData.scrapedText;
        setCorrelations(sData.correlations || []);
        setBreaches(sData.breaches || []);
      }

      setScrapeStatus("Synthesizing intelligence...");
      let result;
      if (activeTool === "oracle") {
        result = await oracleAction({ query, location, keywords, clerkId: userId ?? undefined, caseId: projectId ?? undefined, scrapedData: rawScrapedData });
      } else if (activeTool === "exif") {
        result = await exifAction({ imageUrl, clerkId: userId ?? undefined, caseId: projectId ?? undefined, scrapedData: rawScrapedData });
      } else if (activeTool === "footprint") {
        result = await footprintAction({ handle: query, clerkId: userId ?? undefined, caseId: projectId ?? undefined, scrapedData: rawScrapedData });
      } else if (activeTool === "face") {
        result = await faceAction({ imageUrl, clerkId: userId ?? undefined, caseId: projectId ?? undefined, scrapedData: rawScrapedData });
      } else if (activeTool === "phone") {
        result = await phoneAction({ phoneNumber, clerkId: userId ?? undefined, caseId: projectId ?? undefined });
      } else if (activeTool === "document") {
        result = await documentAction({ documentUrl, clerkId: userId ?? undefined, caseId: projectId ?? undefined, scrapedData: rawScrapedData });
      } else if (activeTool === "qrcode") {
        result = await qrcodeAction({ imageUrl, clerkId: userId ?? undefined, caseId: projectId ?? undefined, scrapedData: rawScrapedData });
      } else if (activeTool === "shadow") {
        result = await shadowAction({ username: query, clerkId: userId ?? undefined, caseId: projectId ?? undefined, scrapedData: rawScrapedData });
      } else if (activeTool === "nexus") {
        result = await nexusAction({ target: query, clerkId: userId ?? undefined, caseId: projectId ?? undefined, scrapedData: rawScrapedData });
      } else if (activeTool === "omni") {
        result = await omniAction({ query, clerkId: userId ?? undefined, caseId: projectId ?? undefined, scrapedData: rawScrapedData });
      } else if (activeTool === "breach") {
        result = await breachAction({ query, clerkId: userId ?? undefined, caseId: projectId ?? undefined, scrapedData: rawScrapedData });
      }
      if (result && typeof result === "object") {
        setDossier((result as any).dossier);
        setCurrentSearchId((result as any).searchId);
      } else {
        setDossier(result as any);
      }
    } catch (error) {
      console.error("Tool execution failed:", error);
      setDossier("### ❌ INVESTIGATION FAILED\nFailed to secure connection with the intelligence pipeline.");
    } finally {
      setLoading(false);
      setScrapeStatus("");
    }
  };

  if (idFromUrl) {
    if (!historicalSearch) {
      return (
        <div className="flex-grow flex flex-col items-center justify-center p-6 bg-white w-full h-full">
          <Loader2 className="w-10 h-10 animate-spin text-black" />
          <p className="mt-4 font-medium tracking-widest text-neutral-400 uppercase text-xs">Loading...</p>
        </div>
      );
    }

    return (
      <div className="flex-grow flex flex-col p-6 pt-16 relative z-10 w-full overflow-y-auto bg-white">
      <div className="max-w-4xl mx-auto w-full">
        {projectId && activeCase && (
          <div className="mb-6 p-4 bg-neutral-900 rounded-xl border border-neutral-700 shadow-2xl flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-neutral-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Active Workspace</span>
                  <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 text-[8px] font-bold uppercase tracking-widest border border-green-500/20">Sync Active</span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">{activeCase.name}</h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-4 border-r border-neutral-800 pr-4">
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Findings</div>
                <div className="text-sm font-bold text-neutral-300">{activeCase.searches.length} Records</div>
              </div>
              <button 
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete('projectId');
                  router.push(`/dashboard?${params.toString()}`);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                Exit Workspace
              </button>
            </div>
          </div>
        )}

        <div className="mb-12 border-b border-neutral-100 pb-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
              <History className="w-3 h-3" /> Historical Archive / {(historicalSearch.tool || "ORACLE").toUpperCase()}
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-black flex items-center gap-4">
              {historicalSearch.query}
              <span className="text-xs bg-neutral-100 px-3 py-1 rounded-md text-neutral-500 font-medium uppercase tracking-wider">
                Dossier #{historicalSearch._id.slice(-6)}
              </span>
            </h2>
          </div>
          
          <div className="prose prose-neutral max-w-none 
            [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:tracking-tight [&>h1]:mb-6
            [&>h2]:text-xs [&>h2]:font-bold [&>h2]:uppercase [&>h2]:tracking-widest [&>h2]:text-neutral-400 [&>h2]:mt-12 [&>h2]:mb-4 [&>h2]:border-t [&>h2]:border-neutral-100 [&>h2]:pt-6
            [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:text-black
            [&>p]:text-neutral-600 [&>p]:leading-relaxed [&>p]:mb-4 [&>p]:text-base
            [&>ul]:space-y-2 [&>ul]:mb-6 [&>ul>li]:text-neutral-600 [&>ul>li]:text-base [&>ul>li]:pl-2
            [&>strong]:text-black [&>strong]:font-bold
            [&>a]:text-black [&>a]:underline [&>a]:decoration-1 [&>a]:underline-offset-2 hover:[&>a]:opacity-70 transition-opacity
          ">
            <ReactMarkdown>{historicalSearch.dossier || ""}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  if (view === "cases") {
    return <CaseManager />;
  }

  if (view === "evidence") {
    return <EvidenceVault />;
  }

  return (
    <div className="flex h-dvh w-full bg-white overflow-hidden relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 w-72 border-r border-neutral-100 flex flex-col bg-neutral-50 z-50 shrink-0
        transition-transform duration-200 ease-out lg:translate-x-0 will-change-transform
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
               <Shield className="w-4 h-4 text-white" />
             </div>
             <span className="font-bold tracking-tight text-black">OSINT Nexus</span>
           </div>
           
           {/* Mobile Close Button */}
           <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 -mr-2 text-neutral-400 hover:text-black lg:hidden"
           >
             <CloseIcon className="w-5 h-5" />
           </button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
             <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4 px-2">Intelligence Modules</div>
             <div className="grid gap-1">
                {[
                  { id: "omni", icon: Sparkles, label: "OmniSearch" },
                  { id: "oracle", icon: Search, label: "Oracle" },
                  { id: "exif", icon: Camera, label: "EXIF Hunter" },
                  { id: "footprint", icon: Shield, label: "Footprint" },
                  { id: "face", icon: Search, label: "Face Recognition" },
                  { id: "phone", icon: Phone, label: "Phone Lookup" },
                  { id: "document", icon: FileText, label: "Document Analysis" },
                  { id: "qrcode", icon: QrCode, label: "QR Scanner" },
                  { id: "shadow", icon: Link, label: "Shadow Link" },
                  { id: "nexus", icon: Globe, label: "Network Nexus" },
                  { id: "breach", icon: ShieldAlert, label: "Breach Watch" },
                ].map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => { 
                        setActiveTool(tool.id as any); 
                        setDossier(""); 
                        setIsSidebarOpen(false); // Close on mobile
                      }}
                      className={`w-full p-2.5 rounded-xl transition-all text-left flex items-center gap-3 group relative ${
                        isActive
                          ? "bg-black text-white shadow-md shadow-black/5"
                          : "text-neutral-500 hover:bg-neutral-100 hover:text-black"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                        isActive ? "bg-white/10" : "bg-white border border-neutral-100 shadow-sm"
                      }`}>
                        <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-black"}`} />
                      </div>
                      <span className="text-xs font-bold truncate tracking-tight">{tool.label}</span>
                      {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-white animate-pulse" />}
                    </button>
                  );
                })}
             </div>
        </div>

        <div className="mt-auto p-4 border-t border-neutral-100 bg-white/50">
           <div className="flex items-center gap-3 p-2">
             <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold">
               {user?.firstName?.charAt(0) || "I"}
             </div>
             <div className="min-w-0">
               <div className="text-xs font-bold text-black truncate">{user?.firstName || "Investigator"}</div>
               <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-medium">Session Active</div>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto relative bg-white flex flex-col scroll-smooth">
        {/* Mobile Header Overlay */}
        <header className="fixed top-0 inset-x-0 h-16 bg-white/95 border-b border-neutral-100 z-30 lg:hidden flex items-center justify-between px-6">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
               <Shield className="w-4 h-4 text-white" />
             </div>
             <span className="font-bold tracking-tight text-black text-sm">OSINT Nexus</span>
           </div>
           <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -mr-2 text-black hover:bg-neutral-50 rounded-lg transition-colors"
           >
             <Menu className="w-6 h-6" />
           </button>
        </header>

        <div className="max-w-4xl mx-auto w-full p-6 lg:p-8 pt-24 lg:pt-20">
          {/* Personalized Greeting */}
          {!dossier && !loading && (
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold tracking-tight text-black mb-3">
                Hello, {user?.firstName || "Investigator"}.
              </h1>
              <p className="text-neutral-500 font-medium text-lg">
                The intelligence pipeline is ready. Choose a module to begin your search.
              </p>
            </div>
          )}

          {/* Persistent Tool Header (Contextual) */}
          {(dossier || loading) && (
            <div className="mb-8 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-between border-l-4 border-l-black">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                   {activeTool === "omni" ? <Sparkles className="w-5 h-5 text-white" /> : <Shield className="w-5 h-5 text-white" />}
                 </div>
                 <div>
                   <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Active Analysis</div>
                   <h2 className="text-sm font-bold text-black">{(activeTool).toUpperCase()} MODULE</h2>
                 </div>
               </div>
               <button 
                onClick={() => { setDossier(""); setQuery(""); }}
                className="text-[10px] font-bold text-neutral-400 hover:text-black uppercase tracking-widest transition-colors"
               >
                 New Investigation
               </button>
            </div>
          )}

          {/* Search Input Section */}
          <div className={`transition-all duration-500 ${dossier ? "scale-95 opacity-50 hover:opacity-100 cursor-pointer" : ""}`}>
            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden transition-all focus-within:shadow-md focus-within:border-neutral-300">
              <div className="flex flex-col">
                {activeTool === "exif" || activeTool === "face" ? (
                  <div className="px-4 py-8">
                    <input
                      type="file" id="imageUpload" className="hidden" accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setImageUrl(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <button
                      onClick={() => document.getElementById('imageUpload')?.click()}
                      className={`w-full flex flex-col items-center justify-center gap-4 py-12 rounded-xl border border-dashed transition-all ${
                        imageUrl ? 'bg-black text-white border-black' : 'bg-neutral-50 border-neutral-200 text-neutral-400 hover:border-neutral-300'
                      }`}
                    >
                      <div className={`p-4 rounded-full ${imageUrl ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                        <Camera className={`w-6 h-6 ${imageUrl ? 'text-white' : 'text-neutral-400'}`} />
                      </div>
                      <div className="text-center space-y-1">
                        <span className="block text-xs font-bold uppercase tracking-widest">
                          {imageUrl ? 'Image Ready' : activeTool === "face" ? 'Upload Face Photo' : 'Upload Evidence Photo'}
                        </span>
                        <span className="block text-[10px] opacity-50 font-medium">
                          {imageUrl ? 'Click to re-upload' : activeTool === "face" ? 'JPG / PNG for facial analysis' : 'JPG / PNG with EXIF data'}
                        </span>
                      </div>
                    </button>
                    {imageUrl && (
                      <div className="mt-4 px-4 py-3 bg-neutral-50 rounded-xl flex items-center justify-between border border-neutral-100">
                         <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Analysis Segment Ready</span>
                         <button
                          onClick={handleSearch}
                          disabled={loading}
                          className="bg-black text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-2"
                         >
                           {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Execute <ArrowRight className="w-3 h-3"/></>}
                         </button>
                      </div>
                    )}
                  </div>
                ) : activeTool === "phone" ? (
                  <div className="flex items-center gap-4 px-6 py-5">
                    <div className="shrink-0 p-2 bg-neutral-50 rounded-lg">
                      <Phone className="w-5 h-5 text-black" />
                    </div>
                    <input
                      autoFocus
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter phone number..."
                      className="bg-transparent border-none outline-none text-xl font-medium text-black placeholder:text-neutral-200 w-full"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                      }}
                    />
                    <button
                      onClick={handleSearch}
                      disabled={loading || !phoneNumber}
                      className="shrink-0 w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white hover:bg-neutral-800 transition-all active:scale-95 disabled:bg-neutral-100 disabled:text-neutral-300"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                    </button>
                  </div>
                ) : activeTool === "document" ? (
                  <div className="px-4 py-8">
                    <input
                      type="file" id="documentUpload" className="hidden" accept=".pdf,.doc,.docx,.txt,.rtf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setDocumentUrl(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <button
                      onClick={() => document.getElementById('documentUpload')?.click()}
                      className={`w-full flex flex-col items-center justify-center gap-4 py-12 rounded-xl border border-dashed transition-all ${
                        documentUrl ? 'bg-black text-white border-black' : 'bg-neutral-50 border-neutral-200 text-neutral-400 hover:border-neutral-300'
                      }`}
                    >
                      <div className={`p-4 rounded-full ${documentUrl ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                        <FileText className={`w-6 h-6 ${documentUrl ? 'text-white' : 'text-neutral-400'}`} />
                      </div>
                      <div className="text-center space-y-1">
                        <span className="block text-xs font-bold uppercase tracking-widest">
                          {documentUrl ? 'Document Ready' : 'Upload Document'}
                        </span>
                        <span className="block text-[10px] opacity-50 font-medium">
                          {documentUrl ? 'Click to re-upload' : 'PDF / DOCX / TXT'}
                        </span>
                      </div>
                    </button>
                    {documentUrl && (
                      <div className="mt-4 px-4 py-3 bg-neutral-50 rounded-xl flex items-center justify-between border border-neutral-100">
                         <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Analysis Segment Ready</span>
                         <button
                          onClick={handleSearch}
                          disabled={loading}
                          className="bg-black text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-2"
                         >
                           {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Execute <ArrowRight className="w-3 h-3"/></>}
                         </button>
                      </div>
                    )}
                  </div>
                ) : activeTool === "qrcode" ? (
                  <div className="px-4 py-8">
                    <input
                      type="file" id="qrcodeUpload" className="hidden" accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setImageUrl(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <button
                      onClick={() => document.getElementById('qrcodeUpload')?.click()}
                      className={`w-full flex flex-col items-center justify-center gap-4 py-12 rounded-xl border border-dashed transition-all ${
                        imageUrl ? 'bg-black text-white border-black' : 'bg-neutral-50 border-neutral-200 text-neutral-400 hover:border-neutral-300'
                      }`}
                    >
                      <div className={`p-4 rounded-full ${imageUrl ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                        <QrCode className={`w-6 h-6 ${imageUrl ? 'text-white' : 'text-neutral-400'}`} />
                      </div>
                      <div className="text-center space-y-1">
                        <span className="block text-xs font-bold uppercase tracking-widest">
                          {imageUrl ? 'QR Code Ready' : 'Upload QR Code Image'}
                        </span>
                        <span className="block text-[10px] opacity-50 font-medium">
                          {imageUrl ? 'Click to re-upload' : 'JPG / PNG with QR code'}
                        </span>
                      </div>
                    </button>
                    {imageUrl && (
                      <div className="mt-4 px-4 py-3 bg-neutral-50 rounded-xl flex items-center justify-between border border-neutral-100">
                         <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Analysis Segment Ready</span>
                         <button
                          onClick={handleSearch}
                          disabled={loading}
                          className="bg-black text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-2"
                         >
                           {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Execute <ArrowRight className="w-3 h-3"/></>}
                         </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-4 px-6 py-5">
                    <div className="shrink-0 p-2 bg-neutral-50 rounded-lg">
                      {activeTool === "omni" || activeTool === "oracle" ? <Sparkles className="w-5 h-5 text-black" /> : <Shield className="w-5 h-5 text-black" />}
                    </div>
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={
                        activeTool === "omni" ? "Global target (name, handle, or organization)..." :
                        activeTool === "oracle" ? "Identify target or organization..." : 
                        activeTool === "shadow" ? "Enter username to correlate..." :
                        activeTool === "nexus" ? "Enter domain or IP to map..." :
                        activeTool === "breach" ? "Enter email or handle for breach scan..." :
                        "Trace handle, email or username..."
                      }
                      className="bg-transparent border-none outline-none text-xl font-medium text-black placeholder:text-neutral-200 w-full"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                      }}
                    />
                    <button
                      onClick={handleSearch}
                      disabled={loading || !query}
                      className="shrink-0 w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white hover:bg-neutral-800 transition-all active:scale-95 disabled:bg-neutral-100 disabled:text-neutral-300"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                    </button>
                  </div>
                )}

                {activeTool === "oracle" && (
                  <div className="grid grid-cols-2 gap-px bg-neutral-100 border-t border-neutral-100">
                    <div className="flex items-center gap-3 px-6 py-4 bg-white transition-colors focus-within:bg-neutral-50/50">
                      <MapPin className="w-4 h-4 text-neutral-300" />
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Location focus (optional)"
                        className="bg-transparent border-none outline-none text-sm font-medium text-black placeholder:text-neutral-300 w-full"
                      />
                    </div>
                    <div className="flex items-center gap-3 px-6 py-4 bg-white transition-colors focus-within:bg-neutral-50/50 border-l border-neutral-100">
                      <Tag className="w-4 h-4 text-neutral-300" />
                      <input
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="Contextual keywords"
                        className="bg-transparent border-none outline-none text-sm font-medium text-black placeholder:text-neutral-300 w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading && !dossier ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-black" />
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 animate-pulse">
                {scrapeStatus || "Syncing Data Layer..."}
              </p>
            </div>
          ) : dossier ? (
            <div className="mt-16 duration-500">
               {correlations.length > 0 && activeTool === "shadow" && (
                  <div className="mb-10 p-6 bg-neutral-50 rounded-2xl border border-neutral-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                        <Link className="w-3 h-3" /> Identity Correlation Map
                      </h3>
                      <div className="text-[10px] font-bold text-neutral-400 bg-white px-3 py-1 rounded-full border border-neutral-100">
                        Scanning {correlations.length} Platforms
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {correlations.map((c, i) => (
                        <div key={i} className={`flex items-center gap-2 p-2.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-[1.02] ${
                          c.status === "found" 
                            ? "bg-black text-white border-black" 
                            : "bg-white text-neutral-300 border-neutral-100 grayscale hover:grayscale-0"
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.status === "found" ? "bg-green-400 animate-pulse" : "bg-neutral-200"}`} />
                          <span className="truncate">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
               )}

               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 text-black pb-4 border-b border-neutral-100 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base lg:text-lg font-bold tracking-tight leading-none mb-1 truncate">Intelligence Report</h3>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 truncate">Context: {query || "Active Analysis"}</div>
                    </div>
                  </div>

                  {/* Case Assignment */}
                  <div className="relative w-full sm:w-auto">
                     <button 
                      onClick={() => setIsCaseSelectorOpen(!isCaseSelectorOpen)}
                      className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-4 py-2 bg-neutral-50 border border-neutral-100 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-black transition-all"
                     >
                       <span className="flex items-center gap-2"><Briefcase className="w-3 h-3" /> Assign to Case</span>
                       <ChevronDown className="w-3 h-3" />
                     </button>

                     {isCaseSelectorOpen && (
                       <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-100 rounded-2xl shadow-2xl z-50 p-2">
                          <div className="px-3 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50 mb-1">Select Active Case</div>
                          <div className="max-h-48 overflow-y-auto">
                            {cases?.map(c => (
                              <button 
                                key={c._id}
                                onClick={async () => {
                                  if (currentSearchId) {
                                    await assignToCase({ searchId: currentSearchId as any, caseId: c._id });
                                  }
                                  setIsCaseSelectorOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium hover:bg-neutral-50 flex items-center justify-between"
                              >
                                {c.name}
                                <Check className={`w-3 h-3 ${currentSearchId ? "opacity-100 text-green-500" : "opacity-0"}`} />
                              </button>
                            ))}
                          </div>
                       </div>
                     )}
                  </div>
               </div>
               <div className="prose prose-neutral max-w-none 
                  [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:tracking-tight [&>h1]:mb-6
                  [&>h2]:text-xs [&>h2]:font-bold [&>h2]:uppercase [&>h2]:tracking-widest [&>h2]:text-neutral-400 [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:border-t [&>h2]:border-neutral-100 [&>h2]:pt-6
                  [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:text-black
                  [&>p]:text-neutral-600 [&>p]:leading-relaxed [&>p]:mb-4 [&>p]:text-base
                  [&>ul]:space-y-2 [&>ul]:mb-6 [&>ul>li]:text-neutral-600 [&>ul>li]:text-base [&>ul>li]:pl-2
                  [&>strong]:text-black [&>strong]:font-bold
                ">
                  <ReactMarkdown>{dossier}</ReactMarkdown>
                </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
