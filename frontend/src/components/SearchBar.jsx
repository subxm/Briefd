import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ onSubmit, isLoading }) {
  const [company, setCompany] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (company.trim() && !isLoading) {
      onSubmit(company.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1 rounded-lg border border-neutral-300 dark:border-border bg-white dark:bg-secondary/50 focus-within:border-accent/60 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.08)] transition-all duration-300">
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={isLoading}
            placeholder="Enter company name..."
            className="w-full h-10 px-3.5 bg-transparent border-0 outline-none text-[12.5px] rounded-lg disabled:opacity-50 text-foreground font-body placeholder:text-muted-foreground/50 transition-colors focus:ring-0 p-0"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !company.trim()}
          className="h-10 px-5 bg-accent text-accent-foreground hover:bg-accent/95 text-[12.5px] font-semibold rounded-lg transition-all duration-200 disabled:opacity-45 flex items-center justify-center gap-1.5 font-body cursor-pointer shadow-sm border border-accent/10 hover:shadow-[0_0_12px_rgba(99,102,241,0.2)]"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Analyze</span>
        </button>
      </div>
    </form>
  );
}
