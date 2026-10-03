# Info Kiosk Core

A fresh Vite + React + TypeScript SPA for portrait (1080 x 1920) and landscape (1920 x 1080) information kiosks. Welcome and home follow the supplied `Kiosk design project.zip`. The old project was inspected for context only; no old code, assets, endpoints, certificates, or authentication flows were migrated.

The catalog is connected to the supplied Kiosk API v3 contract. Categories, counts, localized names, and service UUIDs come from the backend. The approved identity entry screen accepts either a 14-digit PINFL or a passport series (two Latin letters) and number (seven digits). It checks input format locally; subsequent service steps, SMS, printer, camera, identity verification, and application submission integrations remain pending confirmed contracts.

## Start

Use Node.js 24.15 or newer in the 24.x line (or a supported Node.js 26+ release) and npm. Dependencies are pinned; commit only `package-lock.json` as the lockfile.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Copy `.env.example` to `.env.local` to connect to the documented development API or override public settings. Catalog requests need a reachable configured server or a same-origin reverse proxy.

| Variable                 | Default  | Purpose                               |
| ------------------------ | -------- | ------------------------------------- |
| `VITE_API_BASE_URL`      | unset    | API server origin; HTTP or HTTPS only |
| `VITE_KIOSK_ORIENTATION` | `auto`   | `auto`, `portrait`, or `landscape`    |
| `VITE_IDLE_TIMEOUT_MS`   | `120000` | Inactivity period before the warning  |
| `VITE_IDLE_WARNING_MS`   | `15000`  | Extra warning countdown before reset  |

Warning duration must be less than the inactivity period. Default total inactivity before expiration is 135 seconds. Invalid configuration fails with field names rather than exposing configuration values. `VITE_` values are public; never put credentials or secrets in them.

## Routes and display

- `/`: welcome and language selection.
- `/home`: server service catalog and category navigation; `?category=...` selects a server filter.
- `/services/:serviceId`: UUID-based service lookup and identity entry with touch keyboards; missing services show 404.
- `/core-demo`: **development only** integration exercise for query states and form validation.
- `/face-preview`: **development only** camera and single-face capture preview; start the camera explicitly.
- Unrecognized routes: 404.

Auto orientation follows the viewport and updates when the screen rotates. Development controls can preview a fixed orientation; `VITE_KIOSK_ORIENTATION=portrait` or `landscape` locks the configured mode. Layouts rearrange content, not just rotate/scale a screenshot. Smaller browser previews remain scrollable and usable.

The ordinary kiosk view follows the design without a developer settings strip. In development, open `/home?devtools=1` to enable theme, orientation, and demo controls. The flag is read when the layout's controls first mount, remains active during in-app navigation, and is re-evaluated on a full reload. Production does not render these controls.

Identity values stay in the form only. Changing identification method clears prior fields, errors, and the local result; changing service, returning home, finishing, or expiring the session removes the entered values. Continue validates the format and explains that the next service stage is pending; it sends no identity data to the catalog API and does not claim identity verification.

Framer Motion adds opacity-only feedback: content fades in over 160 ms, and button presses, field errors, status messages, and dialogs use 120 ms. Buttons keep their dimensions and native pointer, touch, Enter, and Space behavior. The shared motion policy follows reduced-motion preference changes immediately and disables these animations. Page and session removal never wait for an exit animation, so personal inputs disappear immediately on reset.

Four bundled locales are available: Uzbek Latin (`uz`), Uzbek Cyrillic (`uzc`), Russian (`ru`), and English (`en`). The design's Commissioner variable font is bundled locally from the official Google Fonts repository with its SIL Open Font License (`public/fonts/OFL.txt`); no runtime font network request is required. There is no external map or image dependency. The emblem remains a design placeholder until an approved asset is provided.

## Architecture

### Face capture module

`FaceCapture` from `@/features/face-capture` is prepared for later UI integration. Its `active` prop controls camera access; the owning page passes the session abort signal, `onCapture(Blob)`, and `onCancel`. It uses pinned `face-api.js` and `react-webcam`, with mirroring disabled for both preview and photo. Tiny Face Detector weights are bundled locally in `public/models/face-api` with their upstream license.

Capture requires exactly one detected face. Zero or multiple detected faces block capture, and the frozen photo frame is checked again before returning its JPEG Blob. This is face detection, not identity verification or liveness detection; detector results cannot guarantee every real face is detected. Photos remain in memory and no upload endpoint is connected. Camera access requires HTTPS or localhost and browser permission. Cancel, unmount, and session abort release camera resources; the preview releases photo object URLs on replacement or removal.

Normal welcome, catalog, and identity screens do not open this module. `/face-preview` and its module import are excluded from production routing until the user specifies the activation flow.

```text
src/
  app/                    # Providers, declarative router, shell, styles
  pages/                  # Welcome, home, service identity entry, 404, development demo
  features/kiosk-session/ # Shared session lifecycle and inactivity handling
  entities/service-catalog/ # Validated catalog API, query hooks and localization
  shared/
    api/                  # Fetch transport and typed error model
    config/               # Validated public environment configuration
    lib/                  # Theme, orientation, i18n, safe preference storage
    ui/                   # Accessible component-level primitives
```

FSD layers are `app > pages > widgets > features > entities > shared`. Only used layers exist. A slice may import lower layers, never its sibling slices. Cross-slice imports use public `index.ts` files; internal imports are relative. Shared UI has a public API per component. `@/` consistently resolves to `src/` in TypeScript, Vite, and tests.

`scripts/check-boundaries.mjs` inspects TypeScript import/export/dynamic-import syntax and enforces layer, sibling-slice, and public-API boundaries. `npm run lint` runs it after ESLint. Keep application composition in app and pages; do not create empty layers or unrelated abstractions.

## State, theme, and sessions

- Component-local temporary state: React state/reducer.
- Forms and field errors: React Hook Form + Zod.
- Server/query results: TanStack Query, never copied into Zustand.
- Sharable filters/scenarios: URL search parameters.
- Cross-component client preferences/session: focused Zustand stores with selectors.

Light, dark, and system themes use semantic variables (`background`, `foreground`, `surface`, `muted`, `primary`, `border`, `danger`, `success`, `focus-ring`) in `src/app/styles`. Spacing, typography, radius, and shadows share tokens. System theme follows media changes; event subscriptions clean up. The initial HTML applies the saved preference before React starts.

Presentation uses Tailwind utility recipes in the owning UI segment. Tailwind's `@theme inline` aliases reference the existing runtime tokens, preserving pixel spacing, rem typography, theme changes, and orientation-specific values. Custom media variants retain the original inclusive viewport boundaries. Shared primitives merge caller classes through `cn` so page-specific utilities can override base sizing and appearance. Native scrollbar styling, global accessibility rules, runtime tokens, and animation keyframes remain CSS. Semantic marker classes are retained for browser checks without duplicating their migrated styling.

Only theme, orientation, and language preferences persist. Session data stays in memory. End/timeout aborts session work, removes queries and mutations marked `meta: { sessionOwned: true }`, remounts transient page content, and returns to welcome. “Continue” dismisses the inactivity warning without losing current form data. Future authenticated data must be marked session-owned and use the session signal for mutations.

## Shared UI components

Reusable UI lives in `src/shared/ui/`, with one public `index.ts` per component. Import from `@/shared/ui/<component>` rather than a global components barrel.

- `Button`, `TextField`, `SelectField`, and `FormField` provide common interaction and form styling.
- `StatusPanel` provides illustrated empty, not-found, neutral, success, and error messages; `Loader` provides an accessible loading indicator alongside layout-preserving skeletons; `ArrowIcon` supplies the existing design arrow.
- `ScrollArea` uses a native scroll container and supports semantic elements without extra layout wrappers. Scrollbar track, thumb, and hover colors follow light/dark tokens; keyboard and touch scrolling remain native.
- `Dialog` manages a controlled native modal and its cleanup. Callers own translated content and dismissal behavior; the session warning maps Escape to continuing the existing session.
- `Badge` provides the count/number appearance used by categories and service cards.
- `PageHeading` composes the page title and optional description while callers retain their page-specific layout.

Only components used by the current screens are included. Service-specific cards and category behavior remain in their owning page.

### Skeleton loading states

`Skeleton` from `@/shared/ui/skeleton` provides text, icon, badge, button, input, and box shapes. Page-specific skeletons reuse the content's layout classes and responsive dimensions. Translated static text can be measured invisibly to preserve wrapping; personal input values are never used. Loading regions expose a translated status, while decorative placeholders are hidden from assistive technology and cannot receive focus. Animation follows the current theme and reduced-motion preference.

Catalog categories and service cards show skeletons while their requests are pending. Service details reserve the full identity form layout, including the input, keypad, and actions. Static content renders immediately during normal use. In development, append `?skeleton=1` to `/`, `/home`, `/services/:serviceId`, or `/core-demo` to preview skeletons, including the header and session footer. Removing the parameter restores the normal view. Production ignores this preview parameter.

Previews use available public catalog names and counts for matching text dimensions. Before the first server response, fallback labels reserve space; different server text lengths or category counts can still change wrapping. Browser verification compares matching content after fonts load at 1920 × 1080, 1080 × 1920, and 390 × 844, with block dimensions matching within one pixel in light and dark themes.

## API integration

The supplied Kiosk API v3 catalog endpoints are connected through `entities/service-catalog`:

- `GET /api/v3/services/categories`: category names, order, and counts.
- `GET /api/v3/services`: all services; the optional `category` query parameter applies the server filter.
- `GET /api/v3/services/:id`: one service using a UUID obtained from the server.

Set `VITE_API_BASE_URL=https://192.168.5.21:8001` for the documented development server, as in `.env.example`. Adapters include `/api/v3` in their paths, so the configured value is the server origin. When unset, requests use the frontend origin and require a reverse proxy serving those paths. No authentication is required by this catalog contract.

The development server uses a self-signed certificate. Open [its health page](https://192.168.5.21:8001/health) in the kiosk browser and accept its certificate warning if needed. The frontend does not disable TLS validation; an untrusted certificate appears as a recoverable network error.

Zod validates the full `{ message, result, meta, time }` response before extracting `result`. Server order and UUIDs are preserved. The frontend adds the localized “All services” option and maps frontend `uzc` to backend `cr`. Query keys include category or UUID; query cancellation propagates to fetch. Invalid UUID routes show 404 without a detail request. Catalog queries contain public information and are not session-owned. Loading, empty, error, and retry states are available on the affected screens.

Tests intercept catalog requests using fixtures under `tests/`; production does not import them. Adapter tests cover validation, query keys, filtering, aborts, and invalid IDs. Browser tests exercise API filtering, UUID navigation, all locales, empty/error/retry, and 404 across the three layouts.

The sole transport is `apiClient` from `@/shared/api`:

```ts
const result = await apiClient.request('/confirmed-endpoint', {
  method: 'GET',
  signal,
  schema: responseSchema,
});
```

Provide a Zod schema for external `unknown` data. For 204/no-content responses, use `z.undefined()` (or a schema explicitly allowing undefined). `createApiClient({ baseUrl, fetcher })` supports adapter testing. The client checks HTTP status, handles body reading/JSON parsing, forwards `AbortSignal`, and separates `ApiError` kinds `http`, `network`, and `validation`. It does not log response bodies or personal data.

Query keys must contain all response-affecting parameters. Propagate the query signal. Retry only transient transport failures; auth/validation failures are not retried. Mutation invalidation must target the relevant key factory. Auth, device registration, identity verification, printer, and media integrations remain pending confirmed contracts.

## Development demo

The lazy demo route is guarded by `import.meta.env.DEV`; production builds exclude its route and adapters. It exercises two **demonstration display profiles**, separate from the service catalog. The `scenario` URL parameter accepts `success`, `empty`, or `error`. No HTTP endpoint is simulated as a real service.

The demonstration form accepts a trimmed label of 3–40 characters; submitting the label `error` deliberately triggers a demo failure. It waits for the mutation, blocks repeat submits, exposes query/form error and pending states, and cancels on unmount/session end. Nothing is saved or sent to a real backend. Replace this exercise with confirmed page-specific adapters when those requirements arrive.

## Quality scripts

| Script                    | Purpose                                                     |
| ------------------------- | ----------------------------------------------------------- |
| `dev` / `preview`         | Development server / production preview                     |
| `build`                   | Typecheck and production build                              |
| `lint`                    | ESLint plus FSD boundary checks                             |
| `typecheck`               | Strict TypeScript checks                                    |
| `format` / `format:check` | Apply / verify Prettier formatting                          |
| `test` / `test:run`       | Interactive / one-shot Vitest                               |
| `test:e2e`                | Browser checks for portrait, landscape, and compact layouts |

Tests sit beside their modules; application integration tests are in `tests/` and browser tests in `tests/e2e/`. Each integration test gets its own QueryClient and resets preferences/session state. Install Chromium before browser checks:

```sh
npx playwright install chromium
npm run test:e2e
```

The CI workflow performs a clean install, lint, typecheck, formatting verification, unit/integration tests, and a production build. Browser testing is separately runnable; it is not claimed to run in CI by default.

## Local verification (2026-10-02)

The core and shared component update passed the following local checks:

| Command                                                                   | Result                                                                    |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `npm run lint`                                                            | Passed ESLint and FSD boundaries; invalid import probes were rejected     |
| `npm run typecheck`                                                       | Passed strict TypeScript checks                                           |
| `npm run format:check`                                                    | Passed                                                                    |
| `npm run test:run`                                                        | 45 tests passed across 13 files                                           |
| `npm run build`                                                           | Passed production build; development demo code excluded                   |
| `npm run test:e2e -- --workers=1 --timeout=15000 --global-timeout=120000` | 15 Chromium checks passed across landscape, portrait, and compact layouts |

An independent code review and live browser verification also passed. Browser checks covered language selection, categories, navigation, theme persistence and system-theme changes, demo form/query states, session reset, and responsive layouts. Shared-component checks cover keyboard scrolling, compact wheel scrolling over categories and cards, centered native dialogs, modal focus navigation, Escape/Continue preserving input, and Finish resetting the session. Screenshots are generated in `output/playwright/`. Hardware integrations and real backend contracts remain unverified because they are not implemented. The CI configuration was created but has not run on a remote runner.

Catalog API integration verification (2026-10-02): ESLint, FSD boundaries, strict TypeScript, Prettier, and the production build passed. Unit/integration tests passed 69 tests across 14 files. All 33 browser cases passed across landscape, portrait, and compact layouts, including 18 catalog cases using test-only response fixtures; screenshots cover dark mode and loading states. Independent correctness review found no defects. After the user accepted the development certificate, live verification in the user's Chrome browser also passed without response interception or TLS bypass: 24 services, 6 categories, certificate and road filters returning 2 and 9 services, server UUID navigation, and service names in all four languages. No application console errors were observed. The real catalog source was left selected.

Identity and status screen verification (2026-10-02): lint, FSD boundaries, typecheck, formatting, and production build passed. All 76 unit/integration tests and 33 browser cases passed across landscape, portrait, and compact layouts. Coverage includes PINFL/passport format checks, physical and touch entry, clearing values on method/session changes, loaders, 404, empty/error/retry, and dark mode. Independent correctness review passed. Runtime catalog mocks and the source toggle were removed as requested; catalog fixtures are used only by tests. The configured real catalog connection still fails certificate trust (`DEPTH_ZERO_SELF_SIGNED_CERT`); no certificate bypass was added. Continue validates format locally; the next service stage remains pending.

Opacity animation verification (2026-10-02): lint, FSD boundaries, strict typecheck, formatting, and production build passed. All 77 unit/integration tests and 42 browser cases passed across landscape, portrait, and compact layouts. Browser checks cover pointer/Enter/Space feedback without geometry changes, disabled buttons, initial and live reduced-motion preferences, immediate session reset, dialog focus, and scrolling in both themes. Independent correctness review passed. Catalog responses in these automated checks use test-only fixtures.

Tailwind migration verification (2026-10-03): lint, FSD boundaries, strict typecheck, formatting, and production build passed. All 82 unit/integration tests and 42 browser cases passed; independent correctness review found no remaining defects. Before/after comparisons covered 124 states across landscape, portrait, compact, 1366-pixel previews, both themes, inclusive viewport boundaries, forced orientations, and a 20-pixel root font. Effective computed styles, geometry, and scrolling matched. Of the 124 screenshots, 123 were pixel-identical; forced-landscape home differed only in six border antialiasing pixels by one RGB channel value, with identical geometry and colors. Welcome decoration added concurrently in another chat was preserved and masked for the migration comparison. Catalog requests in these checks use test-only fixtures, and verification browsers and temporary servers are separate from the user's browser.

## Deploy

```sh
npm run build
npm run preview
```

Host `dist/` with an SPA fallback to `index.html` for page routes. Preserve normal asset handling; do not return HTML for missing JS/CSS. The demo route is absent in production. Deploying the core does not enable backend services. No deployment, commit, or push is performed without a user request.

## Dependency choices

Pinned versions include React 19.3.0, React Router 8.4.0 (declarative mode), TanStack Query 5.104.0, React Hook Form 7.89.0, resolvers 5.9.1, Zod 4.6.5, Zustand 5.0.15, Vite 8.3.2, Tailwind 4.3.3, tailwind-merge 3.7.0, Vitest 5.0.3, and TypeScript 6.0.3. TypeScript 7 is not used because the current TypeScript ESLint peer range excludes it. The lockfile records the full dependency tree.

Tailwind uses its [official Vite integration](https://tailwindcss.com/docs/installation/using-vite). Routing follows [React Router's declarative setup](https://reactrouter.com/start/declarative/installation); forms follow the [RHF resolver integration](https://github.com/react-hook-form/resolvers). Peer requirements were checked before installation; no force or legacy-peer-deps flags were used.

## Next decisions

Approve each service interior, actual kiosk deployment orientation, emblem/fonts/assets, further backend response contracts, authentication/session policy, and any printer/camera requirements before adding those integrations. The catalog contract supplies metadata only; it does not enable application submission or service-specific workflows.
