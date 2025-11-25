// Card and Game Types for Rung/Court Piece and Thulla/Bhabhi

export type Suit = "hearts" | "diamonds" | "clubs" | "spades"
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A"

export type GameType = "rung" | "thulla"

export interface Card {
  suit: Suit
  rank: Rank
  id: string
}

export interface Player {
  id: string
  name: string
  hand: Card[]
  team: "A" | "B" | "none" // 'none' for Thulla (individual play)
  isAdmin: boolean
  isConnected: boolean
  position: number // Changed from fixed 0-3 to allow 3-6 players in Thulla
  isOut?: boolean // For Thulla - player has shed all cards
  isThulla?: boolean // For Thulla - the loser
}

export interface Trick {
  cards: { playerId: string; card: Card }[]
  leadSuit: Suit | null
  winnerId: string | null
}

export type GamePhase =
  | "waiting" // Waiting for players
  | "dealing" // Dealing first 5 cards
  | "trump-selection" // Trump caller selecting trump (Rung only)
  | "dealing-rest" // Dealing remaining cards
  | "playing" // Main gameplay
  | "round-end" // Round finished
  | "game-over" // Game finished

export interface GameState {
  gameType: GameType
  roomId: string
  roomPassword: string
  players: Player[]
  phase: GamePhase
  deck: Card[]
  trumpSuit: Suit | null
  trumpCallerId: string | null
  currentTrick: Trick
  completedTricks: Trick[]
  currentPlayerId: string | null
  dealerId: string | null
  // Rung scoring
  teamAScore: number
  teamBScore: number
  teamACourts: number
  teamBCourts: number
  consecutiveWinsA: number
  consecutiveWinsB: number
  // Thulla scoring
  thullaPlayerId: string | null // The loser
  roundsPlayed: number
  playerLosses: Record<string, number> // Track losses per player
  // General
  roundNumber: number
  message: string
  wastePile: Card[] // For Thulla - discarded tricks
  minPlayers: number // Min players for game type
  maxPlayers: number // Max players for game type
}

export interface RoomInfo {
  roomId: string
  playerCount: number
  hasPassword: boolean
  gameType: GameType
}

export type ClientMessage =
  | { type: "join"; playerName: string; password?: string }
  | { type: "start-game" }
  | { type: "select-trump"; suit: Suit }
  | { type: "play-card"; cardId: string }
  | { type: "new-round" }
  | { type: "leave" }

export type ServerMessage =
  | { type: "state"; state: GameState }
  | { type: "error"; message: string }
  | { type: "player-joined"; player: Player }
  | { type: "player-left"; playerId: string }
  | { type: "your-id"; playerId: string }

// Card ranking for comparison (Ace high)
export const RANK_ORDER: Record<Rank, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
}

export const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"]
export const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
}

export const SUIT_COLORS: Record<Suit, string> = {
  hearts: "text-red-600",
  diamonds: "text-red-600",
  clubs: "text-foreground",
  spades: "text-foreground",
}

export const GAME_CONFIG: Record<
  GameType,
  { minPlayers: number; maxPlayers: number; name: string; description: string }
> = {
  rung: {
    minPlayers: 4,
    maxPlayers: 4,
    name: "Rung (Court Piece)",
    description: "4 players, 2 teams. Call trump, win 7+ tricks!",
  },
  thulla: {
    minPlayers: 3,
    maxPlayers: 6,
    name: "Thulla (Bhabhi)",
    description: "3-6 players. Shed all your cards - last one loses!",
  },
}
