"use client"

import { useRouter } from "next/navigation"
import { JoinForm } from "@/components/join-form"
import { generateRoomId } from "@/lib/game-logic"
import type { GameType } from "@/lib/game-types"

export default function Home() {
  const router = useRouter()

  const handleCreate = (name: string, password: string, gameType: GameType) => {
    const roomId = generateRoomId()
    const params = new URLSearchParams({ name, creator: "true", gameType })
    if (password) params.set("password", password)
    router.push(`/room/${roomId}?${params.toString()}`)
  }

  const handleJoin = (name: string, roomId: string, password: string) => {
    const params = new URLSearchParams({ name })
    if (password) params.set("password", password)
    router.push(`/room/${roomId}?${params.toString()}`)
  }

  return <JoinForm onJoin={handleJoin} onCreate={handleCreate} />
}
