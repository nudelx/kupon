import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import type { AuthContextValue, AuthState, SignInPayload } from './types';
import { AuthContext } from './AuthContext';

const createLoadingState = (): AuthState => ({ status: 'loading' });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(createLoadingState);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (session) {
        setState({ status: 'signed-in', session, user: session.user });
      } else {
        setState({ status: 'signed-out' });
      }
    };

    syncSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;

      if (session) {
        setState({ status: 'signed-in', session, user: session.user });
      } else {
        setState({ status: 'signed-out' });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithOtp = async ({ email }: SignInPayload) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      throw error;
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      signInWithOtp,
      signInWithGoogle,
      signOut
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
