import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/routes/paths';
import type { AuthContextValue, AuthState, SignInPayload } from '@/types/auth';
import { AuthContext } from './AuthContext';

const createLoadingState = (): AuthState => ({ status: 'loading' });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(createLoadingState);

  useEffect(() => {
    let isMounted = true;

    const clearEmptyHash = () => {
      if (window.location.hash && window.location.hash.replace(/#/g, '') === '') {
        const url = `${window.location.pathname}${window.location.search}`;
        window.history.replaceState(null, document.title, url);
      }
    };

    clearEmptyHash();

    const handleHashChange = () => {
      clearEmptyHash();
    };

    window.addEventListener('hashchange', handleHashChange);

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

      clearEmptyHash();
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

      clearEmptyHash();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const signInWithOtp = async ({ email }: SignInPayload) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + ROUTES.HOME
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
        redirectTo: window.location.origin + ROUTES.HOME
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
