import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, ChevronDown, Home, CheckSquare, 
  ArrowLeftRight, CreditCard, Landmark, LineChart, 
  Settings, HelpCircle, Activity, Sparkles, AlertCircle, LogOut,
  FileText, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import SearchBar from '../components/SearchBar';
import AgentProgress from '../components/AgentProgress';
import Briefing from '../components/Briefing';

export default function DashboardPage() {
  const { user, token, logout, loading, refreshUser, upgradeToPro } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading]);

  // Competitive Research tool state
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);
  const [completedAgents, setCompletedAgents] = useState([]);
  const [briefingText, setBriefingText] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Supabase Database and limit state
  const [briefingsHistory, setBriefingsHistory] = useState([]);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // PDF Export and dynamic Modal States
  const [activeBriefingId, setActiveBriefingId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [limitModalMode, setLimitModalMode] = useState('limit'); // 'limit' or 'export'

  const resetDashboard = () => {
    setHasSearched(false);
    setCompanyName('');
    setBriefingText('');
    setCompletedAgents([]);
    setActiveAgent(null);
    setErrorMsg(null);
    setActiveBriefingId(null);
  };

  const fetchBriefingsHistory = async (justCompletedCompany = null) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/briefings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBriefingsHistory(data);
        if (justCompletedCompany && data.length > 0) {
          const match = data.find(b => b.company_name.toLowerCase() === justCompletedCompany.toLowerCase());
          if (match) {
            setActiveBriefingId(match.id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch briefings history:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBriefingsHistory();
    }
  }, [token]);

  const loadHistoricalBriefing = async (id) => {
    setIsLoading(true);
    setHasSearched(true);
    setActiveAgent(null);
    setCompletedAgents([1, 2, 3, 4]);
    setErrorMsg(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/briefings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to load historical briefing.");
      }
      const data = await response.json();
      setCompanyName(data.company_name);
      setBriefingText(data.briefing_text);
      setActiveBriefingId(id);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeClick = async () => {
    setIsUpgrading(true);
    try {
      await upgradeToPro();
      fetchBriefingsHistory();
    } catch (err) {
      alert(err.message || "Failed to upgrade.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleExportClick = async () => {
    if (!activeBriefingId) {
      alert("No active briefing found to export. Please select a historical briefing or run a new search.");
      return;
    }
    
    if (user.tier !== 'pro') {
      setLimitModalMode('export');
      setShowLimitModal(true);
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
          logout();
          navigate('/login');
          throw new Error('Session expired. Please log in again.');
        }
        if (response.status === 403) {
          setErrorMsg(null);
          setHasSearched(false);
          setLimitModalMode('limit');
          setShowLimitModal(true);
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

  // Get initials for profile badge
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-body select-text">
      
      {/* Top Bar */}
      <header className="h-12 border-b border-border flex items-center justify-between px-4 select-none relative z-30 bg-background shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-primary text-primary-foreground rounded flex items-center justify-center font-bold text-[10px]">
            B
          </div>
          <span className="font-semibold text-[13px] text-foreground">Briefd</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" />
        </div>

        {/* Search Bar / CMD Box */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-secondary rounded-md border border-border w-64 text-muted-foreground/60 text-[11px] text-left">
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1">Search briefings...</span>
          <kbd className="text-[9px] bg-background border border-border px-1 rounded text-muted-foreground/50 font-mono">⌘K</kbd>
        </div>

        {/* Actions + Profile */}
        <div className="flex items-center gap-3">
          <button 
            onClick={resetDashboard}
            className="px-2.5 py-1 bg-secondary border border-border text-foreground hover:bg-secondary/80 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>New Research</span>
          </button>
          <div className="relative text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <Bell className="h-3.5 w-3.5" />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-accent rounded-full"></span>
          </div>
          
          {/* Avatar Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="h-7 w-7 rounded-full bg-accent text-accent-foreground font-semibold flex items-center justify-center text-[10px] shadow-sm cursor-pointer select-none hover:ring-1 hover:ring-accent transition-all"
            >
              {initials}
            </button>
            
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-dashboard p-1.5 z-40 text-left text-[11px]"
                  >
                    <div className="px-2.5 py-2 border-b border-border/60 mb-1">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar (w-40) */}
        <aside className="w-40 border-r border-border p-3 flex flex-col justify-between select-none bg-background/50 hidden md:flex text-[11px] text-left">
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
            <div className="space-y-1">
              <button 
                onClick={resetDashboard}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded bg-secondary text-foreground font-medium transition-colors cursor-pointer"
              >
                <Home className="h-3.5 w-3.5 text-accent" />
                <span>Home</span>
              </button>
              <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Users className="h-3.5 w-3.5" />
                <span>Competitors</span>
              </button>
              <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <LineChart className="h-3.5 w-3.5" />
                <span>Market Trends</span>
              </button>
              <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Activity className="h-3.5 w-3.5" />
                <span>API Status</span>
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <p className="px-2.5 text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Briefings History</p>
              <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar px-1">
                {briefingsHistory.map((brief) => (
                  <button 
                    key={brief.id} 
                    onClick={() => loadHistoricalBriefing(brief.id)}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer text-[10px] truncate"
                  >
                    <FileText className="h-3.5 w-3.5 text-accent/80 shrink-0" />
                    <span className="truncate">{brief.company_name}</span>
                  </button>
                ))}
                {briefingsHistory.length === 0 && (
                  <p className="px-2.5 py-1 text-[10px] text-muted-foreground/60 italic">No past scans.</p>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <p className="px-2.5 text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Feeds & Settings</p>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <Bell className="h-3.5 w-3.5" />
                  <span>Notifications</span>
                </button>
                <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <Settings className="h-3.5 w-3.5" />
                  <span>Preferences</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-border/60 pt-3 shrink-0">
            <div className="px-2.5 text-[10px]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-muted-foreground">Tier:</span>
                <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-semibold uppercase tracking-wider ${
                  user.tier === 'pro' 
                    ? 'bg-accent/15 text-accent border border-accent/20' 
                    : 'bg-secondary text-muted-foreground border border-border'
                }`}>
                  {user.tier === 'pro' ? 'Pro' : 'Free'}
                </span>
              </div>
              {user.tier !== 'pro' ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] text-muted-foreground/85">
                    <span>Scans today:</span>
                    <span className="font-semibold text-foreground">{user.scans_today} / 2</span>
                  </div>
                  <button 
                    onClick={handleUpgradeClick}
                    disabled={isUpgrading}
                    className="w-full py-1.5 bg-accent text-accent-foreground hover:bg-accent/90 rounded text-[9.5px] font-semibold transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <Sparkles className="h-2.5 w-2.5 animate-pulse" />
                    <span>{isUpgrading ? 'Upgrading...' : 'Upgrade (₹499)'}</span>
                  </button>
                </div>
              ) : (
                <div className="flex justify-between text-[9px] text-muted-foreground/85">
                  <span>Scans:</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Unlimited</span>
                  </span>
                </div>
              )}
            </div>
            
            <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Support</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace (bg-secondary/20 with internal scroll) */}
        <main className="flex-1 bg-secondary/20 p-4 md:p-6 overflow-y-auto custom-scrollbar flex flex-col justify-start">
          
          {/* Greeting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 select-none text-left text-[11px]">
            <div>
              <h2 className="text-sm font-semibold text-foreground tracking-tight">Welcome, {user.name}</h2>
              <p className="text-muted-foreground text-[10px] mt-0.5">Workspace overview & research toolkit.</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button 
                onClick={resetDashboard}
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
              <button className="rounded-full bg-background border border-border text-foreground hover:bg-secondary px-3.5 py-1 text-[10px] font-medium transition-colors cursor-pointer">Invite Team</button>
              <button className="rounded-full bg-background border border-border text-foreground hover:bg-secondary px-3.5 py-1 text-[10px] font-medium transition-colors cursor-pointer">API Status</button>
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
              {hasSearched && (
                <motion.div 
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
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Credit Limit Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-background border border-border rounded-xl p-6 shadow-dashboard text-left"
            >
              <div className="h-10 w-10 bg-accent/15 text-accent rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                {limitModalMode === 'export' ? 'Unlock Premium PDF Export' : 'Daily Scan Limit Reached'}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed font-body">
                {limitModalMode === 'export' 
                  ? 'Downloading reports as professionally-formatted PDFs is a Premium feature. Upgrade to the Professional plan for a ₹499 one-time payment to unlock PDF exports, unlimited scans, and advanced agent analysis.'
                  : 'The Free Starter plan is limited to 2 competitive scans per day. Upgrade to the Professional plan for a ₹499 one-time payment to unlock unlimited scans, advanced market position analysis, and export features.'}
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowLimitModal(false);
                    handleUpgradeClick();
                  }}
                  className="w-full h-10 bg-accent text-accent-foreground hover:bg-accent/90 rounded-[6px] text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Upgrade to Professional (₹499)</span>
                </button>
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="w-full h-10 bg-secondary text-foreground hover:bg-secondary/80 rounded-[6px] text-xs font-medium transition-all flex items-center justify-center cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
