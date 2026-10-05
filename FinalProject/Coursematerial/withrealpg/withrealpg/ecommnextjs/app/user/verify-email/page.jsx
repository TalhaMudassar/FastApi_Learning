'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import api from '@/utils/axios'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('Verifying...')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('No token found.')
        return
      }

      try {
        await api.get("/api/account/verify-email", {
          params: { token }
        })
        setStatus('Email verified successfully!')
      } catch (error) {
        setStatus('Invalid or expired token.')
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded text-center">
      <h2 className="text-xl font-bold">{status}</h2>
    </div>
  )
}
