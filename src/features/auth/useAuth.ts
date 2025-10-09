import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const { state, signInWithOtp, signInWithGoogle, signOut } = context;
  return {
    state,
    signInWithOtp,
    signInWithGoogle,
    signOut,
    isLoading: state.status === 'loading',
    isSignedIn: state.status === 'signed-in',
    isSignedOut: state.status === 'signed-out',
    user: state.status === 'signed-in' ? state.user : null,
    session: state.status === 'signed-in' ? state.session : null
  };
};
