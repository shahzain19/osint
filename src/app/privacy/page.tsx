import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-black py-24 px-6 relative">
      <div className="max-w-4xl mx-auto relative z-10 text-justify">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-black uppercase tracking-widest mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="mb-12">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">Comprehensive Privacy Policy</h1>
          <p className="text-neutral-500 font-medium">Last updated: {new Date().toLocaleDateString()} | Effective immediately upon access</p>
        </div>
        
        <div className="space-y-12">
          <section className="prose prose-neutral max-w-none
            [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:mt-12 [&>h3]:mb-4 [&>h3]:uppercase [&>h3]:tracking-wider
            [&>p]:text-neutral-600 [&>p]:leading-relaxed [&>p]:mb-6
            [&>ul]:space-y-3 [&>ul>li]:text-neutral-600 [&>ul>li]:leading-relaxed
          ">
            <h3>1. Complete Disavowal of Liability & Data Responsibility</h3>
            <p><strong>1.1. User Assumption of Risk:</strong> By accessing Baynaqab, you acknowledge that you are using highly advanced Open-Source Intelligence (OSINT) gathering tools. You expressly agree that we hold ZERO liability for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data or other intangible losses resulting from your use of the platform.</p>
            <p><strong>1.2. No Data Guarantees:</strong> We make no warranties, expressed or implied, regarding the accuracy, integrity, completeness, quality, legality, usefulness, or safety of any information generated, scraped, aggregated, or provided by the platform. The information is provided strictly "AS IS" and "AS AVAILABLE."</p>

            <h3>2. Extremely Exhaustive Information Collection</h3>
            <p><strong>2.1. Active Collection:</strong> We collect information you explicitly provide, including but not limited to email addresses, account credentials, payment information, API keys integrated into your workspace, and the full content of every query, search parameter, uploaded document, facial image, or QR code submitted to the engine.</p>
            <p><strong>2.2. Automated & Passive Collection:</strong> We automatically collect exhaustive telemetry data from your device, including IP addresses, browser types, operating systems, hardware configurations, MAC addresses, precise geographic location, network topology, ISP routing information, behavioral usage patterns, mouse movements, keystroke dynamics, and session durations.</p>
            <p><strong>2.3. Zero-Knowledge Exemption:</strong> While we aim for secure case management, we explicitly reject any classification of Baynaqab as a zero-knowledge provider. We reserve the absolute right to monitor, log, and analyze any and all activities occurring on the platform to prevent abuse, comply with legal demands, or protect our infrastructure.</p>

            <h3>3. Aggressive Third-Party Data Sharing Protocols</h3>
            <p><strong>3.1. Necessary Disclosures:</strong> In order to provide the service, your search queries and uploaded data may be transmitted to third-party endpoints, intelligence databases, scraping nodes, and API providers. We take no responsibility for how these third-party entities handle, store, or process the data you inadvertently or deliberately submit to them via our platform.</p>
            <p><strong>3.2. Law Enforcement & Subpoenas:</strong> WE WILL COMPLY ENTIRELY WITH ANY VALID LEGAL PROCESS. If subpoenaed, ordered by a court of competent jurisdiction, or approached by recognized domestic or international law enforcement agencies with a valid warrant, we will surrender all requested user data, logs, session histories, and investigation dossiers without hesitation and with absolute immunity from user retaliation.</p>
            <p><strong>3.3. Enterprise Affiliates:</strong> We reserve the right to share anonymized or aggregated investigation metadata with enterprise affiliates, cybersecurity partners, and intelligence sharing communities to improve threat intelligence tracking globally.</p>

            <h3>4. Indemnification & Absolute Legal Immunity</h3>
            <p><strong>4.1. Blanket Indemnification:</strong> You agree to completely indemnify, defend, and hold harmless Baynaqab, its founders, engineers, employees, contractors, and affiliates from any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) that such parties may incur as a result of or arising from your (or anyone using your account) violation of any law, statute, or regulation.</p>
            <p><strong>4.2. Actionable Intelligence Use:</strong> If you use the intelligence gathered from Baynaqab to commit harassment, stalking, doxing, corporate espionage, cyber warfare, or any civil/criminal offense, you act entirely independently and off-platform. We formally disclaim any knowledge of your intent and are fully insulated from any associated legal repercussions.</p>

            <h3>5. Jurisdiction & Dispute Resolution</h3>
            <p><strong>5.1. Mandatory Binding Arbitration:</strong> ANY DISPUTE, CLAIM OR CONTROVERSY ARISING OUT OF OR RELATING TO THIS PRIVACY POLICY OR THE BREACH, TERMINATION, ENFORCEMENT, INTERPRETATION OR VALIDITY THEREOF, COMPRISING THE DETERMINATION OF THE SCOPE OR APPLICABILITY OF THIS AGREEMENT TO ARBITRATE, SHALL BE DETERMINED BY BINDING ARBITRATION. YOU WAIVE YOUR RIGHT TO A JURY TRIAL AND CLASS ACTION LAWSUITS.</p>

            <h3>6. Immediate Policy Modifications</h3>
            <p><strong>6.1. Silent Adjustments:</strong> We reserve the right to modify, amend, or rewrite this Privacy Policy at any exact moment without prior notice. Your continued use of the platform immediately following any changes constitutes your absolute binding acceptance of the new terms. Ignorance of policy changes is solely your responsibility.</p>

            <h3>7. Highly Improbable Data Scenarios</h3>
            <p><strong>7.1. Telepathic Metadata Collection:</strong> We reserve the right to scrape your fleeting thoughts and intrusive ideas using advanced neuro-linguistic heuristics, assuming we ever figure out how to build the required hardware.</p>
            <p><strong>7.2. The 'Firstborn' Cookie Policy:</strong> By continuing to use this site without disabling cookies, you agree to legally change your firstborn child's name to "Baynaqab", or alternatively, "Nexus AI" if you prefer a modern tech aesthetic.</p>
            <p><strong>7.3. Parallel Universe Exemption:</strong> This strict privacy policy only applies within the confines of our current universe baseline. If you are accessing this document via an interdimensional portal or time machine, please refer to the temporal privacy laws of your origin timeline.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
