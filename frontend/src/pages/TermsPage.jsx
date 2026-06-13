import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
            Terms of <span className="font-display italic text-accent">Service</span>
          </h1>

          <div className="space-y-6 text-xs text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-2">1. Agreement to Terms</h2>
              <p>
                By accessing or using Briefd, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not access or use our services.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-foreground mb-2">2. Description of Service</h2>
              <p>
                Briefd is an autonomous multi-agent competitive research intelligence tool. The platform scans live web data via third-party search APIs and uses generative AI models (Google Gemini) to draft structured intelligence briefings on requested companies.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-foreground mb-2">3. User Accounts & Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>You must provide accurate and complete information when registering an account.</li>
                <li>You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
                <li>You agree not to use the service for any illegal or unauthorized activities, including attempting to scrape, reverse engineer, or abuse our agent backend systems.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-foreground mb-2">4. Plan Subscriptions and Payments</h2>
              <p className="mb-2">Briefd offers a Free Starter pass and a Professional Pass:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Free Starter Pass:</strong> Grants access to 2 competitive briefings/scans per user per day.</li>
                <li><strong>Professional Pass:</strong> Available for a one-time payment of ₹499, granting unlimited scans and advanced report features.</li>
                <li><strong>Refund Policy:</strong> Due to the live API search and AI resource generation costs incurred instantly upon report execution, one-time payments are generally non-refundable unless otherwise specified.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-foreground mb-2">5. AI Content and Liability Disclaimer</h2>
              <p className="mb-2"><strong>Please read this section carefully:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>All research reports and briefings generated by Briefd are created automatically using autonomous AI agent chains querying live web indexes.</li>
                <li>AI content is provided for general informational purposes only. We do not guarantee the absolute accuracy, completeness, or up-to-date nature of the AI findings.</li>
                <li>Briefd is not liable for any business decisions, financial loss, or actions taken by you or third parties based on the generated briefings or any hallucinations produced by the AI models.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-foreground mb-2">6. Limitation of Liability</h2>
              <p>
                In no event shall Briefd or its creators be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of, or inability to use, the platform.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-foreground mb-2">7. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms of Service at any time. Your continued use of the platform following the posting of any changes constitutes acceptance of those changes.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-foreground mb-2">8. Contact Us</h2>
              <p>
                If you have any questions or concerns regarding these Terms of Service, please contact us at <a href="mailto:briefd.support@gmail.com" className="text-accent hover:underline">briefd.support@gmail.com</a>.
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
