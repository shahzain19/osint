"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useState, useRef } from "react";
import { Shield, Globe, Camera, FileText, QrCode, ExternalLink, Trash, Search, Upload, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EvidenceVault() {
  const [filter, setFilter] = useState<string>("all");
  const [showGlobal, setShowGlobal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") as any;
  const { userId } = useAuth();

  const evidence = useQuery(api.evidence.listEvidence, { clerkId: userId ?? "" });
  const deleteMutation = useMutation(api.evidence.deleteEvidence);
  const generateUploadUrl = useMutation(api.evidence.generateUploadUrl);
  const addEvidence = useMutation(api.evidence.addEvidence);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    setIsUploading(true);
    try {
      // 1. Get a short-lived upload URL from Convex
      const postUrl = await generateUploadUrl({ clerkId: userId });

      // 2. POST the file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) throw new Error("Upload failed");
      
      const { storageId } = await result.json();

      // 3. Save the evidence link
      await addEvidence({
        clerkId: userId,
        caseId: projectId ?? undefined,
        type: file.type.startsWith("image") ? "image" : "document",
        fileId: storageId,
        name: file.name,
        tags: ["uploaded"],
      });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredEvidence = evidence?.filter(item => {
    const typeMatch = filter === "all" || item.type === filter;
    const projectMatch = showGlobal || !projectId || item.caseId === projectId;
    return typeMatch && projectMatch;
  });

  return (
    <div className="flex-grow flex flex-col p-8 pt-20 max-w-6xl mx-auto w-full overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
            <Shield className="w-3 h-3" /> Secure Evidence Vault
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-black mb-2 leading-none">Intelligence Archive</h1>
          <p className="text-neutral-500 font-medium">
            {projectId && !showGlobal ? "Viewing project-specific forensic artifacts." : "Auto-captured artifacts from all active investigations."}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           {projectId && (
             <button 
               onClick={() => setShowGlobal(!showGlobal)}
               className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                 showGlobal 
                   ? "bg-black text-white border-black shadow-lg" 
                   : "bg-white text-neutral-400 border-neutral-200 hover:text-black"
               }`}
             >
               {showGlobal ? "Showing Global Archive" : "Show All Project Evidence"}
             </button>
           )}

           <input
             type="file"
             className="hidden"
             ref={fileInputRef}
             onChange={handleUpload}
             accept="image/*,.pdf,.doc,.docx,.txt"
           />

           <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-black text-white hover:bg-neutral-800 rounded-xl px-6 h-12 flex items-center gap-2 text-sm font-bold shadow-xl shadow-black/10"
           >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isUploading ? "Uploading..." : "Upload Evidence"}
           </Button>

           <div className="h-8 w-px bg-neutral-100 mx-2" />

           {[
             { id: "all", label: "All Assets", icon: Globe },
             { id: "image", label: "Images", icon: Camera },
             { id: "document", label: "Docs", icon: FileText },
             { id: "qr", label: "QR Codes", icon: QrCode },
           ].map((btn) => {
             const Icon = btn.icon;
             return (
               <button
                 key={btn.id}
                 onClick={() => setFilter(btn.id)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                   filter === btn.id 
                    ? "bg-white text-black shadow-md shadow-black/5" 
                    : "text-neutral-400 hover:text-black"
                 }`}
               >
                 <Icon className="w-3 h-3" /> {btn.label}
               </button>
             );
           })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredEvidence?.map((item) => (
          <div key={item._id} className="group relative aspect-square bg-neutral-50 rounded-2xl border border-neutral-100 overflow-hidden hover:border-black hover:shadow-2xl hover:shadow-black/5 transition-all">
            {item.type === "image" ? (
              <img src={item.url} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                 <div className="w-12 h-12 rounded-xl bg-white border border-neutral-100 flex items-center justify-center mb-4 shadow-sm group-hover:bg-black group-hover:text-white transition-colors">
                    {item.type === "document" ? <FileText className="w-6 h-6" /> : <QrCode className="w-6 h-6" />}
                 </div>
                 <div className="text-[10px] font-bold text-black uppercase tracking-widest line-clamp-2">{item.name}</div>
              </div>
            )}
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
               <div className="text-[10px] font-bold text-white uppercase tracking-widest mb-2 px-4 text-center">{item.name}</div>
               <div className="flex items-center gap-2">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-white rounded-xl text-black hover:bg-neutral-100 transition-colors shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => deleteMutation({ id: item._id, clerkId: userId ?? "" })}
                    className="p-3 bg-red-500 rounded-xl text-white hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
               </div>
               <div className="mt-4 flex flex-wrap gap-1 px-4 justify-center">
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-white/10 text-[8px] font-bold uppercase tracking-wider text-white rounded">#{tag}</span>
                  ))}
               </div>
            </div>
          </div>
        ))}
        
        {filteredEvidence?.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 rounded-2xl bg-neutral-50 flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-neutral-200" />
             </div>
             <h3 className="text-xl font-bold text-black mb-2">No evidence found</h3>
             <p className="text-neutral-400 font-medium max-w-xs">Try adjusting your filters or conduct new investigations to populate the vault.</p>
          </div>
        )}
      </div>
    </div>
  );
}
