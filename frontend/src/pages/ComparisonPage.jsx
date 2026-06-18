import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Lock, Loader2, ShieldAlert, Check, X,
  Activity, ArrowRight, BarChart2, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import DashboardLayout from '../components/DashboardLayout';

export default function ComparisonPage() {
  const { user, token, loading, briefingsHistory, activeBriefingId, upgradeToPro } = useAuth();
  const navigate = useNavigate();

  const [baseId, setBaseId] = useState('');
  const [compareId, setCompareId] = useState('');
  const [baseData, setBaseData] = useState(null);
  const [compareData, setCompareData] = useState(null);

  const [isDataLoading, setIsDataLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Set initial selections when history loads
  useEffect(() => {
    if (briefingsHistory.length > 0) {
      const activeItem = briefingsHistory.find(b => b.id === activeBriefingId);
      if (activeItem) {
        setBaseId(activeItem.id);
      } else {
        setBaseId(briefingsHistory[0].id);
      }
      
      // Select a different one for comparison if possible
      if (briefingsHistory.length > 1) {
        const otherItem = briefingsHistory.find(b => b.id !== activeBriefingId);
        setCompareId(otherItem.id);
      } else {
        setCompareId(briefingsHistory[0].id);
      }
    }
  }, [briefingsHistory, activeBriefingId]);

  const fetchComparisonData = async () => {
    if (!token || !baseId || !compareId || user?.tier !== 'pro') return;

    setIsDataLoading(true);
    setErrorMsg(null);
    setBaseData(null);
    setCompareData(null);

    try {
      // Fetch both competitor matrices in parallel
      const [resBase, resCompare] = await Promise.all([
        fetch(`${API_BASE_URL}/briefings/${baseId}/competitors`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/briefings/${compareId}/competitors`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!resBase.ok || !resCompare.ok) {
        throw new Error('Failed to load comparison profiles.');
      }

      const dataBase = await resBase.json();
      const dataCompare = await resCompare.json();

      setBaseData(dataBase);
      setCompareData(dataCompare);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load comparison data.');
    } finally {
      setIsDataLoading(false);
    }
  };

  // Trigger load when ids change
  useEffect(() => {
    if (baseId && compareId && user?.tier === 'pro') {
      if (baseId === compareId) {
        setBaseData(null);
        setCompareData(null);
      } else {
        fetchComparisonData();
      }
    }
  }, [baseId, compareId, user?.tier]);

  const handleBaseChange = (e) => {
    const newBaseId = e.target.value;
    setBaseId(newBaseId);
    if (newBaseId === compareId && briefingsHistory.length > 1) {
      const other = briefingsHistory.find(b => b.id !== newBaseId);
      if (other) {
        setCompareId(other.id);
      }
    }
  };

  const handleCompareChange = (e) => {
    const newCompareId = e.target.value;
    setCompareId(newCompareId);
    if (newCompareId === baseId && briefingsHistory.length > 1) {
      const other = briefingsHistory.find(b => b.id !== newCompareId);
      if (other) {
        setBaseId(other.id);
      }
    }
  };

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

  const renderStatusIcon = (hasFeature) => {
    return hasFeature ? (
      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
    ) : (
      <X className="h-4 w-4 text-red-600 dark:text-red-400 mx-auto" />
    );
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 select-none text-left text-[11px]">
        <div>
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Competitive Benchmarking</h2>
          <p className="text-muted-foreground text-[10px] mt-0.5 font-body">Compare and analyze competitors across researched targets.</p>
        </div>
      </div>

      {/* Main Container */}
      {briefingsHistory.length === 0 ? (
        <div className="bg-background rounded-lg border border-border p-8 text-center max-w-lg mx-auto mt-8 shadow-sm">
          <div className="h-12 w-12 bg-secondary text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No Research Scan History</h3>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            Please run a search scan on the Home page first to build up your company history list for benchmarking.
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
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          
          <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
            <div className="flex-1 space-y-4">
              <div className="h-10 w-10 bg-accent/15 text-accent rounded-full flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground tracking-tight">
                Unlock Side-by-Side Benchmarking Workbench
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-body">
                Benchmark multiple target companies side-by-side to compare their market models, competitive threats, differentiators, and core product capability matrix grids.
              </p>
              
              <ul className="space-y-2.5 pt-2">
                {[
                  'Side-by-side target company details comparison',
                  'Aggregated rival threat scale benchmarks',
                  'Consolidated capabilities comparison checklist',
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
              
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 bg-secondary border border-border rounded" />
                  <div className="h-8 bg-secondary border border-border rounded" />
                </div>
                <div className="border border-border bg-background rounded-lg p-3 space-y-2">
                  <div className="h-3 w-16 bg-border rounded" />
                  <div className="h-1.5 w-full bg-border rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Pro Content Dashboard */
        <div className="space-y-6 max-w-5xl text-left w-full flex flex-col">
          
          {/* Selectors Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-border bg-background rounded-xl shadow-sm">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Base Target Company</label>
              <select 
                value={baseId} 
                onChange={handleBaseChange}
                className="w-full h-9 bg-secondary border border-border rounded-[6px] px-3 text-[11px] font-semibold outline-none focus:border-accent text-foreground cursor-pointer"
              >
                {briefingsHistory.map(b => (
                  <option key={b.id} value={b.id}>{b.company_name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Comparison Target Company</label>
              <select 
                value={compareId} 
                onChange={handleCompareChange}
                className="w-full h-9 bg-secondary border border-border rounded-[6px] px-3 text-[11px] font-semibold outline-none focus:border-accent text-foreground cursor-pointer"
              >
                {briefingsHistory.map(b => (
                  <option key={b.id} value={b.id}>{b.company_name}</option>
                ))}
              </select>
            </div>
          </div>

          {baseId === compareId && (
            <div className="bg-background rounded-lg border border-border p-8 text-center max-w-lg mx-auto mt-8 shadow-sm">
              <div className="h-12 w-12 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Select a Different Company</h3>
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed font-body">
                {briefingsHistory.length <= 1 
                  ? "You only have one company in your research history. Please go back to the Home page and research another company first to compare them."
                  : "You have selected the same company for both comparison fields. Please select two different companies to benchmark them side-by-side."
                }
              </p>
              {briefingsHistory.length <= 1 && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mt-5 rounded-full bg-primary text-primary-foreground hover:bg-primary/95 px-4 py-1.5 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  Research Another Company
                </button>
              )}
            </div>
          )}

          {isDataLoading && baseId !== compareId && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center select-none text-muted-foreground w-full animate-in fade-in duration-300">
              <div className="relative h-10 w-10 shrink-0 mb-5">
                <div className="absolute inset-0 rounded-full border-[3px] border-t-accent border-r-accent/30 border-b-transparent border-l-transparent animate-spin"></div>
                <div className="absolute inset-0 rounded-full border-[3px] border-t-transparent border-r-transparent border-b-accent border-l-accent/20 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}></div>
              </div>
              <p className="text-[12px] font-semibold text-foreground tracking-tight">Fetching benchmarking comparison matrices...</p>
              <p className="mt-1 text-[10px] text-muted-foreground/75 max-w-[280px] leading-relaxed">
                Aggregating rival positioning details from selected reports in parallel.
              </p>
            </div>
          )}

          {errorMsg && !isDataLoading && baseId !== compareId && (
            <div className="p-4 bg-red-500/[0.03] border border-red-500/15 rounded-xl flex items-start gap-3.5 text-[12px] font-body text-left shadow-sm max-w-2xl w-full animate-in fade-in duration-300">
              <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 shrink-0 mt-0.5">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-700 dark:text-red-400 tracking-tight">Benchmarking Load Failed</p>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  {errorMsg}
                </p>
                <button
                  onClick={fetchComparisonData}
                  className="mt-3 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/15 text-red-700 dark:text-red-300 rounded-lg font-semibold transition-colors cursor-pointer text-[10.5px]"
                >
                  Retry Load
                </button>
              </div>
            </div>
          )}

          {baseData && compareData && !isDataLoading && baseId !== compareId && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Profile Summaries Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Base Company summary */}
                <div className="border border-border bg-background rounded-xl p-5 space-y-3 shadow-sm text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-1">
                    <h4 className="text-[12.5px] font-bold text-foreground tracking-tight">{baseData.target_company_name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-[8.5px] font-bold uppercase tracking-wider border border-border">Base</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Core Differentiator:</span>
                      <p className="mt-0.5 text-foreground leading-relaxed font-body">{baseData.competitors[0]?.differentiator || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Estimated Sizing:</span>
                      <p className="mt-0.5 text-foreground leading-relaxed font-body">{baseData.competitors[0]?.scale || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Compare Company summary */}
                <div className="border border-border bg-background rounded-xl p-5 space-y-3 shadow-sm text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-1">
                    <h4 className="text-[12.5px] font-bold text-foreground tracking-tight">{compareData.target_company_name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[8.5px] font-bold uppercase tracking-wider border border-accent/10 animate-pulse">Comparison</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Core Differentiator:</span>
                      <p className="mt-0.5 text-foreground leading-relaxed font-body">{compareData.competitors[0]?.differentiator || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Estimated Sizing:</span>
                      <p className="mt-0.5 text-foreground leading-relaxed font-body">{compareData.competitors[0]?.scale || 'N/A'}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Side-by-Side Competitor Lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Base competitors */}
                <div className="border border-border bg-background rounded-xl p-5 space-y-3 shadow-sm text-left">
                  <h4 className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/60 pb-2">Rivals Identified for {baseData.target_company_name}</h4>
                  <div className="space-y-2.5">
                    {baseData.competitors.map((c, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-secondary/30 border border-border/50 text-[11px]">
                        <div>
                          <p className="font-semibold text-foreground">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground font-body mt-0.5">{c.pricing_model}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            c.strength_score >= 8 
                              ? 'bg-red-500/10 text-red-600' 
                              : c.strength_score >= 5 
                              ? 'bg-amber-500/10 text-amber-600' 
                              : 'bg-emerald-500/10 text-emerald-600'
                          }`}>
                            Threat: {c.strength_score}/10
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compare competitors */}
                <div className="border border-border bg-background rounded-xl p-5 space-y-3 shadow-sm text-left">
                  <h4 className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/60 pb-2">Rivals Identified for {compareData.target_company_name}</h4>
                  <div className="space-y-2.5">
                    {compareData.competitors.map((c, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-secondary/30 border border-border/50 text-[11px]">
                        <div>
                          <p className="font-semibold text-foreground">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground font-body mt-0.5">{c.pricing_model}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            c.strength_score >= 8 
                              ? 'bg-red-500/10 text-red-600' 
                              : c.strength_score >= 5 
                              ? 'bg-amber-500/10 text-amber-600' 
                              : 'bg-emerald-500/10 text-emerald-600'
                          }`}>
                            Threat: {c.strength_score}/10
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Aggregated capability benchmarking table */}
              <div className="border border-border bg-background rounded-xl overflow-hidden shadow-sm text-left">
                <div className="p-4 border-b border-border/60 bg-secondary/20">
                  <h4 className="text-[12px] font-bold text-foreground">Consolidated Capabilities Benchmark</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Direct checklist comparison of core functional features.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[9.5px] text-muted-foreground font-semibold uppercase tracking-wider">
                        <th className="px-4 py-3 text-left font-semibold">Feature / Capability</th>
                        <th className="px-4 py-3 text-center font-semibold">{baseData.target_company_name}</th>
                        <th className="px-4 py-3 text-center font-semibold">{compareData.target_company_name}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {/* We merge unique features from both checklists */}
                      {Array.from(new Set([
                        ...baseData.key_features.map(f => f.feature_name),
                        ...compareData.key_features.map(f => f.feature_name)
                      ])).map((featName, index) => {
                        const baseFeature = baseData.key_features.find(f => f.feature_name === featName);
                        const compareFeature = compareData.key_features.find(f => f.feature_name === featName);

                        return (
                          <tr key={index} className="hover:bg-secondary/10 transition-colors">
                            <td className="px-4 py-2.5 font-semibold text-foreground">{featName}</td>
                            <td className="px-4 py-2.5 text-center">
                              {renderStatusIcon(baseFeature ? baseFeature.target_has : false)}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              {renderStatusIcon(compareFeature ? compareFeature.target_has : false)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </DashboardLayout>
  );
}
