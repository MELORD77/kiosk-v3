# Kiosk core working rules

Follow `C:/Users/u0098/.agents/workflow.md` and the matching role rules. Speak Uzbek with the user; write code, comments, and commit messages in English. User-approved plans authorize implementation; ask again only when scope changes materially.

## Scope

This is a fresh kiosk core. The old `new-info-kiosk` project is reference material only: do not copy its code, assets, dependencies, endpoint contracts, or business workflows. Use the supplied `Kiosk design project.zip` as the visual specification for welcome and home; its visible service names may be reused as static design content. Do not import its runtime or simulated business flows. Build service interiors incrementally after the user approves their UI and behavior. Support portrait (1080 x 1920) and landscape (1920 x 1080) from the same codebase; retain usable layouts at smaller preview sizes.

## Architecture

- Vite + React + strict TypeScript SPA, npm, one package-lock.json.
- FSD layers: app > pages > widgets > features > entities > shared. Add layers/slices only when used.
- Cross-slice imports go through public index.ts APIs. Use relative imports within a slice; never import a slice's own index.ts.
- App and shared use purpose-specific segments. Shared UI exposes one public API per component.
- Files/folders use kebab-case; components use PascalCase; hooks start with use. Prefer import type. Never suppress typing with any, ts-ignore, or unsafe casts.
- React Router declarative mode; TanStack Query owns server data, RHF + Zod own forms, Zustand owns shared client state. Do not duplicate query data in stores.
- Fetch is the sole HTTP transport. No business endpoints until their contracts are supplied and confirmed.
- Demo routes and demo adapters are development/test only. Production must not import or activate them.

## UI and sessions

- Semantic CSS tokens and Tailwind's Vite integration. Use shared primitives; keyboard focus, touch target size, reduced motion, and loading/error/empty states are required.
- All visible text uses i18n in Uzbek Latin, Uzbek Cyrillic, Russian, and English.
- Theme supports light/dark/system; orientation supports auto/portrait/landscape. Preferences may persist, personal information may not.
- Session reset cancels and removes session-owned queries and resets transient state. Timers, listeners, and subscriptions must clean up.
- Never put secrets or personal data in frontend environment values, logs, or localStorage. No authentication implementation without a confirmed contract.

## Verification

Run lint (including FSD boundary checks), typecheck, format:check, test:run, and build. Verify meaningful flows in both kiosk orientations and dark mode. Use an independent correctness reviewer for multi-file implementation. No git commit, push, or deployment unless explicitly requested.
