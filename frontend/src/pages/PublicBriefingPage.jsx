import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ShieldAlert, Sparkles, Calendar, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config';
import Briefing from '../components/Briefing';

export default function PublicBriefingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [briefing, setBriefing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchPublicBriefing = async () => {
      setIsLoading(true);
      setErrorMsg(null);

      try {
        const response = await fetch(`${API_BASE_URL}/public/briefings/${id}`);
        if (!response.ok) {
          throw new Error('Public briefing not found or has been removed.');
        }

        const data = await response.json();
        setBriefing(data);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || 'Failed to load report.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPublicBriefing();
    }
  }, [id]);

  return (
    <div className="min-h-screen w-screen bg-background text-foreground flex flex-col font-body relative overflow-x-hidden select-text">
      
      {/* Background Subtle Graphic */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent rounded-full blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 h-14 border-b border-border flex items-center justify-between px-6 bg-background/30 backdrop-blur-md">
        <div className="flex items-center gap-2 select-none">
          <div className="h-5 w-5 bg-primary text-primary-foreground rounded flex items-center justify-center font-bold text-[10px]">
            B
          </div>
          <span className="font-bold text-[15px] tracking-tight">Briefd Share</span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-3 py-1 bg-secondary hover:bg-secondary/80 border border-border rounded-md text-[10.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer select-none"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-6 py-10 flex flex-col items-center">
        
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center select-none text-muted-foreground">
            <Loader2 className="h-6 w-6 text-accent animate-spin mb-4" />
            <span className="text-[12px] font-medium">Loading shared report...</span>
          </div>
        )}

        {errorMsg && !isLoading && (
          <div className="w-full max-w-md bg-background/50 border border-border backdrop-blur-md rounded-2xl p-8 text-center shadow-lg my-12 animate-in fade-in duration-300">
            <div className="h-12 w-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h1 className="text-sm font-semibold text-foreground tracking-tight">Report Unavailable</h1>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed font-body">
              {errorMsg}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full h-10 mt-6 bg-secondary hover:bg-secondary/80 rounded-[6px] text-xs font-semibold tracking-tight transition-all flex items-center justify-center cursor-pointer border border-border"
            >
              Go to Briefd Workspace
            </button>
          </div>
        )}

        {briefing && !isLoading && (
          <div className="w-full border border-border bg-background/40 backdrop-blur-sm rounded-2xl p-6 md:p-10 shadow-lg text-left space-y-6 animate-in fade-in duration-300">
            
            {/* Report Title Banner */}
            <div className="border-b border-border/60 pb-5 space-y-2">
              <div className="flex items-center gap-1.5 text-accent font-semibold select-none">
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] uppercase tracking-wider font-body">Competitive Research Briefing</span>
              </div>
              <h1 className="text-xl font-bold text-foreground tracking-tight font-body">
                {briefing.company_name}
              </h1>
              
              <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground select-none font-body">
                <Calendar className="h-3.5 w-3.5" />
                <span>Generated on {new Date(briefing.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}</span>
              </div>
            </div>

            {/* Briefing text */}
            <Briefing briefingText={briefing.briefing_text} />
            
          </div>
        )}

      </main>
    </div>
  );
}
