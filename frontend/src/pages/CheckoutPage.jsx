import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Check, AlertCircle, Lock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export default function CheckoutPage() {
  const { user, token, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Redirect if not logged in or if already Pro
  useEffect(() => {
    if (loading) return;
    if (!token) {
      navigate('/login');
    } else if (user && user.tier === 'pro') {
      navigate('/dashboard');
    }
  }, [user, token, loading, navigate]);

  const handleRazorpayPayment = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      // 1. Call Backend to Create Razorpay Order (100 paise = 1 INR; Pro pricing is ₹499 = 49900 paise)
      const response = await fetch(`${API_BASE_URL}/api/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: 49900,
          currency: 'INR'
        }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.detail || "Failed to initiate payment session.");
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Briefd",
        description: "Lifetime Pro Upgrade",
        order_id: orderData.order_id,
        image: "/favicon.svg",
        handler: async function (paymentResponse) {
          setIsSubmitting(true);
          try {
            // Send payment credentials to signature verification endpoint
            const verifyResponse = await fetch(`${API_BASE_URL}/api/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyData.detail || "Payment verification failed.");
            }

            // Sync user state and set success
            setIsSubmittedSuccessfully(true);
            await refreshUser();
          } catch (err) {
            console.error("Verification error:", err);
            setErrorMsg(err.message || "Something went wrong while verifying payment. Please contact support.");
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: ""
        },
        theme: {
          color: "#6366f1"
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setErrorMsg("Payment session was cancelled. You can try again.");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (paymentFailResponse) {
        console.error("Razorpay Payment failed:", paymentFailResponse.error);
        setErrorMsg(`Payment failed: ${paymentFailResponse.error.description}`);
        setIsSubmitting(false);
      });

      rzp.open();

    } catch (err) {
      console.error("Payment initiation failed:", err);
      setErrorMsg(err.message || "Failed to connect to the payment server. Please try again.");
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
              <Lock className="h-4.5 w-4.5 text-accent animate-pulse" />
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
            <h1 className="text-xl font-bold text-foreground tracking-tight">Upgrade Successful!</h1>
            <p className="text-[11.5px] text-muted-foreground mt-3 leading-relaxed font-body">
              Your payment was verified successfully. Your account has been upgraded to <strong>Pro</strong>.
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
            <div className="text-accent text-[10px] font-bold tracking-wider mb-2">
              LIFETIME UPGRADE
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Briefd Professional</h1>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
              Unlock the complete competitive scanning toolkit with instant automated payments. Access premium tools forever.
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

        {/* Right Card: Razorpay Checkout Form */}
        <div className="flex-grow flex-shrink basis-0 bg-background/50 border border-border backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col justify-between text-left shadow-sm">
          <div className="flex-grow flex flex-col justify-between gap-6">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Secure Checkout</h2>
              <p className="text-[10px] text-muted-foreground mt-1">Upgrade your account instantly using Razorpay Checkout.</p>

              {/* Payment Graphic / Info Box */}
              <div className="mt-8 flex flex-col items-center justify-center p-6 border border-border/60 bg-secondary/35 rounded-xl">
                <Lock className="h-10 w-10 text-accent mb-3" />
                <p className="text-[11px] font-semibold text-foreground">Fast & Secure Payments</p>
                <p className="text-[9.5px] text-muted-foreground text-center mt-1">Supports Cards, UPI, Netbanking, & Wallets</p>
                
                {/* Visual badge simulator */}
                <div className="flex items-center gap-2 mt-4 opacity-70">
                  <span className="text-[8px] px-2 py-0.5 border border-border rounded font-mono uppercase bg-background font-bold tracking-wider">UPI</span>
                  <span className="text-[8px] px-2 py-0.5 border border-border rounded font-mono uppercase bg-background font-bold tracking-wider">CARDS</span>
                  <span className="text-[8px] px-2 py-0.5 border border-border rounded font-mono uppercase bg-background font-bold tracking-wider">NETBANKING</span>
                </div>
              </div>

              {/* Error messages banner */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="mt-6 p-3 bg-red-500/[0.03] border border-red-500/15 rounded-lg flex items-start gap-2.5 text-[11px] text-red-600 dark:text-red-400 font-medium text-left"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-3 mt-8">
              <button
                type="button"
                onClick={handleRazorpayPayment}
                disabled={isSubmitting}
                className="w-full h-10 bg-accent text-accent-foreground hover:bg-accent/90 rounded-[8px] text-xs font-semibold tracking-tight transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md animate-none"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Pay Now with Razorpay (₹499)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
