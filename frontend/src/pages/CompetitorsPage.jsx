import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Sparkles, Check, X, ShieldAlert, Award, 
  HelpCircle, ChevronRight, Lock, Loader2, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import DashboardLayout from '../components/DashboardLayout';

const reframeErrorMessage = (rawError) => {
  if (!rawError) return 'An unexpected error occurred. Please try again.';
  const str = String(rawError);
  
  if (str.includes('503') || str.includes('UNAVAILABLE') || str.includes('high demand') || str.includes('temporary')) {
    return 'The AI research service is currently experiencing high demand. This is usually temporary. Please wait a few seconds and try again.';
  }
  if (str.includes('quota') || str.includes('limit') || str.includes('ResourceExhausted') || str.includes('exhausted')) {
    return 'The API quota limit has been reached. Gemini request limits are currently exhausted. Please wait a minute before retrying.';
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

export default function CompetitorsPage() {
  const { user, token, loading, activeBriefingId, companyName, upgradeToPro } = useAuth();
  const navigate = useNavigate();

  const [matrixData, setMatrixData] = useState(null);
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

  // Fetch competitor intelligence when activeBriefingId changes and user is Pro
  useEffect(() => {
    const fetchCompetitors = async () => {
      if (!token || !activeBriefingId || user?.tier !== 'pro') {
        setMatrixData(null);
        return;
      }

      setIsDataLoading(true);
      setErrorMsg(null);

      try {
        const response = await fetch(`${API_BASE_URL}/briefings/${activeBriefingId}/competitors`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || 'Failed to fetch competitor matrix.');
        }

        const data = await response.json();
        setMatrixData(data);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || 'Error loading competitor intelligence.');
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchCompetitors();
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

  // Helper to render check/x icons
  const renderStatusIcon = (hasFeature) => {
    return hasFeature ? (
      <div className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600">
        <Check className="h-3.5 w-3.5" />
      </div>
    ) : (
      <div className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500/10 text-red-600">
        <X className="h-3.5 w-3.5" />
      </div>
    );
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 select-none text-left text-[11px]">
        <div>
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Competitor Intelligence</h2>
          <p className="text-muted-foreground text-[10px] mt-0.5">
            {companyName ? `Analysis for ${companyName}` : 'Select a scan to analyze competitors'}
          </p>
        </div>
      </div>

      {/* Main Container */}
      {!activeBriefingId ? (
        <div className="bg-background rounded-lg border border-border p-8 text-center max-w-lg mx-auto mt-8 shadow-sm">
          <div className="h-12 w-12 bg-secondary text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No Research Scan Selected</h3>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            Please run a search scan on the Home page or select an existing company from your briefings history sidebar to view competitor data.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-1.5 text-[11px] font-medium transition-colors cursor-pointer"
          >
            Go to Search Panel
          </button>
        </div>
      ) : user.tier !== 'pro' ? (
        /* Upgrade Gate Screen */
        <div className="relative bg-background rounded-lg border border-border p-6 md:p-8 shadow-sm overflow-hidden text-left max-w-4xl w-full">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          
          <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
            <div className="flex-1 space-y-4">
              <div className="h-10 w-10 bg-accent/15 text-accent rounded-full flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground tracking-tight">
                Unlock Competitor Threat Profiling & Feature Matrix
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-body">
                Get an instant, deep-dive comparison grid mapping core capabilities, differentiators, sizing category, pricing models, and key strengths/weaknesses for each rival.
              </p>
              
              <ul className="space-y-2.5 pt-2">
                {[
                  'Deep-dive competitor profiles (strengths, weaknesses, differentiator)',
                  'Multi-rival side-by-side feature comparison table',
                  'Instant threat scores relative to your target company',
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
              
              <div className="space-y-3">
                <div className="h-4 w-24 bg-border rounded" />
                <div className="h-1.5 w-full bg-border rounded" />
                
                <div className="border border-border bg-background rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-3.5 w-16 bg-border rounded" />
                    <div className="h-4 w-10 bg-accent/20 rounded-full" />
                  </div>
                  <div className="h-1.5 w-full bg-border rounded" />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="h-6 bg-secondary rounded" />
                    <div className="h-6 bg-secondary rounded" />
                  </div>
                </div>

                <div className="border border-border bg-background rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-3.5 w-14 bg-border rounded" />
                    <div className="h-4 w-10 bg-accent/20 rounded-full" />
                  </div>
                  <div className="h-1.5 w-3/4 bg-border rounded" />
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
              <div className="relative flex items-center justify-center w-16 h-16 mb-5">
                {/* Ambient pulsing aura */}
                <div className="absolute inset-0 rounded-full bg-accent/10 blur-md animate-pulse" />
                
                {/* Outer rotating ring */}
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent border-r-accent/30 animate-spin" style={{ animationDuration: '1.2s' }} />
                
                {/* Inner counter-rotating ring */}
                <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-b-accent border-l-accent/20 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                
                {/* Central pulsing decorative dot */}
                <div className="absolute inset-[13px] rounded-full bg-background border border-border/80 flex items-center justify-center shadow-sm">
                  <Users className="h-3.5 w-3.5 text-accent animate-pulse" />
                </div>
              </div>
              <p className="text-[12.5px] font-semibold text-foreground tracking-tight">Extracting competitor intelligence matrix...</p>
              <p className="mt-1.5 text-[10.5px] text-muted-foreground/75 max-w-[280px] leading-relaxed">
                Analyzing the intel report with Gemini to structure profiles and capabilities.
              </p>
            </div>
          )}

          {errorMsg && !isDataLoading && (
            <div className="p-4 bg-red-500/[0.03] border border-red-500/15 rounded-xl flex items-start gap-3.5 text-[12px] font-body text-left shadow-sm max-w-2xl w-full animate-in fade-in duration-300">
              <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 shrink-0 mt-0.5">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-700 dark:text-red-400 tracking-tight">Competitor Intelligence Extraction Failed</p>
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

          {matrixData && (
            <>
              {/* Competitor Threat Profiles Section */}
              <div className="text-left space-y-4">
                <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                  <Users className="h-4 w-4 text-accent" />
                  <span>Competitor Threat Profiles</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matrixData.competitors?.map((competitor, idx) => (
                    <div 
                      key={idx}
                      className="bg-background border border-border hover:border-slate-400/80 rounded-xl p-5 shadow-sm space-y-4 transition-all"
                    >
                      {/* Name, scale and pricing */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-[13px] font-bold text-foreground">{competitor.name}</h4>
                          <p className="text-[11px] text-muted-foreground/90 mt-0.5">
                            {competitor.scale} • {competitor.pricing_model}
                          </p>
                        </div>
                        <div className="bg-accent/10 text-accent text-[9px] font-semibold px-2.5 py-0.5 rounded-full border border-accent/10">
                          Threat Score: {competitor.strength_score}/10
                        </div>
                      </div>

                      {/* Threat Score Progress bar */}
                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent rounded-full transition-all duration-500" 
                            style={{ width: `${(competitor.strength_score || 0) * 10}%` }}
                          />
                        </div>
                      </div>

                      {/* Differentiator */}
                      <div className="text-[11.5px] bg-secondary/40 border border-border/60 rounded px-2.5 py-1.5 italic text-muted-foreground/95">
                        <span className="font-semibold text-foreground/80 not-italic block mb-0.5 text-[10px]">Core Differentiator</span>
                        "{competitor.differentiator}"
                      </div>

                      {/* Strengths & Weaknesses lists */}
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div className="space-y-1.5 text-left">
                          <h5 className="text-[10px] font-semibold text-foreground/80 uppercase tracking-wider">Key Strengths</h5>
                          <ul className="space-y-1">
                            {competitor.strengths?.map((str, sIdx) => (
                              <li key={sIdx} className="text-[11px] text-muted-foreground/95 flex items-start gap-1">
                                <span className="text-emerald-500 font-bold shrink-0">•</span>
                                <span className="leading-normal">{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-1.5 text-left">
                          <h5 className="text-[10px] font-semibold text-foreground/80 uppercase tracking-wider">Key Weaknesses</h5>
                          <ul className="space-y-1">
                            {competitor.weaknesses?.map((weak, wIdx) => (
                              <li key={wIdx} className="text-[11px] text-muted-foreground/95 flex items-start gap-1">
                                <span className="text-red-500 font-bold shrink-0">•</span>
                                <span className="leading-normal">{weak}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capability Grid / Feature Matrix Section */}
              {matrixData.key_features && matrixData.key_features.length > 0 && (
                <div className="text-left space-y-4 pt-4">
                  <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                    <Award className="h-4 w-4 text-accent" />
                    <span>Capability Check & Feature Matrix</span>
                  </h3>
                  
                  <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="min-w-full divide-y divide-border text-left">
                        <thead className="bg-secondary/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider select-none">
                          <tr>
                            <th className="px-4 py-3 min-w-[150px]">Feature / Capability</th>
                            <th className="px-4 py-3 text-center bg-accent/5 text-foreground font-bold">
                              {matrixData.target_company_name || 'Target Company'}
                            </th>
                            {matrixData.competitors?.map((comp, idx) => (
                              <th key={idx} className="px-4 py-3 text-center min-w-[120px]">{comp.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-[11px] text-muted-foreground">
                          {matrixData.key_features.map((feature, fIdx) => (
                            <tr key={fIdx} className="hover:bg-secondary/20 transition-colors">
                              <td className="px-4 py-3 font-semibold text-foreground/90">{feature.feature_name}</td>
                              
                              {/* Target Has Column */}
                              <td className="px-4 py-3 text-center bg-accent/5">
                                {renderStatusIcon(feature.target_has)}
                              </td>
                              
                              {/* Competitors Has Columns */}
                              {matrixData.competitors?.map((comp, cIdx) => {
                                const state = feature.competitors_have?.find(
                                  (s) => s.competitor_name.toLowerCase() === comp.name.toLowerCase()
                                );
                                return (
                                  <td key={cIdx} className="px-4 py-3 text-center">
                                    {renderStatusIcon(state ? state.has : false)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
