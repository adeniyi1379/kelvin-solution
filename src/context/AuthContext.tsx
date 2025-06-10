
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

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
    if (user && isAuthenticated && !isLoading) {
      // Extract role from Auth0 user metadata or app_metadata
      const userRole = user['https://your-app.com/role'] || user.app_metadata?.role || 'user';
      
      setCurrentUser({
        id: user.sub || '',
        username: user.name || user.email || '',
        role: userRole === "admin" ? "admin" : "user",
        email: user.email,
      });
    } else {
      setCurrentUser(null);
    }
  }, [user, isAuthenticated, isLoading]);

  const value: AuthContextType = {
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
