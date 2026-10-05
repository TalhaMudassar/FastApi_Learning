'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

const RegisterPage = () => {
  const { register } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(form)
    } catch (err) {
      alert('Registration failed')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow mt-8">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={form.email} 
          onChange={handleChange} 
          className="w-full p-2 border" 
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          value={form.password} 
          onChange={handleChange} 
          className="w-full p-2 border" 
          required 
        />
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Register
        </button>
      </form>
    </div>
  )
}

export default RegisterPage
