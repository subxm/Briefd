import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, TrendingUp, Sparkles, AlertCircle, ArrowUpRight, 
  ArrowDownRight, Loader2, Calendar, DollarSign, Brain
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

export default function MarketTrendsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

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

  const trends = [
    {
      title: 'Generative AI API Consolidation',
      category: 'Technology',
      impact: 'High',
      direction: 'up',
      percentage: '+28%',
      description: 'Massive shift toward consolidated multi-modal endpoints (text + audio + vision) instead of discrete single-task APIs.'
    },
    {
      title: 'Token Pricing De-escalation',
      category: 'Financials',
      impact: 'Medium',
      direction: 'down',
      percentage: '-45%',
      description: 'Price war among foundational LLM providers continues to drive input token costs down, enabling agentic loops.'
    },
    {
      title: 'Edge Deployment Architectures',
      category: 'Infrastructure',
      impact: 'High',
      direction: 'up',
      percentage: '+64%',
      description: 'Decentralized serverless edge runtimes increasingly utilized to run lightweight models closer to end-users.'
    }
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 select-none text-left text-[11px]">
        <div>
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Market Trends</h2>
          <p className="text-muted-foreground text-[10px] mt-0.5">Industry technological movements and pricing trends.</p>
        </div>
      </div>

      {/* Coming Soon Notification Banner */}
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-6 flex items-start gap-3 text-left">
        <div className="h-8 w-8 bg-accent/20 text-accent rounded-full flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
            <span>Market Trends Agent (Under Active Development)</span>
            <span className="bg-accent/20 text-accent text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Coming Soon</span>
          </h4>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            We are fine-tuning a dedicated Market Positioning Analyst agent designed to scan global industry releases, venture funding updates, and developer forums on-the-fly to compile these graphs dynamically.
          </p>
        </div>
      </div>

      {/* Grid of Simulated Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-left">
        {/* Main Trends Graph Mock */}
        <div className="lg:col-span-2 bg-background border border-border rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h4 className="text-[12.5px] font-semibold text-foreground">API Price Index Curve</h4>
              <p className="text-[10px] text-muted-foreground">Weighted average cost per million tokens across top-tier providers.</p>
            </div>
            <span className="text-[10px] bg-secondary border border-border px-2.5 py-0.5 rounded text-muted-foreground font-mono">Q1 - Q4 2026</span>
          </div>

          {/* Simple Simulated Chart */}
          <div className="h-44 w-full flex items-end justify-between px-2 pt-6 relative">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-border/40" />
            <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-border/40" />
            <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-border/40" />
            
            {[
              { val: '75%', month: 'Jan' },
              { val: '68%', month: 'Mar' },
              { val: '52%', month: 'May' },
              { val: '40%', month: 'Jul' },
              { val: '28%', month: 'Sep' },
              { val: '15%', month: 'Nov' }
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1 group z-10">
                <div className="w-8 bg-accent/10 border-t-2 border-accent hover:bg-accent/20 rounded-t-sm transition-all duration-300 relative" style={{ height: bar.val }}>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-background border border-border px-1.5 py-0.5 rounded text-[8px] font-mono text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.val}
                  </span>
                </div>
                <span className="text-[9px] text-muted-foreground font-mono">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Small Metrics Box */}
        <div className="bg-background border border-border rounded-xl p-5 shadow-sm space-y-4 text-left flex flex-col justify-between">
          <div>
            <h4 className="text-[12.5px] font-semibold text-foreground">SaaS Pricing Distribution</h4>
            <p className="text-[10px] text-muted-foreground">Standardized models in the artificial intelligence sector.</p>
          </div>
          
          <div className="space-y-3">
            {[
              { label: 'Usage-Based API', share: '48%', color: 'bg-accent' },
              { label: 'Flat monthly subscription', share: '35%', color: 'bg-indigo-500' },
              { label: 'Hybrid credit draw', share: '17%', color: 'bg-slate-400' }
            ].map((metric, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">{metric.label}</span>
                  <span className="font-semibold text-foreground">{metric.share}</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${metric.color} rounded-full`} style={{ width: metric.share }} />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[9.5px] text-muted-foreground/80 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Updated: June 2026</span>
          </div>
        </div>
      </div>

      {/* Industry Shift Cards */}
      <div className="space-y-3 mt-6 text-left">
        <h3 className="text-[11.5px] font-semibold text-foreground uppercase tracking-wider">Detected Industry Movements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trends.map((t, idx) => (
            <div key={idx} className="bg-background border border-border rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border uppercase font-semibold">
                    {t.category}
                  </span>
                  <h4 className="text-[12px] font-bold text-foreground mt-2">{t.title}</h4>
                </div>
                <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  t.direction === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                }`}>
                  {t.direction === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  <span>{t.percentage}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal">{t.description}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
