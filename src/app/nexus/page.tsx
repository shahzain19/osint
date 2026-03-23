import { Suspense } from "react";
import { NexusContent } from "./NexusContent";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function NexusPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-[#050505] w-full h-full min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-800" />
      </div>
    }>
      <NexusContent />
    </Suspense>
  );
}
