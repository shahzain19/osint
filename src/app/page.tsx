"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/react";
import { redirect } from "next/navigation";
import { Search, Shield, Users, Zap, Globe, Fingerprint, Camera, Database, HelpCircle, ChevronDown, ArrowRight, Activity, Lock, SearchCode } from "lucide-react";
import { useEffect } from "react";

export default function LandingPage() {
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && userId) {
      redirect("/dashboard");
    }
  }, [isLoaded, userId]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-gradient-to-b from-neutral-100/50 to-transparent"></div>
      </div>

      {/* Header */}
      <header className="px-8 py-6 relative z-10 border-b border-neutral-50 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-black p-1.5 rounded-lg">
              <Search className="w-5 h-5 text-white stroke-[2]" />
            </div>
            <span className="text-xl font-bold tracking-tight uppercase">Baynaqab</span>
          </div>
          <div className="flex items-center gap-6">
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="text-sm font-medium text-neutral-600 hover:text-black transition-colors uppercase">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 transition-colors text-sm uppercase rounded-lg">
                Get Started
              </button>
            </SignUpButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center py-24">
        <div className="max-w-4xl space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-black">
            Unmask Information.<br />Discover Truth.
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            The professional OSINT engine for journalists and researchers. Search, analyze, and organize public footprints with absolute precision.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto w-full group">
            <div className="relative transform transition-all duration-300 group-hover:scale-[1.01]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <input 
                type="text" 
                placeholder="Enter an IP address, domain, or identity..." 
                className="w-full pl-12 pr-40 py-5 border border-neutral-200 rounded-2xl text-lg focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all shadow-xl shadow-black/5"
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                  <button className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 transition-all text-sm font-semibold rounded-xl flex items-center gap-2">
                    Investigate
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </SignUpButton>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-neutral-400 font-medium tracking-wide uppercase">
              <span className="flex items-center gap-1.5"><Activity className="w-3 h-3" /> Live Scanning</span>
              <span className="w-1 h-1 bg-neutral-200 rounded-full"></span>
              <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Encrypted Queries</span>
              <span className="w-1 h-1 bg-neutral-200 rounded-full"></span>
              <span className="flex items-center gap-1.5"><SearchCode className="w-3 h-3" /> Deep Web Indexing</span>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-16 border-t border-neutral-100">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto md:mx-0">
                <Shield className="w-5 h-5 text-neutral-700" />
              </div>
              <h3 className="font-semibold text-lg">Public Only</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                We only access publicly available data, ensuring investigative ethics and compliance without compromising depth.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto md:mx-0">
                <Zap className="w-5 h-5 text-neutral-700" />
              </div>
              <h3 className="font-semibold text-lg">Real-time Pipeline</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Stream results progressively as our intelligent engine scans news, global profiles, and organizations synchronously.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto md:mx-0">
                <Users className="w-5 h-5 text-neutral-700" />
              </div>
              <h3 className="font-semibold text-lg">Entity Matching</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Advanced scoring logic precisely cuts through the noise to help you find the correct target across sources.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Capabilities Showcase */}
      <section className="py-24 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Powerful Capabilities</h2>
            <p className="text-neutral-500 max-w-xl">Deep investigative tools designed for the modern researcher, providing clarity in a world of fragmented data.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <Fingerprint className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-bold mb-2">Identity Mapping</h4>
              <p className="text-sm text-neutral-500">Cross-reference social footprints, aliases, and historical usernames to build complete identity profiles.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="font-bold mb-2">Network Topology</h4>
              <p className="text-sm text-neutral-500">Map IP ranges, domain ownership, and hosting infrastructure to uncover hidden professional networks.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                <Camera className="w-6 h-6 text-amber-600" />
              </div>
              <h4 className="font-bold mb-2">Multimedia Forensic</h4>
              <p className="text-sm text-neutral-500">Extract EXIF metadata, perform reverse image lookups, and identify consistent visual patterns across platforms.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-bold mb-2">Historical Archives</h4>
              <p className="text-sm text-neutral-500">Access cached snapshots, past DNS records, and deleted public records to see the web as it used to be.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-8">The Investigative Lifecycle</h2>
              <div className="space-y-12">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-black">Data Ingestion</h4>
                    <p className="text-neutral-500">Baynaqab connects to hundreds of public APIs, data sources, and scraping nodes in real-time based on your query.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-black">Heuristic Analysis</h4>
                    <p className="text-neutral-500">Our engine applies scoring weights and probability checks to ensure entities are correctly matched and verified.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-black">Evidence Visualization</h4>
                    <p className="text-neutral-500">Results are structured into visual graphs, chronological timelines, and exportable reports for your investigation case files.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-neutral-900 rounded-2xl p-4 shadow-2xl overflow-hidden aspect-video flex items-center justify-center group cursor-pointer border-4 border-neutral-800">
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent"></div>
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-white fill-white" />
                  </div>
                  <span className="text-white/60 text-sm font-medium uppercase tracking-widest">Interactive Preview</span>
                </div>
                {/* Decorative dots/grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-neutral-50 border-t border-neutral-100">
        <div className="max-w-3xl mx-auto px-8">
          <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-8">
            <div className="space-y-2">
              <h4 className="font-bold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-neutral-400" />
                Is Baynaqab legal to use?
              </h4>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Yes. Baynaqab only accesses publicly available information that is indexed or exposed via standard web protocols. We do not perform any "hacking" or unauthorized access to private databases.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-neutral-400" />
                Where does the data come from?
              </h4>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Our engine aggregates data from WHOIS records, public social media profiles, government business registries, digital news archives, and open-source data repositories.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-neutral-400" />
                Can I export my investigation results?
              </h4>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Yes, Pro users can export entire investigation cases as PDF reports or structured JSON data for integration into other professional tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-black text-white text-center">
        <div className="max-w-4xl mx-auto px-8 space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Ready to Unmask the Truth?</h2>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Join professional researchers and journalists who trust Baynaqab for their most critical investigations.
          </p>
          <div className="pt-4">
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="px-10 py-4 bg-white text-black hover:bg-neutral-200 transition-all text-lg font-bold rounded-2xl inline-flex items-center gap-3 group">
                Start Investigating Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-20 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-black p-1.5 rounded-lg">
                  <Search className="w-5 h-5 text-white stroke-[2]" />
                </div>
                <span className="text-xl font-bold tracking-tight uppercase">Baynaqab</span>
              </div>
              <p className="text-neutral-500 text-sm max-w-xs leading-relaxed">
                The high-precision OSINT engine for professional investigators, journalists, and security researchers. Unmask the truth with data-driven intelligence.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-sm uppercase tracking-wider mb-6">Product</h5>
              <ul className="space-y-4 text-sm text-neutral-500">
                <li className="hover:text-black cursor-pointer transition-colors">Features</li>
                <li className="hover:text-black cursor-pointer transition-colors">API Access</li>
                <li className="hover:text-black cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-black cursor-pointer transition-colors">Changelog</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-sm uppercase tracking-wider mb-6">Resources</h5>
              <ul className="space-y-4 text-sm text-neutral-500">
                <li className="hover:text-black cursor-pointer transition-colors">Documentation</li>
                <li className="hover:text-black cursor-pointer transition-colors">OSINT Guide</li>
                <li className="hover:text-black cursor-pointer transition-colors">Case Studies</li>
                <li className="hover:text-black cursor-pointer transition-colors">Support</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-sm uppercase tracking-wider mb-6">Company</h5>
              <ul className="space-y-4 text-sm text-neutral-500">
                <li className="hover:text-black cursor-pointer transition-colors">About</li>
                <li className="hover:text-black cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-black cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-black cursor-pointer transition-colors">Ethics Charter</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
              © 2026 Baynaqab OSINT Engine. Professional Investigation Use Only.
            </p>
            <div className="flex gap-6">
              {/* Mock Social Icons */}
              <div className="w-4 h-4 bg-neutral-200 rounded-sm"></div>
              <div className="w-4 h-4 bg-neutral-200 rounded-sm"></div>
              <div className="w-4 h-4 bg-neutral-200 rounded-sm"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
