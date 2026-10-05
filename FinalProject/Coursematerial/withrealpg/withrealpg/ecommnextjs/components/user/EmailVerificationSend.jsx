'use client'

import { useState } from 'react'
import api from '@/utils/axios'
import { useAuth } from '@/context/AuthContext'

export default function EmailVerificationSend() {
  const { user } = useAuth()
  const [sending, setSending] = useState(false)

  const sendVerificationEmail = async () => {
    try {
      setSending(true)
      await api.post('/api/account/send-verification-email')
      alert('Verification email sent! Check your inbox.')
    } catch (err) {
      console.error(err)
      alert('Failed to send verification email.')
    } finally {
      setSending(false)
    }
  }

  if (user?.is_verified) return null

  return (
    <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded flex justify-between items-center">
      <p>✅ Verify your email to access full features</p>
      <button
        onClick={sendVerificationEmail}
        disabled={sending}
        className={`ml-4 px-4 py-2 rounded text-white transition ${
          sending ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {sending ? 'Sending...' : 'Send Verification Email'}
      </button>
    </div>
  )
}
