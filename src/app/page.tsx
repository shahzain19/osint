"use client";
export const dynamic = "force-dynamic";

import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Search, Shield, Users, Zap, Globe, Fingerprint, Camera, Database,
  HelpCircle, ArrowRight, Activity, Lock, SearchCode, Sparkles, Check,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isHoveringSearch, setIsHoveringSearch] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mounted && isLoaded && userId) {
      router.push("/dashboard");
    }
  }, [isLoaded, userId, mounted, router]);

  if (!mounted) null; // Return null instead of nothing to avoid flicker before hydration, wait, we must return null if not mounted but letting it render safely

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF9] text-[#292524] font-sans selection:bg-[#E7E5E4] selection:text-[#1C1917] overflow-hidden">
      
      {/* Soft Ambient Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Warm radial gradient */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-[#FDE68A]/20 via-[#FED7AA]/10 to-transparent blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-bl from-[#E2E8F0]/40 via-[#F1F5F9]/30 to-transparent blur-[120px] mix-blend-multiply opacity-60" />
        
        {/* Subtle dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.4]" 
          style={{ 
            backgroundImage: 'radial-gradient(#D6D3D1 1.5px, transparent 1.5px)', 
            backgroundSize: '32px 32px',
            transform: `translateY(${scrollY * 0.15}px)` // Parallax effect
          }}
        />
      </div>

      {/* Floating Header */}
      <header className={`px-6 py-4 fixed w-full top-0 z-50 transition-all duration-500 ${scrollY > 20 ? 'bg-[#FAFAF9]/80 backdrop-blur-xl border-b border-[#E7E5E4] py-3 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
            <div className="bg-[#1C1917] p-2 rounded-xl group-hover:scale-105 group-hover:bg-[#292524] transition-all duration-300 shadow-md">
              <Search className="w-5 h-5 text-[#FAFAF9] stroke-[2.5]" />
            </div>
            <span className="text-xl font-bold tracking-tight uppercase text-[#1C1917] group-hover:opacity-80 transition-opacity">Baynaqab</span>
          </div>
          <div className="flex items-center gap-6">
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="text-sm font-semibold text-[#57534E] hover:text-[#1C1917] transition-colors">
                Log In
              </button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="px-5 py-2.5 bg-[#1C1917] text-[#FAFAF9] hover:bg-[#292524] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm font-semibold rounded-xl active:scale-95 shadow-md">
                Get Started
              </button>
            </SignUpButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center pt-40 pb-32 relative z-10 w-full min-h-[90vh]">
        <div className="max-w-4xl space-y-10 w-full">
          
          <FadeIn delay={100}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F5F4] border border-[#E7E5E4] text-xs font-bold text-[#57534E] shadow-sm mb-4 tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              The Next Generation Intelligence Protocol
            </div>
          </FadeIn>

          <FadeIn delay={300}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#1C1917] leading-[1.1]">
              Unmask the <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1C1917] to-[#78716C]">Information.</span><br />
              <span className="relative">
                Discover Truth.
                <div className="absolute -bottom-2 left-0 w-full h-3 bg-[#FDE68A]/60 -z-10 transform -rotate-1 rounded-sm"></div>
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={500}>
            <p className="text-lg md:text-xl text-[#57534E] max-w-2xl mx-auto leading-relaxed font-medium">
              The professional cozy OSINT engine for elite researchers. Gather, analyze, and organize digital footprints with absolute precision and warm clarity.
            </p>
          </FadeIn>

          {/* Interactive Search Bar */}
          <FadeIn delay={700}>
            <div 
              className="max-w-2xl mx-auto w-full relative mt-8 z-20"
              onMouseEnter={() => setIsHoveringSearch(true)}
              onMouseLeave={() => setIsHoveringSearch(false)}
            >
              <div className={`relative transform transition-all duration-500 ${isHoveringSearch ? 'scale-[1.02] shadow-2xl shadow-[#D6D3D1]/50' : 'scale-100 shadow-xl shadow-[#D6D3D1]/30'} rounded-2xl bg-white/80 backdrop-blur-xl border border-[#E7E5E4] overflow-hidden`}>
                
                {/* Glow behind input */}
                <div className={`absolute inset-0 bg-gradient-to-r from-[#FDE68A]/0 via-[#FDE68A]/20 to-[#FDE68A]/0 transition-opacity duration-700 ${isHoveringSearch ? 'opacity-100' : 'opacity-0'} pointer-events-none`}></div>
                
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Search className={`h-5 w-5 transition-colors duration-300 ${isHoveringSearch ? 'text-[#1C1917]' : 'text-[#A8A29E]'}`} />
                </div>
                
                <input 
                  type="text" 
                  placeholder="Enter a target, IP, domain..." 
                  className="w-full pl-14 pr-44 py-6 bg-transparent text-lg font-medium text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:bg-white transition-colors relative z-10"
                />
                
                <div className="absolute inset-y-0 right-2 flex items-center z-20">
                  <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                    <button className="px-6 py-3 bg-[#1C1917] text-white hover:bg-[#292524] transition-all text-sm font-bold rounded-xl flex items-center gap-2 m-1 shadow-md hover:shadow-xl active:scale-95 group overflow-hidden relative">
                      <span className="relative z-10 flex items-center gap-2">
                        Query
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                      {/* Button shine effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1s_forwards] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 z-0"></div>
                    </button>
                  </SignUpButton>
                </div>
              </div>

              {/* Status indicators under search */}
              <div className={`mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-bold tracking-widest uppercase transition-all duration-500 delay-100 ${isHoveringSearch ? 'text-[#1C1917]' : 'text-[#A8A29E]'}`}>
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Live Scanning</span>
                <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Encrypted Links</span>
                <span className="flex items-center gap-1.5"><SearchCode className="w-3.5 h-3.5" /> Deep Search</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </main>

      {/* Trust & Principles Section */}
      <section className="py-24 bg-white relative z-10 border-t border-[#F5F5F4] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF9] to-white pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Shield, title: "Ethical & Public", desc: "We exclusively synthesize publicly available intelligence to ensure complete investigative compliance.", color: "text-[#059669]", bg: "bg-[#D1FAE5]" },
              { icon: Zap, title: "Asynchronous Engine", desc: "Results render progressively. As soon as a connection is found, it illuminates on your dashboard.", color: "text-[#D97706]", bg: "bg-[#FEF3C7]" },
              { icon: Users, title: "Precision Matching", desc: "Our heuristic algorithms match aliases and entities warmly and accurately, filtering the noise.", color: "text-[#4F46E5]", bg: "bg-[#E0E7FF]" }
            ].map((item, idx) => (
              <FadeIn key={idx} delay={idx * 150}>
                <div className="group space-y-5 p-8 rounded-3xl hover:bg-[#FAFAF9] hover:shadow-xl hover:shadow-[#D6D3D1]/20 transition-all duration-500 border border-transparent hover:border-[#E7E5E4] cursor-default">
                  <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="font-bold text-xl text-[#1C1917]">{item.title}</h3>
                  <p className="text-[#57534E] leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities App Preview */}
      <section className="py-24 bg-[#FAFAF9] border-y border-[#E7E5E4] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold tracking-tight mb-5 text-[#1C1917]">Refined Interrogation</h2>
            <p className="text-lg text-[#57534E] font-medium leading-relaxed">
              We abstracted the terminal into a beautiful, cozy workspace. Discover everything with a simple, elegant intelligence flow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6">
            {[
              { icon: Fingerprint, title: "Identity Maps", desc: "Trace pseudonyms comfortably." },
              { icon: Globe, title: "Topography", desc: "Uncover network host infra." },
              { icon: Camera, title: "Visual Exif", desc: "Reverse image forensics." },
              { icon: Database, title: "Web Archives", desc: "Resurrect deleted assets." },
            ].map((feature, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="bg-white p-8 rounded-3xl border border-[#E7E5E4] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#F5F5F4] to-transparent rounded-bl-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
                  <div className="w-12 h-12 bg-[#F5F5F4] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#1C1917] transition-colors duration-300 shadow-sm relative z-10">
                    <feature.icon className="w-5 h-5 text-[#57534E] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-[#1C1917] relative z-10">{feature.title}</h4>
                  <p className="text-[#78716C] font-medium text-sm relative z-10">{feature.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Interactive Section */}
      <section className="py-32 bg-[#1C1917] text-[#FAFAF9] relative z-10 overflow-hidden">
        {/* Dark warm glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-gradient-to-b from-[#292524] to-transparent opacity-50 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            <FadeIn>
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#292524] border border-[#44403C] text-xs font-bold text-[#D6D3D1] uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5 text-[#FDE68A]" />
                  Nexus AI Core
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                  Your relentless, brilliant analyst by your side.
                </h2>
                <p className="text-lg text-[#A8A29E] leading-relaxed font-medium">
                  Interact with an intelligence model designed purely for offensive operations and deep data correlation. It organizes, investigates, and presents finding in perfectly structured reports.
                </p>
                
                <ul className="space-y-5 text-[#D6D3D1] font-medium">
                  {["Unrestricted threat models", "Autonomous pivot suggestions", "Automated finding summarization"].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 group cursor-default">
                      <div className="w-8 h-8 rounded-full bg-[#292524] flex items-center justify-center group-hover:bg-[#FDE68A] group-hover:text-[#1C1917] transition-colors duration-300 shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="group-hover:text-white transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="relative group perspective-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FDE68A]/20 to-[#EA580C]/20 blur-3xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-1000" />
                <div className="bg-[#292524] rounded-3xl p-3 shadow-2xl border border-[#44403C] transform transition-all duration-700 ease-out group-hover:rotate-x-2 group-hover:-rotate-y-2 group-hover:scale-[1.02] relative z-10 overflow-hidden">
                  
                  {/* Mock Window Header */}
                  <div className="flex items-center gap-2 mb-4 px-2 pt-2">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                    <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                    <div className="ml-4 text-xs font-medium text-[#78716C]">Session: Nexus-Omega Active</div>
                  </div>
                  
                  {/* Mock Chat UI */}
                  <div className="bg-[#1C1917] rounded-2xl p-6 space-y-6">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#FAFAF9] flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-[#1C1917]">You</span>
                      </div>
                      <div className="bg-[#292524] text-sm text-[#D6D3D1] p-4 rounded-2xl rounded-tl-sm border border-[#44403C]">
                        Correlate this IP address with known actor aliases across GitHub.
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FDE68A] to-[#D97706] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(253,230,138,0.4)]">
                        <Sparkles className="w-4 h-4 text-[#1C1917]" />
                      </div>
                      <div className="bg-[#292524] text-sm text-[#FAFAF9] p-4 rounded-2xl rounded-tl-sm border border-[#44403C]/50 shadow-inner">
                        <div className="flex items-center gap-2 mb-3 text-xs text-[#FDE68A] font-bold uppercase tracking-widest">
                          <Activity className="w-3 h-3 animate-pulse" /> Analyzed 24 domains
                        </div>
                        <p className="leading-relaxed">
                          Infrastructure overlaps identified. Found 3 connected repositories holding exposed configuration files. Commencing deep scan of historical commits.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Modern Cozy Footer CTA */}
      <section className="py-32 bg-[#F5F5F4] text-center relative z-10 px-6">
        <div className="max-w-3xl mx-auto space-y-10">
          <FadeIn>
            <div className="w-20 h-20 bg-white shadow-xl shadow-[#D6D3D1]/40 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
              <Search className="w-10 h-10 text-[#1C1917] stroke-[2]" />
            </div>
          </FadeIn>
          
          <FadeIn delay={100}>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-[#1C1917]">
              Begin your <br />investigation.
            </h2>
          </FadeIn>
          
          <FadeIn delay={200}>
            <p className="text-xl text-[#78716C] font-medium">
              Join the elite tier of researchers using the warmest, sharpest intelligence engine.
            </p>
          </FadeIn>
          
          <FadeIn delay={300}>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="px-10 py-5 bg-[#1C1917] text-white hover:bg-[#292524] hover:shadow-2xl hover:shadow-[#1C1917]/20 transition-all duration-300 text-lg font-bold rounded-2xl inline-flex items-center gap-3 group active:scale-95">
                Launch Workspace
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>
          </FadeIn>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-[#E7E5E4] py-12 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
            <Search className="w-4 h-4 text-[#1C1917] stroke-[3]" />
            <span className="text-sm font-bold tracking-widest uppercase">Baynaqab</span>
          </div>
          <p className="text-xs font-bold text-[#A8A29E] uppercase tracking-widest">
            © 2026. For Authorized Research Only.
          </p>
          <div className="flex gap-6 text-sm font-semibold text-[#A8A29E]">
            <Link href="/privacy" className="hover:text-[#1C1917] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#1C1917] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
