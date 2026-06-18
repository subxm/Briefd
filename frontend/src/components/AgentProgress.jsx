import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronDown, ChevronUp, Sparkles, Check, Play, Cpu } from 'lucide-react';

const AGENTS = [
  { id: 1, name: 'Company Researcher', desc: 'Scans search indices & web archives' },
  { id: 2, name: 'Competitor Finder', desc: 'Isolates market rivals & alternatives' },
  { id: 3, name: 'Positioning Analyst', desc: 'Maps feature capability grids' },
  { id: 4, name: 'Briefing Writer', desc: 'Synthesizes competitive reports' },
];

const AGENT_LOGS = {
  1: [
    "Establishing connection to Tavily web search index...",
    "Querying Tavily search API for target company overview, founding history, and leadership...",
    "Fetched unstructured search documents. Cleaning text nodes and removing scripts...",
    "Extracting corporate attributes: headquarters location, founding date, and funding rounds...",
    "Grounded company profile context compiled. Emitting data to pipe..."
  ],
  2: [
    "Analyzing profile findings from Company Researcher...",
    "Generating competitive search queries for direct rivals...",
    "Scanning databases for pricing tiers and alternative SaaS platforms...",
    "Scoring relative competitor threat values (1-10) using market overlap indices...",
    "Isolating rivals. Competitor matrix node constructed."
  ],
  3: [
    "Loading rival feature checklists and differentiator descriptions...",
    "Evaluating pricing plan structures vs market distributions...",
    "Comparing product strengths, weaknesses, and key differentiators...",
    "Constructing side-by-side product capability checklist matrix..."
  ],
  4: [
    "Aggregating structured intelligence inputs from all 3 preceding agents...",
    "Drafting Executive Snapshot and strategic risk assessments...",
    "Formatting reports into clean markdown layout...",
    "Caching intelligence payload and saving final briefing to Supabase database..."
  ]
};

export default function AgentProgress({ activeAgent, completedAgents }) {
  const [showLogs, setShowLogs] = useState(true);
  const [logs, setLogs] = useState([]);
  const consoleEndRef = useRef(null);

  useEffect(() => {
    if (!activeAgent) {
      if (completedAgents.length > 0) {
        setLogs(prev => [...prev, "[System] All agent scans completed successfully. Ready."]);
      } else {
        setLogs([]);
      }
      return;
    }

    const agentName = AGENTS.find(a => a.id === activeAgent)?.name || 'Agent';
    // Add start log
    setLogs(prev => [...prev, `[System] Booting ${agentName}...`]);

    const phrases = AGENT_LOGS[activeAgent] || [];
    let currentIdx = 0;

    const interval = setInterval(() => {
      if (currentIdx < phrases.length) {
        setLogs(prev => [...prev, `[${agentName}] ${phrases[currentIdx]}`]);
        currentIdx++;
      } else {
        clearInterval(interval);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [activeAgent, completedAgents.length]);

  // Scroll to bottom of logs console
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, showLogs]);

  return (
    <div className="w-full space-y-4">
      {/* 4-Agent Neural Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        {AGENTS.map((agent, index) => {
          const isCompleted = completedAgents.includes(agent.id);
          const isActive = activeAgent === agent.id;
          const isWaiting = !isActive && !isCompleted;

          return (
            <div 
              key={agent.id} 
              className={`relative border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 ${
                isActive 
                  ? 'bg-accent/5 border-accent/30 shadow-[0_0_15px_rgba(99,102,241,0.06)] scale-[1.01]' 
                  : isCompleted 
                  ? 'bg-secondary/40 border-border' 
                  : 'bg-secondary/20 border-border/40 opacity-60'
              }`}
            >
              {/* Animated Connecting Line between steps (Desktop only) */}
              {index < AGENTS.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3.5 -translate-y-1/2 w-3 h-[2px] z-20">
                  <svg className="w-full h-full" overflow="visible">
                    <line 
                      x1="0" 
                      y1="0" 
                      x2="16" 
                      y2="0" 
                      stroke={isCompleted ? 'hsl(var(--accent))' : 'hsl(var(--border))'} 
                      strokeWidth="2" 
                      className={isActive ? 'stroke-accent animate-dash-flow' : ''}
                    />
                  </svg>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                    isActive 
                      ? 'bg-accent/10 border-accent/20 text-accent animate-pulse' 
                      : isCompleted 
                      ? 'bg-accent/10 border-accent/10 text-accent' 
                      : 'bg-muted border-border/30 text-muted-foreground'
                  }`}>
                    Agent {agent.id}
                  </span>
                  
                  {/* Status Indicator Icon */}
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center border ${
                    isActive 
                      ? 'bg-accent/10 border-accent/30 text-accent animate-spin' 
                      : isCompleted 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-muted border-border/20 text-muted-foreground/45'
                  }`}>
                    {isActive ? (
                      <Cpu className="h-3 w-3" />
                    ) : isCompleted ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : (
                      <Play className="h-2.5 w-2.5 fill-muted-foreground/30 text-transparent" />
                    )}
                  </div>
                </div>

                <div className="text-left space-y-1">
                  <h5 className={`text-[12.5px] font-bold tracking-tight ${
                    isActive ? 'text-foreground font-semibold' : 'text-foreground/90'
                  }`}>
                    {agent.name}
                  </h5>
                  <p className="text-[10.5px] text-muted-foreground/90 leading-normal font-body">
                    {agent.desc}
                  </p>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="mt-4 w-full bg-border/40 h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCompleted ? 'w-full bg-accent' : isActive ? 'w-1/2 bg-accent animate-pulse' : 'w-0'
                  }`} 
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Live Agent Thinking Console */}
      {(activeAgent || logs.length > 0) && (
        <div className="border border-border rounded-xl bg-slate-950 text-slate-200 overflow-hidden shadow-dashboard select-none">
          <button 
            onClick={() => setShowLogs(!showLogs)}
            className="w-full flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[10.5px] font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Live Agent Thinking Console</span>
            </div>
            <div className="flex items-center gap-1.5">
              {activeAgent && (
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              )}
              {showLogs ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </div>
          </button>

          {showLogs && (
            <div className="p-3.5 h-36 overflow-y-auto font-mono text-[10.5px] text-left text-emerald-500/90 space-y-1.5 custom-scrollbar bg-slate-950/90 leading-relaxed select-text">
              {logs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-slate-600 shrink-0 select-none">&gt;</span>
                  <span className={log.includes('[System]') ? 'text-blue-400' : 'text-emerald-400'}>{log}</span>
                </div>
              ))}
              {activeAgent && (
                <div className="flex gap-2 items-center">
                  <span className="text-slate-600 shrink-0 select-none">&gt;</span>
                  <span className="w-1.5 h-3 bg-emerald-500 animate-pulse" />
                </div>
              )}
              <div ref={consoleEndRef} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
