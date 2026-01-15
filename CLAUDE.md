# Quel io - Frontend

Time tracking application built with Vue 3, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Language**: TypeScript 5.9.3 (strict mode)
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS v4
- **Package Manager**: pnpm
- **Date/Time**: moment.js with French locale

## Project Structure

```
src/
├── components/          # 34+ Vue SFC components
│   ├── drawer/         # Slide-out panels (settings, absence)
│   ├── widgets/        # Dashboard widgets
│   └── christmas/      # Seasonal decorations
├── composables/        # 9 reusable state/logic functions
├── utils/              # API client and localStorage wrapper
├── types/              # TypeScript type definitions
└── styles/             # Global styles + 8 theme CSS files
```

## Common Commands

- `pnpm dev` - Start development server (Docker + Vite on port 9876)
- `pnpm build` - Type check + build + copy API to dist/
- `pnpm preview` - Run production Docker container

## Development Patterns

### Vue Components
- Always use `<script setup lang="ts">` (Composition API)
- Props/emits typed via `defineProps<T>()` and `defineEmits<T>()`
- Destructure refs from composables
- Event naming: descriptive (`@update:credentials`, `@mark-absent`)

### State Management
- No Vuex/Pinia - use composables instead
- Each composable exports single function returning refs and methods
- Pass refs between composables for cross-feature communication
- Side effects (localStorage, API) isolated in utils/

### Time Handling
- Format: HH:MM (24-hour, zero-padded)
- Calculations: Convert to minutes, calculate, convert back to HH:MM
- Use moment.js for date manipulation

### API Integration
- Entry point: `./api/` (proxied via Vite in dev)
- Method: POST with FormData
- Authentication: Token-first, fallback to username/password
- Error handling: Specific detection for `TOKEN_INVALIDATED`, `TOKEN_EXPIRED`

### localStorage
- User-scoped keys: `quelio_{label}_{username}` prevents multi-user conflicts
- Centralized access via utils/storage.ts

## Theme System

- 8 dynamic themes with CSS variables (default: ocean)
- Load CSS at runtime via dynamic imports
- Persistence: localStorage + API sync
- PWA resources (manifest, icons) parametrized with theme colors

## Code Style

- TypeScript strict mode enabled (no unused vars, no implicit any)
- ES modules only (not CommonJS)
- Camel case in JavaScript, kebab-case in templates
- Single responsibility: components do UI, composables do logic

## Key Files

- `src/main.ts` - Entry point (initializes theme, mounts app)
- `src/App.vue` - Root component (auth state, login flow)
- `src/components/Dashboard.vue` - Main app orchestrator
- `src/composables/useAuth.ts` - Authentication flow
- `src/composables/useTheme.ts` - Dynamic theme loading
- `src/utils/api.ts` - API client
- `src/types/index.ts` - Central type definitions

## Notes

- API backend is PHP 8 REST API in `/api` subdirectory (git submodule)
- Dev server proxies `/api/*` to localhost:8080
- PWA enabled with dynamic manifest and icon generation
- Offline mode supported with cached data fallback
- Docker used for consistent dev/prod environments
