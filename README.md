# Intelligent Immigration System

A frontend-focused web project for immigration planning, country comparison, and learning resources.

## What This Project Includes

- Multi-page web app with a shared design system and JS utilities
- Planner, dashboard, country insights, learning, and safety pages
- Diagram assets for system and flow documentation
- Optional React frontend sandbox under `frontend/`
- Local demo authentication flow (no external backend required)

## Tech Stack

- HTML
- CSS
- JavaScript
- Vite (for local dev server)
- React (in `frontend/` sandbox)

## Run Locally

1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`
3. Open the local URL shown in terminal (usually `http://localhost:5173`).

## Project Structure

- `index.html` - main entry page
- `pages/` - app pages (planner, dashboard, countries, login, signup, etc.)
- `css/` - global styling
- `js/` - shared frontend logic
- `diagrams/` - UML and architecture diagrams
- `scripts/` - development scripts
- `frontend/` - separate React sandbox app

## Authentication Note

This project currently uses browser local storage for demo login/signup behavior.

- Accounts are stored locally in the browser
- No production-grade auth backend is required for demo usage

## Scripts

- `npm run dev` - run the main project with Vite
- `npm run dev:react-frontend` - run React sandbox from `frontend/`
- `npm run install:all` - install root + frontend dependencies

## Git / Security

Sensitive and local files are excluded with `.gitignore` (for example `.env*`, keys, node_modules, logs, and tool metadata folders).

## Repository

GitHub: https://github.com/Aditya04Raman/Intelligent-Immigration_System
