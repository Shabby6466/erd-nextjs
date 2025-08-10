"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { verifyToken, isLoading, token, tokenExpiry, isAuthenticated } =
    useAuthStore();
  const [initialized, setInitialized] = useState(false);
  const [verificationTimeout, setVerificationTimeout] = useState(false);

  // Handle verification timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading && !verificationTimeout) {
      // Set a 5-second timeout for verification
      timeoutId = setTimeout(() => {
        console.log("Auth verification timed out, forcing render");
        setVerificationTimeout(true);
        // Force isLoading to false after timeout
        useAuthStore.setState({ isLoading: false });
      }, 5000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, verificationTimeout]);

  // Only run token verification once on initial render
  useEffect(() => {
    if (!initialized) {
      // Check if token is expired
      if (tokenExpiry && Date.now() > tokenExpiry) {
        console.log("Token expired during initialization");
        useAuthStore.getState().logout();
        setInitialized(true);
      } else if (token && !isAuthenticated) {
        console.log("Token exists but not authenticated, verifying");
        verifyToken().finally(() => {
          setInitialized(true);
        });
      } else {
        console.log(
          "Auth initialization complete, token:",
          !!token,
          "authenticated:",
          isAuthenticated
        );
        setInitialized(true);
      }
    }
  }, [initialized, token, tokenExpiry, isAuthenticated, verifyToken]);

  // Show loading state, but with timeout protection
  if (isLoading && !verificationTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}
