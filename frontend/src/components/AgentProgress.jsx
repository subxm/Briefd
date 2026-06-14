import React from 'react';

const AGENTS = [
  { id: 1, name: 'Company Researcher', desc: 'Queries search index' },
  { id: 2, name: 'Competitor Finder', desc: 'Profiles market rivals' },
  { id: 3, name: 'Positioning Analyst', desc: 'Maps feature capability' },
  { id: 4, name: 'Briefing Writer', desc: 'Synthesizes intelligence' },
];

export default function AgentProgress({ activeAgent, completedAgents }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full bg-secondary/20 border border-border/60 rounded-xl p-4 select-none">
      {AGENTS.map((agent, index) => {
        const isCompleted = completedAgents.includes(agent.id);
        const isActive = activeAgent === agent.id;
        const isWaiting = !isActive && !isCompleted;

        return (
          <div key={agent.id} className="relative flex items-center gap-3 text-left flex-1 min-w-0">
            {/* Connecting Chevron Arrow for Desktop */}
            {index < AGENTS.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-3.5 -translate-y-1/2 z-10 text-muted-foreground/30">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}

            {/* Status indicator dot */}
            <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background border border-border/60">
              {isActive ? (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                </span>
              ) : isCompleted ? (
                <div className="h-4 w-4 rounded-full bg-accent flex items-center justify-center shadow-sm text-accent-foreground">
                  <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              ) : (
                <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              )}
            </div>

            {/* Content text */}
            <div className="flex-1 min-w-0">
              <p className={`text-[11.5px] font-bold leading-tight transition-colors duration-150 truncate ${
                isActive ? 'text-foreground' : isCompleted ? 'text-foreground/80' : 'text-muted-foreground/50'
              }`}>
                {agent.name}
              </p>
              <p className="mt-0.5 text-[9.5px] text-muted-foreground/60 truncate leading-none">
                {isActive ? 'Processing live search...' : isCompleted ? 'Analysis complete' : 'Waiting in queue...'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
