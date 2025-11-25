"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"
import type { GameState, Player, Suit, ClientMessage, GameType } from "@/lib/game-types"
import {
  createInitialGameState,
  createDeck,
  shuffleDeck,
  dealCards,
  determineTrickWinner,
  getValidCards,
  sortHand,
  checkForCourt,
} from "@/lib/game-logic"
import {
  dealCardsThulla,
  findStartingPlayer,
  getValidCardsThulla,
  hasThullaPlayed,
  findPickupPlayer,
  findNextLeader,
  getActivePlayers,
  isThullaGameOver,
  sortHandThulla,
} from "@/lib/thulla-logic"

interface UseGameChannelOptions {
  roomId: string
  playerName: string
  password: string
  isCreator: boolean
  gameType?: GameType // Add game type option
}

interface PresenceState {
  id: string
  name: string
  isAdmin: boolean
  joinedAt: string
}

export function useGameChannel({ roomId, playerName, password, isCreator, gameType = "rung" }: UseGameChannelOptions) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [error, setError] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()
  const playerIdRef = useRef<string>(`player-${Date.now()}-${Math.random().toString(36).slice(2)}`)

  // Initialize game state for creator
  const initGameState = useCallback(() => {
    return createInitialGameState(roomId, password, gameType)
  }, [roomId, password, gameType])

  // Process game actions (runs on admin client)
  const processAction = useCallback((state: GameState, action: ClientMessage, senderId: string): GameState => {
    const newState = { ...state }
    const isThulla = state.gameType === "thulla"

    switch (action.type) {
      case "join": {
        if (state.players.length >= state.maxPlayers) {
          return state
        }
        if (state.roomPassword && action.password !== state.roomPassword) {
          return state
        }
        const existingPlayer = state.players.find((p) => p.id === senderId)
        if (existingPlayer) return state

        const position = state.players.length
        const team = isThulla ? "none" : position % 2 === 0 ? "A" : "B"
        const newPlayer: Player = {
          id: senderId,
          name: action.playerName,
          hand: [],
          team,
          isAdmin: state.players.length === 0,
          isConnected: true,
          position,
          isOut: false,
          isThulla: false,
        }
        newState.players = [...state.players, newPlayer]
        newState.message = `${newPlayer.name} joined! (${newState.players.length}/${state.maxPlayers})`
        return newState
      }

      case "start-game": {
        if (state.players.length < state.minPlayers) return state

        if (isThulla) {
          const deck = createDeck()
          const dealtPlayers = dealCardsThulla(deck, state.players)
          const sortedPlayers = dealtPlayers.map((p) => ({ ...p, hand: sortHandThulla(p.hand) }))
          const startingPlayerId = findStartingPlayer(sortedPlayers)
          const startingPlayer = sortedPlayers.find((p) => p.id === startingPlayerId)

          return {
            ...newState,
            deck: [],
            players: sortedPlayers,
            phase: "playing",
            dealerId: state.players[0].id,
            currentPlayerId: startingPlayerId,
            wastePile: [],
            playerLosses: state.players.reduce((acc, p) => ({ ...acc, [p.id]: state.playerLosses[p.id] || 0 }), {}),
            message: `${startingPlayer?.name} starts with Ace of Spades!`,
          }
        } else {
          // Rung game start logic (existing)
          const deck = shuffleDeck(createDeck())
          const dealerId = state.players[0].id
          const trumpCallerIndex = 3
          const trumpCallerId = state.players[trumpCallerIndex].id

          const clearedPlayers = state.players.map((p) => ({ ...p, hand: [] }))
          const { deck: remainingDeck, players: dealtPlayers } = dealCards(deck, clearedPlayers, 5)
          const sortedPlayers = dealtPlayers.map((p) => ({ ...p, hand: sortHand(p.hand) }))

          return {
            ...newState,
            deck: remainingDeck,
            players: sortedPlayers,
            phase: "trump-selection",
            dealerId,
            trumpCallerId,
            currentPlayerId: trumpCallerId,
            message: `${sortedPlayers[trumpCallerIndex].name} is selecting trump...`,
          }
        }
      }

      case "select-trump": {
        if (state.phase !== "trump-selection") return state
        if (senderId !== state.trumpCallerId) return state

        const { deck: emptyDeck, players: fullyDealtPlayers } = dealCards(state.deck, state.players, 8)
        const sortedPlayers = fullyDealtPlayers.map((p) => ({ ...p, hand: sortHand(p.hand) }))

        return {
          ...newState,
          deck: emptyDeck,
          players: sortedPlayers,
          phase: "playing",
          trumpSuit: action.suit,
          currentPlayerId: state.trumpCallerId,
          message: `Trump is ${action.suit}! ${sortedPlayers.find((p) => p.id === state.trumpCallerId)?.name} leads.`,
        }
      }

      case "play-card": {
        if (state.phase !== "playing") return state
        if (senderId !== state.currentPlayerId) return state

        const player = state.players.find((p) => p.id === senderId)
        if (!player) return state

        const card = player.hand.find((c) => c.id === action.cardId)
        if (!card) return state

        // Validate card based on game type
        const validCards = isThulla
          ? getValidCardsThulla(player, state.currentTrick)
          : getValidCards(player, state.currentTrick)

        if (!validCards.some((c) => c.id === action.cardId)) return state

        // Remove card from hand
        const updatedPlayers = state.players.map((p) =>
          p.id === senderId ? { ...p, hand: p.hand.filter((c) => c.id !== action.cardId) } : p,
        )

        const newTrick = {
          ...state.currentTrick,
          cards: [...state.currentTrick.cards, { playerId: senderId, card }],
          leadSuit: state.currentTrick.leadSuit || card.suit,
        }

        if (isThulla) {
          const activePlayers = getActivePlayers(updatedPlayers)
          const trickComplete =
            newTrick.cards.length ===
            activePlayers.length + (updatedPlayers.find((p) => p.id === senderId)?.hand.length === 0 ? 0 : 0)

          // Check if all active players have played
          const activePlayerIds = activePlayers.map((p) => p.id)
          const playersWhoPlayed = newTrick.cards.map((c) => c.playerId)
          const allActivePlayed = activePlayerIds.every((id) => playersWhoPlayed.includes(id))

          if (allActivePlayed) {
            // Trick is complete
            const thullaPlayed = hasThullaPlayed(newTrick)

            if (thullaPlayed) {
              // Someone broke suit - highest lead suit card player picks up
              const pickupPlayerId = findPickupPlayer(newTrick)
              const pickupPlayer = updatedPlayers.find((p) => p.id === pickupPlayerId)

              if (pickupPlayer) {
                // Add all trick cards to pickup player's hand
                const trickCards = newTrick.cards.map((c) => c.card)
                const finalPlayers = updatedPlayers.map((p) =>
                  p.id === pickupPlayerId ? { ...p, hand: sortHandThulla([...p.hand, ...trickCards]) } : p,
                )

                // Check if someone went out (player who played the thulla might be out)
                const playerWhoPlayedThulla = newTrick.cards.find((c) => c.card.suit !== newTrick.leadSuit)?.playerId
                const thullaPlayerObj = finalPlayers.find((p) => p.id === playerWhoPlayedThulla)

                // Mark players as out if they have no cards
                const playersWithOutStatus = finalPlayers.map((p) => ({
                  ...p,
                  isOut: p.hand.length === 0,
                }))

                // Check if game is over
                const gameOverCheck = isThullaGameOver(playersWithOutStatus)

                if (gameOverCheck.isOver) {
                  const loser = playersWithOutStatus.find((p) => p.id === gameOverCheck.loserId)
                  const finalPlayersWithThulla = playersWithOutStatus.map((p) => ({
                    ...p,
                    isThulla: p.id === gameOverCheck.loserId,
                  }))

                  return {
                    ...newState,
                    players: finalPlayersWithThulla,
                    currentTrick: { cards: [], leadSuit: null, winnerId: null },
                    phase: "round-end",
                    thullaPlayerId: gameOverCheck.loserId,
                    playerLosses: {
                      ...state.playerLosses,
                      [gameOverCheck.loserId!]: (state.playerLosses[gameOverCheck.loserId!] || 0) + 1,
                    },
                    message: `${loser?.name} is the Thulla! They lose this round.`,
                  }
                }

                // Find next leader (pickup player leads)
                const nextActivePlayers = getActivePlayers(playersWithOutStatus)
                let nextPlayerId = pickupPlayerId

                // If pickup player is out, find next active player
                if (playersWithOutStatus.find((p) => p.id === pickupPlayerId)?.isOut) {
                  const pickupIndex = state.players.findIndex((p) => p.id === pickupPlayerId)
                  for (let i = 1; i <= state.players.length; i++) {
                    const nextIndex = (pickupIndex + i) % state.players.length
                    const nextPlayer = playersWithOutStatus[nextIndex]
                    if (!nextPlayer.isOut && nextPlayer.hand.length > 0) {
                      nextPlayerId = nextPlayer.id
                      break
                    }
                  }
                }

                return {
                  ...newState,
                  players: playersWithOutStatus,
                  currentTrick: { cards: [], leadSuit: null, winnerId: null },
                  currentPlayerId: nextPlayerId,
                  message: `${pickupPlayer.name} picks up ${trickCards.length} cards! ${playersWithOutStatus.find((p) => p.id === nextPlayerId)?.name}'s turn.`,
                }
              }
            } else {
              // No thulla - trick goes to waste pile, highest card leads next
              const nextLeaderId = findNextLeader(newTrick)
              const nextLeader = updatedPlayers.find((p) => p.id === nextLeaderId)

              // Mark players as out
              const playersWithOutStatus = updatedPlayers.map((p) => ({
                ...p,
                isOut: p.hand.length === 0,
              }))

              // Check if game is over
              const gameOverCheck = isThullaGameOver(playersWithOutStatus)

              if (gameOverCheck.isOver) {
                const loser = playersWithOutStatus.find((p) => p.id === gameOverCheck.loserId)
                const finalPlayersWithThulla = playersWithOutStatus.map((p) => ({
                  ...p,
                  isThulla: p.id === gameOverCheck.loserId,
                }))

                return {
                  ...newState,
                  players: finalPlayersWithThulla,
                  currentTrick: { cards: [], leadSuit: null, winnerId: null },
                  wastePile: [...state.wastePile, ...newTrick.cards.map((c) => c.card)],
                  phase: "round-end",
                  thullaPlayerId: gameOverCheck.loserId,
                  playerLosses: {
                    ...state.playerLosses,
                    [gameOverCheck.loserId!]: (state.playerLosses[gameOverCheck.loserId!] || 0) + 1,
                  },
                  message: `${loser?.name} is the Thulla! They lose this round.`,
                }
              }

              // Find next leader - if they're out, find next active player
              let nextPlayerId = nextLeaderId
              if (playersWithOutStatus.find((p) => p.id === nextLeaderId)?.isOut) {
                const leaderIndex = state.players.findIndex((p) => p.id === nextLeaderId)
                for (let i = 1; i <= state.players.length; i++) {
                  const nextIndex = (leaderIndex + i) % state.players.length
                  const nextPlayer = playersWithOutStatus[nextIndex]
                  if (!nextPlayer.isOut && nextPlayer.hand.length > 0) {
                    nextPlayerId = nextPlayer.id
                    break
                  }
                }
              }

              return {
                ...newState,
                players: playersWithOutStatus,
                currentTrick: { cards: [], leadSuit: null, winnerId: null },
                wastePile: [...state.wastePile, ...newTrick.cards.map((c) => c.card)],
                currentPlayerId: nextPlayerId,
                message: `Trick discarded. ${playersWithOutStatus.find((p) => p.id === nextPlayerId)?.name} leads!`,
              }
            }
          }

          // Not all players have played yet - find next active player
          const currentIndex = state.players.findIndex((p) => p.id === senderId)
          let nextPlayerId: string | null = null

          for (let i = 1; i <= state.players.length; i++) {
            const nextIndex = (currentIndex + i) % state.players.length
            const nextPlayer = updatedPlayers[nextIndex]
            if (!nextPlayer.isOut && nextPlayer.hand.length > 0 && !playersWhoPlayed.includes(nextPlayer.id)) {
              nextPlayerId = nextPlayer.id
              break
            }
          }

          // Mark current player as out if they have no cards
          const playersWithOutStatus = updatedPlayers.map((p) => ({
            ...p,
            isOut: p.hand.length === 0,
          }))

          return {
            ...newState,
            players: playersWithOutStatus,
            currentTrick: newTrick,
            currentPlayerId: nextPlayerId,
            message: `${playersWithOutStatus.find((p) => p.id === nextPlayerId)?.name}'s turn`,
          }
        } else {
          if (newTrick.cards.length === 4) {
            const winnerId = determineTrickWinner(newTrick, state.trumpSuit)
            const winner = updatedPlayers.find((p) => p.id === winnerId)

            const completedTrick = { ...newTrick, winnerId }
            const newCompletedTricks = [...state.completedTricks, completedTrick]

            let teamAScore = state.teamAScore
            let teamBScore = state.teamBScore

            if (winner?.team === "A") teamAScore++
            else teamBScore++

            const courtCheck = checkForCourt({ ...state, completedTricks: newCompletedTricks })

            if (newCompletedTricks.length === 13 || courtCheck.courtScored) {
              let teamACourts = state.teamACourts
              let teamBCourts = state.teamBCourts
              let consecutiveWinsA = state.consecutiveWinsA
              let consecutiveWinsB = state.consecutiveWinsB

              if (courtCheck.courtScored && courtCheck.team) {
                if (courtCheck.team === "A") {
                  teamACourts += 1
                  consecutiveWinsA = 0
                } else {
                  teamBCourts += 1
                  consecutiveWinsB = 0
                }
              } else {
                const roundWinner = teamAScore >= 7 ? "A" : "B"
                if (roundWinner === "A") {
                  consecutiveWinsA++
                  consecutiveWinsB = 0
                  if (consecutiveWinsA >= 7) {
                    teamACourts++
                    consecutiveWinsA = 0
                  }
                } else {
                  consecutiveWinsB++
                  consecutiveWinsA = 0
                  if (consecutiveWinsB >= 7) {
                    teamBCourts++
                    consecutiveWinsB = 0
                  }
                }
              }

              if (teamAScore === 13) teamACourts += 52
              if (teamBScore === 13) teamBCourts += 52

              return {
                ...newState,
                players: updatedPlayers,
                currentTrick: { cards: [], leadSuit: null, winnerId: null },
                completedTricks: newCompletedTricks,
                teamAScore,
                teamBScore,
                teamACourts,
                teamBCourts,
                consecutiveWinsA,
                consecutiveWinsB,
                phase: "round-end",
                currentPlayerId: null,
                message: `Round over! Team ${teamAScore >= 7 ? "A" : "B"} wins with ${Math.max(teamAScore, teamBScore)} tricks!`,
              }
            }

            return {
              ...newState,
              players: updatedPlayers,
              currentTrick: { cards: [], leadSuit: null, winnerId: null },
              completedTricks: newCompletedTricks,
              teamAScore,
              teamBScore,
              currentPlayerId: winnerId,
              message: `${winner?.name} wins the trick! (Team A: ${teamAScore}, Team B: ${teamBScore})`,
            }
          }

          const currentIndex = updatedPlayers.findIndex((p) => p.id === senderId)
          const nextIndex = (currentIndex + 1) % 4
          const nextPlayer = updatedPlayers[nextIndex]

          return {
            ...newState,
            players: updatedPlayers,
            currentTrick: newTrick,
            currentPlayerId: nextPlayer.id,
            message: `${nextPlayer.name}'s turn`,
          }
        }
      }

      case "new-round": {
        if (state.phase !== "round-end") return state

        if (isThulla) {
          const deck = createDeck()
          const resetPlayers = state.players.map((p) => ({ ...p, hand: [], isOut: false, isThulla: false }))
          const dealtPlayers = dealCardsThulla(deck, resetPlayers)
          const sortedPlayers = dealtPlayers.map((p) => ({ ...p, hand: sortHandThulla(p.hand) }))
          const startingPlayerId = findStartingPlayer(sortedPlayers)
          const startingPlayer = sortedPlayers.find((p) => p.id === startingPlayerId)

          return {
            ...newState,
            deck: [],
            players: sortedPlayers,
            phase: "playing",
            currentTrick: { cards: [], leadSuit: null, winnerId: null },
            completedTricks: [],
            currentPlayerId: startingPlayerId,
            wastePile: [],
            thullaPlayerId: null,
            roundNumber: state.roundNumber + 1,
            message: `Round ${state.roundNumber + 1}! ${startingPlayer?.name} starts.`,
          }
        } else {
          // Rung new round (existing)
          const deck = shuffleDeck(createDeck())
          const currentDealerIndex = state.players.findIndex((p) => p.id === state.dealerId)
          const newDealerIndex = (currentDealerIndex + 1) % 4
          const newDealerId = state.players[newDealerIndex].id
          const trumpCallerIndex = (newDealerIndex + 3) % 4
          const trumpCallerId = state.players[trumpCallerIndex].id

          const clearedPlayers = state.players.map((p) => ({ ...p, hand: [] }))
          const { deck: remainingDeck, players: dealtPlayers } = dealCards(deck, clearedPlayers, 5)
          const sortedPlayers = dealtPlayers.map((p) => ({ ...p, hand: sortHand(p.hand) }))

          return {
            ...newState,
            deck: remainingDeck,
            players: sortedPlayers,
            phase: "trump-selection",
            trumpSuit: null,
            trumpCallerId,
            currentTrick: { cards: [], leadSuit: null, winnerId: null },
            completedTricks: [],
            currentPlayerId: trumpCallerId,
            dealerId: newDealerId,
            teamAScore: 0,
            teamBScore: 0,
            roundNumber: state.roundNumber + 1,
            message: `Round ${state.roundNumber + 1}! ${sortedPlayers[trumpCallerIndex].name} is selecting trump...`,
          }
        }
      }

      case "leave": {
        const leavingPlayer = state.players.find((p) => p.id === senderId)
        if (!leavingPlayer) return state

        const updatedPlayers = state.players.map((p) => (p.id === senderId ? { ...p, isConnected: false } : p))

        return {
          ...newState,
          players: updatedPlayers,
          message: `${leavingPlayer.name} disconnected`,
        }
      }

      default:
        return state
    }
  }, [])

  // Send action to channel
  const sendAction = useCallback(
    (action: ClientMessage) => {
      if (!channelRef.current || !playerId) return

      channelRef.current.send({
        type: "broadcast",
        event: "game-action",
        payload: { action, senderId: playerId },
      })
    },
    [playerId],
  )

  // Game action handlers
  const startGame = useCallback(() => {
    sendAction({ type: "start-game" })
  }, [sendAction])

  const playCard = useCallback(
    (cardId: string) => {
      sendAction({ type: "play-card", cardId })
    },
    [sendAction],
  )

  const selectTrump = useCallback(
    (suit: Suit) => {
      sendAction({ type: "select-trump", suit })
    },
    [sendAction],
  )

  const newRound = useCallback(() => {
    sendAction({ type: "new-round" })
  }, [sendAction])

  // Setup channel
  useEffect(() => {
    const id = playerIdRef.current
    setPlayerId(id)

    const channel = supabase.channel(`game-room-${roomId}`, {
      config: {
        broadcast: { self: true, ack: true },
        presence: { key: id },
      },
    })

    channelRef.current = channel

    // Handle broadcast messages
    channel.on("broadcast", { event: "game-action" }, ({ payload }) => {
      const { action, senderId } = payload as { action: ClientMessage; senderId: string }

      setGameState((currentState) => {
        if (!currentState) return currentState

        const isAdmin = currentState.players[0]?.id === id
        if (isAdmin) {
          const newState = processAction(currentState, action, senderId)

          channel.send({
            type: "broadcast",
            event: "state-update",
            payload: { state: newState },
          })

          return newState
        }
        return currentState
      })
    })

    // Handle state updates (for non-admin players)
    channel.on("broadcast", { event: "state-update" }, ({ payload }) => {
      const { state } = payload as { state: GameState }
      setGameState(state)
    })

    // Handle presence
    channel.on("presence", { event: "sync" }, () => {
      const presenceState = channel.presenceState<PresenceState>()
    })

    channel.on("presence", { event: "leave" }, ({ key }) => {
      setGameState((currentState) => {
        if (!currentState) return currentState
        const isAdmin = currentState.players[0]?.id === id
        if (isAdmin && key) {
          return processAction(currentState, { type: "leave" }, key)
        }
        return currentState
      })
    })

    // Subscribe to channel
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true)

        await channel.track({
          id,
          name: playerName,
          isAdmin: isCreator,
          joinedAt: new Date().toISOString(),
        })

        if (isCreator) {
          const initialState = initGameState()
          setGameState(initialState)

          const stateWithCreator = processAction(initialState, { type: "join", playerName, password }, id)
          setGameState(stateWithCreator)

          await channel.send({
            type: "broadcast",
            event: "state-update",
            payload: { state: stateWithCreator },
          })
        } else {
          await channel.send({
            type: "broadcast",
            event: "game-action",
            payload: {
              action: { type: "join", playerName, password },
              senderId: id,
            },
          })
        }
      } else if (status === "CHANNEL_ERROR") {
        setError("Failed to connect to room")
      }
    })

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [roomId, playerName, password, isCreator, supabase, initGameState, processAction])

  return {
    gameState,
    playerId,
    error,
    isConnected,
    startGame,
    playCard,
    selectTrump,
    newRound,
  }
}
