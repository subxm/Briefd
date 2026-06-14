import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PricingPage() {
  const { user, upgradeToPro } = useAuth();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Free Starter',
      price: 0,
      desc: 'Perfect for trying out Briefd with standard company lookups.',
      features: [
        '2 competitive briefings per day',
        'Standard Company Researcher agent',
        'Competitor Finder (up to 3 rivals)',
        'Standard streaming delivery',
      ],
      cta: 'Start for Free',
      popular: false,
    },
    {
      name: 'Professional',
      price: 499,
      desc: 'Deep analytical tools for growing businesses and serious researchers.',
      features: [
        'Unlimited competitive briefings',
        'Advanced Company Researcher agent',
        'Full Competitor Finder (5+ alternatives)',
        'Market Positioning Analyst agent',
        'Synthesized Briefing Writer outputs',
        'Priority agent stream queuing',
        'Export reports to Markdown/PDF',
      ],
      cta: 'Upgrade to Pro',
      popular: true,
    },
  ];

  const handleCTA = (planName) => {
    if (planName === 'Professional') {
      if (user) {
        if (user.tier === 'pro') {
          navigate('/dashboard');
        } else {
          upgradeToPro().catch((err) => {
            console.error("Failed to upgrade:", err);
            navigate('/dashboard');
          });
        }
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pending_checkout_after_login', 'true');
        }
        navigate('/login');
      }
    } else {
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-body relative">
      
      {/* Background Video Backdrop */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <video 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4" 
          muted 
          autoPlay 
          loop 
          playsInline 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 border-b border-border bg-background/30 backdrop-blur-sm select-none">
        <Link to="/" className="flex items-center gap-1.5 text-xl font-semibold tracking-tight text-foreground">
          Briefd
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/pricing" className="text-sm font-medium text-foreground transition-colors">Pricing</Link>
          <a href="mailto:briefd.support@gmail.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 text-sm font-medium transition-all cursor-pointer"
            >
              Dashboard
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 transition-colors">Log In</Link>
              <button 
                onClick={() => navigate('/register')}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 text-sm font-medium transition-all cursor-pointer"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-6 md:px-12 lg:px-20 py-6 overflow-y-auto custom-scrollbar">
        
        {/* Title */}
        <div className="text-center max-w-xl mb-6">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight text-foreground">
            Simple, Transparent <span className="font-display italic text-accent">Pricing</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Choose the plan that fits your competitive research needs. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl items-stretch">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`relative bg-background/80 backdrop-blur-sm border rounded-lg p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:border-slate-400 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${
                plan.popular 
                  ? 'border-accent shadow-[0_0_25px_rgba(239,84,67,0.12)] ring-1 ring-accent' 
                  : 'border-border shadow-sm'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full shadow-sm">
                  Most Popular
                </span>
              )}

              <div className="text-left">
                <h3 className="text-sm font-semibold text-foreground tracking-tight">{plan.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed min-h-[36px]">{plan.desc}</p>
                
                {/* Price Display */}
                <div className="mt-4 mb-5">
                  {typeof plan.price === 'number' ? (
                    <div className="flex items-baseline">
                      <span className="text-3xl font-semibold tracking-tight text-foreground">₹{plan.price}</span>
                    </div>
                  ) : (
                    <div className="text-3xl font-semibold tracking-tight text-foreground">{plan.price}</div>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 border-t border-border/60 pt-4">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => handleCTA(plan.name)}
                className={`mt-6 w-full py-2.5 rounded-[6px] text-xs font-medium transition-all duration-150 cursor-pointer ${
                  plan.popular 
                    ? 'bg-accent text-accent-foreground hover:bg-accent/90 shadow' 
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
