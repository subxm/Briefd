import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, CheckCircle2, AlertTriangle, Sparkles, Loader2, 
  Trash2, MailOpen, ShieldAlert, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      category: 'scans',
      title: 'Scan Completed Successfully',
      message: 'Briefing report and competitor profiling generated successfully for Notion Inc.',
      time: '10 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'billing',
      category: 'billing',
      title: 'Account Upgraded to Professional',
      message: 'Welcome to Professional tier! You now have unlimited scans, PDF downloads, and full feature matrices.',
      time: '2 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'system',
      category: 'system',
      title: 'Daily API quota reset',
      message: 'Your standard daily competitive scan counters have been reset at 00:00 UTC.',
      time: '23 hours ago',
      read: true
    },
    {
      id: 4,
      type: 'warning',
      category: 'scans',
      title: 'Daily Scan Limit Warning',
      message: 'You have reached 2/2 scans for your Free tier account. Upgrade to Pro to bypass all limits.',
      time: '1 day ago',
      read: true
    }
  ]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
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

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.category === filter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'billing':
        return <Sparkles className="h-4 w-4 text-accent" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl w-full mx-auto flex flex-col flex-1">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 select-none text-left text-[11px]">
        <div>
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Notifications</h2>
          <p className="text-muted-foreground text-[10px] mt-0.5">Stay updated with research agent runs and system reports.</p>
        </div>
        <button
          onClick={markAllAsRead}
          className="rounded-full bg-secondary border border-border text-foreground hover:bg-secondary/80 px-3.5 py-1 text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <MailOpen className="h-3 w-3" />
          <span>Mark all as read</span>
        </button>
      </div>

      <div className="max-w-3xl space-y-4 text-left w-full mx-auto">
        {/* Filters */}
        <div className="flex border-b border-border">
          {[
            { id: 'all', label: 'All notifications' },
            { id: 'scans', label: 'Agent runs' },
            { id: 'billing', label: 'Billing & Plan' },
            { id: 'system', label: 'System status' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer ${
                filter === tab.id
                  ? 'border-accent text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        <div className="space-y-2.5">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 border rounded-xl flex items-start justify-between gap-4 transition-all duration-150 ${
                notif.read
                  ? 'bg-background/40 border-border/60 opacity-80'
                  : 'bg-background border-border shadow-sm ring-1 ring-accent/5'
              }`}
            >
              <div className="flex gap-3">
                {/* Visual Unread dot */}
                {!notif.read && (
                  <span className="h-2 w-2 rounded-full bg-accent mt-1.5 shrink-0 animate-pulse" />
                )}
                
                {/* Category Icon */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  notif.read ? 'bg-secondary/50' : 'bg-secondary'
                }`}>
                  {getIcon(notif.type)}
                </div>

                <div>
                  <h4 className="text-[12px] font-semibold text-foreground">{notif.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                  <span className="text-[9.5px] text-muted-foreground/60 block mt-2 font-mono">{notif.time}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleRead(notif.id)}
                  title={notif.read ? "Mark as unread" : "Mark as read"}
                  className="p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteNotification(notif.id)}
                  title="Delete notification"
                  className="p-1.5 text-muted-foreground/60 hover:text-red-600 hover:bg-red-500/5 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12 border border-dashed border-border rounded-xl bg-background/50">
              <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-[12px] font-medium text-muted-foreground">Clean inbox!</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">No notifications match this filter.</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
