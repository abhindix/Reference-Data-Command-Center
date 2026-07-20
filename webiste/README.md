# Loan Reference Data Platform Website

Frontend dashboard for your Loan Reference Data Platform backend (FastAPI + PostgreSQL/SQLite).

## Stack

- React 19 + TypeScript
- Vite 8
- ESLint

## Features

- Live loan catalog view from backend API
- Product detail panel with rates, terms, fees, and requirements
- Admin stats cards from `/api/v1/admin/stats`
- Mobile responsive dashboard layout

## Quick Start

1. Install frontend dependencies:

```bash
npm install
```

2. Start backend server from project root:

```bash
python -m uvicorn app.main:app --reload
```

3. Start frontend dev server from this folder:

```bash
npm run dev
```

4. Open the website:

- http://localhost:5173

## API Configuration

By default, frontend calls `/api/v1` and Vite proxies `/api/*` to `http://localhost:8000`.

If you want a different backend URL, create `.env` in this folder:

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Validation

Verified in setup:

- `npm run build` passes
- `npm run lint` passes

## Folder Notes

- Main page: `src/App.tsx`
- Styles: `src/App.css`, `src/index.css`
- Dev proxy: `vite.config.ts`
