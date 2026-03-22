import { Sidebar } from "./sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-white text-black overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-grow flex flex-col relative overflow-hidden bg-white min-w-0">
        {children}
      </main>
    </div>
  );
}
