"use client"
import type { GameState } from "@/lib/game-types"
import { GAME_CONFIG } from "@/lib/game-types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LobbyProps {
  gameState: GameState
  playerId: string
  onStartGame: () => void
}

export function Lobby({ gameState, playerId, onStartGame }: LobbyProps) {
  const currentPlayer = gameState.players.find((p) => p.id === playerId)
  const isRung = gameState.gameType === "rung"
  const config = GAME_CONFIG[gameState.gameType]

  const canStart =
    currentPlayer?.isAdmin &&
    gameState.players.length >= gameState.minPlayers &&
    gameState.players.length <= gameState.maxPlayers

  const teamAPlayers = gameState.players.filter((p) => p.team === "A")
  const teamBPlayers = gameState.players.filter((p) => p.team === "B")
  const allPlayers = gameState.players

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="bg-card border-4 border-foreground shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-2 border-b-4 border-foreground pb-4">
          {config.name.toUpperCase()}
        </h1>
        <p className="text-center text-muted-foreground mb-6">{config.description}</p>

        <div className="bg-muted border-4 border-foreground p-4 mb-6">
          <p className="text-center font-bold">
            Room: <span className="text-primary">{gameState.roomId}</span>
          </p>
          <p className="text-center text-sm text-muted-foreground">Share this code with friends to join!</p>
        </div>

        {isRung ? (
          // Team-based display for Rung
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Team A */}
            <div className="bg-secondary border-4 border-foreground p-4">
              <h3 className="font-bold text-lg mb-3 text-center text-secondary-foreground">Team A</h3>
              <div className="space-y-2">
                {[0, 1].map((i) => {
                  const player = teamAPlayers[i]
                  return (
                    <div
                      key={i}
                      className={cn(
                        "border-2 border-foreground p-3 text-center bg-white",
                        player ? "" : "border-dashed",
                      )}
                    >
                      {player ? (
                        <span className="font-bold">
                          {player.name} {player.isAdmin && "👑"}
                          {player.id === playerId && " (You)"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Waiting for player...</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Team B */}
            <div className="bg-accent border-4 border-foreground p-4">
              <h3 className="font-bold text-lg mb-3 text-center text-accent-foreground">Team B</h3>
              <div className="space-y-2">
                {[0, 1].map((i) => {
                  const player = teamBPlayers[i]
                  return (
                    <div
                      key={i}
                      className={cn(
                        "border-2 border-foreground p-3 text-center bg-white",
                        player ? "" : "border-dashed",
                      )}
                    >
                      {player ? (
                        <span className="font-bold">
                          {player.name} {player.isAdmin && "👑"}
                          {player.id === playerId && " (You)"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Waiting for player...</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          // Individual display for Thulla
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-3 text-center">Players</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: gameState.maxPlayers }).map((_, i) => {
                const player = allPlayers[i]
                return (
                  <div
                    key={i}
                    className={cn(
                      "border-4 border-foreground p-3 text-center",
                      player ? "bg-secondary" : "bg-muted border-dashed",
                    )}
                  >
                    {player ? (
                      <span className="font-bold">
                        {player.name} {player.isAdmin && "👑"}
                        {player.id === playerId && " (You)"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Empty slot</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <p className="text-center mb-4 font-bold">
          {gameState.players.length}/{isRung ? "4" : `${gameState.minPlayers}-${gameState.maxPlayers}`} Players Joined
        </p>

        {currentPlayer?.isAdmin ? (
          <Button onClick={onStartGame} disabled={!canStart} className="w-full text-lg py-6">
            {canStart ? "Start Game" : `Need ${gameState.minPlayers - gameState.players.length} more player(s)`}
          </Button>
        ) : (
          <p className="text-center text-muted-foreground">Waiting for admin to start the game...</p>
        )}

        <div className="mt-8 border-t-4 border-foreground pt-4">
          <h4 className="font-bold mb-2">Quick Rules:</h4>
          {isRung ? (
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 4 players, 2 teams (partners sit opposite)</li>
              <li>• Trump caller picks the trump suit after seeing 5 cards</li>
              <li>• Must follow suit if possible</li>
              <li>• Win 7+ tricks to win the round</li>
              <li>• Win 7 consecutive rounds for a court!</li>
            </ul>
          ) : (
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • {gameState.minPlayers}-{gameState.maxPlayers} players, everyone plays alone
              </li>
              <li>• Player with Ace of Spades starts</li>
              <li>• Must follow suit AND beat the highest card if possible</li>
              <li>• If you can't follow suit (thulla!), highest card player picks up all</li>
              <li>• First to empty hand wins - last player is the Thulla!</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
