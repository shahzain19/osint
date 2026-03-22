"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Search, History, Settings, Plus, ShieldCheck, ChevronLeft, Menu, Sparkles, Shield, Camera, Briefcase, FileArchive, Filter, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [filterTool, setFilterTool] = useState("all");
  const [filterText, setFilterText] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeView = searchParams.get("view");
  const activeId = searchParams.get("id");
  const projectId = searchParams.get("projectId");
  const { userId } = useAuth();

  const searches = useQuery(api.searches.listUserSearches, { 
    clerkId: userId ?? undefined,
    tool: filterTool === "all" ? undefined : filterTool,
    searchQuery: filterText || undefined,
  });

  // Filter searches by project if active
  const projectSearches = searches?.filter(s => !projectId || s.caseId === projectId);

  if (!isOpen) {
    return (
      <aside className="w-16 border-r border-neutral-200 flex flex-col bg-neutral-50 items-center py-6 transition-all shrink-0">
        <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div className="flex-grow" />
        <div className="pb-4">
          <UserButton />
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r border-neutral-200 flex flex-col bg-neutral-50 transition-all shrink-0">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/dashboard')}>
          <div className="bg-black p-1.5 rounded-lg">
            <Search className="w-5 h-5 text-white stroke-[2]" />
          </div>
          <span className="font-bold tracking-tight text-lg uppercase">Baynaqab</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-black transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 mb-6 space-y-2">
        <Button 
          onClick={() => router.push('/dashboard')} 
          variant={!activeView && !activeId ? "secondary" : "outline"} 
          className="w-full justify-start gap-2 border-neutral-200 shadow-sm rounded-lg font-bold uppercase text-[10px] tracking-widest"
        >
          <Plus className="w-4 h-4" />
          New Search
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => router.push('/dashboard?view=cases')} 
            variant={activeView === "cases" ? "secondary" : "outline"}
            className="justify-start gap-2 border-neutral-200 shadow-sm rounded-lg font-bold uppercase text-[9px] tracking-widest px-2"
          >
            <Briefcase className="w-3 h-3" />
            Cases
          </Button>
          <Button 
            onClick={() => router.push('/dashboard?view=evidence')} 
            variant={activeView === "evidence" ? "secondary" : "outline"}
            className="justify-start gap-2 border-neutral-200 shadow-sm rounded-lg font-bold uppercase text-[9px] tracking-widest px-2"
          >
            <FileArchive className="w-3 h-3" />
            Vault
          </Button>
        </div>
      </div>

      <div className="px-6 mb-4">
         <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input 
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter archive..."
              className="w-full bg-neutral-100 border-none rounded-lg pl-9 pr-3 py-2 text-[11px] font-medium focus:ring-1 focus:ring-black/5"
            />
         </div>
         <div className="flex flex-wrap gap-1">
            {["all", "oracle", "exif", "shadow", "footprint"].map(tool => (
              <button 
                key={tool}
                onClick={() => setFilterTool(tool)}
                className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider transition-all ${
                  filterTool === tool ? "bg-black text-white" : "bg-neutral-100 text-neutral-400 hover:text-black"
                }`}
              >
                {tool}
              </button>
            ))}
         </div>
      </div>

      <ScrollArea className="flex-grow px-6">
        <div className="space-y-1">
          <div className="px-2 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center justify-between">
            {projectId ? "Project Archive" : "Search Archive"}
            {projectSearches && projectSearches.length > 0 && <span className="text-neutral-200">{projectSearches.length}</span>}
          </div>
          {projectSearches === undefined ? (
            <div className="text-xs text-neutral-400 px-2 font-medium">Loading history...</div>
          ) : projectSearches.length === 0 ? (
            <div className="text-xs text-neutral-400 px-2 font-medium">No records found.</div>
          ) : (
            projectSearches.map((search) => (
              <button
                key={search._id}
                onClick={() => router.push(`/dashboard?id=${search._id}`)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-3 border ${
                  activeId === search._id 
                  ? "bg-white text-black border-neutral-200 shadow-sm" 
                  : "text-neutral-600 hover:bg-white hover:text-black hover:border-neutral-200 border-transparent"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                  {search.tool === "exif" ? (
                    <Camera className="w-4 h-4" />
                  ) : search.tool === "footprint" ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{search.query}</span>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{search.tool || "oracle"}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-neutral-200 space-y-2 bg-white">
        <Button variant="ghost" className="w-full justify-start gap-3 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg font-medium">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
        <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-50 border border-neutral-200">
          <UserButton />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium truncate">Investigator</span>
            <span className="text-[10px] text-black font-semibold flex items-center gap-1 uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 stroke-[2]" /> Verified
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
