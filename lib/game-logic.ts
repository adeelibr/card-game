import {
  type Card,
  type Suit,
  type Player,
  type GameState,
  type Trick,
  type GameType,
  SUITS,
  RANKS,
  RANK_ORDER,
} from "./game-types"

// Create a full deck of 52 cards
export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${rank}-${suit}` })
    }
  }
  return deck
}

// Fisher-Yates shuffle
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Deal cards to players
export function dealCards(deck: Card[], players: Player[], count: number): { deck: Card[]; players: Player[] } {
  const newDeck = [...deck]
  const newPlayers = players.map((p) => ({ ...p, hand: [...p.hand] }))

  // Deal counter-clockwise starting from trump caller (player after dealer)
  for (let i = 0; i < count; i++) {
    for (const player of newPlayers) {
      if (newDeck.length > 0) {
        const card = newDeck.pop()!
        player.hand.push(card)
      }
    }
  }

  return { deck: newDeck, players: newPlayers }
}

// Compare two cards given the lead suit and trump suit
export function compareCards(card1: Card, card2: Card, leadSuit: Suit, trumpSuit: Suit | null): number {
  const isTrump1 = trumpSuit && card1.suit === trumpSuit
  const isTrump2 = trumpSuit && card2.suit === trumpSuit

  // Trump beats non-trump
  if (isTrump1 && !isTrump2) return 1
  if (!isTrump1 && isTrump2) return -1

  // Both trump or both not trump
  if (isTrump1 && isTrump2) {
    return RANK_ORDER[card1.rank] - RANK_ORDER[card2.rank]
  }

  // Neither is trump - only lead suit cards count
  const isLead1 = card1.suit === leadSuit
  const isLead2 = card2.suit === leadSuit

  if (isLead1 && !isLead2) return 1
  if (!isLead1 && isLead2) return -1
  if (isLead1 && isLead2) {
    return RANK_ORDER[card1.rank] - RANK_ORDER[card2.rank]
  }

  // Neither is lead suit - first card wins by default
  return 0
}

// Determine winner of a trick
export function determineTrickWinner(trick: Trick, trumpSuit: Suit | null): string | null {
  if (trick.cards.length === 0 || !trick.leadSuit) return null

  let winningPlay = trick.cards[0]

  for (let i = 1; i < trick.cards.length; i++) {
    const comparison = compareCards(trick.cards[i].card, winningPlay.card, trick.leadSuit, trumpSuit)
    if (comparison > 0) {
      winningPlay = trick.cards[i]
    }
  }

  return winningPlay.playerId
}

// Check if a player can play a specific card
export function canPlayCard(player: Player, card: Card, currentTrick: Trick): boolean {
  // First card of trick - can play anything
  if (currentTrick.cards.length === 0) return true

  const leadSuit = currentTrick.leadSuit
  if (!leadSuit) return true

  // Must follow suit if possible
  const hasSuit = player.hand.some((c) => c.suit === leadSuit)
  if (hasSuit) {
    return card.suit === leadSuit
  }

  // No cards of lead suit - can play anything
  return true
}

// Get valid cards a player can play
export function getValidCards(player: Player, currentTrick: Trick): Card[] {
  return player.hand.filter((card) => canPlayCard(player, card, currentTrick))
}

// Sort hand by suit then rank
export function sortHand(hand: Card[]): Card[] {
  const suitOrder: Record<Suit, number> = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 }
  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) return suitOrder[a.suit] - suitOrder[b.suit]
    return RANK_ORDER[b.rank] - RANK_ORDER[a.rank]
  })
}

export function createInitialGameState(roomId: string, password: string, gameType: GameType = "rung"): GameState {
  const isThulla = gameType === "thulla"
  return {
    gameType,
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
    minPlayers: isThulla ? 3 : 4,
    maxPlayers: isThulla ? 6 : 4,
  }
}

// Start a new round
export function startNewRound(state: GameState): GameState {
  const deck = shuffleDeck(createDeck())

  // Rotate dealer
  const dealerIndex = state.players.findIndex((p) => p.id === state.dealerId)
  const newDealerIndex = (dealerIndex + 1) % 4
  const newDealerId = state.players[newDealerIndex].id

  // Trump caller is player to dealer's right (counter-clockwise)
  const trumpCallerIndex = (newDealerIndex + 3) % 4
  const trumpCallerId = state.players[trumpCallerIndex].id

  // Clear hands
  const clearedPlayers = state.players.map((p) => ({ ...p, hand: [] }))

  // Deal first 5 cards
  const { deck: remainingDeck, players: dealtPlayers } = dealCards(deck, clearedPlayers, 5)

  return {
    ...state,
    deck: remainingDeck,
    players: dealtPlayers,
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
    message: `${dealtPlayers.find((p) => p.id === trumpCallerId)?.name} is selecting trump...`,
  }
}

// Check for court (7 consecutive wins)
export function checkForCourt(state: GameState): {
  courtScored: boolean
  team: "A" | "B" | null
  isGoonCourt: boolean
} {
  // Check for Goon Court (first 7 tricks in a row)
  if (state.completedTricks.length === 7) {
    const firstSevenWinners = state.completedTricks.slice(0, 7).map((t) => {
      const winner = state.players.find((p) => p.id === t.winnerId)
      return winner?.team
    })
    const allSameTeam = firstSevenWinners.every((t) => t === firstSevenWinners[0])
    if (allSameTeam && firstSevenWinners[0] && firstSevenWinners[0] !== "none") {
      return { courtScored: true, team: firstSevenWinners[0], isGoonCourt: true }
    }
  }

  return { courtScored: false, team: null, isGoonCourt: false }
}

// Generate a random room ID
export function generateRoomId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}
