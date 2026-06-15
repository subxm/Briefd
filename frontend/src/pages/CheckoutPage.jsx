import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Check, Sparkles, 
  HelpCircle, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export default function CheckoutPage() {
  const { user, token, loading, refreshUser, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [utr, setUtr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  // Redirect if not logged in or if already Pro
  useEffect(() => {
    if (loading) return;
    if (!token) {
      navigate('/login');
    } else if (user && user.tier === 'pro') {
      navigate('/dashboard');
    }
  }, [user, token, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUtr = utr.trim();
    if (!cleanUtr) {
      setErrorMsg("Please enter the 12-digit UPI Transaction ID.");
      return;
    }

    if (!/^\d{12}$/.test(cleanUtr)) {
      setErrorMsg("Transaction ID must be exactly 12 numeric digits.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/payments/upi-submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ utr: cleanUtr }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to submit transaction.");
      }

      setIsSubmittedSuccessfully(true);
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMsg(err.message || "Something went wrong. Please verify your UTR and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-background text-foreground flex flex-col items-center justify-center font-body relative overflow-hidden select-none">
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <video 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4" 
            muted 
            autoPlay 
            loop 
            playsInline 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative h-12 w-12 shrink-0">
            <div className="absolute inset-0 rounded-full border-[3px] border-t-accent border-r-accent/30 border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-0 rounded-full border-[3px] border-t-transparent border-r-transparent border-b-accent border-l-accent/20 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5 text-accent animate-pulse" />
            </div>
          </div>
          <span className="text-[12px] font-semibold tracking-tight">Loading session...</span>
        </div>
      </div>
    );
  }

  if (isSubmittedSuccessfully) {
    return (
      <div className="min-h-screen w-screen bg-background text-foreground flex flex-col font-body relative overflow-x-hidden select-none">
        {/* Background Graphic */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <video 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4" 
            muted 
            autoPlay 
            loop 
            playsInline 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />
        </div>

        <main className="relative z-10 flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-background/50 border border-border backdrop-blur-md rounded-2xl p-8 text-center shadow-lg">
            <div className="h-12 w-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Verification Pending</h1>
            <p className="text-[11.5px] text-muted-foreground mt-3 leading-relaxed font-body">
              Your UPI reference ID (UTR) <strong className="font-mono">{utr}</strong> has been successfully submitted for review. 
            </p>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed font-body">
              We are verifying your transaction. Your account will be automatically upgraded to <strong>Pro</strong> within 10–15 minutes once the bank transfer is confirmed.
            </p>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full h-10 mt-8 bg-accent text-accent-foreground hover:bg-accent/90 rounded-[8px] text-xs font-semibold tracking-tight transition-all flex items-center justify-center cursor-pointer shadow-md"
            >
              Go to Workspace Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-background text-foreground flex flex-col font-body relative overflow-x-hidden select-none">
      
      {/* Background Graphic */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <video 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4" 
          muted 
          autoPlay 
          loop 
          playsInline 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 border-b border-border bg-background/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer animate-none"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workspace
          </button>
          <span className="text-sm font-semibold tracking-tight">Briefd Checkout</span>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col md:flex-row gap-8 justify-center items-stretch">
        
        {/* Left Card: Order summary */}
        <div className="flex-grow flex-shrink basis-0 bg-background/50 border border-border backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col justify-between text-left shadow-sm">
          <div>
            <div className="flex items-center gap-1.5 text-accent text-xs font-semibold mb-2">
              <Sparkles className="h-4 w-4 animate-pulse" />
              LIFETIME UPGRADE
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Briefd Professional</h1>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
              Unlock the complete competitive scanning toolkit with direct bank-to-bank settlement. No third party commissions.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Unlimited competitive briefings",
                "Advanced AI positioning matrix scans",
                "Full competitor capacity grids",
                "Vector-sharp PDF intelligence report downloads",
                "Priority agent queue allocation"
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[11px]">
                  <div className="p-0.5 bg-accent/10 rounded-full text-accent mt-0.5 shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-muted-foreground leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-6 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">Total One-Time Amount</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-foreground">₹499</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">INR (0% taxes/fees)</span>
            </div>
          </div>
        </div>

        {/* Right Card: UPI Form */}
        <div className="flex-grow flex-shrink basis-0 bg-background/50 border border-border backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col justify-between text-left shadow-sm">
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col justify-between gap-6">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Pay Direct via UPI</h2>
              <p className="text-[10px] text-muted-foreground mt-1">Scan the QR code below to complete the transfer.</p>

              {/* QR Code Container */}
              <div className="mt-5 flex flex-col items-center gap-3">
                <div className="bg-white p-2 rounded-xl border border-border/80 shadow-md">
                  <img 
                    src="/upi_qr_cropped.png" 
                    alt="Scan UPI QR Code" 
                    className="h-[170px] w-[170px] object-contain select-none animate-none"
                    draggable="false"
                  />
                </div>
              </div>

              {/* Input for UTR */}
              <div className="mt-6">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  12-Digit UPI Transaction ID / UTR
                </label>
                <input 
                  type="text"
                  maxLength={12}
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 12-digit Ref Number (e.g. 345678912345)"
                  className="w-full h-10 px-3.5 bg-background border border-border rounded-lg text-xs outline-none focus:border-accent font-medium text-foreground transition-colors placeholder:text-muted-foreground/50 tracking-wider font-mono text-center"
                />
              </div>

              {/* Error messages banner */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="mt-4 p-3 bg-red-500/[0.03] border border-red-500/15 rounded-lg flex items-start gap-2.5 text-[11px] text-red-600 dark:text-red-400 font-medium text-left"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-3 mt-4">
              <button
                type="submit"
                disabled={isSubmitting || utr.trim().length !== 12}
                className="w-full h-10 bg-accent text-accent-foreground hover:bg-accent/90 rounded-[8px] text-xs font-semibold tracking-tight transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md animate-none"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin"></span>
                    <span>Verifying UTR...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Complete Upgrade (₹499)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="w-full flex items-center justify-center gap-1.5 text-[10.5px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                Where can I find the UTR Number?
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Guide Overlay Modal */}
      <AnimatePresence>
        {showGuide && (
          <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-background border border-border rounded-xl p-6 shadow-dashboard text-left"
            >
              <h3 className="text-sm font-semibold text-foreground tracking-tight mb-4 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-accent" />
                Finding UPI UTR Ref Numbers
              </h3>
              <div className="space-y-4 text-[10.5px] text-muted-foreground font-body leading-relaxed max-h-[350px] overflow-y-auto pr-1">
                <div>
                  <h4 className="font-semibold text-foreground">Google Pay (GPay):</h4>
                  <p className="mt-0.5">Open GPay transaction history -&gt; click the payment card. Locate the 12-digit number starting with `UPI Transaction ID` or `UTR`.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">PhonePe:</h4>
                  <p className="mt-0.5">Open History -&gt; select payment record. Copy the 12-digit numeric value beside the `UTR` field.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Paytm:</h4>
                  <p className="mt-0.5">Open Wallet/Transactions ledger -&gt; click transaction. Find the `UPI Ref No.` or `UTR` containing 12 numerical digits.</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg border border-border/40 text-[10px]">
                  <strong>Note:</strong> All UPI receipts contain a standard 12-digit transaction ID starting with the current calendar year digit. Wait for the notification and paste it in the box.
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="w-full h-10 mt-6 bg-secondary text-foreground hover:bg-secondary/80 rounded-[6px] text-xs font-semibold transition-all flex items-center justify-center cursor-pointer"
              >
                Close Guide
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
