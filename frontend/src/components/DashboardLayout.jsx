import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, ChevronDown, Home, CreditCard, 
  LineChart, Settings, HelpCircle, Activity, Sparkles, LogOut,
  FileText, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children }) {
  const { 
    user, logout, briefingsHistory, loadHistoricalBriefing, 
    upgradeToPro, fetchBriefingsHistory 
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgradeClick = async () => {
    setIsUpgrading(true);
    try {
      await upgradeToPro();
      if (fetchBriefingsHistory) {
        fetchBriefingsHistory();
      }
    } catch (err) {
      alert(err.message || "Failed to upgrade.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'US';

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-body select-text">
      
      {/* Top Bar */}
      <header className="h-12 border-b border-border flex items-center justify-between px-4 select-none relative z-30 bg-background shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="h-5 w-5 bg-primary text-primary-foreground rounded flex items-center justify-center font-bold text-[10px]">
            B
          </div>
          <span className="font-semibold text-[13px] text-foreground">Briefd</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" />
        </div>

        {/* Search Bar / CMD Box */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-secondary rounded-md border border-border w-64 text-muted-foreground/60 text-[11px] text-left">
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1">Search briefings...</span>
          <kbd className="text-[9px] bg-background border border-border px-1 rounded text-muted-foreground/50 font-mono">⌘K</kbd>
        </div>

        {/* Actions + Profile */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              navigate('/dashboard');
            }}
            className="px-2.5 py-1 bg-secondary border border-border text-foreground hover:bg-secondary/80 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>New Research</span>
          </button>
          <div className="relative text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <Bell className="h-3.5 w-3.5" />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-accent rounded-full"></span>
          </div>
          
          {/* Avatar Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="h-7 w-7 rounded-full bg-accent text-accent-foreground font-semibold flex items-center justify-center text-[10px] shadow-sm cursor-pointer select-none hover:ring-1 hover:ring-accent transition-all"
            >
              {initials}
            </button>
            
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-dashboard p-1.5 z-40 text-left text-[11px]"
                  >
                    <div className="px-2.5 py-2 border-b border-border/60 mb-1">
                      <p className="font-semibold text-foreground">{user?.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar (w-40) */}
        <aside className="w-40 border-r border-border p-3 flex flex-col justify-between select-none bg-background/50 hidden md:flex text-[11px] text-left">
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
            <div className="space-y-1">
              <button 
                onClick={() => navigate('/dashboard')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                  activePath === '/dashboard' 
                    ? 'bg-secondary text-foreground font-semibold' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
              >
                <Home className={`h-3.5 w-3.5 ${activePath === '/dashboard' ? 'text-accent' : ''}`} />
                <span>Home</span>
              </button>
              <button 
                onClick={() => navigate('/competitors')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                  activePath === '/competitors' 
                    ? 'bg-secondary text-foreground font-semibold' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
              >
                <Users className={`h-3.5 w-3.5 ${activePath === '/competitors' ? 'text-accent' : ''}`} />
                <span>Competitors</span>
              </button>
              <button 
                onClick={() => navigate('/market-trends')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                  activePath === '/market-trends' 
                    ? 'bg-secondary text-foreground font-semibold' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
              >
                <LineChart className={`h-3.5 w-3.5 ${activePath === '/market-trends' ? 'text-accent' : ''}`} />
                <span>Market Trends</span>
              </button>
              <button 
                onClick={() => navigate('/api-status')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                  activePath === '/api-status' 
                    ? 'bg-secondary text-foreground font-semibold' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
              >
                <Activity className={`h-3.5 w-3.5 ${activePath === '/api-status' ? 'text-accent' : ''}`} />
                <span>API Status</span>
              </button>
            </div>

            {/* Briefings History list */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <p className="px-2.5 text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Briefings History</p>
              <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar px-1">
                {briefingsHistory.map((brief) => (
                  <button 
                    key={brief.id} 
                    onClick={() => {
                      loadHistoricalBriefing(brief.id);
                      if (activePath !== '/dashboard') {
                        navigate('/dashboard'); // Switch to home dashboard when loading history brief
                      }
                    }}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer text-[10px] truncate"
                  >
                    <FileText className="h-3.5 w-3.5 text-accent/80 shrink-0" />
                    <span className="truncate">{brief.company_name}</span>
                  </button>
                ))}
                {briefingsHistory.length === 0 && (
                  <p className="px-2.5 py-1 text-[10px] text-muted-foreground/60 italic">No past scans.</p>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <p className="px-2.5 text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Feeds & Settings</p>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <Bell className="h-3.5 w-3.5" />
                  <span>Notifications</span>
                </button>
                <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <Settings className="h-3.5 w-3.5" />
                  <span>Preferences</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-border/60 pt-3 shrink-0">
            {user && (
              <div className="px-2.5 text-[10px]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-muted-foreground">Tier:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-semibold uppercase tracking-wider ${
                    user.tier === 'pro' 
                      ? 'bg-accent/15 text-accent border border-accent/20' 
                      : 'bg-secondary text-muted-foreground border border-border'
                  }`}>
                    {user.tier === 'pro' ? 'Pro' : 'Free'}
                  </span>
                </div>
                {user.tier !== 'pro' ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] text-muted-foreground/85">
                      <span>Scans today:</span>
                      <span className="font-semibold text-foreground">{user.scans_today} / 2</span>
                    </div>
                    <button 
                      onClick={() => setShowLimitModal(true)}
                      className="w-full py-1.5 bg-accent text-accent-foreground hover:bg-accent/90 rounded text-[9.5px] font-semibold transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-1"
                    >
                      <Sparkles className="h-2.5 w-2.5 animate-pulse" />
                      <span>Upgrade Plan</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between text-[9px] text-muted-foreground/85">
                    <span>Scans:</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Unlimited</span>
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Support</span>
            </button>
          </div>
        </aside>

        {/* Dynamic workspace content slot */}
        <main className="flex-1 bg-secondary/20 p-4 md:p-6 overflow-y-auto custom-scrollbar flex flex-col justify-start">
          {children}
        </main>
      </div>

      {/* Credit Limit / Upgrade Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-background border border-border rounded-xl p-6 shadow-dashboard text-left"
            >
              <div className="h-10 w-10 bg-accent/15 text-accent rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground tracking-tight">Upgrade to Briefd Professional</h3>
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed font-body">
                Unlock unlimited competitive scans, structured competitor intelligence tables, vector-sharp PDF downloads, and advanced market trends analysis for a ₹499 one-time payment.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowLimitModal(false);
                    handleUpgradeClick();
                  }}
                  disabled={isUpgrading}
                  className="w-full h-10 bg-accent text-accent-foreground hover:bg-accent/90 rounded-[6px] text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isUpgrading ? 'Upgrading...' : 'Upgrade to Professional (₹499)'}</span>
                </button>
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="w-full h-10 bg-secondary text-foreground hover:bg-secondary/80 rounded-[6px] text-xs font-medium transition-all flex items-center justify-center cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
