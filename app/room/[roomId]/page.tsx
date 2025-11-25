"use client"

import { useState } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { JoinForm } from "@/components/join-form"
import { Lobby } from "@/components/lobby"
import { GameBoard } from "@/components/game-board"
import { ThullaGameBoard } from "@/components/thulla-game-board"
import { useGameChannel } from "@/hooks/use-game-channel"
import type { GameType } from "@/lib/game-types"

export default function RoomPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const searchParams = useSearchParams()

  const nameFromUrl = searchParams.get("name")
  const passwordFromUrl = searchParams.get("password") || ""
  const isCreator = searchParams.get("creator") === "true"
  const gameTypeFromUrl = (searchParams.get("gameType") as GameType) || "rung"

  const [joinData, setJoinData] = useState<{ name: string; password: string } | null>(
    nameFromUrl ? { name: nameFromUrl, password: passwordFromUrl } : null,
  )

  const { gameState, playerId, error, isConnected, startGame, playCard, selectTrump, newRound } = useGameChannel({
    roomId,
    playerName: joinData?.name || "",
    password: joinData?.password || "",
    isCreator,
    gameType: gameTypeFromUrl, // Pass game type to hook
  })

  const handleJoin = (name: string, _roomId: string, password: string) => {
    setJoinData({ name, password })
  }

  // Loading state
  if (!isConnected || !gameState || !playerId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-foreground border-t-primary mx-auto mb-4" />
          <p className="font-bold">Connecting to room {roomId}...</p>
          {error && <p className="text-destructive mt-2 font-bold">{error}</p>}
        </div>
      </div>
    )
  }

  // Show join form if no name provided
  if (!joinData) {
    return <JoinForm roomId={roomId} onJoin={handleJoin} onCreate={() => {}} />
  }

  // Show lobby if waiting for players
  if (gameState.phase === "waiting") {
    return <Lobby gameState={gameState} playerId={playerId} onStartGame={startGame} />
  }

  return (
    <div className="min-h-screen bg-background">
      {gameState.gameType === "thulla" ? (
        <ThullaGameBoard gameState={gameState} playerId={playerId} onPlayCard={playCard} onNewRound={newRound} />
      ) : (
        <GameBoard
          gameState={gameState}
          playerId={playerId}
          onPlayCard={playCard}
          onSelectTrump={selectTrump}
          onNewRound={newRound}
        />
      )}
    </div>
  )
}
