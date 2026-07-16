# FND-09: Version Alignment Waves (Next/React/Tailwind/zod/shared UI)

> **Status:** Ready
> **Track:** A (interleaved from wave 2; each sub-wave is an independent PR)
> **Depends on:** FND-04 (CI catches regressions)
> **Blocks:** FND-08 per-app (standalone output lands here)
> **Branch:** `chore/fnd-09-<wave>-<app>`

## 1. Goal

Every app on the same pinned Next 16.2.x + React 19.2.x stable; Tailwind v4 + one shared
`@workspace/ui` everywhere; zod v4 everywhere; the four local shadcn copies on a managed
path to deletion.

## 2. Context & current state (verified matrix)

| Package | Next | React | Tailwind | zod | Notes |
|---|---|---|---|---|---|
| web | ^16.0.7 | **19.0.0-rc.1** | v3 | v3 | build disables type checking (`NEXT_DISABLE_TYPE_CHECKING`, `TSC_COMPILE_ON_ERROR`) |
| portal | ^16.0.7 | ^19.2.1 | v3 | v3 | consumes @workspace/ui |
| task | ^16.0.7 | ^19.2.1 | v3 | v4 | 4 local shadcn components |
| alumni | ^16.0.7 | ^19.2.1 | v4 | v4 | 31 local shadcn components |
| internal | 16.1.6 | ^19.2.4 | v4 | v4 | 30 local; retired by MOD-07 — do the MINIMUM here |
| hr | 16.2.1 | 19.2.4 | v4 | v4 | 27 local; `lucide-react ^1.7.0` is a bogus spec — fix immediately |
| packages/ui | — | peer | **v3** | v3 | 34 components; consumed only by web+portal |
| backend | — | — | — | v3 | zod last (error-shape changes touch validators) |
| root | pollution removed in FND-03 | | | | `react-server-dom-webpack@19.1.1` pin removed with it |

Also: lucide-react versions differ everywhere (0.456–0.562 + bogus 1.7.0); tailwind-merge v2/v3
split; CVA duplicated; radix ranges divergent; eslint-config-next 15.x vs 16.x.

## 3. Waves (strict order, one PR each)

**Wave A — immediate hygiene** (no framework bumps): pin one workspace-wide `lucide-react`
(latest 0.5xx) via pnpm catalog (add `catalog:` in pnpm-workspace.yaml for lucide, zod, cva,
tailwind-merge, radix meta), fixing hr's bogus ^1.7.0; align eslint-config-next to the app's
Next major.

**Wave B — Next/React pinning**, easiest→hardest: hr (verify only) → internal → alumni →
task → portal → web. Per app: pin `next 16.2.x` exact, `react`/`react-dom 19.2.x` exact,
add `output: "standalone"` + `outputFileTracingRoot`, run the app, run its tests.
**web sub-steps** (its own PR sequence): (1) React RC → stable + react-server-dom-webpack
removal; (2) Next pin; (3) SEPARATE ticket `chore/web-type-debt`: remove
`NEXT_DISABLE_TYPE_CHECKING`/`TSC_COMPILE_ON_ERROR`, fix the surfaced type errors (timebox;
if > a day, land incremental `// @ts-expect-error` with TODO tags and a count ratchet).

**Wave C — Tailwind v4 for the v3 holdouts**: portal → web → packages/ui. Mechanical
migration: drop `tailwind.config.ts` in favor of CSS `@theme`, swap to `@tailwindcss/postcss`,
`npx @tailwindcss/upgrade` as starting point; visual smoke per app (key pages screenshot diff).
packages/ui LAST in this wave: bump its radix set to the newest line, tailwind-merge v3,
keep component API stable.

**Wave D — zod v4**: packages/ui → portal → web → backend. Backend: run validators' tests
(FND-04 harness) — error `issues` shape changes; update the error-formatting middleware once.

**Wave E — shared-UI adoption policy** (not a big-bang): rule recorded in root CLAUDE.md —
*new components import `@workspace/ui`; any PR touching a local `components/ui/X` first
migrates that X to the shared package if it isn't there, then deletes the local copy.*
Final sweep tickets per app (hr, alumni, task) close out remaining local copies once traffic
through waves has shrunk them. apps/internal exempt (dies in MOD-07).

## 4/5. API & Frontend

No API changes. Frontend = the waves above.

## 6. Tests to write FIRST

Per wave-B app PR: the app's existing test suite + `pnpm turbo build --filter=<app>` +
manual dev-server smoke of its 3 most-used pages (list them in each PR).
Wave C: Playwright visual snapshots of portal login, web home, web opportunities page BEFORE
the migration (committed as baseline), compared after.
Wave D backend: validator unit tests for the 5 most complex schemas BEFORE bumping
(characterize v3 behavior), updated intentionally with the bump.

## 7. Acceptance criteria

- [ ] `pnpm ls next react zod tailwindcss lucide-react -r` shows exactly one version each (except internal until MOD-07).
- [ ] All apps build with `output: standalone`; no build disables type checking (web debt ticket closed or ratchet in place).
- [ ] packages/ui on TW v4; portal + web still render (snapshots pass).
- [ ] pnpm catalog governs the shared libs; renovate-style drift impossible without a catalog change.
- [ ] Shared-UI adoption rule in CLAUDE.md; per-app sweep tickets filed with remaining-component counts.

## 8. Edge cases

- Peer-dep storms after React pin: prefer fixing the consumer version over `--force`; document any unavoidable override in package.json `pnpm.overrides` with a comment.
- TW v4 + HeroUI/primereact in hr: those carry their own styling — untouched, only shadcn/tailwind layers migrate.
- next-intl (web) and tiptap (portal) majors may lag Next 16.2 — check compatibility BEFORE the wave-B PR of that app; pin the newest compatible minor and note it.

## 9. Out of scope

Express 5 / backend deps (FND-10 handles build only; dep bumps opportunistic later);
Multer 1.x→2.x — **do fold this one in**: bump `multer` + `multer-s3` in backend during Wave A
(known advisories, small change, test uploads).

## 10. Rollout

Each PR independently revertable. Wave order is strict; apps within a wave can interleave
with other work.
