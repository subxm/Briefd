import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Sparkles, ArrowUpRight, ArrowDownRight, 
  Loader2, Calendar, DollarSign, Brain, BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const SECTORS = {
  ai: {
    id: 'ai',
    name: 'AI Foundation Models',
    subtitle: 'Track LLM API cost trends and developer monetization models.',
    chartTitle: 'API Price Index Curve',
    chartSubtitle: 'Weighted average cost per million tokens across top-tier providers.',
    timeRange: 'Q1 - Q4 2026',
    yAxisLabel: 'Cost per 1M tokens',
    points: [
      { month: 'Jan', val: '$10.00', pct: 90 },
      { month: 'Mar', val: '$6.50', pct: 65 },
      { month: 'May', val: '$3.20', pct: 38 },
      { month: 'Jul', val: '$1.50', pct: 20 },
      { month: 'Sep', val: '$0.50', pct: 8 },
      { month: 'Nov', val: '$0.15', pct: 2.5 }
    ],
    pricing: [
      { label: 'Usage-Based API', share: '48%', color: 'bg-accent' },
      { label: 'Flat monthly subscription', share: '35%', color: 'bg-indigo-500' },
      { label: 'Hybrid credit draw', share: '17%', color: 'bg-slate-400' }
    ],
    trends: [
      {
        title: 'Generative AI API Consolidation',
        category: 'Technology',
        direction: 'up',
        percentage: '+28%',
        description: 'Massive shift toward consolidated multi-modal endpoints (text + audio + vision) instead of discrete single-task APIs.'
      },
      {
        title: 'Token Pricing De-escalation',
        category: 'Financials',
        direction: 'down',
        percentage: '-45%',
        description: 'Price war among foundational LLM providers continues to drive input token costs down, enabling agentic loops.'
      },
      {
        title: 'Edge Deployment Architectures',
        category: 'Infrastructure',
        direction: 'up',
        percentage: '+64%',
        description: 'Decentralized serverless edge runtimes increasingly utilized to run lightweight models closer to end-users.'
      }
    ]
  },
  fintech: {
    id: 'fintech',
    name: 'Fintech & Digital Payments',
    subtitle: 'Monitor transaction commissions, take-rates, and cross-border fee models.',
    chartTitle: 'Average Transaction Take-Rate',
    chartSubtitle: 'Weighted blended merchant processing commission percentage globally.',
    timeRange: 'Q1 - Q4 2026',
    yAxisLabel: 'Blended take-rate %',
    points: [
      { month: 'Jan', val: '2.90%', pct: 85 },
      { month: 'Mar', val: '2.65%', pct: 77 },
      { month: 'May', val: '2.40%', pct: 69 },
      { month: 'Jul', val: '2.10%', pct: 60 },
      { month: 'Sep', val: '1.85%', pct: 51 },
      { month: 'Nov', val: '1.45%', pct: 40 }
    ],
    pricing: [
      { label: 'Take-rate commission', share: '62%', color: 'bg-accent' },
      { label: 'Hybrid volume tier', share: '23%', color: 'bg-indigo-500' },
      { label: 'Flat monthly platform', share: '15%', color: 'bg-slate-400' }
    ],
    trends: [
      {
        title: 'Open Banking Integrations',
        category: 'Compliance',
        direction: 'up',
        percentage: '+42%',
        description: 'Adoption of zero-auth instant bank transfer APIs bypassing traditional card networks to save processing costs.'
      },
      {
        title: 'Cross-Border Fee Compression',
        category: 'Financials',
        direction: 'down',
        percentage: '-18%',
        description: 'Venture-backed stablecoin settlement corridors reducing international wire fee margins.'
      },
      {
        title: 'Embedded Finance Orchestration',
        category: 'Infrastructure',
        direction: 'up',
        percentage: '+75%',
        description: 'Non-financial software applications natively bundling banking services (cards, lending) via direct APIs.'
      }
    ]
  },
  cloud: {
    id: 'cloud',
    name: 'Cloud Storage & Database',
    subtitle: 'Track storage billing rates, computing hours, and network bandwidth pricing.',
    chartTitle: 'Compute Cost Index (vCPU/hr)',
    chartSubtitle: 'Index price of standard serverless computing time across cloud hyperscalers.',
    timeRange: 'Q1 - Q4 2026',
    yAxisLabel: 'Cost per vCPU/hour',
    points: [
      { month: 'Jan', val: '$0.040', pct: 80 },
      { month: 'Mar', val: '$0.038', pct: 75 },
      { month: 'May', val: '$0.034', pct: 65 },
      { month: 'Jul', val: '$0.030', pct: 55 },
      { month: 'Sep', val: '$0.024', pct: 40 },
      { month: 'Nov', val: '$0.016', pct: 20 }
    ],
    pricing: [
      { label: 'Serverless compute hours', share: '55%', color: 'bg-accent' },
      { label: 'Provisioned storage capacity', share: '30%', color: 'bg-indigo-500' },
      { label: 'Egress bandwidth charges', share: '15%', color: 'bg-slate-400' }
    ],
    trends: [
      {
        title: 'Vector Database Explosion',
        category: 'Database',
        direction: 'up',
        percentage: '+110%',
        description: 'Massive rise in semantic search indexing nodes requiring high-RAM database instances.'
      },
      {
        title: 'Egress Bandwidth Deflation',
        category: 'Network',
        direction: 'down',
        percentage: '-80%',
        description: 'Hyperscalers forced to drop data transfer exit fees due to regulatory antitrust pressures.'
      },
      {
        title: 'Serverless Edge Transition',
        category: 'Compute',
        direction: 'up',
        percentage: '+45%',
        description: 'Migration of stateful database actions to stateless edge worker nodes.'
      }
    ]
  },
  workspace: {
    id: 'workspace',
    name: 'Collaborative Workspace & SaaS',
    subtitle: 'Analyze per-seat software pricing, seat-expansion limits, and modular packaging.',
    chartTitle: 'Seat License Cost Index',
    chartSubtitle: 'Average monthly subscription cost per active seat license across corporate tools.',
    timeRange: 'Q1 - Q4 2026',
    yAxisLabel: 'Average seat cost/mo',
    points: [
      { month: 'Jan', val: '$12.00', pct: 40 },
      { month: 'Mar', val: '$14.00', pct: 50 },
      { month: 'May', val: '$16.50', pct: 62 },
      { month: 'Jul', val: '$19.00', pct: 73 },
      { month: 'Sep', val: '$21.50', pct: 84 },
      { month: 'Nov', val: '$24.00', pct: 95 }
    ],
    pricing: [
      { label: 'Flat seat-based license', share: '70%', color: 'bg-accent' },
      { label: 'Free-tier active limits', share: '20%', color: 'bg-indigo-500' },
      { label: 'Enterprise security add-ons', share: '10%', color: 'bg-slate-400' }
    ],
    trends: [
      {
        title: 'Modular Add-On Packages',
        category: 'Packaging',
        direction: 'up',
        percentage: '+50%',
        description: 'SaaS companies shifting from large bundled packages to modular add-on monetization models.'
      },
      {
        title: 'Free-Tier Limits Tightening',
        category: 'Financials',
        direction: 'down',
        percentage: '-22%',
        description: 'Reducing free collaborator counts and trial periods to drive premium seat conversion rates.'
      },
      {
        title: 'AI Companion Seat Premiums',
        category: 'Technology',
        direction: 'up',
        percentage: '+35%',
        description: 'Charging separate, premium-priced add-ons for integrated generative AI write/search agents.'
      }
    ]
  }
};

export default function MarketTrendsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [activeSectorKey, setActiveSectorKey] = useState('ai');
  const [isSectorLoading, setIsSectorLoading] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleSectorChange = (key) => {
    if (key === activeSectorKey || isSectorLoading) return;
    setIsSectorLoading(true);
    setTimeout(() => {
      setActiveSectorKey(key);
      setIsSectorLoading(false);
      setHoveredPointIndex(null);
    }, 1000);
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

  const activeSector = SECTORS[activeSectorKey];

  // Calculate SVG layout coordinates for 6 points in a 480x160 viewBox
  const chartPoints = activeSector.points.map((pt, i) => {
    const x = 40 + i * 80;
    const y = 140 - (pt.pct / 100) * 110; // clamp between y=30 and y=140
    return { x, y, month: pt.month, val: pt.val };
  });

  // Construct smooth cubic bezier path connecting coordinates
  let linePathD = `M ${chartPoints[0].x},${chartPoints[0].y}`;
  for (let i = 0; i < chartPoints.length - 1; i++) {
    const p0 = chartPoints[i];
    const p1 = chartPoints[i + 1];
    const cp1x = p0.x + 40;
    const cp1y = p0.y;
    const cp2x = p1.x - 40;
    const cp2y = p1.y;
    linePathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
  }

  // Close the SVG outline below the path to fill with gradient
  const areaPathD = `${linePathD} L ${chartPoints[chartPoints.length - 1].x},150 L ${chartPoints[0].x},150 Z`;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 select-none text-left text-[11px]">
        <div>
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Market Trends</h2>
          <p className="text-muted-foreground text-[10px] mt-0.5">Industry technological movements and pricing trends.</p>
        </div>
      </div>

      {/* Interactive Sector Switcher Banner */}
      <div className="bg-background border border-border rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <h4 className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            <span>Market Trends Agent (Active v1.2)</span>
          </h4>
          <p className="text-[10.5px] text-muted-foreground max-w-xl leading-relaxed">
            Our dedicated Market Positioning Analyst agent scans global venture data and pricing endpoints. Select an industry sector below to trigger a real-time synthesis.
          </p>
        </div>

        {/* Sector Tabs Switcher */}
        <div className="flex flex-wrap gap-1.5 self-start md:self-center">
          {[
            { key: 'ai', label: 'AI Models' },
            { key: 'fintech', label: 'Payments' },
            { key: 'cloud', label: 'Cloud Compute' },
            { key: 'workspace', label: 'SaaS Workspace' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleSectorChange(tab.key)}
              disabled={isSectorLoading}
              className={`rounded-full px-3.5 py-1 text-[10px] font-semibold tracking-tight transition-all cursor-pointer border ${
                activeSectorKey === tab.key
                  ? 'bg-accent border-accent text-accent-foreground shadow-sm'
                  : 'bg-secondary hover:bg-secondary/70 border-border text-muted-foreground hover:text-foreground'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Analysis Display Panel */}
      <div className="min-h-[460px] flex flex-col w-full relative">
        {isSectorLoading ? (
          /* Concentric Orbital Spinner Loading State */
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center select-none text-muted-foreground w-full min-h-[400px] animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center w-16 h-16 mb-5">
              {/* Ambient pulsing aura */}
              <div className="absolute inset-0 rounded-full bg-accent/10 blur-md animate-pulse" />
              
              {/* Outer rotating ring */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent border-r-accent/30 animate-spin" style={{ animationDuration: '1.2s' }} />
              
              {/* Inner counter-rotating ring */}
              <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-b-accent border-l-accent/20 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
              
              {/* Central pulsing decorative dot */}
              <div className="absolute inset-[13px] rounded-full bg-background border border-border/80 flex items-center justify-center shadow-sm">
                <Brain className="h-3.5 w-3.5 text-accent animate-pulse" />
              </div>
            </div>
            <p className="text-[12.5px] font-semibold text-foreground tracking-tight">Market Positioning Agent scanning indexes...</p>
            <p className="mt-1.5 text-[10.5px] text-muted-foreground/75 max-w-[280px] leading-relaxed">
              Synthesizing global industry releases, venture funding updates, and developer billing endpoints.
            </p>
          </div>
        ) : (
          /* Dashboard Analytics Grid */
          <div className="space-y-6 w-full animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-left">
              
              {/* SVG Area Line Chart Container */}
              <div className="lg:col-span-2 bg-background border border-border rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h4 className="text-[12.5px] font-semibold text-foreground">{activeSector.chartTitle}</h4>
                    <p className="text-[10px] text-muted-foreground">{activeSector.chartSubtitle}</p>
                  </div>
                  <span className="text-[10px] bg-secondary border border-border px-2.5 py-0.5 rounded text-muted-foreground font-mono">{activeSector.timeRange}</span>
                </div>

                {/* SVG Chart Frame */}
                <div className="h-44 w-full relative pt-4 flex items-center justify-center select-none">
                  
                  {/* Absolute Position Y-Axis Scale Indicator */}
                  <div className="absolute left-1 top-2 text-[9px] text-muted-foreground/55 font-mono select-none flex flex-col justify-between h-[120px] pointer-events-none">
                    <span>High</span>
                    <span>Mid</span>
                    <span>Low</span>
                  </div>

                  <svg className="w-full h-full max-w-[480px]" viewBox="0 0 480 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      {/* Gradient for area fill under the curve */}
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Dashed Grid Lines */}
                    <line x1="40" y1="30" x2="440" y2="30" stroke="hsl(var(--border))" strokeDasharray="3 3" strokeWidth="0.8" />
                    <line x1="40" y1="85" x2="440" y2="85" stroke="hsl(var(--border))" strokeDasharray="3 3" strokeWidth="0.8" />
                    <line x1="40" y1="140" x2="440" y2="140" stroke="hsl(var(--border))" strokeDasharray="3 3" strokeWidth="0.8" />

                    {/* Area path fill under line */}
                    <path d={areaPathD} fill="url(#chartGradient)" />

                    {/* Thick curved line path */}
                    <path d={linePathD} stroke="hsl(var(--accent))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Active coordinate dots */}
                    {chartPoints.map((pt, idx) => {
                      const isHovered = hoveredPointIndex === idx;
                      return (
                        <g key={idx}>
                          {/* Outer pulse boundary on hover */}
                          {isHovered && (
                            <circle cx={pt.x} cy={pt.y} r="8" fill="hsl(var(--accent))" fillOpacity="0.15" />
                          )}
                          {/* Core node dot */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? "5" : "3.5"}
                            fill="hsl(var(--background))"
                            stroke="hsl(var(--accent))"
                            strokeWidth={isHovered ? "2.5" : "1.8"}
                            className="cursor-pointer transition-all duration-150"
                            onMouseEnter={() => setHoveredPointIndex(idx)}
                            onMouseLeave={() => setHoveredPointIndex(null)}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* HTML Tooltip Box centered above nodes */}
                  {hoveredPointIndex !== null && (
                    <div
                      className="absolute bg-background border border-border px-2.5 py-1 rounded-lg shadow-dashboard text-[9.5px] font-mono font-bold text-foreground pointer-events-none z-20 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5 items-center justify-center"
                      style={{
                        left: `${(chartPoints[hoveredPointIndex].x / 480) * 100}%`,
                        top: `${(chartPoints[hoveredPointIndex].y / 160) * 100 - 20}%`,
                        transform: 'translate(-50%, -100%)'
                      }}
                    >
                      <span className="text-muted-foreground text-[8px] uppercase tracking-wider">{chartPoints[hoveredPointIndex].month}</span>
                      <span className="text-accent">{chartPoints[hoveredPointIndex].val}</span>
                    </div>
                  )}
                </div>

                {/* X-Axis labels underneath chart */}
                <div className="flex justify-between w-full max-w-[480px] mx-auto px-10 border-t border-border/40 pt-2 select-none">
                  {chartPoints.map((pt, idx) => (
                    <span key={idx} className="text-[9.5px] text-muted-foreground/85 font-semibold font-mono tracking-tight">{pt.month}</span>
                  ))}
                </div>
              </div>

              {/* Share Distribution Panel */}
              <div className="bg-background border border-border rounded-xl p-5 shadow-sm space-y-4 text-left flex flex-col justify-between">
                <div>
                  <h4 className="text-[12.5px] font-semibold text-foreground">SaaS Pricing Distribution</h4>
                  <p className="text-[10px] text-muted-foreground">Standardized models in the {activeSector.name.toLowerCase()} sector.</p>
                </div>
                
                <div className="space-y-4 py-2">
                  {activeSector.pricing.map((metric, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[10.5px]">
                        <span className="text-muted-foreground font-medium">{metric.label}</span>
                        <span className="font-bold text-foreground">{metric.share}</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${metric.color} rounded-full transition-all duration-700 ease-out`} 
                          style={{ width: metric.share }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-border/40 text-[9.5px] text-muted-foreground/80 flex items-center gap-1.5 select-none">
                  <Calendar className="h-3.5 w-3.5 text-accent" />
                  <span>Updated: June 2026</span>
                </div>
              </div>
            </div>

            {/* Detected Industry Shift Cards Grid */}
            <div className="space-y-3 mt-6 text-left">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Detected Industry Movements</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeSector.trends.map((t, idx) => (
                  <div key={idx} className="bg-background border border-border hover:border-slate-300 transition-all rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[140px]">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[9px] text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border uppercase font-semibold">
                          {t.category}
                        </span>
                        <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          t.direction === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                        }`}>
                          {t.direction === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          <span>{t.percentage}</span>
                        </div>
                      </div>
                      <h4 className="text-[12px] font-bold text-foreground leading-snug">{t.title}</h4>
                    </div>
                    <p className="text-[10px] text-muted-foreground/90 leading-relaxed mt-2">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
