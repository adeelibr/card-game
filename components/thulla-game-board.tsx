"use client"

import type { GameState, Card } from "@/lib/game-types"
import { PlayingCard } from "./playing-card"
import { getValidCardsThulla } from "@/lib/thulla-logic"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ThullaGameBoardProps {
  gameState: GameState
  playerId: string
  onPlayCard: (cardId: string) => void
  onNewRound: () => void
}

export function ThullaGameBoard({ gameState, playerId, onPlayCard, onNewRound }: ThullaGameBoardProps) {
  const currentPlayer = gameState.players.find((p) => p.id === playerId)
  const isMyTurn = gameState.currentPlayerId === playerId

  // Get other players (excluding self)
  const otherPlayers = gameState.players.filter((p) => p.id !== playerId)

  // Get played cards in current trick
  const getPlayedCard = (player: { id: string }): Card | undefined => {
    return gameState.currentTrick.cards.find((c) => c.playerId === player.id)?.card
  }

  const validCards =
    currentPlayer && gameState.phase === "playing" ? getValidCardsThulla(currentPlayer, gameState.currentTrick) : []

  // Count cards for each player
  const getCardCount = (player: { hand: Card[]; isOut?: boolean }) => {
    if (player.isOut) return "OUT"
    return player.hand.length
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b-4 border-foreground bg-muted">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg">THULLA</span>
          <span className="text-muted-foreground">Round {gameState.roundNumber}</span>
        </div>
        <div className="flex gap-2">
          {gameState.players.map((p) => (
            <div
              key={p.id}
              className={cn(
                "px-3 py-1 border-2 border-foreground text-sm font-bold",
                p.isOut ? "bg-muted text-muted-foreground line-through" : "bg-card",
                p.isThulla ? "bg-destructive text-destructive-foreground" : "",
                p.id === playerId ? "ring-2 ring-primary" : "",
              )}
            >
              {p.name}: {getCardCount(p)}
            </div>
          ))}
        </div>
      </div>

      {/* Message bar */}
      <div className="bg-foreground text-background px-4 py-2 text-center font-bold">{gameState.message}</div>

      {/* Game area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-[400px]">
        {/* Game Over */}
        {gameState.phase === "round-end" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="bg-card border-4 border-foreground p-6 shadow-lg text-center">
              <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
              {gameState.thullaPlayerId && (
                <p className="text-xl mb-4">
                  <span className="text-destructive font-bold">
                    {gameState.players.find((p) => p.id === gameState.thullaPlayerId)?.name}
                  </span>{" "}
                  is the Thulla!
                </p>
              )}
              <div className="mb-4 border-4 border-foreground p-4 bg-muted">
                <h3 className="font-bold mb-2">Scoreboard</h3>
                {Object.entries(gameState.playerLosses)
                  .sort(([, a], [, b]) => a - b)
                  .map(([pId, losses]) => {
                    const player = gameState.players.find((p) => p.id === pId)
                    return (
                      <div key={pId} className="flex justify-between">
                        <span>{player?.name}</span>
                        <span className="font-bold">{losses} losses</span>
                      </div>
                    )
                  })}
              </div>
              {currentPlayer?.isAdmin && (
                <Button onClick={onNewRound} className="mt-4">
                  Play Again
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Other players' areas */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {otherPlayers.map((player) => (
            <div
              key={player.id}
              className={cn(
                "border-4 border-foreground p-4 min-w-[150px]",
                player.isOut ? "bg-muted opacity-50" : "bg-card",
                gameState.currentPlayerId === player.id ? "ring-4 ring-primary" : "",
              )}
            >
              <div className="text-center font-bold mb-2">
                {player.name} {player.isAdmin && "👑"}
              </div>
              <div className="text-center text-sm text-muted-foreground mb-2">
                {player.isOut ? "OUT!" : `${player.hand.length} cards`}
              </div>
              {/* Show card backs */}
              <div className="flex justify-center">
                {!player.isOut &&
                  Array.from({ length: Math.min(player.hand.length, 5) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-12 bg-primary border-2 border-foreground -ml-4 first:ml-0 rounded-sm"
                    />
                  ))}
              </div>
              {/* Played card */}
              {getPlayedCard(player) && (
                <div className="mt-2 flex justify-center">
                  <PlayingCard card={getPlayedCard(player)!} disabled small />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Center - current trick */}
        <div className="bg-muted/50 border-4 border-dashed border-foreground p-4 rounded-lg min-h-[120px] min-w-[200px]">
          <div className="flex justify-center gap-2 flex-wrap">
            {gameState.currentTrick.cards.map(({ playerId: pid, card }, i) => {
              const player = gameState.players.find((p) => p.id === pid)
              return (
                <div key={i} className="flex flex-col items-center">
                  <PlayingCard card={card} disabled small />
                  <span className="text-xs mt-1 font-bold">{player?.name}</span>
                </div>
              )
            })}
            {gameState.currentTrick.cards.length === 0 && (
              <span className="text-muted-foreground">Waiting for lead card...</span>
            )}
          </div>
        </div>

        {/* Waste pile indicator */}
        {gameState.wastePile.length > 0 && (
          <div className="absolute bottom-24 right-4 bg-muted border-2 border-foreground p-2 text-sm">
            Discarded: {gameState.wastePile.length} cards
          </div>
        )}
      </div>

      {/* Bottom player hand */}
      <div className="border-t-4 border-foreground bg-muted p-4">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {currentPlayer && !currentPlayer.isOut && (
            <>
              <div className="mr-4 border-4 border-foreground bg-card px-4 py-2">
                <span className="font-bold">{currentPlayer.name}</span>
                {currentPlayer.isAdmin && " 👑"}
                <span className="ml-2 text-muted-foreground">({currentPlayer.hand.length} cards)</span>
                {isMyTurn && <span className="ml-2 text-primary font-bold">YOUR TURN</span>}
              </div>
              {currentPlayer.hand.map((card) => {
                const isValid = validCards.some((c) => c.id === card.id)
                return (
                  <PlayingCard
                    key={card.id}
                    card={card}
                    onClick={() => onPlayCard(card.id)}
                    disabled={!isMyTurn || gameState.phase !== "playing" || !isValid}
                    highlight={isValid && isMyTurn}
                  />
                )
              })}
            </>
          )}
          {currentPlayer?.isOut && (
            <div className="text-center text-lg font-bold text-primary">
              You're out! Waiting for the game to finish...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
