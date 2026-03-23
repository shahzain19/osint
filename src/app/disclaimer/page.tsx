import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function LegalDisclaimer() {
  return (
    <div className="min-h-screen bg-white text-black py-24 px-6 relative">
      <div className="max-w-4xl mx-auto relative z-10 text-justify">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-black uppercase tracking-widest mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="mb-12">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">Ultimate Legal Disclaimer</h1>
          <p className="text-neutral-500 font-medium">Last updated: {new Date().toLocaleDateString()} | Read carefully before use</p>
        </div>
        
        <div className="space-y-12">
          <section className="prose prose-neutral max-w-none
            [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:mt-12 [&>h3]:mb-4 [&>h3]:uppercase [&>h3]:tracking-wider
            [&>p]:text-neutral-600 [&>p]:leading-relaxed [&>p]:mb-6
            [&>ul]:space-y-3 [&>ul>li]:text-neutral-600 [&>ul>li]:leading-relaxed
          ">
            <h3>1. Complete Denial of Agency</h3>
            <p><strong>1.1. No Fiduciary Duty:</strong> Under no circumstances does the use of Baynaqab establish a fiduciary, advisory, or consultative relationship between you and the developers of the platform. The platform is merely a hollow conduit for retrieving public information. You bear 100% of the cognitive, ethical, and legal burden of interpreting the outputs.</p>

            <h3>2. Harm Disavowal</h3>
            <p><strong>2.1. Physical and Psychological Harm:</strong> If the intelligence gathered on this platform causes emotional distress, psychological trauma, financial ruin, reputational damage, or physical harm to any individual or entity globally, WE HOLD ZERO, RECKLESS, BLANKET IMMUNITY. We did not prompt the query. You did.</p>
            <p><strong>2.2. Indirect Outcomes:</strong> The intelligence pipeline connects to chaotic, unpredictable, and often erroneous nodes on the internet. We entirely disavow responsibility for decisions made utilizing corrupted, hallucinated, or malicious data retrieved via our API integrations.</p>

            <h3>3. Zero Regulatory Assumption</h3>
            <p><strong>3.1. International Law Void:</strong> We make no claim that this platform compliantly adheres to the GDPR, CCPA, HIPAA, FCRA, or any global intelligence gathering statutes. If you are a regulated entity, doing compliance checks on targets, you are performing unauthorized, rogue analysis at your own unparalleled risk. We are not a Consumer Reporting Agency.</p>

            <h3>4. Catastrophic Engine Failure</h3>
            <p><strong>4.1. The AI Shield:</strong> Nexus AI operates autonomously using vast language datasets. Any responses indicating bias, hate speech, illegality, hallucinations, or dangerously unhinged conclusions are solely the output of mathematical probability models intersecting with your direct prompt input. The creators, founders, hosting providers, and third-party vendors are mathematically, legally, and philosophically insulated from the AI's generation.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
