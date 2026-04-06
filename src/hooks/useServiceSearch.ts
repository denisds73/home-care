import { useState, useEffect, useRef, useCallback } from 'react'
import { serviceService } from '../services/serviceService'
import { CATEGORIES } from '../data/categories'
import type { Service, CategoryMeta } from '../types/domain'

export interface SearchResult {
  type: 'category' | 'service'
  id: string | number
  title: string
  subtitle: string
  category?: string
  price?: number
  rating?: string
  navigateTo: string
}

const DEBOUNCE_MS = 250
const MIN_QUERY_LENGTH = 2
const MAX_RESULTS = 5

export function useServiceSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cacheRef = useRef<Map<string, SearchResult[]>>(new Map())

  const search = useCallback(async (q: string) => {
    const trimmed = q.trim().toLowerCase()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([])
      setIsSearching(false)
      return
    }

    // Check cache first
    const cached = cacheRef.current.get(trimmed)
    if (cached) {
      setResults(cached)
      setIsSearching(false)
      setIsOpen(true)
      return
    }

    // Abort any in-flight request
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setIsSearching(true)

    try {
      // Search categories locally (instant)
      const catMatches: SearchResult[] = CATEGORIES
        .filter((c: CategoryMeta) => c.name.toLowerCase().includes(trimmed) || c.id.includes(trimmed))
        .slice(0, 3)
        .map((c: CategoryMeta) => ({
          type: 'category' as const,
          id: c.id,
          title: c.name,
          subtitle: c.desc,
          navigateTo: `/app/services/${c.id}`,
        }))

      // Search services via API (debounced)
      const response = await serviceService.searchServices(trimmed)
      const svcMatches: SearchResult[] = (response.data ?? [])
        .slice(0, MAX_RESULTS - catMatches.length)
        .map((s: Service) => {
          const seed = ((s.id * 2654435761) >>> 0) / 4294967296
          const rating = s.rating_average && s.rating_average > 0
            ? Number(s.rating_average).toFixed(1)
            : (4.5 + seed * 0.5).toFixed(1)
          return {
            type: 'service' as const,
            id: s.id,
            title: s.service_name,
            subtitle: CATEGORIES.find(c => c.id === s.category)?.name ?? s.category,
            category: s.category,
            price: Number(s.price),
            rating,
            navigateTo: `/app/services/${s.category}`,
          }
        })

      const combined = [...catMatches, ...svcMatches].slice(0, MAX_RESULTS)

      // Cache the result
      cacheRef.current.set(trimmed, combined)
      // Cap cache size
      if (cacheRef.current.size > 50) {
        const first = cacheRef.current.keys().next().value
        if (first !== undefined) cacheRef.current.delete(first)
      }

      setResults(combined)
      setIsOpen(true)
    } catch {
      // Aborted or network error — don't update state
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounced search on query change
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (query.trim().length < MIN_QUERY_LENGTH) {
      setResults([])
      setIsOpen(false)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    timerRef.current = setTimeout(() => search(query), DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, search])

  const clear = useCallback(() => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    setIsSearching(false)
    abortRef.current?.abort()
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  return { query, setQuery, results, isSearching, isOpen, clear, close }
}
