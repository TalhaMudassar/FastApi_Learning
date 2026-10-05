'use client'
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useRouter } from 'next/navigation'

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow mt-8">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" name="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border" required />
        <input type="password" name="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border" required />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
      </form>
    </div>
  )
}

export default LoginPage
