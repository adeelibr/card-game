"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type GameType, GAME_CONFIG } from "@/lib/game-types"
import { cn } from "@/lib/utils"

interface JoinFormProps {
  roomId?: string
  onJoin: (name: string, roomId: string, password: string) => void
  onCreate: (name: string, password: string, gameType: GameType) => void
  error?: string
}

export function JoinForm({ roomId: initialRoomId, onJoin, onCreate, error }: JoinFormProps) {
  const [mode, setMode] = useState<"join" | "create">(initialRoomId ? "join" : "create")
  const [name, setName] = useState("")
  const [roomId, setRoomId] = useState(initialRoomId || "")
  const [password, setPassword] = useState("")
  const [gameType, setGameType] = useState<GameType>("rung")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (mode === "create") {
      onCreate(name.trim(), password, gameType)
    } else {
      if (!roomId.trim()) return
      onJoin(name.trim(), roomId.trim().toUpperCase(), password)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border-4 border-foreground shadow-lg p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-2">CARD GAMES</h1>
        <p className="text-center text-muted-foreground mb-6">Rung & Thulla - Classic South Asian Games</p>

        {/* Mode selector */}
        <div className="flex mb-6 border-4 border-foreground">
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`flex-1 py-3 font-bold transition-colors ${
              mode === "create"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Create Room
          </button>
          <button
            type="button"
            onClick={() => setMode("join")}
            className={`flex-1 py-3 font-bold transition-colors border-l-4 border-foreground ${
              mode === "join"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Join Room
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "create" && (
            <div>
              <Label className="font-bold mb-2 block">Select Game</Label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(GAME_CONFIG) as GameType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setGameType(type)}
                    className={cn(
                      "border-4 border-foreground p-4 text-left transition-all",
                      gameType === type
                        ? "bg-primary text-primary-foreground shadow-[4px_4px_0_0_#000]"
                        : "bg-muted hover:bg-muted/80",
                    )}
                  >
                    <span className="font-bold block">{GAME_CONFIG[type].name}</span>
                    <span
                      className={cn(
                        "text-xs",
                        gameType === type ? "text-primary-foreground/80" : "text-muted-foreground",
                      )}
                    >
                      {GAME_CONFIG[type].description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="name" className="font-bold">
              Your Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              required
              className="border-4 border-foreground mt-1"
            />
          </div>

          {mode === "join" && (
            <div>
              <Label htmlFor="roomId" className="font-bold">
                Room Code
              </Label>
              <Input
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter 6-letter code"
                maxLength={6}
                required
                className="border-4 border-foreground mt-1 uppercase"
              />
            </div>
          )}

          <div>
            <Label htmlFor="password" className="font-bold">
              Password {mode === "create" && "(Optional)"}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "create" ? "Set a password (optional)" : "Enter room password"}
              className="border-4 border-foreground mt-1"
            />
          </div>

          {error && (
            <div className="bg-destructive text-destructive-foreground border-4 border-foreground p-3 text-center font-bold">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full text-lg py-6">
            {mode === "create" ? `Create ${GAME_CONFIG[gameType].name} Room` : "Join Room"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t-4 border-foreground space-y-4">
          <div>
            <h3 className="font-bold mb-1">Rung (Court Piece)</h3>
            <p className="text-sm text-muted-foreground">
              4 players, 2 teams. Call trump after seeing 5 cards. Win 7+ tricks to win the round!
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-1">Thulla (Bhabhi)</h3>
            <p className="text-sm text-muted-foreground">
              3-6 players, individual play. Shed all your cards first! Last player with cards is the "Thulla" and loses.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
