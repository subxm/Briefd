import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { API_BASE_URL } from '../config';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

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
    // 1. Verify session validity against Supabase Auth API to catch invalidated DB sessions
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      console.warn("Supabase session is invalid or has expired:", authError);
      // Purge local storage and clear client state
      await supabase.auth.signOut().catch(() => {});
      setUser(null);
      setToken(null);
      return;
    }

    const activeSession = currentSession || (await supabase.auth.getSession()).data.session;
    if (!activeSession) {
      setUser(null);
      setToken(null);
      return;
    }

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
    // 1. Load Razorpay SDK script dynamically
    const res = await loadRazorpayScript();
    if (!res) {
      throw new Error("Razorpay SDK failed to load. Are you offline?");
    }

    // 2. Retrieve dynamic Supabase session token
    const { data: { session } } = await supabase.auth.getSession();
    const activeToken = session?.access_token || token;

    if (!activeToken) throw new Error("Unauthorized: No session token found.");
    
    // 3. Create order on backend
    const response = await fetch(`${API_BASE_URL}/payments/razorpay-create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeToken}`
      }
    });

    const orderData = await response.json();

    if (!response.ok) {
      throw new Error(orderData.detail || 'Failed to initiate Razorpay order.');
    }

    // 4. Configure Razorpay checkout options
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Briefd",
      description: "Briefd Professional Pass",
      order_id: orderData.order_id,
      prefill: {
        name: user?.name || "User",
        email: user?.email || "",
      },
      handler: async function (paymentResponse) {
        try {
          // Set pending pro upgrade indicator locally in sessionStorage to avoid webhook lag
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('pending_pro_upgrade', 'true');
          }
          
          // Instantly upgrade local user object
          setUser(prev => prev ? { ...prev, tier: 'pro' } : null);

          // Call backend verification
          const verifyResponse = await fetch(`${API_BASE_URL}/payments/razorpay-verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${activeToken}`
            },
            body: JSON.stringify({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            })
          });

          if (!verifyResponse.ok) {
            const errData = await verifyResponse.json().catch(() => ({}));
            throw new Error(errData.detail || "Payment verification failed.");
          }

          // Trigger state sync and dashboard reload
          await refreshUser();
          
          // Redirect to dashboard with payment success search param
          window.location.href = `${window.location.origin}/dashboard?payment=success`;
        } catch (err) {
          console.error("Verification error:", err);
          window.location.href = `${window.location.origin}/dashboard?payment=cancel`;
        }
      },
      modal: {
        ondismiss: function () {
          console.log("Checkout modal dismissed.");
        }
      },
      theme: {
        color: "#6366f1", // Indigo accent
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
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

  // Handle post-login checkout redirect for landing/pricing pages
  useEffect(() => {
    if (!loading && user) {
      if (typeof window !== 'undefined' && sessionStorage.getItem('pending_checkout_after_login') === 'true') {
        sessionStorage.removeItem('pending_checkout_after_login');
        upgradeToPro().catch((err) => {
          console.error("Failed to redirect to Razorpay checkout:", err);
        });
      }
    }
  }, [user, loading]);

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
