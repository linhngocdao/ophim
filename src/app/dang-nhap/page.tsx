'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import type { AuthUser } from '@/hooks/useAuth'

type LoginFormValues = {
  email: string
  password: string
}

function LoginContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
  })

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginFormValues) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json?.error || 'Đăng nhập thất bại')
      }
      return json as { user?: AuthUser }
    },
    onSuccess: (json) => {
      const user = json?.user || null
      queryClient.setQueryData(['auth', 'me'], user)
      if (user?.role === 'admin') {
        router.push('/quan-tri')
      } else {
        router.push(next)
      }
      router.refresh()
    },
  })

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values)
  }

  return (
    <div className="min-h-screen bg-[#09090d] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141421] p-6 shadow-2xl"
      >
        <h1 className="mb-1 text-2xl font-bold text-white">Đăng nhập</h1>
        <p className="mb-5 text-sm text-zinc-400">Quản lý tài khoản và truy cập khu quản trị.</p>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#f31260]/60"
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
            className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#f31260]/60"
            {...register('password', {
              required: 'Mật khẩu là bắt buộc',
              minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
            })}
          />
          {errors.password && <p className="text-xs text-red-300">{errors.password.message}</p>}
        </div>

        {loginMutation.error && (
          <p className="mt-3 text-sm text-red-300">{(loginMutation.error as Error).message}</p>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#f31260] text-sm font-semibold text-white disabled:opacity-60"
        >
          <LogIn className="h-4 w-4" />
          {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <div className="mt-4 flex justify-between text-xs text-zinc-400">
          <Link href="/quen-mat-khau" className="hover:text-zinc-200">Quên mật khẩu</Link>
          <Link href="/dang-ky" className="hover:text-zinc-200">Tạo tài khoản</Link>
        </div>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090d]" />}>
      <LoginContent />
    </Suspense>
  )
}
