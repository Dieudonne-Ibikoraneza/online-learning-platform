"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { User, AuthResponse } from "@/types";
import { authAPI } from "@/lib/api";

// Create a simplified type for auth responses
interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: {
    url: string;
    public_id: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
      name: string,
      email: string,
      password: string,
      role?: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                        children,
                                                                      }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await authAPI.getMe();
        setUser(response.data.data as AuthUser);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      toast.error("Session expired. Please log in again.");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { token, refreshToken, ...userData } = response.data.data;

    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    setUser(userData as AuthUser);
    toast.success("Welcome back! You have successfully logged in.");
  };

  const register = async (
      name: string,
      email: string,
      password: string,
      role?: string
  ) => {
    const response = await authAPI.register({ name, email, password, role });
    const { token, refreshToken, ...userData } = response.data.data;

    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    setUser(userData as AuthUser);
    toast.success(
        "Account created! Your account has been created successfully."
    );
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    toast.success("You have been successfully logged out.");
    // Call logout API
    authAPI.logout().catch(console.error);
  };

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    toast.success("Your profile has been updated successfully.");
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            isLoading,
            login,
            register,
            logout,
            updateUser,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};