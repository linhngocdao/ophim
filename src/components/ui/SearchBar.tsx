'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useMovieStore } from '@/store/useMovieStore'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  className?: string
  placeholder?: string
  onClose?: () => void
  autoFocus?: boolean
}

export function SearchBar({ className, placeholder = 'Tìm kiếm phim...', onClose, autoFocus }: SearchBarProps) {
  const router = useRouter()
  const { searchQuery, setSearchQuery } = useMovieStore()
  const [inputValue, setInputValue] = useState(searchQuery)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value)
    if (value.trim().length >= 2) {
      router.push(`/tim-kiem?keyword=${encodeURIComponent(value.trim())}`)
    }
  }, [router, setSearchQuery])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      if (value.trim().length >= 2) {
        handleSearch(value)
      }
    }, 500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    if (inputValue.trim().length >= 2) {
      handleSearch(inputValue)
      onClose?.()
    }
  }

  const handleClear = () => {
    setInputValue('')
    setSearchQuery('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 text-muted-foreground w-4 h-4 pointer-events-none" />
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-12 rounded-full border-white/20 bg-white/10 pl-10 pr-10 text-sm text-white placeholder:text-white/50 focus-visible:border-[#f31260] focus-visible:ring-[#f31260]/30"
      />
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 text-muted-foreground hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  )
}
