import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, Search, Bell, ChevronDown, Home, CheckSquare, 
  ArrowLeftRight, CreditCard, Landmark, LineChart, 
  Settings, HelpCircle, Activity, Sparkles, Check,
  Users, TrendingUp, FileText, ChevronRight, User, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [demoStep, setDemoStep] = useState('idle'); // idle -> typing -> agent1 -> agent2 -> agent3 -> agent4 -> done
  const [demoSearch, setDemoSearch] = useState('');
  const [demoBriefing, setDemoBriefing] = useState('');

  useEffect(() => {
    let isMounted = true;
    const runCycle = async () => {
      if (!isMounted) return;
      // Step 1: Idle
      setDemoStep('idle');
      setDemoSearch('');
      setDemoBriefing('');
      
      await new Promise(r => setTimeout(r, 2000));
      if (!isMounted) return;
      
      // Step 2: Typing "Stripe"
      setDemoStep('typing');
      const text = 'Stripe';
      for (let i = 1; i <= text.length; i++) {
        if (!isMounted) return;
        setDemoSearch(text.substring(0, i));
        await new Promise(r => setTimeout(r, 150));
      }
      
      await new Promise(r => setTimeout(r, 800));
      if (!isMounted) return;
      
      // Step 3: Agent 1 (Company Researcher)
      setDemoStep('agent1');
      await new Promise(r => setTimeout(r, 1800));
      if (!isMounted) return;
      
      // Step 4: Agent 2 (Competitor Finder)
      setDemoStep('agent2');
      await new Promise(r => setTimeout(r, 1800));
      if (!isMounted) return;
      
      // Step 5: Agent 3 (Market Positioning Analyst)
      setDemoStep('agent3');
      await new Promise(r => setTimeout(r, 1800));
      if (!isMounted) return;
      
      // Step 6: Agent 4 (Briefing Writer)
      setDemoStep('agent4');
      await new Promise(r => setTimeout(r, 1800));
      if (!isMounted) return;
      
      // Step 7: Done (Show Briefing)
      setDemoStep('done');
      setDemoBriefing(
        `## Executive Summary\n- **Stripe** is the global standard in financial infrastructure, enabling...`
      );
      
      await new Promise(r => setTimeout(r, 9000));
      if (!isMounted) return;
      
      runCycle();
    };

    runCycle();
    
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      isMounted = false;
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const agents = [
    {
      step: '01',
      name: 'Company Researcher',
      icon: Search,
      desc: 'Queries real-time web indexes via Tavily to build a foundation. Extracts founding details, HQ, business models, funding, and recent press releases.'
    },
    {
      step: '02',
      name: 'Competitor Finder',
      icon: Users,
      desc: 'Analyzes Agent 1\'s outputs, targets key search phrases, and gathers information on 3-5 main competitors and alternatives.'
    },
    {
      step: '03',
      name: 'Market Positioning Analyst',
      icon: TrendingUp,
      desc: 'Investigates industry trends, sizing, and growth rate. Maps where the target company stands in terms of pricing and features relative to rivals.'
    },
    {
      step: '04',
      name: 'Briefing Writer',
      icon: FileText,
      desc: 'Synthesizes all gathered intelligence into a cohesive executive document organized in five precise sections: Snapshot, Competitors, Position, Insights, and Risks.'
    }
  ];

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

  const faqs = [
    {
      q: "How does the sequential multi-agent pipeline work?",
      a: "CompeteAI orchestrates four specialized agents in order. The Company Researcher gathers public web data, the Competitor Finder extracts key rivals, the Market Positioning Analyst determines sizing and features, and the Briefing Writer compiles everything into a finished dossier."
    },
    {
      q: "Where does the real-time search data come from?",
      a: "Our Company Researcher agent utilizes Tavily Search API to query real-time search indexes across the web, bypassing outdated databases to fetch up-to-the-minute news, funding updates, and company developments."
    },
    {
      q: "Is my search history and briefing private?",
      a: "Yes. All research briefings are encrypted and stored in your private workspace. Other users cannot see what companies you have analyzed or tracked."
    },
    {
      q: "Can I export the generated briefings?",
      a: "Absolutely. With our Professional and Enterprise plans, you can export the full intelligence briefing to clean Markdown or downloadable PDF files for internal distribution."
    }
  ];

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

      {/* Public Navbar Container (Sticky Scroll) */}
      <div className={`fixed left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-50 select-none font-body transition-all duration-300 ${
        isScrolled ? 'top-3' : 'top-5'
      }`}>
        <header className={`w-full flex items-center justify-between px-6 rounded-full shrink-0 relative border transition-all duration-300 hover:scale-[1.01] hover:bg-background/95 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm ${
          isScrolled 
            ? 'py-2.5 bg-background/95 border-border shadow-[0_8px_30px_rgb(0,0,0,0.06)]' 
            : 'py-5 bg-transparent border-transparent'
        }`}>
          <div className="flex items-center gap-1.5 text-xl font-semibold tracking-tight text-foreground cursor-pointer hover:scale-[1.01] transition-transform z-10" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Briefd
          </div>
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/70 px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer bg-transparent border-0 font-medium">Home</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/70 px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer bg-transparent border-0 font-medium font-body">How it works</button>
            <button onClick={() => scrollToSection('plans')} className="text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/70 px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer bg-transparent border-0 font-medium font-body">Pricing</button>
          </nav>
          <div className="flex items-center gap-3 z-10">
            {user ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 text-sm font-medium transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 transition-colors hover:scale-[1.03]">Log In</Link>
                <button 
                  onClick={handleCTA}
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 text-sm font-medium transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </header>
      </div>

      {/* Floating profile avatar on the complete extreme right of the viewport */}
      {user && (
        <div className={`fixed right-6 z-50 transition-all duration-300 ${
          isScrolled ? 'top-[16px]' : 'top-[26px]'
        }`}>
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground hover:border-accent hover:text-accent flex items-center justify-center shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <User className="h-4.5 w-4.5 text-muted-foreground hover:text-accent transition-colors" />
            </button>
            
            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-dashboard p-1.5 z-40 text-left text-[11px]">
                  <div className="px-2.5 py-2 border-b border-border/60 mb-1">
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/dashboard');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-secondary transition-colors cursor-pointer text-foreground"
                  >
                    <Home className="h-3.5 w-3.5 text-accent" />
                    <span>Dashboard</span>
                  </button>
                  <button 
                    onClick={async () => {
                      setShowProfileMenu(false);
                      await logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hero Section Container */}
      <main className="relative z-10 w-full px-6 md:px-12 lg:px-20 pt-28 pb-12 select-text flex flex-col items-center text-center">
        
        {/* Hero Copy */}
        <div className="flex flex-col items-center max-w-4xl">
          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-[4.75rem] leading-[0.95] tracking-tight text-foreground max-w-2xl"
          >
            The Future of <span className="font-display italic text-accent">Competitive</span> Intelligence
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-sm md:text-base text-muted-foreground max-w-[620px] leading-relaxed font-body"
          >
            Map market positioning, uncover competitor strategies, and analyze key risks—delivered in seconds by autonomous research intelligence.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 flex justify-center"
          >
            <button 
              onClick={handleCTA}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3.5 text-sm font-medium font-body transition-all duration-150 shadow-md cursor-pointer"
            >
              Start Researching
            </button>
          </motion.div>
        </div>

        {/* Dashboard Preview (fixed height mockup) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full max-w-5xl mt-12 h-[450px] flex flex-col overflow-hidden pointer-events-none select-none rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.55)',
            boxShadow: 'var(--shadow-dashboard)',
            backdropBlur: '20px',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '12px'
          }}
        >
          {/* Dashboard Internals */}
          <div className="flex-1 bg-background rounded-xl border border-border/85 shadow-sm overflow-hidden flex flex-col text-[11px]">
            
            {/* Top Bar */}
            <div className="h-11 px-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-primary text-primary-foreground rounded flex items-center justify-center font-bold text-[10px]">
                  B
                </div>
                <span className="font-semibold text-foreground">Briefd</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </div>

              <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-md border border-border w-64 text-muted-foreground/60 text-left">
                <Search className="h-3.5 w-3.5" />
                <span className="flex-1 text-[10px]">{demoSearch || 'Search briefings...'}</span>
                <kbd className="text-[9px] bg-background border border-border px-1 rounded text-muted-foreground/50 font-mono">⌘K</kbd>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1 bg-secondary border border-border text-foreground rounded-md font-medium">
                  New Research
                </div>
                <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="h-6 w-6 rounded-full bg-accent text-accent-foreground font-semibold flex items-center justify-center text-[9px] shadow-sm">
                  JB
                </div>
              </div>
            </div>

            {/* Sidebar + Main Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <aside className="w-40 border-r border-border p-3 flex flex-col justify-between bg-background/50 text-left">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded bg-secondary text-foreground font-medium">
                      <Home className="h-3.5 w-3.5 text-accent" />
                      <span>Home</span>
                    </div>
                    <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Briefings</span>
                      </div>
                      <span className="px-1.5 py-0.2 bg-secondary text-foreground rounded-[4px] text-[9px] font-medium border border-border">12</span>
                    </div>
                    <div className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>Competitors</span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Content Area */}
              <main className="flex-1 bg-secondary/20 p-4 md:p-6 overflow-hidden flex flex-col justify-start text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground tracking-tight">Welcome, Jane</h2>
                    <p className="text-muted-foreground text-[10px] mt-0.5">Workspace overview & research toolkit.</p>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-[10px] font-medium">New Scan</span>
                    <span className="rounded-full bg-background border border-border text-foreground px-3 py-1 text-[10px] font-medium">Export Report</span>
                  </div>
                </div>

                {/* Simulated Search State vs Dashboard Overview */}
                {demoStep === 'idle' || demoStep === 'typing' ? (
                  <div className="flex gap-4 w-full">
                    {/* Card 1: Briefings Generated */}
                    <div className="flex-1 bg-background border border-border rounded-lg p-4 flex flex-col justify-between h-36">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground font-medium">Briefings Generated</span>
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <div className="text-base font-semibold text-foreground mt-1">
                          1,842
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] border-t border-border/50 pt-2 text-muted-foreground">
                        <span>Last 30 Days</span>
                        <span className="text-emerald-600 font-medium">+248 reports</span>
                      </div>
                    </div>

                    {/* Card 2: Active Briefings */}
                    <div className="flex-1 bg-background border border-border rounded-lg p-4 flex flex-col justify-between h-36">
                      <div>
                        <span className="text-[10px] text-muted-foreground font-medium">Active Briefings</span>
                        <div className="text-base font-semibold text-foreground mt-1">1,240 briefings</div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] border-t border-border/50 pt-2 text-muted-foreground">
                        <span>Updated hourly</span>
                        <span className="text-accent font-medium">99.9% uptime</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 w-full h-[280px] overflow-hidden text-[10px]">
                    {/* Simulated Agent Progress (Timeline) */}
                    <div className="w-40 shrink-0 border-r border-border/60 pr-3 flex flex-col justify-start gap-2.5">
                      <h4 className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Agent Orchestration
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-semibold ${
                            demoStep === 'agent1' ? 'bg-accent text-accent-foreground animate-pulse' : 
                            ['agent2', 'agent3', 'agent4', 'done'].includes(demoStep) ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground'
                          }`}>
                            {['agent2', 'agent3', 'agent4', 'done'].includes(demoStep) ? '✓' : '1'}
                          </div>
                          <span className={demoStep === 'agent1' ? 'text-foreground font-medium text-[9px]' : 'text-muted-foreground text-[9px]'}>Researcher</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-semibold ${
                            demoStep === 'agent2' ? 'bg-accent text-accent-foreground animate-pulse' : 
                            ['agent3', 'agent4', 'done'].includes(demoStep) ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground'
                          }`}>
                            {['agent3', 'agent4', 'done'].includes(demoStep) ? '✓' : '2'}
                          </div>
                          <span className={demoStep === 'agent2' ? 'text-foreground font-medium text-[9px]' : 'text-muted-foreground text-[9px]'}>Competitor Finder</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-semibold ${
                            demoStep === 'agent3' ? 'bg-accent text-accent-foreground animate-pulse' : 
                            ['agent4', 'done'].includes(demoStep) ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground'
                          }`}>
                            {['agent4', 'done'].includes(demoStep) ? '✓' : '3'}
                          </div>
                          <span className={demoStep === 'agent3' ? 'text-foreground font-medium text-[9px]' : 'text-muted-foreground text-[9px]'}>Market Analyst</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-semibold ${
                            demoStep === 'agent4' ? 'bg-accent text-accent-foreground animate-pulse' : 
                            demoStep === 'done' ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground'
                          }`}>
                            {demoStep === 'done' ? '✓' : '4'}
                          </div>
                          <span className={demoStep === 'agent4' ? 'text-foreground font-medium text-[9px]' : 'text-muted-foreground text-[9px]'}>Briefing Writer</span>
                        </div>
                      </div>
                    </div>

                    {/* Briefing Output area */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col justify-start text-[9px]">
                      {demoStep === 'done' ? (
                        <div className="space-y-3 animate-in fade-in duration-300">
                          <div className="border-l border-accent pl-2.5 py-0.5">
                            <h4 className="font-semibold text-foreground uppercase tracking-wider text-[8px] mb-0.5">Executive Summary</h4>
                            <p className="text-muted-foreground leading-relaxed text-[8.5px]">
                              <strong>Stripe</strong> is the global standard in financial infrastructure, enabling checkout APIs and billing models.
                            </p>
                          </div>
                          <div className="border-l border-accent pl-2.5 py-0.5">
                            <h4 className="font-semibold text-foreground uppercase tracking-wider text-[8px] mb-0.5">Key Competitors</h4>
                            <p className="text-muted-foreground leading-relaxed text-[8.5px]">
                              <strong>Adyen</strong> (enterprise unified checkout) and <strong>Braintree</strong> (developer merchant services).
                            </p>
                          </div>
                          <div className="border-l border-accent pl-2.5 py-0.5">
                            <h4 className="font-semibold text-foreground uppercase tracking-wider text-[8px] mb-0.5">Market Positioning</h4>
                            <p className="text-muted-foreground leading-relaxed text-[8.5px]">
                              Dominates startups and developers. Moving upmarket to compete with Adyen for enterprise scale.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                          <Sparkles className="h-4 w-4 text-accent animate-spin" />
                          <p className="mt-2 text-[9px] font-medium text-foreground">Agent Pipeline executing...</p>
                          <p className="text-[8px] text-muted-foreground/60 max-w-[160px]">Scanning live data for "{demoSearch}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Section 2: How it Works (The Multi-Agent Pipeline) */}
      <section id="how-it-works" className="scroll-mt-24 relative z-10 w-full px-6 md:px-12 lg:px-20 py-24 bg-secondary/10 border-t border-border select-text text-left flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <div className="max-w-2xl mb-12">
            <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
              A Sequential Pipeline of <span className="font-display italic text-accent">Four AI Agents</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-body">
              Briefd coordinates four specialized agents in sequence, passing the context of each agent\'s outputs forward to construct a high-density, multi-dimensional intelligence dossier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {agents.map((ag, idx) => {
              return (
                <div key={idx} className="bg-background border border-border p-7 rounded-xl shadow-sm hover:scale-[1.02] hover:border-slate-400 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 relative z-10 flex flex-col justify-start min-h-[220px]">
                  <span className="absolute top-5 right-6 text-3xl font-extrabold text-accent/20 font-mono tracking-tight">{ag.step}</span>
                  <div className="w-6 h-[2px] bg-accent/50 mb-4" />
                  <h3 className="text-sm font-bold text-foreground tracking-tight mb-2 pr-12">
                    {ag.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {ag.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: Pricing Plans */}
      <section id="plans" className="scroll-mt-24 relative z-10 w-full px-6 md:px-12 lg:px-20 py-24 bg-background border-t border-border select-text flex flex-col items-center">
        <div className="w-full max-w-5xl">
          
          {/* Section title */}
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
              Flexible Plans for <span className="font-display italic text-accent">Scale</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Unlock access to the agentic pipeline, real-time scanning tools, and downloadable PDF reports.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto items-stretch">
            {plans.map((plan, idx) => (
              <div 
                key={idx}
                className={`relative bg-background/60 backdrop-blur-sm border rounded-lg p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:border-slate-400 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${
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
                  
                  {/* Price */}
                  <div className="mt-4 mb-5">
                    {typeof plan.price === 'number' ? (
                      <div className="flex items-baseline">
                        <span className="text-3xl font-semibold tracking-tight text-foreground">₹{plan.price}</span>
                      </div>
                    ) : (
                      <div className="text-3xl font-semibold tracking-tight text-foreground">{plan.price}</div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 border-t border-border/60 pt-4">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={handleCTA}
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
        </div>
      </section>

      {/* Section 4: FAQ Section */}
      <section className="relative z-10 w-full px-6 md:px-12 lg:px-20 py-24 bg-background border-t border-border select-text flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
              Frequently Asked <span className="font-display italic text-accent">Questions</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you need to know about our autonomous research intelligence.
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="border border-border/80 rounded-[6px] overflow-hidden transition-all bg-secondary/10"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between font-medium text-sm text-foreground hover:bg-secondary/25 transition-colors cursor-pointer bg-transparent border-0"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div 
                    className={`transition-all duration-200 overflow-hidden ${
                      isOpen ? 'max-h-40 border-t border-border/40' : 'max-h-0'
                    }`}
                  >
                    <p className="p-5 text-xs text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border bg-background py-8 px-6 md:px-12 lg:px-20 select-none text-[11px] text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="w-full sm:w-1/3 flex justify-center sm:justify-start">
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 text-sm font-medium text-foreground cursor-pointer hover:scale-[1.01] transition-transform"
          >
            Briefd
          </div>
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
