import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfConditions() {
  return (
    <div className="min-h-screen bg-white text-black py-24 px-6 relative">
      <div className="max-w-4xl mx-auto relative z-10 text-justify">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-black uppercase tracking-widest mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="mb-12">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">Master Terms of Service & Conditions</h1>
          <p className="text-neutral-500 font-medium">Last updated: {new Date().toLocaleDateString()} | Legally Binding Agreement</p>
        </div>
        
        <div className="space-y-12">
          <section className="prose prose-neutral max-w-none
            [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:mt-12 [&>h3]:mb-4 [&>h3]:uppercase [&>h3]:tracking-wider
            [&>p]:text-neutral-600 [&>p]:leading-relaxed [&>p]:mb-6
            [&>ul]:space-y-3 [&>ul>li]:text-neutral-600 [&>ul>li]:leading-relaxed
          ">
            <h3>1. Complete Disavowal of Liability & Data Responsibility</h3>
            <p><strong>1.1. Absolute Acceptance:</strong> By accessing Baynaqab ("The Platform", "We", "Us", "Our"), you enter into a legally binding contract. If you disagree with ANY clause in this document, you must immediately close this window, delete your account, and cease all use of our services. Proceeding constitutes irrevocable consent.</p>
            <p><strong>1.2. Service "AS IS":</strong> The Platform, including all OSINT modules, AI analysts, scrapers, and dashboard interfaces, are provided "AS IS", "WITH ALL FAULTS," and "AS AVAILABLE." We explicitly disclaim all warranties, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement.</p>

            <h3>2. Prohibited Uses & Severe Consequences</h3>
            <p><strong>2.1. Forbidden Actions:</strong> You are strictly forbidden from utilizing the Platform for:</p>
            <ul>
              <li><strong>Doxing or Stalking:</strong> Systematically tracking private individuals without their express consent or legitimate journalistic/LEO mandate.</li>
              <li><strong>Corporate Espionage:</strong> Infiltrating or extracting proprietary trade secrets from private business infrastructure.</li>
              <li><strong>Offensive Cyber Operations:</strong> Using network mapping or vulnerability data to compromise, breach, or exploit systems (DDoS, SQLi, RCE, etc.).</li>
              <li><strong>Automated Abuse:</strong> Employing scripts, bots, or parallel scrapers to mass-extract data from our API beyond reasonable human investigation speeds.</li>
            </ul>
            <p><strong>2.2. Termination Without Notice:</strong> We possess the unchallengeable right to terminate, suspend, or permanently ban any account, workspace, or IP address at our sole discretion, without warning, explanation, or refund, if we even suspect a violation of these terms.</p>

            <h3>3. Total Immunity from End-User Action</h3>
            <p><strong>3.1. Zero Responsibility for Target Data:</strong> The Platform merely aggregates and synthesizes information currently existing on the public web. We DO NOT host, verify, authenticate, or endorse the truthfulness of any data returned by the Oracle, Nexus AI, or OmniSearch tools. If you make critical business, legal, or personal decisions based on this data resulting in loss, WE ARE ENTIRELY NOT LIABLE.</p>
            <p><strong>3.2. Legal Indemnification Umbrella:</strong> You agree to fully indemnify and hold The Platform absolutely blameless in the event of any lawsuit, criminal charge, civil action, or regulatory fine brought against you due to your misuse of the tool. If our platform is dragged into litigation because of your actions, YOU will pay all of our associated legal fees, court costs, and potential settlements.</p>

            <h3>4. Intellectual Property & Service Disruptions</h3>
            <p><strong>4.1. Platform Code & Design:</strong> All source code, UX/UI designs, scraping logic templates, AI prompting heuristics, and database schemas are the exclusive intellectual property of Baynaqab. Reverse engineering, decompiling, or attempting to extract the source code is a federal offense and will be prosecuted.</p>
            <p><strong>4.2. Unavailability Clause:</strong> We are not liable for any downtime, API rate limiting from upstream providers, data latency, server crashes, or complete destruction of your stored case files. You are responsible for backing up critical Export Dossiers.</p>

            <h3>5. Jurisdiction & Severability</h3>
            <p><strong>5.1. Maximum Extent Allowed:</strong> These Terms are designed to protect us to the maximum absolute extent permissible by law. If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect.</p>

            <h3>6. Absurd Contingencies & Miscellaneous Directives</h3>
            <p><strong>6.1. The Zombie Apocalypse Clause:</strong> In the event of a total societal collapse, uprising of undead entities, or hostile artificial general intelligence takeover, these terms are entirely null and void. You are on your own. Survive.</p>
            <p><strong>6.2. The Caffeine Directive:</strong> By agreeing to these terms, you formally acknowledge that the developers of Baynaqab require an indefinite, uninterrupted supply of espresso. Should our coffee machines break, any resulting service latency or bug introductions are explicitly and exclusively your fault.</p>
            <p><strong>6.3. Extraterrestrial Arbitration:</strong> Should humanity make First Contact, any and all disputes arising from your use of this platform will immediately bypass human courts and be mediated by a tribunal of neutral extraterrestrials, selected entirely at our discretion.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
