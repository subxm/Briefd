import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // If user is already logged in, redirect them
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Failed to authenticate with Google.');
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-body relative">
      
      {/* Background Video Backdrop */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <video 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4" 
          muted 
          autoPlay 
          loop 
          playsInline 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 bg-background/30 backdrop-blur-sm select-none">
        <Link to="/" className="flex items-center gap-1.5 text-xl font-semibold tracking-tight text-foreground">
          Briefd
        </Link>
      </header>

      {/* Main content centered */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 select-text">
        <div className="w-full max-w-sm bg-background/80 backdrop-blur-md border border-border rounded-xl p-6 shadow-dashboard text-left">
          
          {/* Logo Title */}
          <div className="text-center mb-6 select-none">
            <div className="h-9 w-9 bg-primary text-primary-foreground rounded flex items-center justify-center mx-auto mb-3 font-bold text-sm">
              B
            </div>
            <h2 className="text-lg font-medium tracking-tight text-foreground">Welcome to Briefd</h2>
            <p className="text-[11px] text-muted-foreground mt-1">
              Sign in to run agentic competitive intelligence.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[6px] text-red-700 text-[11px] flex items-start gap-1.5 font-medium">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-11 bg-background hover:bg-secondary border border-border rounded-[6px] text-xs font-semibold text-foreground transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 shadow-sm hover:scale-[1.01] active:scale-[0.99] hover:border-slate-400"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin"></span>
                Connecting...
              </span>
            ) : (
              <>
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Disclaimer */}
          <div className="mt-5 text-center text-[10px] text-muted-foreground/60 border-t border-border/50 pt-4 select-none">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="hover:underline font-medium text-muted-foreground">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="hover:underline font-medium text-muted-foreground">
              Privacy Policy
            </Link>.
          </div>

        </div>
      </main>
    </div>
  );
}
