# Quelio Development Guidelines

## Architecture Overview

**Hybrid App**: Vue 3 SPA frontend + PHP 8 REST API backend communicating via `/api` proxy.

### Frontend (Vue 3 + TypeScript + Vite)
- **Composables pattern**: Business logic in `src/composables/use*.ts` (auth, theme, drawers, absences, etc.)
- **Storage strategy**: User-scoped localStorage with pattern `quelio_{label}_{username}` (see `utils/storage.ts`)
- **Authentication flow**: Token-based (stored locally) with fallback to username/password. Token invalidation triggers re-login
- **Theme system**: Dynamic CSS injection via `useTheme()` - themes load as inline CSS modules, update PWA manifest/icons with color params
- **State management**: Reactive refs in composables, no Vuex/Pinia

### Backend (PHP 8 MVC)
- **Auto-wiring DI**: `Container` class with PSR-4 autoloading - dependencies injected automatically
- **Routing**: Convention-based in `index.php` - `?action=` params dispatch to `{action}Action()` methods
- **Services layer**: `KelioClient` (external API), `TimeCalculator` (business logic), `Auth` (token management), `Storage` (cache)
- **Middleware**: `AuthMiddleware` validates tokens, `RateLimiter` prevents brute force
- **Cache strategy**: Local JSON file (`data.json`) for offline support - API returns cached data with `error: "using cached data"`

## Development Workflow

**Start dev environment**: `pnpm dev` (runs `scripts/dev.sh`)
- Launches PHP API via Docker Compose on `:8080`
- Starts Vite dev server on `:9876` with HMR and API proxy
- Access at `http://localhost:9876`

**Build**: `pnpm build` → `dist/` (static SPA + API files copied)
**Preview**: `pnpm preview` → Full production Docker container on `:9876`

**Key scripts**:
- `scripts/dev.sh` - Docker Compose dev profile, waits for API readiness
- `scripts/build.sh` - Builds frontend, copies API files to dist
- `scripts/preview.sh` - Production Docker with nginx

## Project Conventions

### Vue Components
- **Single File Components** with `<script setup>` and TypeScript
- **Props/emits**: Typed with interfaces from `types/index.ts`
- **Composables**: Import at component level, destructure needed refs/functions
- **Example**: Dashboard uses 5 composables (absences, timeObjective, suggestions, weekStats, theme)

### API Communication
- **Entry point**: `utils/api.ts` - `loginUser()` and `updateUserPreferences()`
- **Token strategy**: Try token first, fallback to password. Handle `TOKEN_INVALIDATED` error specifically
- **Error handling**: Check for `token_invalidated` flag in response, throw `Error('TOKEN_INVALIDATED')`
- **FormData**: All API requests use FormData, even for simple params

### Styling
- **Tailwind CSS v4**: `@tailwindcss/vite` plugin - no config file needed
- **Theme CSS files**: `src/styles/themes/*.css` - define CSS variables, imported dynamically as inline strings
- **Current themes**: midnight, light, abyss, ocean, forest, sunset, lavender, christmas (default)

### Data Flow Example
1. User logs in → `useAuth.login()` → `loginUser()` → POST `/api/?action=login`
2. API validates → `KelioClient.login()` → scrapes Kelio → `TimeCalculator.calculateTotalWorkingHours()`
3. Response → Save token/data → Load theme from preferences → Mount Dashboard
4. Dashboard → Multiple composables process `data` ref → Render stats/cards/suggestions

## Integration Points

### Kelio External Service
- **Client**: `api/src/services/KelioClient.php` - Scrapes HTML, handles CSRF tokens
- **Session**: JSESSIONID cookie-based, requires full login flow with user-agent spoofing
- **Data extraction**: DOM parsing via PHP DOMDocument to find hours table

### Docker Development
- **Profiles**: `dev` (API only) vs `prod` (full app with nginx)
- **Volumes**: `kelio_data:/tmp` persists cache across restarts
- **Dockerfiles**: `Dockerfile.dev` (Apache + PHP) vs `Dockerfile` (nginx + static files)

### PWA Features
- **Dynamic manifest**: `/api/manifest.json?primary={hex}&secondary={hex}&background={hex}`
- **Dynamic icons**: `/api/icon.svg?primary={hex}&secondary={hex}` - SVG generated in PHP
- **Meta theme-color**: Updated on theme change for mobile browser chrome

## Critical Patterns

**Composable communication**: Pass refs between composables (e.g., `missingDates` from `useAbsences` to `useTimeObjective`)

**localStorage scoping**: Always use username in key to support multi-user on same browser: `saveToStorage(username, 'theme', value)`

**Token refresh**: When API returns 401 with `token_invalidated`, clear session and force password re-entry (see `useAuth.login()` error handling)

**Theme loading priority**: Server preferences > localStorage > default ("christmas")

**Offline mode**: API returns cached data with error flag. Frontend displays banner but remains functional.

**Time calculations**: Frontend uses `moment.js` (French locale), backend uses native PHP DateTime. Both handle HH:MM format.

## File Structure Patterns

**Composables**: Export single `use{Name}()` function returning reactive state + methods
**Components**: Group related (e.g., `drawer/`, `widgets/`) - Dashboard orchestrates via props/emits
**API Controllers**: Extend `BaseController` or `BaseGuestController`, implement `{action}Action()` methods
**Services**: Single-responsibility classes (Auth, Storage, KelioClient, TimeCalculator, RateLimiter)

## Common Tasks

**Add new theme**: 
1. Create `src/styles/themes/{name}.css` with CSS variables
2. Add to `themes` and `themeModules` in `useTheme.ts`
3. Update `ThemeName` type

**Add new API endpoint**:
1. Create controller in `api/src/controllers/` extending base
2. Register route in `api/index.php` router
3. Add middleware if auth required: `[AuthMiddleware::class]`

**Add new composable**:
1. Create `src/composables/use{Name}.ts`
2. Export function with reactive refs
3. Import in component and destructure
