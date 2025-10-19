import type { Session, User } from '@supabase/supabase-js';

export type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; session: Session; user: User };

export type SignInPayload = {
  email: string;
};

export type AuthContextValue = {
  state: AuthState;
  signInWithOtp: (payload: SignInPayload) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};
