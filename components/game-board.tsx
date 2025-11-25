"use client"

import type { GameState, Card, Suit } from "@/lib/game-types"
import { PlayingCard } from "./playing-card"
import { PlayerArea } from "./player-area"
import { TrumpSelector } from "./trump-selector"
import { getValidCards } from "@/lib/game-logic"
import { cn } from "@/lib/utils"
import { SUIT_SYMBOLS } from "@/lib/game-types"
import { Button } from "@/components/ui/button"

interface GameBoardProps {
  gameState: GameState
  playerId: string
  onPlayCard: (cardId: string) => void
  onSelectTrump: (suit: Suit) => void
  onNewRound: () => void
}

export function GameBoard({ gameState, playerId, onPlayCard, onSelectTrump, onNewRound }: GameBoardProps) {
  const currentPlayer = gameState.players.find((p) => p.id === playerId)
  const isMyTurn = gameState.currentPlayerId === playerId
  const isTrumpCaller = gameState.trumpCallerId === playerId

  // Get player positions relative to current player
  const myIndex = gameState.players.findIndex((p) => p.id === playerId)
  const getRelativePlayer = (offset: number) => {
    const index = (myIndex + offset) % 4
    return gameState.players[index]
  }

  const bottomPlayer = currentPlayer || gameState.players[0]
  const leftPlayer = getRelativePlayer(1)
  const topPlayer = getRelativePlayer(2)
  const rightPlayer = getRelativePlayer(3)

  // Get played cards in current trick
  const getPlayedCard = (player: { id: string }): Card | undefined => {
    return gameState.currentTrick.cards.find((c) => c.playerId === player.id)?.card
  }

  const validCards =
    currentPlayer && gameState.phase === "playing" ? getValidCards(currentPlayer, gameState.currentTrick) : []

  return (
    <div className="flex flex-col h-full">
      {/* Scoreboard */}
      <div className="flex justify-between items-center p-4 border-b-4 border-foreground bg-muted">
        <div className="flex gap-4">
          <div className="bg-secondary border-4 border-foreground px-4 py-2 shadow-md">
            <span className="font-bold text-secondary-foreground">Team A:</span>
            <span className="ml-2 text-secondary-foreground">{gameState.teamAScore}/7 tricks</span>
            <span className="ml-2 text-secondary-foreground">({gameState.teamACourts} courts)</span>
          </div>
          <div className="bg-accent border-4 border-foreground px-4 py-2 shadow-md">
            <span className="font-bold text-accent-foreground">Team B:</span>
            <span className="ml-2 text-accent-foreground">{gameState.teamBScore}/7 tricks</span>
            <span className="ml-2 text-accent-foreground">({gameState.teamBCourts} courts)</span>
          </div>
        </div>
        {gameState.trumpSuit && (
          <div className="bg-primary border-4 border-foreground px-4 py-2 shadow-md">
            <span className="font-bold text-primary-foreground">Trump: </span>
            <span
              className={cn(
                "text-2xl",
                gameState.trumpSuit === "hearts" || gameState.trumpSuit === "diamonds"
                  ? "text-white"
                  : "text-primary-foreground",
              )}
            >
              {SUIT_SYMBOLS[gameState.trumpSuit]}
            </span>
          </div>
        )}
      </div>

      {/* Message bar */}
      <div className="bg-foreground text-background px-4 py-2 text-center font-bold">{gameState.message}</div>

      {/* Game area */}
      <div className="flex-1 flex items-center justify-center p-4 relative min-h-[400px]">
        {/* Trump Selection */}
        {gameState.phase === "trump-selection" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="bg-card border-4 border-foreground p-6 shadow-lg">
              {isTrumpCaller ? (
                <TrumpSelector onSelect={onSelectTrump} disabled={!isTrumpCaller} />
              ) : (
                <div className="text-center">
                  <p className="text-lg font-bold">Waiting for trump selection...</p>
                  <p className="text-muted-foreground">
                    {gameState.players.find((p) => p.id === gameState.trumpCallerId)?.name} is choosing
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Round End */}
        {gameState.phase === "round-end" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="bg-card border-4 border-foreground p-6 shadow-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Round Over!</h2>
              <p className="text-lg mb-2">
                Team A: {gameState.teamAScore} tricks ({gameState.teamACourts} courts)
              </p>
              <p className="text-lg mb-4">
                Team B: {gameState.teamBScore} tricks ({gameState.teamBCourts} courts)
              </p>
              {currentPlayer?.isAdmin && (
                <Button onClick={onNewRound} className="mt-4">
                  Start New Round
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Top player */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          {topPlayer && (
            <PlayerArea
              player={topPlayer}
              isCurrentPlayer={gameState.currentPlayerId === topPlayer.id}
              isSelf={false}
              playedCard={getPlayedCard(topPlayer)}
              position="top"
            />
          )}
        </div>

        {/* Left player */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {leftPlayer && (
            <PlayerArea
              player={leftPlayer}
              isCurrentPlayer={gameState.currentPlayerId === leftPlayer.id}
              isSelf={false}
              playedCard={getPlayedCard(leftPlayer)}
              position="left"
            />
          )}
        </div>

        {/* Right player */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {rightPlayer && (
            <PlayerArea
              player={rightPlayer}
              isCurrentPlayer={gameState.currentPlayerId === rightPlayer.id}
              isSelf={false}
              playedCard={getPlayedCard(rightPlayer)}
              position="right"
            />
          )}
        </div>

        {/* Center - played cards */}
        <div className="grid grid-cols-2 gap-2 w-40 h-32">
          {gameState.currentTrick.cards.map(({ playerId: pid, card }, i) => (
            <div key={i} className="flex items-center justify-center">
              <PlayingCard card={card} disabled small />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom player hand */}
      <div className="border-t-4 border-foreground bg-muted p-4">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {bottomPlayer && (
            <>
              <div className="mr-4">
                <PlayerArea
                  player={bottomPlayer}
                  isCurrentPlayer={gameState.currentPlayerId === bottomPlayer.id}
                  isSelf={true}
                  playedCard={getPlayedCard(bottomPlayer)}
                  position="bottom"
                />
              </div>
              {currentPlayer?.hand.map((card) => {
                const isValid = validCards.some((c) => c.id === card.id)
                return (
                  <PlayingCard
                    key={card.id}
                    card={card}
                    onClick={() => onPlayCard(card.id)}
                    disabled={!isMyTurn || gameState.phase !== "playing" || !isValid}
                  />
                )
              })}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
