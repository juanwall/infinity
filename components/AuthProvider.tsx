'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

const AuthContext = createContext<{
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    captchaToken: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  message: string | null;
  setMessage: (s: string | null) => void;
  setError: (s: string | null) => void;
  isAuthLoading: boolean;
}>({
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  error: null,
  message: null,
  setMessage: () => {},
  setError: () => {},
  isAuthLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
      router.refresh();
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const signUp = async (
    email: string,
    password: string,
    captchaToken: string,
  ) => {
    try {
      setMessage(null);
      setError(null);

      console.log('origin:', window.location.origin);

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          ...(process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ? { captchaToken } : {}),
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (!data?.user?.user_metadata?.email_verified) {
        setMessage(
          'Please check your email for a verification link. You may need to check your spam folder.',
        );

        return;
      }

      await signIn(email, password);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        signOut,
        error,
        message,
        setMessage,
        setError,
        isAuthLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
