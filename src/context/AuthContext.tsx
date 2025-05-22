
// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, logout, isLoading } = useAuth0();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && user.email) {
        // Try to fetch user profile from Supabase
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", user.email)
          .single();

        if (data) {
          setCurrentUser({
            id: data.id,
            username: data.username || user.name || user.email,
            role: data.role || "user",
            email: data.email,
          });
        } else if (!error) {
          // Optionally, create a new profile if not found
          const { data: newProfile } = await supabase
            .from("profiles")
            .insert([{ email: user.email, username: user.name || user.email, role: "user" }])
            .select()
            .single();
          setCurrentUser(newProfile);
        }
      } else {
        setCurrentUser(null);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    } else {
      setCurrentUser(null);
    }
  }, [user, isAuthenticated]);

  const value = {
    currentUser,
    isAuthenticated,
    isAdmin: currentUser?.role === "admin",
    logout: () => logout({ logoutParams: { returnTo: window.location.origin } }),
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
