# FND-10: Backend Build Modernization (tsup, kill module-alias)

> **Status:** Ready
> **Track:** A
> **Depends on:** FND-03 (workspace)
> **Blocks:** FND-08 (backend image builds on this)
> **Branch:** `feat/fnd-10-backend-build`

## 1. Goal

Backend builds to a self-contained `dist/` with native path resolution — no runtime
`module-alias` hack — fast enough for CI, correct inside a Docker image.

## 2. Context & current state

- `backend/package.json`: `build` = `tsc` with `--max-old-space-size=4096`; `start` =
  `node dist/server.js`; `dev` = `tsx watch src/server.ts`; `_moduleAliases: {"@": "dist"}`
  - `module-alias` runtime dep resolving `@/...` imports.
- tsconfig paths `@/* → src/*` (verify exact mapping in `backend/tsconfig.json`).
- Non-code runtime assets: `drizzle/` (migrations), `public/images/logo.png` (payslip PDF
  header), `swagger/` output.
- Express 4 + CommonJS today.

## 3. The change

1. Add `tsup.config.ts`: entry `src/server.ts`, `format: ["cjs"]`, `target: "node22"`,
   `sourcemap: true`, `clean: true`, `bundle: true` with `noExternal` left default
   (node_modules stay external — the workspace install provides them; bundling everything
   breaks native deps like argon2/bcrypt). tsup resolves the `@/` alias at build time via
   esbuild `tsconfig` support — verify with a smoke run; if any dynamic `require` pattern
   (module-alias era) breaks, convert that file to static imports.
2. Delete `module-alias` dep + `_moduleAliases` + its import in the entry file.
3. Scripts: `build` = `tsup`; `typecheck` = `tsc --noEmit` (keeps full type safety since tsup
   doesn't typecheck); `start` unchanged; `dev` unchanged (tsx already handles paths).
4. Copy step for assets into dist consumers: none needed — `drizzle/` and `public/` are
   referenced by cwd-relative paths; keep them alongside in the Docker image (FND-08 §3.1)
   and verify the pdf.service logo path resolution (`process.cwd()` vs `__dirname` — fix to
   an env-configurable `ASSETS_DIR` defaulting to `./public` if fragile).
5. node-cron jobs (`modules/hr/notifications`) and swagger generation: confirm they run from
   the bundle (dynamic file scanning patterns are the usual breakage — swagger:generate can
   stay a dev-time script, its JSON output shipped as an asset).

## 4/5. API & Frontend

None.

## 6. Tests to write FIRST

1. FND-04 integration suite runs against the BUILT artifact: add a CI step that boots
   `node dist/server.js` (test env) and hits /health + one authenticated route + one route
   using `@/` deep imports + one PDF generation (logo asset resolution).
2. Cold-boot time and dist size recorded in the PR (baseline vs after).
3. `pnpm --filter ganzafrica-backend build` completes without the 4GB heap flag.

## 7. Acceptance criteria

- [ ] `module-alias` gone from package.json and code; grep `_moduleAliases` empty.
- [ ] Built server passes the integration smoke (§6.1) locally and in CI.
- [ ] Build time ≤ 30s on CI (tsc typecheck runs as a separate parallel task).
- [ ] Payslip PDF renders with the logo from the built artifact.

## 8. Edge cases

- argon2/bcrypt/pdfkit native or asset-carrying deps must remain external (default) — never bundled.
- `drizzle-kit` CLI in the image needs `drizzle.config.ts` + schema? NO — migration in prod
  runs `drizzle-kit migrate` which only needs `drizzle/` + config with `out`; copy
  `drizzle.config.ts` into the image and confirm it doesn't import from src (if it does,
  split a minimal prod config).
- Windows dev: tsup watch not needed (tsx dev path unchanged).

## 9. Out of scope

Express 4→5, ESM migration, dependency bumps (FND-09 Wave A covers multer only).

## 10. Rollout

Pure build-tooling change; deploy like any backend release. Revert = restore tsc script.
