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
        <div className="relative flex-1">
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={isLoading}
            placeholder="Enter company name (e.g., Notion, Stripe, Figma)..."
            className="w-full h-10 px-3 py-2 bg-secondary border border-border text-[13px] rounded-[6px] focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 text-foreground font-body placeholder:text-muted-foreground/60 transition-all duration-150"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !company.trim()}
          className="h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-[13px] font-medium rounded-[6px] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5 font-body cursor-pointer"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Analyze</span>
        </button>
      </div>
    </form>
  );
}
