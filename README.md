# Gym Client

Frontend web app for managing a gym: members, subscriptions, and unpaid accounts.

## Features

- **Members** — add, edit, search, and delete members
- **Subscriptions** — manage member subscription plans
- **Unpaid** — view members with overdue payments

## Tech Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS

## Getting Started

**Prerequisites:** Node.js 18+ and a running [gym API](http://localhost:5000) backend.

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command        | Description          |
|----------------|----------------------|
| `npm run dev`  | Start dev server     |
| `npm run build`| Production build     |
| `npm run start`| Run production build |
| `npm run lint` | Run ESLint           |

## Project Structure

```
src/
├── app/          # Next.js app, hooks, API client
├── components/   # UI components and forms
├── pages/        # Members, Subscriptions, Impayees views
└── types/        # TypeScript types
└── utils/        # Shared helpers (API fetch, date/currency/phone formatters)
```

