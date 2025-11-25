// Thulla/Bhabhi specific game logic
import { type Card, type Player, type GameState, type Trick, RANK_ORDER, type Suit } from "./game-types"
import { shuffleDeck } from "./game-logic"

// Deal all cards equally to players
export function dealCardsThulla(deck: Card[], players: Player[]): Player[] {
  const shuffled = shuffleDeck([...deck])
  const numPlayers = players.length
  const cardsPerPlayer = Math.floor(52 / numPlayers)

  const newPlayers = players.map((p, index) => ({
    ...p,
    hand: shuffled.slice(index * cardsPerPlayer, (index + 1) * cardsPerPlayer),
    isOut: false,
    isThulla: false,
  }))

  return newPlayers
}

// Find player with Ace of Spades (starts the game)
export function findStartingPlayer(players: Player[]): string | null {
  for (const player of players) {
    if (player.hand.some((c) => c.suit === "spades" && c.rank === "A")) {
      return player.id
    }
  }
  return players[0]?.id || null
}

// Check if a card can beat the current high card in trick
export function canBeatCard(card: Card, highCard: Card, leadSuit: Suit): boolean {
  if (card.suit !== leadSuit) return false
  return RANK_ORDER[card.rank] > RANK_ORDER[highCard.rank]
}

// Get valid cards for Thulla
export function getValidCardsThulla(player: Player, currentTrick: Trick): Card[] {
  // First card - can play anything (but traditionally starts with Ace of Spades on first trick)
  if (currentTrick.cards.length === 0) {
    return player.hand
  }

  const leadSuit = currentTrick.leadSuit
  if (!leadSuit) return player.hand

  // Find the current highest card in the trick
  const highCard = currentTrick.cards.reduce(
    (high, play) => {
      if (play.card.suit === leadSuit) {
        if (!high || RANK_ORDER[play.card.rank] > RANK_ORDER[high.rank]) {
          return play.card
        }
      }
      return high
    },
    null as Card | null,
  )

  // Get cards of the lead suit
  const suitCards = player.hand.filter((c) => c.suit === leadSuit)

  if (suitCards.length > 0) {
    // Must play a card of the lead suit
    // If possible, must play a higher card
    if (highCard) {
      const higherCards = suitCards.filter((c) => RANK_ORDER[c.rank] > RANK_ORDER[highCard.rank])
      if (higherCards.length > 0) {
        return higherCards // Must play a higher card if possible
      }
    }
    return suitCards // Any card of the suit if can't beat
  }

  // No cards of lead suit - can play any card (this is a "thulla")
  return player.hand
}

// Check if a thulla (breaking suit) was played
export function hasThullaPlayed(trick: Trick): boolean {
  if (!trick.leadSuit || trick.cards.length === 0) return false
  return trick.cards.some((play) => play.card.suit !== trick.leadSuit)
}

// Find who has to pick up cards (highest card of lead suit when thulla played)
export function findPickupPlayer(trick: Trick): string | null {
  if (!trick.leadSuit || !hasThullaPlayed(trick)) return null

  let highestPlay: { playerId: string; card: Card } | null = null

  for (const play of trick.cards) {
    if (play.card.suit === trick.leadSuit) {
      if (!highestPlay || RANK_ORDER[play.card.rank] > RANK_ORDER[highestPlay.card.rank]) {
        highestPlay = play
      }
    }
  }

  return highestPlay?.playerId || null
}

// Find who leads next trick (highest card of lead suit)
export function findNextLeader(trick: Trick): string | null {
  if (!trick.leadSuit) return null

  let highestPlay: { playerId: string; card: Card } | null = null

  for (const play of trick.cards) {
    if (play.card.suit === trick.leadSuit) {
      if (!highestPlay || RANK_ORDER[play.card.rank] > RANK_ORDER[highestPlay.card.rank]) {
        highestPlay = play
      }
    }
  }

  return highestPlay?.playerId || null
}

// Initialize Thulla game state
export function createInitialThullaState(roomId: string, password: string): GameState {
  return {
    gameType: "thulla",
    roomId,
    roomPassword: password,
    players: [],
    phase: "waiting",
    deck: [],
    trumpSuit: null,
    trumpCallerId: null,
    currentTrick: { cards: [], leadSuit: null, winnerId: null },
    completedTricks: [],
    currentPlayerId: null,
    dealerId: null,
    teamAScore: 0,
    teamBScore: 0,
    teamACourts: 0,
    teamBCourts: 0,
    consecutiveWinsA: 0,
    consecutiveWinsB: 0,
    thullaPlayerId: null,
    roundsPlayed: 0,
    playerLosses: {},
    roundNumber: 1,
    message: "Waiting for players to join...",
    wastePile: [],
    minPlayers: 3,
    maxPlayers: 6,
  }
}

// Get active players (still have cards)
export function getActivePlayers(players: Player[]): Player[] {
  return players.filter((p) => p.isConnected && !p.isOut && p.hand.length > 0)
}

// Check if game is over (only one player left with cards)
export function isThullaGameOver(players: Player[]): { isOver: boolean; loserId: string | null } {
  const activePlayers = getActivePlayers(players)

  if (activePlayers.length === 1) {
    return { isOver: true, loserId: activePlayers[0].id }
  }

  return { isOver: false, loserId: null }
}

// Sort hand for Thulla (by suit then rank descending)
export function sortHandThulla(hand: Card[]): Card[] {
  const suitOrder: Record<string, number> = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 }
  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) return suitOrder[a.suit] - suitOrder[b.suit]
    return RANK_ORDER[b.rank] - RANK_ORDER[a.rank]
  })
}
