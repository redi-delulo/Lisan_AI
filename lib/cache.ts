import type { DashboardData } from "./app-types"

const cachePrefix = "lisan-ai"

export function readCachedDashboard(userId: string): DashboardData | null {
  if (typeof window === "undefined") return null

  try {
    const value = window.localStorage.getItem(`${cachePrefix}:dashboard:${userId}`)
    return value ? JSON.parse(value) as DashboardData : null
  } catch {
    return null
  }
}

export function writeCachedDashboard(userId: string, data: DashboardData) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(`${cachePrefix}:dashboard:${userId}`, JSON.stringify(data))
}

export function clearUserCache(userId: string) {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(`${cachePrefix}:dashboard:${userId}`)
}
