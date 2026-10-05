"use client";
import { createContext, useContext, useEffect, useState } from "react";
import api from '@/utils/axios'
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await api.get("api/account/me");
      setUser(res.data);
      return res.data
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data) => {
    await api.post("api/account/login", data);
    const loggedInUser = await fetchUser();
    const searchParams = new URLSearchParams(window.location.search);
    const redirect = searchParams.get("redirect") 
    if(redirect){
      router.push(redirect);
    } else if(loggedInUser?.is_admin){
      router.push("/user/dashboard");
    } else {
      router.push("/user/order");
    }
  };

  const logout = async () => {
    await api.post("api/account/logout");
    setUser(null);
    router.push("/login");
  };

  const register = async (data) => {
    await api.post("api/account/register", data);
    router.push("/login");
  };

  useEffect(() => {
     if (!user && loading) {
    fetchUser();
  }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
