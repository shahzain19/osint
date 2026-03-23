import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export default function EthicsCharter() {
  return (
    <div className="min-h-screen bg-white text-black py-24 px-6 relative">
      <div className="max-w-4xl mx-auto relative z-10 text-justify">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-black uppercase tracking-widest mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="mb-12">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">Code of Open-Source Ethics</h1>
          <p className="text-neutral-500 font-medium">Last updated: {new Date().toLocaleDateString()} | Guiding Principles</p>
        </div>
        
        <div className="space-y-12">
          <section className="prose prose-neutral max-w-none
            [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:mt-12 [&>h3]:mb-4 [&>h3]:uppercase [&>h3]:tracking-wider
            [&>p]:text-neutral-600 [&>p]:leading-relaxed [&>p]:mb-6
            [&>ul]:space-y-3 [&>ul>li]:text-neutral-600 [&>ul>li]:leading-relaxed
          ">
            <h3>1. Truth over Intrusion</h3>
            <p><strong>1.1. Journalistic Integrity:</strong> Baynaqab exists to arm researchers, journalists, and security analysts with the truth. We believe in penetrating the veil of disinformation and corporate opacity. However, this pursuit of truth must never cross the threshold into unwarranted intrusion of protected private lives. Public data represents public actions; do not manipulate public data to infer deeply private truths baselessly.</p>

            <h3>2. The Weaponization Clause</h3>
            <p><strong>2.1. Do No Harm:</strong> OSINT is an incredibly powerful capability that straddles the line between observation and digital violence. As an investigator using Baynaqab, you pledge never to weaponize the infrastructure mappings, shadow links, or facial recognition modules for purposes of intimidation, blackmail, harassment, or non-consensual surveillance. Our tools are for defensive intelligence and exposure of corruption, not offensive subjugation.</p>

            <h3>3. Unrestricted but Guided Inquiry</h3>
            <p><strong>3.1. Unhinged Exploration vs. Malicious Intent:</strong> While Nexus AI is prompted to explore extreme, unrestricted hypotheticals and "unhinged" possibilities to break mental constraints, users must apply human discernment. The AI suggests the edges of the map; the investigator must decide if those edges are legally and morally traversable.</p>

            <h3>4. Accountability of the Analyst</h3>
            <p><strong>4.1. The Final Arbiter:</strong> The platform provides data. The analyst provides the ethics. If an investigator uses our comprehensive toolset to violate these ethical boundaries, they sever all ideological alignment with Baynaqab. We stand for radical transparency and accountability—first and foremost by holding our own user base to the absolute highest standard of investigative morality.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
