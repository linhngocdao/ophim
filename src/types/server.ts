import type { Movie } from '@/types/movie'
import type { UserRole } from '@/lib/server/auth'

export interface UserDoc {
  _id: string
  email: string
  name?: string
  passwordHash: string
  role: UserRole
  isActive: boolean
  resetPasswordToken?: string
  resetPasswordExpire?: Date
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface BannerDoc {
  id: string
  title: string
  subtitle: string
  imageUrl: string
  href: string
  priority: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface StoredMovieDoc extends Movie {
  searchableText?: string
  source?: string
  createdAt?: Date
  updatedAt?: Date
}
