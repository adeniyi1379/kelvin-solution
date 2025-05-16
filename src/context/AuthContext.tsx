
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  username: string;
  role: 'user' | 'admin';
  password?: string; // Added password field as optional
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to clean up auth state
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userProfile) {
          setCurrentUser({
            id: session.user.id,
            username: userProfile.username || session.user.email || '',
            role: (userProfile.role as 'user' | 'admin') || 'user'
          });
          setIsAuthenticated(true);
        }
      }
    };

    checkUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Defer data fetching to prevent deadlocks
          setTimeout(async () => {
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (userProfile) {
              setCurrentUser({
                id: session.user.id,
                username: userProfile.username || session.user.email || '',
                role: (userProfile.role as 'user' | 'admin') || 'user'
              });
              setIsAuthenticated(true);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Clean up existing auth state
      cleanupAuthState();
      
      // Attempt to sign out any existing sessions
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userProfile) {
          setCurrentUser({
            id: data.user.id,
            username: userProfile.username || data.user.email || '',
            role: (userProfile.role as 'user' | 'admin') || 'user'
          });
          setIsAuthenticated(true);
          toast.success('Login successful!');
          
          // Force page reload for a clean state
          window.location.href = '/';
          return true;
        }
      }

      return false;
    } catch (error) {
      toast.error('An error occurred during login');
      return false;
    }
  };

  const logout = async () => {
    // Clean up auth state
    cleanupAuthState();
    
    try {
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      // Ignore errors
    }
    
    setCurrentUser(null);
    setIsAuthenticated(false);
    toast.info('You have been logged out');
    
    // Force page reload for a clean state
    window.location.href = '/login';
  };

  const isAdmin = currentUser?.role === 'admin';

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
