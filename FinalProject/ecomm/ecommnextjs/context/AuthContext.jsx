"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/account/me");
      setUser(res.data);
      return res.data;
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data) => {
    await api.post("/api/account/login", data);
    const loggedInUser = await fetchUser();

    let redirect = null;
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      redirect = searchParams.get("redirect");
    }

    if (redirect) {
      router.push(redirect);
    } else if (loggedInUser?.is_admin) {
      router.push("/user/dashboard");
    } else {
      router.push("/user/order");
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/account/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  // Register new user, dispatch verification email, and navigate to login
  const register = async (data) => {
    await api.post("/api/account/register", data);
    router.push("/login?registered=true");
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};