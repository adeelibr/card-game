"use client"

import { type Card, SUIT_SYMBOLS, SUIT_COLORS } from "@/lib/game-types"
import { cn } from "@/lib/utils"

interface PlayingCardProps {
  card: Card
  onClick?: () => void
  disabled?: boolean
  selected?: boolean
  hidden?: boolean
  small?: boolean
  highlight?: boolean // Add highlight prop for valid cards
}

export function PlayingCard({ card, onClick, disabled, selected, hidden, small, highlight }: PlayingCardProps) {
  if (hidden || card.id === "hidden") {
    return (
      <div
        className={cn(
          "bg-primary border-4 border-foreground shadow-md flex items-center justify-center",
          small ? "w-12 h-16" : "w-16 h-24",
          "select-none",
        )}
      >
        <div className="text-primary-foreground font-bold text-2xl">R</div>
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "bg-white border-4 border-foreground shadow-md transition-all duration-200 flex flex-col items-center justify-between p-1",
        small ? "w-12 h-16 text-xs" : "w-16 h-24 text-sm",
        !disabled && "hover:-translate-y-2 hover:shadow-lg cursor-pointer",
        disabled && "opacity-60 cursor-not-allowed",
        selected && "ring-4 ring-accent -translate-y-2",
        highlight && !disabled && "ring-4 ring-primary -translate-y-1 bg-primary/10",
        SUIT_COLORS[card.suit],
      )}
    >
      <div className="self-start font-bold">{card.rank}</div>
      <div className={cn("text-3xl", small && "text-xl")}>{SUIT_SYMBOLS[card.suit]}</div>
      <div className="self-end font-bold rotate-180">{card.rank}</div>
    </button>
  )
}
