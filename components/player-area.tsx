"use client"

import type { Player, Card } from "@/lib/game-types"
import { PlayingCard } from "./playing-card"
import { cn } from "@/lib/utils"

interface PlayerAreaProps {
  player: Player
  isCurrentPlayer: boolean
  isSelf: boolean
  playedCard?: Card
  position: "top" | "bottom" | "left" | "right"
}

export function PlayerArea({ player, isCurrentPlayer, isSelf, playedCard, position }: PlayerAreaProps) {
  const positionClasses = {
    top: "flex-col",
    bottom: "flex-col-reverse",
    left: "flex-row",
    right: "flex-row-reverse",
  }

  const teamColors = {
    A: "bg-secondary",
    B: "bg-accent",
  }

  return (
    <div className={cn("flex items-center gap-2", positionClasses[position])}>
      {/* Player info */}
      <div
        className={cn(
          "border-4 border-foreground px-3 py-1 shadow-md",
          teamColors[player.team],
          player.team === "A" ? "text-secondary-foreground" : "text-accent-foreground",
          isCurrentPlayer && "ring-4 ring-primary animate-pulse",
          !player.isConnected && "opacity-50",
        )}
      >
        <div className="font-bold text-sm">{player.name}</div>
        <div className="text-xs">
          Team {player.team} {player.isAdmin && "👑"}
          {!player.isConnected && " (Disconnected)"}
        </div>
      </div>

      {/* Played card or card count */}
      <div className="h-24 w-16 flex items-center justify-center">
        {playedCard ? (
          <PlayingCard card={playedCard} disabled />
        ) : !isSelf && player.hand.length > 0 ? (
          <div className="relative">
            <PlayingCard card={player.hand[0]} hidden small />
            <span className="absolute -bottom-2 -right-2 bg-foreground text-background rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-background">
              {player.hand.length}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
