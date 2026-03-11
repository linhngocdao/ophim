'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

type RegisterFormValues = {
  name: string
  email: string
  password: string
}

export default function RegisterPage() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    defaultValues: { name: '', email: '', password: '' },
  })

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterFormValues) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json?.error || 'Đăng ký thất bại')
      }
      return json
    },
    onSuccess: () => {
      router.push('/')
      router.refresh()
    },
  })

  const submit = (values: RegisterFormValues) => {
    registerMutation.mutate(values)
  }

  return (
    <div className="min-h-screen bg-[#09090d] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141421] p-6">
        <h1 className="text-2xl font-bold text-white">Đăng ký</h1>
        <div className="mt-4 space-y-3">
          <input
            placeholder="Tên hiển thị"
            className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white"
            {...register('name', { required: 'Tên hiển thị là bắt buộc' })}
          />
          {errors.name && <p className="text-xs text-red-300">{errors.name.message}</p>}
          <input
            type="email"
            placeholder="Email"
            className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white"
            {...register('email', {
              required: 'Email là bắt buộc',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email không hợp lệ',
              },
            })}
          />
          {errors.email && <p className="text-xs text-red-300">{errors.email.message}</p>}
          <input
            type="password"
            placeholder="Mật khẩu"
            className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white"
            {...register('password', {
              required: 'Mật khẩu là bắt buộc',
              minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
            })}
          />
          {errors.password && <p className="text-xs text-red-300">{errors.password.message}</p>}
        </div>
        {registerMutation.error && (
          <p className="mt-3 text-sm text-red-300">{(registerMutation.error as Error).message}</p>
        )}
        <button type="submit" disabled={registerMutation.isPending} className="mt-4 h-11 w-full rounded-lg bg-[#f31260] text-sm font-semibold text-white disabled:opacity-60">
          {registerMutation.isPending ? 'Đang xử lý...' : 'Tạo tài khoản'}
        </button>
      </form>
    </div>
  )
}
