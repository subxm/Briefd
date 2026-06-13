import React from 'react';

const AGENTS = [
  { id: 1, name: 'Company Researcher', desc: 'Queries search index and extracts company profile' },
  { id: 2, name: 'Competitor Finder', desc: 'Identifies top alternatives and profiles competitors' },
  { id: 3, name: 'Market Positioning Analyst', desc: 'Analyzes positioning, strengths, and differentiation' },
  { id: 4, name: 'Briefing Writer', desc: 'Synthesizes all details into structured report' },
];

export default function AgentProgress({ activeAgent, completedAgents }) {
  return (
    <div className="flex flex-col space-y-6 py-2">
      {AGENTS.map((agent, index) => {
        const isCompleted = completedAgents.includes(agent.id);
        const isActive = activeAgent === agent.id;
        const isWaiting = !isActive && !isCompleted;

        return (
          <div key={agent.id} className="relative flex gap-4 text-left">
            {/* Left line segment connecting the items */}
            {index < AGENTS.length - 1 && (
              <div 
                className={`absolute left-[9px] top-6 w-[1px] h-[calc(100%+16px)] transition-colors duration-300 ${
                  isCompleted && (completedAgents.includes(agent.id + 1) || activeAgent === agent.id + 1)
                    ? 'bg-accent' 
                    : 'bg-border'
                }`}
              />
            )}

            {/* Status indicator dot */}
            <div className="relative z-10 flex h-5 w-5 items-center justify-center">
              {isActive ? (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                </span>
              ) : isCompleted ? (
                <div className="h-3.5 w-3.5 rounded-full bg-accent flex items-center justify-center shadow-sm">
                  <svg className="h-2 w-2 text-accent-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              ) : (
                <div className="h-2.5 w-2.5 rounded-full bg-muted border border-border" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-[13px] leading-none transition-colors duration-150 ${
                isActive ? 'text-foreground font-medium' : isCompleted ? 'text-foreground/80' : 'text-muted-foreground/65'
              }`}>
                {agent.name}
              </p>
              <p className="mt-1.5 text-[11px] text-muted-foreground/60 truncate">
                {isActive ? 'Processing live search...' : isCompleted ? 'Analysis complete' : 'Waiting for context...'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
