# 📚 Reading Tracker

A personal reading tracker built with React, TypeScript, and Tailwind CSS for CSCI 39548 – Practical Web Development (Summer 2026).

## Features

- **Book Search** – Search millions of books via the [Open Library API](https://openlibrary.org/developers/api). Results show the cover thumbnail, title, author, and first-publish year.
- **Library Management** – Add books from search results; the same book can't be added twice.
- **Status Pipeline** – Move books through `To Read → Reading → Finished` (forward and back).
- **Star Ratings** – Rate finished books 1–5 stars.
- **Filter & Sort** – Filter by status (All / To Read / Reading / Finished) and sort by title, author, or date added (ascending or descending).
- **Stats Bar** – Live counts per status and average rating of finished books.
- **Empty State** – Friendly message when the library is empty or the filter matches nothing.
- **Persistence** – Library and dark-mode preference survive page refreshes via `localStorage`.
- **Dark Mode** – Toggle with one click; preference is remembered.
- **Loading & Error States** – The search shows a spinner while fetching and a clear error message on failure.

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Vite](https://vitejs.dev/) | Build tool / dev server |
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [Open Library API](https://openlibrary.org/search.json) | Book data (no key needed) |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── types.ts          # Shared TypeScript interfaces
├── App.tsx           # Root component – owns all state
├── SearchBar.tsx     # Search input + results panel
├── BookCard.tsx      # Individual library book card
├── StatsBar.tsx      # Counts + average rating display
└── main.tsx          # React entry point
```

## Component Overview

- **`App`** – Lifts all state (library, dark-mode, search results, filters, sort). Passes data and callbacks down as props.
- **`SearchBar`** – Controlled input that fires a `useEffect`-based fetch against Open Library. Handles loading and error states.
- **`BookCard`** – Displays one book in the library; exposes status-change, delete, and rating controls.
- **`StatsBar`** – Pure display component; derives counts and average from the library array.

## Git Workflow

Development followed the feature-branch workflow taught in class:

1. Initial commit on `main` with scaffold + config
2. Feature branch `feature/core-app` for all development work
3. Incremental commits at each milestone (types → scaffold → search → library → persistence → dark mode → polish)
4. Pull request merged into `main`

## Assignment

CSCI 39548 – Practical Web Development, Summer 2026  
Instructor: Sourya Saha  
Assignment 3 – Reading Tracker (React + Tailwind)
