import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Key, CreditCard, Sparkles, Loader2, 
  Check, Save, Eye, EyeOff, ShieldAlert, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import DashboardLayout from '../components/DashboardLayout';

export default function SettingsPage() {
  const { user, refreshUser, upgradeToPro, loading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile settings state
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // API Integration state
  const [apiKey, setApiKey] = useState('bd_prod_live_xxxxxxxxxxxxxxxxxxxxxxxx');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  // Billing state
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Sync state with user data
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      // 1. Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: name.trim() }
      });

      if (authError) throw authError;

      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setSaveError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const generateNewApiKey = () => {
    setIsGeneratingKey(true);
    setTimeout(() => {
      const randomHex = Array.from({ length: 24 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      setApiKey(`bd_prod_live_${randomHex}`);
      setIsGeneratingKey(false);
      setShowApiKey(true);
    }, 800);
  };

  const handleUpgradeClick = async () => {
    setIsUpgrading(true);
    try {
      await upgradeToPro();
    } catch (err) {
      alert(err.message || 'Failed to upgrade.');
    } finally {
      setIsUpgrading(false);
    }
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

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 select-none text-left text-[11px]">
        <div>
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Settings</h2>
          <p className="text-muted-foreground text-[10px] mt-0.5">Manage your profile configurations, API keys, and subscription details.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 text-left">
        {/* Navigation Tabs (Vertical) */}
        <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col gap-1 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-4">
          {[
            { id: 'profile', label: 'Profile Settings', icon: User },
            { id: 'api', label: 'Developer API', icon: Key },
            { id: 'billing', label: 'Billing & Plan', icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div className="flex-1 bg-background border border-border rounded-xl p-6 shadow-sm min-h-[300px]">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Profile Information</h3>
              </div>

              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-[11px]">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{saveError}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-emerald-700 text-[11px]">
                  <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span>Profile updated successfully.</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Subham Singh"
                  className="w-full h-9 bg-background border border-border px-3 rounded-md text-xs text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Email Address (Primary)</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full h-9 bg-secondary border border-border px-3 rounded-md text-xs text-muted-foreground/80 cursor-not-allowed"
                />
                <p className="text-[9px] text-muted-foreground/75">Email addresses are tied to Google login and cannot be altered.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">User UUID</label>
                <input
                  type="text"
                  value={user.id}
                  disabled
                  className="w-full h-9 bg-secondary border border-border px-3 rounded-md text-xs text-muted-foreground/80 font-mono cursor-not-allowed select-all"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground hover:bg-primary/95 px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'api' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Developer API Integration</h3>
                <p className="text-[10.5px] text-muted-foreground leading-relaxed">
                  Generate programmatic API tokens to scan competitive intelligence directly from your build servers or custom analytics scripts.
                </p>
              </div>

              <div className="border border-border rounded-lg p-4 space-y-3 bg-secondary/20">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                    <span>Live Production Key</span>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-[10px] text-accent font-semibold hover:underline flex items-center gap-0.5 cursor-pointer select-none"
                    >
                      {showApiKey ? (
                        <>
                          <EyeOff className="h-3 w-3" /> Hide Key
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" /> Show Key
                        </>
                      )}
                    </button>
                  </label>
                  
                  <div className="relative flex items-center">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      readOnly
                      className="w-full h-9 bg-background border border-border px-3 pr-10 rounded-md text-xs text-foreground font-mono select-all focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={generateNewApiKey}
                    disabled={isGeneratingKey}
                    className="bg-primary text-primary-foreground hover:bg-primary/95 px-3 py-1.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingKey && <Loader2 className="h-3 w-3 animate-spin" />}
                    <span>{isGeneratingKey ? 'Generating...' : 'Roll New API Token'}</span>
                  </button>
                </div>
              </div>

              {/* Code snippet mock */}
              <div className="space-y-2">
                <p className="text-[10.5px] font-semibold text-foreground">Usage Example (FastAPI Python):</p>
                <pre className="bg-secondary p-3 rounded-lg text-[9.5px] font-mono text-foreground/80 overflow-x-auto border border-border">
{`import requests

url = "https://briefdd.vercel.app/api/v1/research"
headers = {
    "Authorization": "Bearer ${apiKey}"
}
payload = {
    "company": "Notion"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Subscription & Credit Consumption</h3>
                <p className="text-[10.5px] text-muted-foreground">Manage your subscription, check daily limits, and unlock unlimited capabilities.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-border rounded-xl p-4 bg-secondary/10 text-left space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Active Plan</span>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-foreground capitalize">{user.tier} Plan</h4>
                    {user.tier === 'pro' && (
                      <span className="bg-accent/10 border border-accent/20 text-accent text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Pro</span>
                    )}
                  </div>
                  <p className="text-[10.5px] text-muted-foreground pt-1.5">
                    {user.tier === 'pro' 
                      ? 'You are running Briefd Professional with unlimited search scans and high resolution features.' 
                      : 'You are on the Starter Free tier. You can search up to 2 competitive briefs per day.'}
                  </p>
                </div>

                <div className="border border-border rounded-xl p-4 bg-secondary/10 text-left space-y-2">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Usage Today</span>
                  {user.tier === 'pro' ? (
                    <div className="space-y-1.5">
                      <span className="text-emerald-600 font-bold text-base flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Unlimited scans</span>
                      </span>
                      <p className="text-[10.5px] text-muted-foreground">All sequential research agents are ready to scan.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Daily Scans:</span>
                        <span>{user.scans_today} / 2 used</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${(user.scans_today / 2) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upgrade Trigger if Free */}
              {user.tier !== 'pro' && (
                <div className="border border-accent/35 rounded-xl p-5 bg-accent/5 text-left space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-accent/15 text-accent rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">Unlock Unlimited Briefd Professional</h4>
                      <p className="text-[10.5px] text-muted-foreground mt-1 leading-relaxed">
                        Say goodbye to daily scan counters. Unlock programmatic PDF downloads, competitor feature checklists, and market trends dashboards for a single one-time upgrade payment.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleUpgradeClick}
                      disabled={isUpgrading}
                      className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-[6px] px-4 py-2 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>{isUpgrading ? 'Upgrading...' : 'Upgrade to Professional (₹499)'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
