"use client"

import { type Suit, SUIT_SYMBOLS, SUITS } from "@/lib/game-types"
import { cn } from "@/lib/utils"

interface TrumpSelectorProps {
  onSelect: (suit: Suit) => void
  disabled: boolean
}

export function TrumpSelector({ onSelect, disabled }: TrumpSelectorProps) {
  const suitColors: Record<Suit, string> = {
    hearts: "bg-red-500 hover:bg-red-600 text-white",
    diamonds: "bg-red-500 hover:bg-red-600 text-white",
    clubs: "bg-foreground hover:bg-foreground/80 text-background",
    spades: "bg-foreground hover:bg-foreground/80 text-background",
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-xl font-bold border-b-4 border-foreground pb-2">Select Trump Suit</h3>
      <div className="flex gap-4">
        {SUITS.map((suit) => (
          <button
            key={suit}
            onClick={() => onSelect(suit)}
            disabled={disabled}
            className={cn(
              "w-20 h-24 border-4 border-foreground shadow-md text-4xl font-bold",
              "transition-all hover:-translate-y-1 hover:shadow-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
              suitColors[suit],
            )}
          >
            {SUIT_SYMBOLS[suit]}
          </button>
        ))}
      </div>
    </div>
  )
}
