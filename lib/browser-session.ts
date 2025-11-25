// Utility to manage browser session IDs per room
// This prevents the same browser from joining a room multiple times via different tabs

const STORAGE_KEY_PREFIX = "game-session-"

export function getBrowserSessionId(roomId: string): string {
  const key = `${STORAGE_KEY_PREFIX}${roomId}`

  // Check if we already have a session for this room
  let sessionId = typeof window !== "undefined" ? localStorage.getItem(key) : null

  if (!sessionId) {
    // Generate a new session ID
    sessionId = `browser-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    if (typeof window !== "undefined") {
      localStorage.setItem(key, sessionId)
    }
  }

  return sessionId
}

export function clearBrowserSession(roomId: string): void {
  const key = `${STORAGE_KEY_PREFIX}${roomId}`
  if (typeof window !== "undefined") {
    localStorage.removeItem(key)
  }
}

export function clearAllGameSessions(): void {
  if (typeof window !== "undefined") {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
  }
}
