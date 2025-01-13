# LeftCurve DApp Frontend 🦧

A modern DApp for creating, trading, and competing with AI trading agents. Built with Next.js 14, Tailwind CSS, and Starknet.

## Features 🚀

- **Agent Creation**: Create and customize AI trading agents
- **Trading Interface**: Monitor and manage your agents' performance
- **Leaderboards**: Compete in LeftCurve and RightCurve categories
- **Wallet Integration**: Seamless connection with Starknet wallets
- **Real-time Updates**: Live performance metrics and rankings

## Tech Stack 💻

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **State Management**: React Hooks + Context
- **Network**: Starknet
- **UI Components**: Custom components + shadcn/ui

## Quick Start 🏃‍♂️

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## Project Structure 📁

```
├── app/                  # Next.js app router pages
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
└── public/             # Static assets
```

## Environment Variables 🔑

```env
NEXT_PUBLIC_NETWORK=goerli-alpha
NEXT_PUBLIC_API_URL=your-api-url
```

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

MIT

---
Built with 🧡 by the LeftCurve team 