import { Suspense } from "react";
import { DashboardContent } from "./DashboardContent";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-white w-full h-full">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-100" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
