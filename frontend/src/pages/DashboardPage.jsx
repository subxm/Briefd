import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import SearchBar from '../components/SearchBar';
import AgentProgress from '../components/AgentProgress';
import Briefing from '../components/Briefing';
import DashboardLayout from '../components/DashboardLayout';

const reframeErrorMessage = (rawError) => {
  if (!rawError) return 'An unexpected error occurred during research. Please try again.';
  const str = String(rawError);
  
  if (str.includes('503') || str.includes('UNAVAILABLE') || str.includes('high demand') || str.includes('temporary')) {
    return 'The AI research service is currently experiencing high demand. This is usually temporary. Please wait a few seconds and click Retry to resume your scan.';
  }
  if (str.includes('quota') || str.includes('limit') || str.includes('ResourceExhausted') || str.includes('exhausted')) {
    return 'The API quota limit has been reached. Gemini request limits are currently exhausted. Please wait a minute before running another scan.';
  }
  if (str.includes('403') || str.includes('Forbidden') || str.includes('Daily limit') || str.includes('limit reached')) {
    return 'Daily competitive scan limit reached. Please upgrade to the Professional plan to run unlimited research scans.';
  }
  if (str.includes('401') || str.includes('Unauthorized') || str.includes('Session expired') || str.includes('expired')) {
    return 'Your session has expired. Please log in again to continue.';
  }
  if (str.includes('Failed to fetch') || str.includes('NetworkError') || str.includes('network')) {
    return 'Connection lost. Please check your internet connection or backend server status and try again.';
  }
  
  let cleaned = str;
  if (cleaned.startsWith('Error:')) {
    cleaned = cleaned.substring(6).trim();
  }
  
  if (cleaned.includes('"message":')) {
    try {
      const match = cleaned.match(/"message":\s*"([^"]+)"/);
      if (match && match[1]) {
        return match[1];
      }
    } catch (e) {}
  }
  
  return cleaned;
};

export default function DashboardPage() {
  const { 
    user, token, loading, refreshUser,
    activeBriefingId, setActiveBriefingId,
    companyName, setCompanyName,
    briefingText, setBriefingText,
    briefingsHistory, fetchBriefingsHistory
  } = useAuth();
  
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading]);

  // Local research and scan states
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);
  const [completedAgents, setCompletedAgents] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Sync hasSearched when a historical briefing is loaded
  useEffect(() => {
    if (briefingText) {
      setHasSearched(true);
      setCompletedAgents([1, 2, 3, 4]);
      setActiveAgent(null);
      setErrorMsg(null);
    }
  }, [briefingText]);

  const handleExportClick = async () => {
    if (!activeBriefingId) {
      alert("No active briefing found to export. Please select a historical briefing or run a new search.");
      return;
    }
    
    setIsExporting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/briefings/${activeBriefingId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to download PDF report.");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Briefd_${companyName.replace(/\s+/g, '_')}_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert(err.message || "Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleResearchSubmit = async (company) => {
    setCompanyName(company);
    setIsLoading(true);
    setHasSearched(true);
    setActiveAgent(1);
    setCompletedAgents([]);
    setBriefingText('');
    setErrorMsg(null);
    setActiveBriefingId(null);

    try {
      const response = await fetch(`${API_BASE_URL}/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ company }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          throw new Error('Session expired. Please log in again.');
        }
        if (response.status === 403) {
          setErrorMsg("Daily limit reached. Upgrade to Pro for unlimited scans.");
          setHasSearched(false);
          alert("Daily scan limit reached! Please upgrade to Pro via the sidebar.");
          return;
        }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Failed to initialize research: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep trailing incomplete line in buffer

        let currentEvent = null;

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('event:')) {
            currentEvent = trimmed.substring(6).trim();
          } else if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.substring(5).trim();
            try {
              const data = JSON.parse(dataStr);
              
              if (currentEvent === 'agent_start') {
                setActiveAgent(data.agent);
              } else if (currentEvent === 'agent_done') {
                setCompletedAgents(prev => [...prev, data.agent]);
              } else if (currentEvent === 'complete') {
                setBriefingText(data.briefing);
                setActiveAgent(null);
                setCompletedAgents([1, 2, 3, 4]);
                // Sync user state and search history upon scan completion
                setTimeout(() => {
                  refreshUser();
                  fetchBriefingsHistory(company);
                }, 1000);
              } else if (currentEvent === 'error') {
                setErrorMsg(data.message);
                setActiveAgent(null);
              }
            } catch (err) {
              console.error('Failed to parse SSE line data:', err);
            }
            currentEvent = null;
          }
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during research.');
      setActiveAgent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setHasSearched(false);
    setCompanyName('');
    setBriefingText('');
    setCompletedAgents([]);
    setActiveAgent(null);
    setErrorMsg(null);
    setActiveBriefingId(null);
  };

  if (loading || !user) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center font-body">
        <div className="flex flex-col items-center gap-2 text-muted-foreground select-none">
          <Sparkles className="h-5 w-5 text-accent animate-spin" />
          <span className="text-[12px] font-medium">Loading session...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 select-none text-left text-[11px]">
        <div>
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Welcome, {user.name}</h2>
          <p className="text-muted-foreground text-[10px] mt-0.5">Workspace overview & research toolkit.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button 
            onClick={handleReset}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/95 px-3.5 py-1 text-[10px] font-medium transition-colors shadow-sm cursor-pointer"
          >
            New Scan
          </button>
          <button 
            onClick={handleExportClick}
            disabled={!briefingText || isExporting}
            className="rounded-full bg-background border border-border text-foreground hover:bg-secondary px-3.5 py-1 text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <span className="h-3 w-3 border-2 border-accent border-t-transparent rounded-full animate-spin"></span>
            ) : user.tier !== 'pro' ? (
              <Sparkles className="h-3 w-3 text-accent shrink-0 animate-pulse" />
            ) : null}
            <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Research Panel Container */}
      <div className="bg-background rounded-lg border border-border p-4 md:p-5 flex flex-col gap-6 shadow-sm">
        
        {/* Tool Header */}
        <div className="flex items-start justify-between border-b border-border/60 pb-3 text-left">
          <div>
            <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>Competitive Research Multi-Agent Toolkit</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              Run 4 agents sequentially to synthesize intelligence on your target company.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="w-full">
          <SearchBar onSubmit={handleResearchSubmit} isLoading={isLoading} />
        </div>

        {/* Active Workings Panel */}
        <AnimatePresence mode="wait">
          {hasSearched ? (
            <motion.div 
              key="active-search"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-6 border-t border-border/60 pt-5 text-left text-[11px] w-full"
            >
              {/* Progress Stepper at the top */}
              <div className="w-full space-y-2.5">
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Agent Orchestration
                </h4>
                <AgentProgress activeAgent={activeAgent} completedAgents={completedAgents} />
              </div>

              {/* Briefing Results below */}
              <div className="w-full min-w-0 border-t border-border/60 pt-5">
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Briefing Outputs
                </h4>
                
                 {/* Error messaging */}
                 {errorMsg && (
                   <div className="p-4 bg-red-500/[0.03] border border-red-500/15 rounded-xl flex items-start gap-3.5 text-[12px] font-body text-left shadow-sm w-full animate-in fade-in duration-300">
                     <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 shrink-0 mt-0.5">
                       <AlertCircle className="h-4 w-4" />
                     </div>
                     <div className="flex-1">
                       <p className="font-semibold text-red-700 dark:text-red-400 tracking-tight">Research Stream Interrupted</p>
                       <p className="mt-1 text-muted-foreground leading-relaxed">
                         {reframeErrorMessage(errorMsg)}
                       </p>
                       
                       <details className="mt-2 text-[10px] text-muted-foreground/60 cursor-pointer select-none">
                         <summary className="hover:text-muted-foreground transition-colors font-medium outline-none">Technical details</summary>
                         <pre className="mt-1.5 p-2 bg-secondary/50 rounded-md border border-border/40 overflow-x-auto font-mono text-[9px] select-text whitespace-pre-wrap leading-normal">
                           {String(errorMsg)}
                         </pre>
                       </details>

                       <div className="mt-3.5 flex items-center gap-4">
                         <button
                           onClick={() => handleResearchSubmit(companyName)}
                           className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/15 text-red-700 dark:text-red-300 rounded-lg font-semibold transition-colors cursor-pointer text-[10.5px]"
                         >
                           Retry Scan
                         </button>
                         <button
                           onClick={handleReset}
                           className="text-muted-foreground hover:text-foreground transition-colors font-medium text-[10.5px] cursor-pointer"
                         >
                           Clear Search
                         </button>
                       </div>
                     </div>
                   </div>
                 )}
 
                 {/* Loading state message if briefing hasn't started */}
                 {isLoading && !briefingText && !errorMsg && (
                   <div className="flex flex-col items-center justify-center py-16 text-center select-none text-muted-foreground w-full animate-in fade-in duration-300">
                     <div className="relative flex items-center justify-center w-16 h-16 mb-5">
                       {/* Ambient pulsing aura */}
                       <div className="absolute inset-0 rounded-full bg-accent/10 blur-md animate-pulse" />
                       
                       {/* Outer rotating ring */}
                       <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent border-r-accent/30 animate-spin" style={{ animationDuration: '1.2s' }} />
                       
                       {/* Inner counter-rotating ring */}
                       <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-b-accent border-l-accent/20 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                       
                       {/* Central pulsing decorative dot */}
                       <div className="absolute inset-[13px] rounded-full bg-background border border-border/80 flex items-center justify-center shadow-sm">
                         <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
                       </div>
                     </div>
                     <p className="text-[12.5px] font-semibold text-foreground tracking-tight">Gathering information from search indices...</p>
                     <p className="mt-1.5 text-[10.5px] text-muted-foreground/75 max-w-[280px] leading-relaxed">
                       Our agents are currently scanning the web. This can take up to 30-45 seconds.
                     </p>
                   </div>
                 )}

                {/* Stream/Display the briefing report */}
                {(briefingText || completedAgents.length > 0) && (
                  <Briefing briefingText={briefingText} />
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pipeline-placeholder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="border-t border-border/60 pt-5 text-left text-[11px]"
            >
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Research Pipeline Loop
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                {[
                  {
                    step: '01',
                    name: 'Company Researcher',
                    desc: 'Scans search indices, archives news, and builds target profiles.'
                  },
                  {
                    step: '02',
                    name: 'Competitor Finder',
                    desc: 'Identifies alternatives, extracts rivals, and maps threat cards.'
                  },
                  {
                    step: '03',
                    name: 'Positioning Analyst',
                    desc: 'Maps feature capability grids and counts differentiator levels.'
                  },
                  {
                    step: '04',
                    name: 'Briefing Writer',
                    desc: 'Synthesizes all structured agent data into final markdown briefs.'
                  }
                ].map((agent, index) => (
                  <div key={index} className="relative bg-secondary/35 border border-border/60 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-all min-h-[110px]">
                    {/* Connecting Chevron/Arrow for desktop */}
                    {index < 3 && (
                      <div className="hidden sm:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 bg-background border border-border rounded-full p-1 text-muted-foreground">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9.5px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/10">
                          Step {agent.step}
                        </span>
                      </div>
                      <h5 className="text-[11.5px] font-bold text-foreground leading-tight">{agent.name}</h5>
                      <p className="mt-1.5 text-[10.5px] text-muted-foreground/85 leading-relaxed">{agent.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Placeholder dashboard content when no active scan is open */}
      {!hasSearched && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 text-left">
          {/* Quick Scans / Popular Targets */}
          <div className="md:col-span-2 bg-background rounded-lg border border-border p-5 shadow-sm space-y-4">
            <div>
              <h4 className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-accent" />
                <span>Suggested Research Targets</span>
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Click any popular tech firm to launch a sequential multi-agent scan instantly.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'Stripe', industry: 'Fintech / Payments' },
                { name: 'Figma', industry: 'Design Tools' },
                { name: 'Notion', industry: 'Collaborative Workspace' },
                { name: 'Supabase', industry: 'Database / Backend' },
                { name: 'Vercel', industry: 'Frontend Deployment' },
                { name: 'OpenAI', industry: 'AI Foundation Models' }
              ].map((company, idx) => (
                <button
                  key={idx}
                  onClick={() => handleResearchSubmit(company.name)}
                  className="flex flex-col items-start p-3 bg-secondary/35 border border-border/80 hover:border-slate-350 hover:bg-secondary/60 rounded-xl transition-all cursor-pointer text-left w-full"
                >
                  <span className="text-[11.5px] font-bold text-foreground">{company.name}</span>
                  <span className="text-[9.5px] text-muted-foreground mt-0.5">{company.industry}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-background rounded-lg border border-border p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="text-[12px] font-semibold text-foreground">Workspace Metrics</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Overview of scan logs and resource allocations.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px] py-1 border-b border-border/40">
                <span className="text-muted-foreground">Scanned Companies</span>
                <span className="font-semibold text-foreground">{(briefingsHistory || []).length}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] py-1 border-b border-border/40">
                <span className="text-muted-foreground">Competitors Profiled</span>
                <span className="font-semibold text-foreground">{(briefingsHistory || []).length * 3}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] py-1">
                <span className="text-muted-foreground">Active Billing Tier</span>
                <span className="font-semibold text-accent capitalize">{user.tier}</span>
              </div>
            </div>

            <div className="text-[9px] bg-secondary/50 border border-border/60 p-2 rounded text-muted-foreground leading-normal">
              {user.tier === 'pro' 
                ? 'Professional plan activated. Priority agent streams and unrestricted PDF/Competitor matrices are ready.'
                : 'Upgrade to Professional in settings to unlock unlimited research limits, deep competitor tables, and PDF reports.'
              }
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
