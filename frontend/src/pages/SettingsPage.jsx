import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Key, CreditCard, Sparkles, Loader2, 
  Check, Save, Eye, EyeOff, ShieldAlert, Award,
  Trash2, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import DashboardLayout from '../components/DashboardLayout';

export default function SettingsPage() {
  const { user, token, refreshUser, upgradeToPro, loading, setUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  
  // Admin state
  const [adminPayments, setAdminPayments] = useState([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState(null);
  const [revokingId, setRevokingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const fetchAdminPayments = async () => {
    setIsAdminLoading(true);
    setAdminError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const activeToken = session?.access_token || token;
      
      const response = await fetch(`${API_BASE_URL}/admin/payments`, {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to fetch admin transactions.");
      }
      const data = await response.json();
      setAdminPayments(data);
    } catch (err) {
      console.error(err);
      setAdminError(err.message);
    } finally {
      setIsAdminLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin') {
      fetchAdminPayments();
    }
  }, [activeTab]);

  const handleRevoke = async (targetUserId, paymentId) => {
    if (!window.confirm("Are you sure you want to revoke Pro access for this user? This will instantly downgrade their account to Free.")) {
      return;
    }
    setRevokingId(paymentId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const activeToken = session?.access_token || token;

      const response = await fetch(`${API_BASE_URL}/admin/payments/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          user_id: targetUserId,
          payment_id: paymentId
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to revoke payment.");
      }

      // Re-fetch list
      await fetchAdminPayments();
      
      // If the admin downgraded themselves, refresh local state
      if (targetUserId === user.id) {
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to revoke tier.");
    } finally {
      setRevokingId(null);
    }
  };

  const handleApprove = async (targetUserId, paymentId) => {
    if (!window.confirm("Are you sure you want to approve this UPI payment and grant Pro access?")) {
      return;
    }
    setApprovingId(paymentId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const activeToken = session?.access_token || token;

      const response = await fetch(`${API_BASE_URL}/admin/payments/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          user_id: targetUserId,
          payment_id: paymentId
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to approve payment.");
      }

      // Re-fetch list
      await fetchAdminPayments();
      
      // If the admin upgraded themselves, refresh local state
      if (targetUserId === user.id) {
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to approve payment.");
    } finally {
      setApprovingId(null);
    }
  };
  
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

      <div className="max-w-4xl flex flex-col md:flex-row gap-6 text-left w-full">
        {/* Navigation Tabs (Vertical) */}
        <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col gap-1 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-4">
          {(() => {
            const tabs = [
              { id: 'profile', label: 'Profile Settings', icon: User },
              { id: 'api', label: 'Developer API', icon: Key },
              { id: 'billing', label: 'Billing & Plan', icon: CreditCard }
            ];
            if (user?.email && user.email.toLowerCase() === 'shubhamnegissn14@gmail.com') {
              tabs.push({ id: 'admin', label: 'Admin Console', icon: ShieldAlert });
            }
            return tabs.map((tab) => {
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
            });
          })()}
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

          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">UPI Payments Audit Console</h3>
                  <p className="text-[10.5px] text-muted-foreground mt-0.5 font-body">Review Direct P2P UPI payments and revoke fake submissions.</p>
                </div>
                <button
                  onClick={fetchAdminPayments}
                  disabled={isAdminLoading}
                  className="p-1.5 rounded-lg bg-secondary border border-border/80 hover:bg-secondary/80 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50"
                  title="Refresh List"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isAdminLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {adminError && (
                <div className="p-3 bg-red-500/[0.03] border border-red-500/15 rounded-lg flex items-start gap-2.5 text-[11px] text-red-600 dark:text-red-400 font-medium">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{adminError}</span>
                </div>
              )}

              {isAdminLoading && adminPayments.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground select-none">
                  <Loader2 className="h-5 w-5 text-accent animate-spin" />
                  <span className="text-[11px]">Loading submissions...</span>
                </div>
              ) : adminPayments.length === 0 ? (
                <div className="h-40 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground select-none">
                  <Award className="h-6 w-6 text-muted-foreground/50 mb-1" />
                  <span className="text-[11px] font-medium">No UPI payments submitted yet.</span>
                </div>
              ) : (
                <div className="border border-border rounded-xl overflow-hidden bg-background">
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-secondary/40 border-b border-border text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                          <th className="px-4 py-2.5 text-left font-semibold">User Email</th>
                          <th className="px-4 py-2.5 text-left font-semibold">UTR ID</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Submitted</th>
                          <th className="px-4 py-2.5 text-center font-semibold">Status</th>
                          <th className="px-4 py-2.5 text-center font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {adminPayments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-secondary/10 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground truncate max-w-[150px]">{payment.email}</td>
                            <td className="px-4 py-3 font-mono font-medium text-[10.5px] select-all">{payment.utr}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(payment.created_at).toLocaleString('en-IN', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                                timeZone: 'Asia/Kolkata'
                              })}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                payment.status === 'approved'
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                  : payment.status === 'pending'
                                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                                  : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {payment.status === 'pending' && (
                                  <button
                                    onClick={() => handleApprove(payment.user_id, payment.id)}
                                    disabled={approvingId !== null || revokingId !== null}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all font-semibold cursor-pointer disabled:opacity-50"
                                  >
                                    {approvingId === payment.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                    <span>Approve</span>
                                  </button>
                                )}
                                {payment.status === 'approved' && (
                                  <button
                                    onClick={() => handleRevoke(payment.user_id, payment.id)}
                                    disabled={approvingId !== null || revokingId !== null}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all font-semibold cursor-pointer disabled:opacity-50"
                                  >
                                    {revokingId === payment.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3 w-3" />
                                    )}
                                    <span>Revoke Pro</span>
                                  </button>
                                )}
                                {payment.status === 'revoked' && (
                                  <span className="text-muted-foreground/60 text-[10px] font-medium">No actions</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
