import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen flex flex-col bg-background text-foreground overflow-x-hidden overflow-y-auto font-body relative custom-scrollbar">
      
      {/* Background Video Backdrop */}
      <div className="absolute inset-0 w-full h-[120vh] overflow-hidden z-0 pointer-events-none">
        <video 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4" 
          muted 
          autoPlay 
          loop 
          playsInline 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
      </div>

      {/* Simple Subpage Navbar */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-50 select-none">
        <header className="w-full flex items-center justify-between px-6 py-3 rounded-full bg-background/95 border border-border shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-sm">
          <Link to="/" className="flex items-center gap-1.5 text-xl font-semibold tracking-tight text-foreground">
            Briefd
          </Link>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors bg-transparent border-0 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </button>
        </header>
      </div>

      {/* Content Container */}
      <main className="relative z-10 w-full max-w-3xl mx-auto px-6 pt-28 pb-20 select-text flex flex-col">
        <div className="bg-background/80 backdrop-blur-md border border-border rounded-2xl p-8 md:p-10 shadow-[0_25px_80px_-12px_rgba(0,0,0,0.08)]">
          <h1 className="font-display text-4xl tracking-tight text-foreground mb-8">
            Privacy <span className="font-display italic text-accent">Policy</span>
          </h1>

          <div className="space-y-6 text-xs text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-2">1. Overview</h2>
              <p>
                Welcome to Briefd. We are committed to protecting your privacy and security. This Privacy Policy describes how we collect, use, and share information when you use our multi-agent competitive research platform.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-foreground mb-2">2. Information We Collect</h2>
              <p className="mb-2">We collect information directly from you and automatically through your use of Briefd:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account Information:</strong> When you sign up, we collect your name, email address, and account credentials (hashed securely).</li>
                <li><strong>Search and Research Queries:</strong> We store the company names and topics you search for to generate and cache your competitive briefings.</li>
                <li><strong>Payment Data:</strong> Payment details are processed directly and securely by our third-party payment gateways. Briefd does not store your card or banking credentials.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-foreground mb-2">3. How We Use Your Information</h2>
              <p className="mb-2">We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>To orchestrate our AI agent pipeline (Company Researcher, Competitor Finder, Market Positioning Analyst, Briefing Writer) to generate your reports.</li>
                <li>To secure your private workspace, ensuring only you can access your generated briefings.</li>
                <li>To manage your account, enforce the daily scanning limits on the Free Starter tier, and handle one-time Professional Pass credentials.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-foreground mb-2">4. Third-Party Services and APIs</h2>
              <p>
                Briefd utilizes external tools to deliver research intelligence: the <strong>Tavily Search API</strong> to scan the live web for news and competitor data, and the <strong>Google Gemini API</strong> to analyze and synthesize the findings. These APIs do not receive your personal account information, and search queries are transmitted securely under strict API protocols.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-foreground mb-2">5. Security</h2>
              <p>
                We use industry-standard security measures (SSL/TLS encryption) to protect your account data and briefings. However, no internet transmission is 100% secure, and we encourage you to use a strong, unique password.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-foreground mb-2">6. Your Choices</h2>
              <p>
                You can view, download, or delete your briefing history directly from your dashboard workspace. To delete your account and all associated data permanently, please contact our support team.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-foreground mb-2">7. Contact Us</h2>
              <p>
                If you have any questions or concerns regarding this Privacy Policy, please contact us at <a href="mailto:briefd.support@gmail.com" className="text-accent hover:underline">briefd.support@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-background py-8 px-6 md:px-12 lg:px-20 select-none text-[11px] text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="w-full sm:w-1/3 flex justify-center sm:justify-start">
          <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:scale-[1.01] transition-transform">
            Briefd
          </Link>
        </div>
        <div className="w-full sm:w-1/3 text-center">
          © {new Date().getFullYear()} Briefd. All rights reserved.
        </div>
        <div className="w-full sm:w-1/3 flex justify-center sm:justify-end gap-6">
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
        </div>
      </footer>

    </div>
  );
}
