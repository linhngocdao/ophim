'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

type ForgotPasswordValues = {
  email: string
}

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState('')
  const [resetToken, setResetToken] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordValues>({
    defaultValues: { email: '' },
  })

  const forgotMutation = useMutation({
    mutationFn: async (payload: ForgotPasswordValues) => {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json?.error || 'Không thể gửi yêu cầu')
      }
      return json
    },
    onSuccess: (json) => {
      setMessage(json?.message || 'Vui lòng kiểm tra email của bạn.')
      if (json?.resetToken) setResetToken(json.resetToken)
    },
  })

  const submit = (values: ForgotPasswordValues) => {
    setMessage('')
    setResetToken('')
    forgotMutation.mutate(values)
  }

  return (
    <div className="min-h-screen bg-[#09090d] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141421] p-6">
        <h1 className="text-2xl font-bold text-white">Quên mật khẩu</h1>
        <p className="mt-1 text-sm text-zinc-400">Nhập email để nhận token đặt lại mật khẩu.</p>
        <input
          type="email"
          placeholder="Email"
          className="mt-4 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white"
          {...register('email', {
            required: 'Email là bắt buộc',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Email không hợp lệ',
            },
          })}
        />
        {errors.email && <p className="mt-2 text-xs text-red-300">{errors.email.message}</p>}
        <button type="submit" disabled={forgotMutation.isPending} className="mt-4 h-11 w-full rounded-lg bg-[#f31260] text-sm font-semibold text-white disabled:opacity-60">
          {forgotMutation.isPending ? 'Đang xử lý...' : 'Gửi yêu cầu'}
        </button>
        {forgotMutation.error && (
          <p className="mt-3 text-sm text-red-300">{(forgotMutation.error as Error).message}</p>
        )}
        {message && <p className="mt-3 text-sm text-zinc-300">{message}</p>}
        {resetToken && (
          <p className="mt-2 break-all text-xs text-yellow-300">
            Reset token (dev): {resetToken}
          </p>
        )}
      </form>
    </div>
  )
}
