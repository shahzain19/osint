"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Briefcase, Plus, Search, Calendar, ChevronRight, FolderPlus, Loader2, FileText, ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function CaseManager() {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");
  
  const { userId } = useAuth();
  const router = useRouter();

  const cases = useQuery(api.cases.listCases, { clerkId: userId ?? "" });
  const createCase = useMutation(api.cases.createCase);
  const createDocument = useMutation(api.documents.createDocument);
  const deleteDocument = useMutation(api.documents.deleteDocument);
  
  const selectedCase = useQuery(api.cases.getCaseWithSearches, 
    selectedCaseId ? { caseId: selectedCaseId as any } : "skip"
  );

  const handleCreate = async () => {
    if (!newName || !userId) return;
    await createCase({ name: newName, description: newDesc, clerkId: userId });
    setIsCreating(false);
    setNewName("");
    setNewDesc("");
  };

  const handleAddDocument = async () => {
    if (!docTitle || !docContent || !selectedCaseId || !userId) return;
    await createDocument({
      title: docTitle,
      content: docContent,
      caseId: selectedCaseId as any,
      clerkId: userId,
    });
    setIsAddingDoc(false);
    setDocTitle("");
    setDocContent("");
  };

  if (selectedCaseId && selectedCase) {
    return (
      <div className="flex-grow flex flex-col p-8 pt-20 max-w-5xl mx-auto w-full overflow-y-auto">
        <button 
          onClick={() => setSelectedCaseId(null)}
          className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6 hover:text-black transition-colors flex items-center gap-2"
        >
          ← Back to Cases
        </button>

        <div className="mb-12 border-b border-neutral-100 pb-8 flex items-center justify-between gap-4">
           <div>
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                <Briefcase className="w-4 h-4" /> Active Investigation / Case File
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-black mb-4">
                {selectedCase.name}
              </h1>
              <p className="text-lg text-neutral-500 max-w-2xl leading-relaxed">
                {selectedCase.description || "No case description provided."}
              </p>
           </div>
           <Button 
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set('projectId', selectedCase._id);
                params.delete('view');
                router.push(`/dashboard?${params.toString()}`);
              }}
              className="bg-black text-white hover:bg-neutral-800 rounded-xl px-6 h-12 flex items-center gap-2 text-sm font-bold shadow-xl shadow-black/10"
           >
              <Play className="w-4 h-4" /> Open Workspace
           </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            {/* Case Documents */}
            <section>
              <div className="flex items-center justify-between mb-6 border-b border-neutral-100 pb-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Internal Case Documents</h2>
                <button 
                  onClick={() => setIsAddingDoc(!isAddingDoc)}
                  className="text-[10px] font-bold uppercase tracking-widest text-black hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New Document
                </button>
              </div>

              {isAddingDoc && (
                <div className="mb-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
                  <input 
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Document Title"
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none"
                  />
                  <textarea 
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    placeholder="Document content (Markdown supported)..."
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm min-h-[150px] focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <Button onClick={handleAddDocument} className="bg-black text-white hover:bg-neutral-800 rounded-lg px-6 py-2 font-bold text-[10px] uppercase h-8">Save Document</Button>
                    <Button onClick={() => setIsAddingDoc(false)} variant="ghost" className="text-neutral-400 hover:text-black font-bold text-[10px] uppercase h-8">Cancel</Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 mb-12">
                {selectedCase.documents?.map((doc: any) => (
                  <div key={doc._id} className="p-6 bg-white border border-neutral-100 rounded-2xl hover:border-neutral-300 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-black flex items-center gap-2">
                        <FileText className="w-4 h-4 text-neutral-400" /> {doc.title}
                      </h3>
                      <button 
                        onClick={() => deleteDocument({ id: doc._id, clerkId: userId ?? "" })}
                        className="text-[10px] font-bold uppercase tracking-widest text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="prose prose-sm prose-neutral max-w-none text-neutral-600">
                       <ReactMarkdown>{doc.content}</ReactMarkdown>
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-50 text-[9px] font-bold uppercase tracking-widest text-neutral-300">
                      Created {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {selectedCase.documents?.length === 0 && !isAddingDoc && (
                  <div className="py-12 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 mb-12">
                     <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">No documents drafted for this case file.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Case Summary (AI Generated) */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6 border-b border-neutral-100 pb-2"> Discovery Summary</h2>
              <div className="prose prose-neutral max-w-none bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                <ReactMarkdown>{selectedCase.summary || "No automated summary generated yet. Intelligence synthesis pending."}</ReactMarkdown>
              </div>
            </section>

            {/* Evidence & Findings */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6 border-b border-neutral-100 pb-2">Linked Investigations</h2>
              <div className="space-y-4">
                {selectedCase.searches.map((search: any) => (
                  <div key={search._id} className="p-5 rounded-2xl border border-neutral-100 bg-white hover:border-neutral-300 transition-all group flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-black font-bold text-xs uppercase shadow-inner">
                          {search.tool?.[0] || "O"}
                        </div>
                        <div>
                          <div className="font-bold text-black">{search.query}</div>
                          <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-2">
                             {search.tool} • {new Date(search.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-300 hover:text-black transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
             <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Case Evidence</h3>
                <div className="grid grid-cols-2 gap-2">
                   {selectedCase.evidence.map((item: any) => (
                      <div key={item._id} className="aspect-square bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 hover:scale-[1.05] transition-transform cursor-pointer">
                         {item.type === "image" ? (
                           <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-[10px] font-bold uppercase text-neutral-400 p-2 text-center">
                             {item.name}
                           </div>
                         )}
                      </div>
                   ))}
                </div>
             </section>
             
             <section className="p-6 bg-black rounded-2xl text-white">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Intelligence Synthesis</h3>
                <p className="text-[11px] leading-relaxed text-neutral-300 mb-4">
                   Run a cross-tool correlation scan to link disparate findings across this case file.
                </p>
                <Button className="w-full bg-white text-black hover:bg-neutral-100 text-xs font-bold uppercase tracking-wider h-10">
                   Synthesize Case
                </Button>
             </section>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col p-8 pt-20 max-w-5xl mx-auto w-full overflow-y-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-black mb-2">Case Files</h1>
          <p className="text-neutral-500 font-medium">Manage and group related intelligence discovery.</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-black text-white hover:bg-neutral-800 rounded-xl px-6 h-12 flex items-center gap-2 text-sm font-bold shadow-xl shadow-black/10"
        >
          <FolderPlus className="w-4 h-4" /> Create New Case
        </Button>
      </div>

      {isCreating && (
        <div className="mb-10 p-8 bg-neutral-50 rounded-2xl border border-neutral-200 animate-in fade-in slide-in-from-top-4 duration-300">
           <div className="flex flex-col gap-6 max-w-xl">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Case Identity</label>
                <input 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Operation Ghost Trace"
                  className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-lg font-bold placeholder:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Description / Context</label>
                <textarea 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Primary objective and background information..."
                  className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleCreate} className="bg-black text-white hover:bg-neutral-800 rounded-lg px-8 py-2 font-bold text-xs uppercase">Initialize Case</Button>
                <Button onClick={() => setIsCreating(false)} variant="ghost" className="text-neutral-400 hover:text-black font-bold text-xs uppercase">Cancel</Button>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases?.map((c) => (
          <button 
            key={c._id} 
            onClick={() => setSelectedCaseId(c._id)}
            className="p-6 bg-white border border-neutral-100 rounded-2xl hover:border-black hover:shadow-2xl hover:shadow-black/5 transition-all text-left flex flex-col h-full group"
          >
             <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors shadow-inner">
                <Briefcase className="w-5 h-5" />
             </div>
             <div className="flex-grow">
               <h3 className="text-xl font-bold text-black mb-2 leading-tight">{c.name}</h3>
               <p className="text-sm text-neutral-500 line-clamp-2 font-medium mb-6">
                 {c.description || "No description provided for this case file."}
               </p>
             </div>
             <div className="flex items-center justify-between pt-6 border-t border-neutral-50 mt-auto">
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-300">
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-black">
                   Open File <ChevronRight className="w-3 h-3" />
                </div>
             </div>
          </button>
        ))}
      </div>
    </div>
  );
}
