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
              className="flex flex-col md:flex-row gap-6 border-t border-border/60 pt-5 text-left text-[11px]"
            >
              {/* Progress Timeline on the left */}
              <div className="w-full md:w-60 shrink-0">
                <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Agent Orchestration
                </h4>
                <AgentProgress activeAgent={activeAgent} completedAgents={completedAgents} />
              </div>

              {/* Briefing Results on the right */}
              <div className="flex-1 min-w-0 border-t md:border-t-0 md:border-l border-border/60 pt-5 md:pt-0 md:pl-6">
                <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Briefing Outputs
                </h4>
                
                {/* Error messaging */}
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-red-700 text-[12px] font-body">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Analysis Failed</p>
                      <p className="mt-0.5 opacity-90">{errorMsg}</p>
                    </div>
                  </div>
                )}

                {/* Loading state message if briefing hasn't started */}
                {isLoading && !briefingText && !errorMsg && (
                  <div className="flex flex-col items-center justify-center py-12 text-center select-none text-muted-foreground">
                    <div className="h-6 w-6 rounded-full border border-border flex items-center justify-center animate-pulse">
                      <Sparkles className="h-3.5 w-3.5 text-accent animate-spin" />
                    </div>
                    <p className="mt-3 text-[12px] font-medium text-foreground">Gathering information from search indices...</p>
                    <p className="mt-1 text-[10px] text-muted-foreground/60 max-w-xs">
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
