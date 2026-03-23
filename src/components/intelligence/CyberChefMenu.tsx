"use client";

import { useEffect, useState, useRef } from "react";
import { Copy, Check, X, Wand2, Braces, Globe, Network, Key } from "lucide-react";

export function CyberChefMenu() {
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [result, setResult] = useState<{ title: string; content: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim() && !selection.isCollapsed) {
          try {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Ignore if the selection is inside our own menu UI or modal
            if (menuRef.current && menuRef.current.contains(selection.anchorNode)) return;
            // Also restrict if it's an input or textarea to avoid interfering with native behavior
            if (selection.anchorNode?.parentElement?.tagName === 'INPUT' || selection.anchorNode?.parentElement?.tagName === 'TEXTAREA') return;

            setSelectionRect(rect);
            setSelectedText(selection.toString());
          } catch (e) {
            setSelectionRect(null);
          }
        } else {
          setSelectionRect(null);
        }
      }, 10);
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Don't close if clicking inside the menu
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return; 
      }
      setSelectionRect(null);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  // Action handlers
  const handleBase64 = () => {
    try {
      setResult({ title: "Base64 Decoded", content: atob(selectedText) });
    } catch {
      setResult({ title: "Error", content: "Invalid Base64 string." });
    }
    setSelectionRect(null);
  };

  const handleJWT = () => {
    try {
      const parts = selectedText.split(".");
      if (parts.length !== 3) throw new Error();
      const payload = JSON.parse(atob(parts[1]));
      setResult({ title: "JWT Payload", content: JSON.stringify(payload, null, 2) });
    } catch {
      setResult({ title: "Error", content: "Invalid JWT representation." });
    }
    setSelectionRect(null);
  };

  const handleIPs = () => {
    const ipv4Regex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
    const matches = selectedText.match(ipv4Regex) || [];
    setResult({ title: "Extracted IPs", content: matches.length ? matches.join("\n") : "No IPs found." });
    setSelectionRect(null);
  };

  const handleURLs = () => {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const matches = selectedText.match(urlRegex) || [];
    setResult({ title: "Extracted URLs", content: matches.length ? matches.join("\n") : "No URLs found." });
    setSelectionRect(null);
  };

  const handleJSON = () => {
    try {
      const parsed = JSON.parse(selectedText);
      setResult({ title: "Formatted JSON", content: JSON.stringify(parsed, null, 2) });
    } catch {
      setResult({ title: "Error", content: "Invalid JSON format." });
    }
    setSelectionRect(null);
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {selectionRect && !result && (
        <div 
          ref={menuRef}
          className="fixed z-[9999] bg-black text-white px-2 py-1.5 rounded-xl shadow-2xl flex items-center gap-1 animate-in fade-in zoom-in-95 pointer-events-auto"
          style={{
            top: `${Math.max(10, selectionRect.top - 50)}px`,
            left: `${Math.max(10, selectionRect.left + (selectionRect.width / 2) - 130)}px`,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mr-2 ml-1">Tools</div>
          <button onClick={handleBase64} className="p-1.5 hover:bg-neutral-800 rounded-lg group transition-colors" title="Decode Base64"><Wand2 className="w-4 h-4 text-neutral-300 group-hover:text-white" /></button>
          <button onClick={handleJWT} className="p-1.5 hover:bg-neutral-800 rounded-lg group transition-colors" title="Parse JWT"><Key className="w-4 h-4 text-neutral-300 group-hover:text-white" /></button>
          <button onClick={handleIPs} className="p-1.5 hover:bg-neutral-800 rounded-lg group transition-colors" title="Extract IPs"><Network className="w-4 h-4 text-neutral-300 group-hover:text-white" /></button>
          <button onClick={handleURLs} className="p-1.5 hover:bg-neutral-800 rounded-lg group transition-colors" title="Extract URLs"><Globe className="w-4 h-4 text-neutral-300 group-hover:text-white" /></button>
          <button onClick={handleJSON} className="p-1.5 hover:bg-neutral-800 rounded-lg group transition-colors" title="Pretty JSON"><Braces className="w-4 h-4 text-neutral-300 group-hover:text-white" /></button>
        </div>
      )}

      {result && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in pointer-events-auto" onClick={() => setResult(null)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-neutral-100 w-full max-w-2xl overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="font-bold text-black flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-neutral-500" /> {result.title}
              </h3>
              <button onClick={() => setResult(null)} className="p-1 text-neutral-400 hover:text-black hover:bg-neutral-200 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-neutral-950 text-neutral-300 font-mono text-xs max-h-[60vh] overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {result.content}
            </div>
            <div className="p-4 bg-white border-t border-neutral-100 flex justify-end">
              <button 
                onClick={copyResult} 
                className="bg-black text-white hover:bg-neutral-800 rounded-lg text-xs font-bold uppercase tracking-widest h-9 px-6 flex items-center gap-2 shadow-sm transition-colors"
                >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Result"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
