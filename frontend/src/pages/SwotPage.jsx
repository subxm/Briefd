import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Lock, Loader2, ShieldAlert, Check,
  Activity, ArrowRight, Award, Plus, TrendingUp, AlertCircle, Zap, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import DashboardLayout from '../components/DashboardLayout';

const reframeErrorMessage = (rawError) => {
  if (!rawError) return 'An unexpected error occurred. Please try again.';
  const str = String(rawError);
  
  if (str.includes('503') || str.includes('UNAVAILABLE') || str.includes('high demand') || str.includes('temporary')) {
    return 'The AI research service is currently experiencing high demand. Please wait a few seconds and try again.';
  }
  if (str.includes('quota') || str.includes('limit') || str.includes('ResourceExhausted') || str.includes('exhausted')) {
    return 'The API quota limit has been reached. Groq request limits are currently exhausted. Please wait a minute before retrying.';
  }
  if (str.includes('403') || str.includes('Forbidden') || str.includes('Daily limit') || str.includes('limit reached')) {
    return 'Daily competitive scan limit reached. Please upgrade to the Professional plan to run unlimited scans.';
  }
  if (str.includes('401') || str.includes('Unauthorized') || str.includes('Session expired') || str.includes('expired')) {
    return 'Your session has expired. Please log in again to continue.';
  }
  if (str.includes('Failed to fetch') || str.includes('NetworkError') || str.includes('network')) {
    return 'Connection lost. Please check your internet connection or backend server status and try again.';
  }
  return str;
};

export default function SwotPage() {
  const { user, token, loading, activeBriefingId, companyName, upgradeToPro } = useAuth();
  const navigate = useNavigate();

  const [swotData, setSwotData] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Fetch SWOT data when activeBriefingId changes and user is Pro
  useEffect(() => {
    const fetchSwot = async () => {
      const isDemo = companyName && companyName.toLowerCase().includes('(demo)');
      if (!token || !activeBriefingId || (user?.tier !== 'pro' && !isDemo)) {
        setSwotData(null);
        return;
      }

      setIsDataLoading(true);
      setErrorMsg(null);

      try {
        const response = await fetch(`${API_BASE_URL}/briefings/${activeBriefingId}/swot`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || 'Failed to fetch SWOT analysis.');
        }

        const data = await response.json();
        setSwotData(data);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || 'Error loading SWOT analysis.');
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchSwot();
  }, [activeBriefingId, token, user?.tier, retryTrigger]);

  const handleUpgradeClick = async () => {
    setIsUpgrading(true);
    try {
      await upgradeToPro();
    } catch (err) {
      alert(err.message || "Failed to upgrade.");
    } finally {
      setIsUpgrading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center font-body">
        <div className="flex flex-col items-center gap-2 text-muted-foreground select-none">
          <Loader2 className="h-5 w-5 text-accent animate-spin" />
          <span className="text-[12px] font-medium">Loading session...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl w-full mx-auto flex flex-col flex-1">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 select-none text-left text-[11px]">
        <div>
          <h2 className="text-sm font-semibold text-foreground tracking-tight">SWOT Analysis Matrix</h2>
          <p className="text-muted-foreground text-[10px] mt-0.5">
            {companyName ? `Analysis for ${companyName}` : 'Select a scan to view SWOT metrics'}
          </p>
        </div>
      </div>

      {/* Main Container */}
      {!activeBriefingId ? (
        <div className="bg-background rounded-lg border border-border p-8 text-center max-w-lg mx-auto mt-8 shadow-sm">
          <div className="h-12 w-12 bg-secondary text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No Research Scan Selected</h3>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            Please run a search scan on the Home page or select an existing company from your briefings history sidebar to view the SWOT analysis.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-1.5 text-[11px] font-medium transition-colors cursor-pointer"
          >
            Go to Search Panel
          </button>
        </div>
      ) : (user.tier !== 'pro' && !(companyName && companyName.toLowerCase().includes('(demo)'))) ? (
        /* Upgrade Gate Screen */
        <div className="relative bg-background rounded-lg border border-border p-6 md:p-8 shadow-sm overflow-hidden text-left max-w-4xl w-full mx-auto">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          
          <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
            <div className="flex-1 space-y-4">
              <div className="h-10 w-10 bg-accent/15 text-accent rounded-full flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground tracking-tight">
                Unlock SWOT Analysis Dashboard
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-body">
                Access a dynamic, multi-agent extracted SWOT quadrant detailing internal Strengths & Weaknesses alongside external Opportunities & Threats for your target companies.
              </p>
              
              <ul className="space-y-2.5 pt-2">
                {[
                  'Frosted glassmorphic 2x2 SWOT grid layout',
                  'Strategic executive summaries compiled by reasoning agents',
                  'Actionable opportunity maps and vulnerability alerts',
                  'Unlimited competitive briefings and search scans',
                  'Vector-sharp PDF report exports'
                ].map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleUpgradeClick}
                  disabled={isUpgrading}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-[6px] px-5 py-2.5 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span>{isUpgrading ? 'Upgrading...' : 'Upgrade to Professional (₹499)'}</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-secondary text-foreground hover:bg-secondary/80 rounded-[6px] px-5 py-2.5 text-xs font-medium transition-all cursor-pointer text-center"
                >
                  Return to Briefing
                </button>
              </div>
            </div>

            {/* Blurred Mock UI Side */}
            <div className="w-full md:w-80 shrink-0 border border-border bg-secondary/30 rounded-xl p-4 blur-[2.5px] select-none pointer-events-none relative">
              <div className="absolute inset-0 bg-background/20 z-10 flex items-center justify-center">
                <span className="bg-background/90 border border-border px-3 py-1.5 rounded-full text-[10px] font-semibold text-muted-foreground flex items-center gap-1 shadow-md">
                  <Lock className="h-3 w-3 text-accent" /> Premium Feature
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-border bg-background rounded-lg p-3 space-y-2">
                  <div className="h-3 w-12 bg-emerald-500/20 rounded" />
                  <div className="h-1.5 w-full bg-border rounded" />
                  <div className="h-1.5 w-3/4 bg-border rounded" />
                </div>
                <div className="border border-border bg-background rounded-lg p-3 space-y-2">
                  <div className="h-3 w-12 bg-red-500/20 rounded" />
                  <div className="h-1.5 w-full bg-border rounded" />
                  <div className="h-1.5 w-2/3 bg-border rounded" />
                </div>
                <div className="border border-border bg-background rounded-lg p-3 space-y-2">
                  <div className="h-3 w-12 bg-blue-500/20 rounded" />
                  <div className="h-1.5 w-full bg-border rounded" />
                  <div className="h-1.5 w-3/4 bg-border rounded" />
                </div>
                <div className="border border-border bg-background rounded-lg p-3 space-y-2">
                  <div className="h-3 w-12 bg-amber-500/20 rounded" />
                  <div className="h-1.5 w-full bg-border rounded" />
                  <div className="h-1.5 w-2/3 bg-border rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Pro Content Loading & Display */
        <div className="space-y-6 max-w-5xl text-left w-full min-h-[450px] flex flex-col">
          {isDataLoading && (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center select-none text-muted-foreground w-full animate-in fade-in duration-300">
              <div className="relative h-10 w-10 shrink-0 mb-5">
                <div className="absolute inset-0 rounded-full border-[3px] border-t-accent border-r-accent/30 border-b-transparent border-l-transparent animate-spin"></div>
                <div className="absolute inset-0 rounded-full border-[3px] border-t-transparent border-r-transparent border-b-accent border-l-accent/20 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}></div>
              </div>
              <p className="text-[12.5px] font-semibold text-foreground tracking-tight">Extracting SWOT intelligence matrix...</p>
              <p className="mt-1.5 text-[10.5px] text-muted-foreground/75 max-w-[280px] leading-relaxed">
                Analyzing the intel report with Llama 3.3 to structure strengths and vulnerabilities.
              </p>
            </div>
          )}

          {errorMsg && !isDataLoading && (
            <div className="p-4 bg-red-500/[0.03] border border-red-500/15 rounded-xl flex items-start gap-3.5 text-[12px] font-body text-left shadow-sm max-w-2xl w-full animate-in fade-in duration-300">
              <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 shrink-0 mt-0.5">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-700 dark:text-red-400 tracking-tight">SWOT Extraction Failed</p>
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
                    onClick={() => setRetryTrigger(prev => prev + 1)}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/15 text-red-700 dark:text-red-300 rounded-lg font-semibold transition-colors cursor-pointer text-[10.5px]"
                  >
                    Retry Analysis
                  </button>
                </div>
              </div>
            </div>
          )}

          {swotData && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Executive Summary Card */}
              <div className="p-6 border border-border bg-background rounded-2xl shadow-dashboard text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
                <h4 className="text-[13.5px] font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-3 mb-4">
                  <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                  <span className="font-semibold">Strategic Executive Summary</span>
                </h4>
                <p className="text-[12px] text-foreground/80 leading-relaxed font-body">
                  {swotData.executive_summary}
                </p>
              </div>

              {/* SWOT 2x2 Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Strengths Card */}
                <div className="group border border-emerald-500/15 bg-emerald-500/[0.01] hover:bg-emerald-500/[0.02] hover:border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                        <TrendingUp className="h-3.5 w-3.5" />
                      </div>
                      <h4 className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Strengths</h4>
                    </div>
                    <span className="text-[9.5px] font-semibold text-emerald-600/70 dark:text-emerald-400/50 uppercase tracking-wider font-mono">Internal Assets</span>
                  </div>
                  <ul className="space-y-3">
                    {swotData.strengths.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-[11.5px] text-muted-foreground">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-body text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses Card */}
                <div className="group border border-red-500/15 bg-red-500/[0.01] hover:bg-red-500/[0.02] hover:border-red-500/30 rounded-2xl p-6 space-y-4 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-red-500/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center font-bold">
                        <AlertCircle className="h-3.5 w-3.5" />
                      </div>
                      <h4 className="text-[12px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Weaknesses</h4>
                    </div>
                    <span className="text-[9.5px] font-semibold text-red-600/70 dark:text-red-400/50 uppercase tracking-wider font-mono">Internal Limits</span>
                  </div>
                  <ul className="space-y-3">
                    {swotData.weaknesses.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-[11.5px] text-muted-foreground">
                        <ShieldAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-body text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Opportunities Card */}
                <div className="group border border-blue-500/15 bg-blue-500/[0.01] hover:bg-blue-500/[0.02] hover:border-blue-500/30 rounded-2xl p-6 space-y-4 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-blue-500/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                        <Zap className="h-3.5 w-3.5" />
                      </div>
                      <h4 className="text-[12px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Opportunities</h4>
                    </div>
                    <span className="text-[9.5px] font-semibold text-blue-600/70 dark:text-blue-400/50 uppercase tracking-wider font-mono">External Growth</span>
                  </div>
                  <ul className="space-y-3">
                    {swotData.opportunities.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-[11.5px] text-muted-foreground">
                        <Plus className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-body text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Threats Card */}
                <div className="group border border-amber-500/15 bg-amber-500/[0.01] hover:bg-amber-500/[0.02] hover:border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                      <h4 className="text-[12px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Threats</h4>
                    </div>
                    <span className="text-[9.5px] font-semibold text-amber-600/70 dark:text-amber-400/50 uppercase tracking-wider font-mono">External Risks</span>
                  </div>
                  <ul className="space-y-3">
                    {swotData.threats.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-[11.5px] text-muted-foreground">
                        <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-body text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          )}
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
