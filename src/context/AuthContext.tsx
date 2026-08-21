import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  username: string;
  role: "user" | "admin";
  email?: string;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async (userId: string, email?: string) => {
      const { data } = await supabase
        .from("user_roles")
        .select("is_admin")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted) return;

      setCurrentUser({
        id: userId,
        username: email ?? "",
        role: data?.is_admin ? "admin" : "user",
        email,
      });
      setIsLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        loadProfile(session.user.id, session.user.email ?? undefined);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id, session.user.email ?? undefined);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: currentUser !== null,
    isAdmin: currentUser?.role === "admin",
    isLoading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
