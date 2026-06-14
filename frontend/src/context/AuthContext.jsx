import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global Research & History States
  const [activeBriefingId, setActiveBriefingId] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [briefingText, setBriefingText] = useState('');
  const [briefingsHistory, setBriefingsHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Function to refresh the profile info from public.profiles
  const refreshUser = async (currentSession = null) => {
    const activeSession = currentSession || (await supabase.auth.getSession()).data.session;
    if (!activeSession) {
      setUser(null);
      setToken(null);
      return;
    }

    const { user: authUser } = activeSession;
    const jwtToken = activeSession.access_token;
    setToken(jwtToken);

    try {
      // Query our custom public.profiles table for billing tier & scans today
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        // Fallback to auth details if profile is not found or fails
        const isPendingPro = typeof window !== 'undefined' && sessionStorage.getItem('pending_pro_upgrade') === 'true';
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || 'User',
          tier: isPendingPro ? 'pro' : 'free',
          scans_today: 0,
          last_scan_date: '',
          total_scans: 0
        });
      } else {
        if (profile.tier === 'pro' && typeof window !== 'undefined') {
          sessionStorage.removeItem('pending_pro_upgrade');
        }
        const isPendingPro = typeof window !== 'undefined' && sessionStorage.getItem('pending_pro_upgrade') === 'true';
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: profile.name || authUser.user_metadata?.name || 'User',
          tier: (profile.tier === 'pro' || isPendingPro) ? 'pro' : (profile.tier || 'free'),
          scans_today: profile.scans_today || 0,
          last_scan_date: profile.last_scan_date || '',
          total_scans: profile.total_scans || 0
        });
      }
    } catch (err) {
      console.error("Failed to sync profile:", err);
    }
  };

  useEffect(() => {
    // 1. Recover initial session
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await refreshUser(session);
      }
      setLoading(false);
    };

    initSession();

    // 2. Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await refreshUser(session);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
    
    if (data.session) {
      await refreshUser(data.session);
    }
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(),
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  };

  const upgradeToPro = async () => {
    if (!token) throw new Error("Unauthorized: No session token found.");
    
    // Call the backend API to create a Stripe checkout session
    const response = await fetch(`${API_BASE_URL}/payments/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to initiate upgrade payment.');
    }

    if (data.url) {
      // Redirect user directly to Stripe's secure hosted payment page
      window.location.href = data.url;
    } else {
      throw new Error('No payment redirect URL returned.');
    }
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  };

  const fetchBriefingsHistory = async (justCompletedCompany = null) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/briefings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBriefingsHistory(data);
        if (justCompletedCompany && data.length > 0) {
          const match = data.find(b => b.company_name.toLowerCase() === justCompletedCompany.toLowerCase());
          if (match) {
            setActiveBriefingId(match.id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch briefings history:", err);
    }
  };

  const loadHistoricalBriefing = async (id) => {
    if (!token || !id) return;
    setIsHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/briefings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to load historical briefing.");
      }
      const data = await response.json();
      setCompanyName(data.company_name);
      setBriefingText(data.briefing_text);
      setActiveBriefingId(id);
    } catch (err) {
      console.error("Failed to load briefing:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Automatically fetch history on login, clear on logout
  useEffect(() => {
    if (token) {
      fetchBriefingsHistory();
    } else {
      setBriefingsHistory([]);
      setActiveBriefingId(null);
      setCompanyName('');
      setBriefingText('');
    }
  }, [token]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, setUser, token, login, register, loginWithGoogle, logout, loading, refreshUser, upgradeToPro,
      activeBriefingId, setActiveBriefingId,
      companyName, setCompanyName,
      briefingText, setBriefingText,
      briefingsHistory, setBriefingsHistory,
      isHistoryLoading, fetchBriefingsHistory, loadHistoricalBriefing
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
