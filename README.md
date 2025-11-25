# 🃏 Rung Card Game

A real-time multiplayer card game built with Next.js, featuring the classic South Asian card games **Rung** and **Thulla**. Play with friends online in beautifully designed game rooms with live synchronization.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/adeel-imran/v0-rung-card-game)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/femLUnFCd1C)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 🎮 Features

- **Two Game Modes**
  - **Rung**: A 4-player team-based trick-taking card game with trump selection
  - **Thulla**: A multi-player elimination game where the last player holding cards loses

- **Real-Time Multiplayer**: Play with friends using live room synchronization powered by PartyKit
- **Room System**: Create private rooms with optional password protection
- **Responsive Design**: Optimized for desktop and mobile devices
- **Beautiful UI**: Modern interface built with Tailwind CSS and Radix UI components
- **Dark/Light Mode**: Toggle between themes for comfortable gameplay

---

## 🕹️ Game Rules

### Rung (4 Players - Team Game)

1. Four players split into two teams (partners sit opposite each other)
2. The trump caller picks the trump suit after seeing their first 5 cards
3. Players must follow the lead suit if possible
4. Win 7+ tricks out of 13 to win the round
5. Win 7 consecutive rounds to earn a "court"

### Thulla (3-6 Players - Individual Game)

1. Each player plays individually
2. The player with the Ace of Spades leads first
3. You must follow suit AND beat the highest card if possible
4. If you cannot follow suit (thulla!), the highest card player picks up all cards
5. First to empty your hand wins - the last player holding cards is the "Thulla" (loser)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/adeelibr/card-game.git
   cd card-game
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start the development server**

   ```bash
   pnpm dev
   ```

4. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
pnpm build
pnpm start
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [Radix UI](https://www.radix-ui.com/) | Accessible UI components |
| [PartyKit](https://www.partykit.io/) | Real-time multiplayer synchronization |
| [Supabase](https://supabase.com/) | Backend services |
| [Vercel](https://vercel.com/) | Deployment and hosting |

---

## 📁 Project Structure

```
card-game/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Home page with join/create room
│   └── room/             # Game room pages
├── components/           # React components
│   ├── game-board.tsx    # Rung game board
│   ├── thulla-game-board.tsx # Thulla game board
│   ├── lobby.tsx         # Game lobby
│   ├── playing-card.tsx  # Card component
│   └── ui/               # Shadcn UI components
├── lib/                  # Utility functions and game logic
├── hooks/                # Custom React hooks
├── styles/               # Global styles
└── public/               # Static assets
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and suggest improvements.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [v0.app](https://v0.app) by Vercel
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Real-time features powered by [PartyKit](https://www.partykit.io/)

---

## 🔗 Links

- **Live Demo**: [Play Now](https://vercel.com/adeel-imran/v0-rung-card-game)
- **Report Issues**: [GitHub Issues](https://github.com/adeelibr/card-game/issues)
- **Discussions**: [GitHub Discussions](https://github.com/adeelibr/card-game/discussions)
