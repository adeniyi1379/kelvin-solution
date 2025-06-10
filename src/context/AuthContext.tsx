
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
      // Debug: Log the entire user object to see available properties
      console.log("Auth0 user object:", user);
      console.log("User app_metadata:", user.app_metadata);
      console.log("User user_metadata:", user.user_metadata);
      
      // Try multiple ways to extract the role
      let userRole = 'user'; // default role
      
      // Method 1: Check custom claim (namespace format)
      if (user['https://your-app.com/role']) {
        userRole = user['https://your-app.com/role'];
      }
      // Method 2: Check app_metadata
      else if (user.app_metadata?.role) {
        userRole = user.app_metadata.role;
      }
      // Method 3: Check user_metadata
      else if (user.user_metadata?.role) {
        userRole = user.user_metadata.role;
      }
      // Method 4: Check for any role-related field
      else if (user.role) {
        userRole = user.role;
      }
      // Method 5: Check for admin indicators in email or nickname
      else if (user.email?.includes('admin') || user.nickname === 'admin') {
        userRole = 'admin';
        console.log("Admin role assigned based on email/nickname");
      }
      
      console.log("Extracted role:", userRole);
      
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
