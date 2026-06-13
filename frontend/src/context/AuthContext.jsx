import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || 'User',
          tier: 'free',
          scans_today: 0,
          last_scan_date: '',
          total_scans: 0
        });
      } else {
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: profile.name || authUser.user_metadata?.name || 'User',
          tier: profile.tier || 'free',
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
    
    // Call the backend API securely to toggle the tier
    const response = await fetch(`${API_BASE_URL}/auth/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to upgrade to Pro.');
    }

    if (data.user) {
      setUser(prev => ({
        ...prev,
        tier: data.user.tier,
        scans_today: data.user.scans_today,
        total_scans: data.user.total_scans
      }));
    } else {
      await refreshUser();
    }
    return data.user;
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

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, loginWithGoogle, logout, loading, refreshUser, upgradeToPro }}>
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
