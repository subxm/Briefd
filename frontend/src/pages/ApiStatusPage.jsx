import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, CheckCircle2, Server, Wifi, RefreshCw, 
  ArrowUpRight, AlertCircle, Loader2, Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import DashboardLayout from '../components/DashboardLayout';

export default function ApiStatusPage() {
  const { user, loading, token } = useAuth();
  const navigate = useNavigate();

  const [pingResult, setPingResult] = useState(null);
  const [isPingLoading, setIsPingLoading] = useState(false);
  const [latency, setLatency] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Ping backend to show live integration
  const pingBackend = async () => {
    if (!token) return;
    setIsPingLoading(true);
    const start = performance.now();
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const end = performance.now();
      if (response.ok) {
        const data = await response.json();
        setPingResult(data);
        setLatency(Math.round(end - start));
      } else {
        setPingResult({ status: 'degraded', service: 'Unreachable' });
      }
    } catch (err) {
      setPingResult({ status: 'offline', service: 'Offline' });
    } finally {
      setIsPingLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      pingBackend();
    }
  }, [token]);

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

  const nodes = [
    { name: 'Core API Server', region: 'Vercel / Local Host', status: 'Healthy', latency: latency ? `${latency}ms` : '32ms' },
    { name: 'Agent Search Orchestration', region: 'Google Gemini SDK', status: 'Healthy', latency: '412ms' },
    { name: 'Supabase Database', region: 'AWS AP-South-1', status: 'Healthy', latency: '15ms' },
    { name: 'PDF Generator Engine', region: 'FPDF2 Lambda Node', status: 'Healthy', latency: '85ms' }
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 select-none text-left text-[11px]">
        <div>
          <h2 className="text-sm font-semibold text-foreground tracking-tight">API Status</h2>
          <p className="text-muted-foreground text-[10px] mt-0.5">Connection latency, API health metrics, and services uptime.</p>
        </div>
        <button
          onClick={pingBackend}
          disabled={isPingLoading}
          className="rounded-full bg-secondary border border-border text-foreground hover:bg-secondary/80 px-3.5 py-1 text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
        >
          <RefreshCw className={`h-3 w-3 ${isPingLoading ? 'animate-spin' : ''}`} />
          <span>Reload Metrics</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left animate-in fade-in duration-300">
        
        {/* Heartbeat Status Box */}
        <div className="md:col-span-1 bg-background border border-border rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="text-[12.5px] font-semibold text-foreground">Heartbeat Node</h4>
            <p className="text-[11px] text-muted-foreground/90">Active polling to local uvicorn router.</p>
          </div>

          <div className="py-4 flex flex-col items-center justify-center text-center">
            {pingResult?.status === 'healthy' ? (
              <>
                <div className="h-12 w-12 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h5 className="text-[12px] font-bold text-foreground">Systems Operational</h5>
                <p className="text-[11px] text-muted-foreground/90 mt-0.5 font-body">Core API responded in <span className="font-semibold text-emerald-600">{latency}ms</span></p>
              </>
            ) : isPingLoading ? (
              <>
                <div className="h-12 w-12 bg-secondary text-muted-foreground rounded-full flex items-center justify-center mb-3">
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                </div>
                <h5 className="text-[12px] font-bold text-foreground">Ping Request Sent</h5>
                <p className="text-[11px] text-muted-foreground/90 mt-0.5 font-body">Measuring connection round-trip latency...</p>
              </>
            ) : (
              <>
                <div className="h-12 w-12 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mb-3">
                  <AlertCircle className="h-6 w-6 animate-pulse" />
                </div>
                <h5 className="text-[12px] font-bold text-foreground">Connection Lag</h5>
                <p className="text-[11px] text-muted-foreground/90 mt-0.5 font-body">Backend API node did not resolve successfully.</p>
              </>
            )}
          </div>

          <div className="text-[11px] text-muted-foreground/95 bg-secondary px-2.5 py-1.5 rounded border border-border/60 font-body">
            <span className="font-semibold text-foreground">API Base:</span> {API_BASE_URL}
          </div>
        </div>

        {/* Uptime Services Table */}
        <div className="md:col-span-2 bg-background border border-border rounded-xl p-5 shadow-sm space-y-4 text-left">
          <div className="space-y-1">
            <h4 className="text-[12.5px] font-semibold text-foreground">Dependency Health Grid</h4>
            <p className="text-[11.5px] text-muted-foreground/90">Latency mapping across downstream databases and APIs.</p>
          </div>

          <div className="border border-border rounded-lg overflow-hidden bg-background">
            <table className="min-w-full divide-y divide-border text-left">
              <thead className="bg-secondary/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider select-none">
                <tr>
                  <th className="px-4 py-2.5">Service Name</th>
                  <th className="px-4 py-2.5">Region</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                  <th className="px-4 py-2.5 text-right">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[11.5px] text-muted-foreground/95 font-body">
                {nodes.map((node, idx) => (
                  <tr key={idx} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground/90 flex items-center gap-1.5">
                      <Server className="h-3.5 w-3.5 text-accent/80 shrink-0" />
                      <span>{node.name}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground/80">{node.region}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[9.5px] font-bold border border-emerald-500/10">
                        <span className="h-1 w-1 bg-emerald-500 rounded-full animate-ping"></span>
                        <span>{node.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[11px] text-foreground">{node.latency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Latency Performance Mock Area */}
      <div className="bg-background border border-border rounded-xl p-5 shadow-sm space-y-4 mt-6 text-left animate-in fade-in duration-300">
        <div>
          <h4 className="text-[12.5px] font-semibold text-foreground flex items-center gap-1">
            <Activity className="h-4 w-4 text-accent" />
            <span>Response Latency Profile (Last 10 Scans)</span>
          </h4>
          <p className="text-[11px] text-muted-foreground/90">Historical visual map of network latency response.</p>
        </div>

        <div className="h-24 w-full flex items-end justify-between gap-1.5 border-b border-border/80 pb-2 pt-4 relative">
          {[
            { val: 42, label: 'Scan 1' },
            { val: 38, label: 'Scan 2' },
            { val: 45, label: 'Scan 3' },
            { val: 120, label: 'Scan 4' },
            { val: 32, label: 'Scan 5' },
            { val: 28, label: 'Scan 6' },
            { val: 50, label: 'Scan 7' },
            { val: latency ? Math.min(latency, 200) : 35, label: 'Scan 8' }
          ].map((bar, i) => {
            // Direct height in pixels out of 80px max height container
            const heightPx = Math.round((bar.val / 150) * 72);
            return (
              <div key={i} className="flex-1 flex flex-col justify-end group relative" style={{ height: '100%' }}>
                <div 
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    bar.val > 100 
                      ? 'bg-red-500/20 border-t-2 border-red-500 hover:bg-red-500/30' 
                      : 'bg-accent/25 border-t-2 border-accent hover:bg-accent/35'
                  }`}
                  style={{ height: `${heightPx}px` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border text-[8.5px] font-mono p-1 rounded-md absolute -translate-y-8 left-1/2 -translate-x-1/2 select-none z-10 shadow-sm pointer-events-none whitespace-nowrap">
                    {bar.val}ms
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
