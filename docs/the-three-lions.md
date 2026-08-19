# The Three Lions

Three-part pass on `apps/hr`: a real app-wide toast system wired into CRUD actions, dark mode
across a named set of pages/components, and a profile page rework with a real photo uploader.
Branch: `mod-01-employees-core`.

## Part 1 — Toast system

Investigation found the app already had an active toast library — `sonner`, wrapped in a
shadcn-style shim — called from **14 files** across recruitment, assets, and org-chart (not
the 5 files it first looked like). Its `<Toaster>` was never mounted anywhere, so all ~49 of
those calls were silently no-ops. Also found `@heroui/react` ships its own working
module-scope singleton (`toastQueue`/`toast`) — building a second one from the pasted snippet
would have created a disconnected duplicate, so the singleton is HeroUI's own.

- `src/lib/toast/index.ts` — public API: `toast.success/danger/warning/info(title, description?)`.
- `src/components/toast/toast-provider.tsx` — the rendered `Toast.Provider`, mounted once in
  `src/app/layout.tsx`.
- All 14 sonner-based files migrated to the new API; `src/hooks/use-toast.tsx` and
  `src/components/ui/sonner.tsx` deleted; `sonner` removed from `package.json`.
- `src/providers/app-provider.tsx` — global `MutationCache.onError` fires `toast.danger(...)`
  for every failed mutation app-wide, pulling the real backend message
  (`error.response.data.message`), with a `meta: { silentError: true }` escape hatch on the
  handful of mutations whose callers already show a more specific toast (avoids double toasts).
- Added `onSuccess` toasts to real create/update/delete mutations across `useAssets`,
  `useContracts`, `useDocuments`, `useDocumentsPlus`, `useEmployees`, `useLeaveBalances`,
  `useOrg`, `usePolicies`, `useProcesses`, `useRecruitment`, `useSigning` that had zero prior
  feedback. Skipped a few dead-code mutations (zero real consumers) in `useHelpdesk`/`useLeaves`.

### Testing this part

- Trigger a failing mutation somewhere **not** explicitly touched (e.g. a leave policy save
  with the network killed) and confirm the global error toast still fires with a real message.
- Trigger a few of the migrated recruitment/asset flows and confirm no **double** toast (one
  from a local handler, one from the global one) — the manager-reassignment cycle-conflict case
  and the recruitment offer-send case are the ones worth specifically checking.
- Rapid-fire multiple actions and check toast stacking/dismissal looks right.
- Confirm `toast.success/danger/warning/info` render with visually distinct colors (HeroUI's
  own theme tokens, not hand-rolled).

## Part 2 — Dark mode

Mechanism already existed (`next-themes`, `attribute="class"`, toggle already in `navbar.tsx`)
and was partially applied — extended the same mechanism, didn't introduce a new one.

- **Table**: one real shared component (`DataTable` in `table-component.tsx`) — fixed once.
- **Tabs**: turned out to be _three_ separate implementations — the shared Radix-based
  `ui/tabs.tsx` (already fine), a hand-rolled `SettingsTabs` component (used by Settings →
  Roles/Timeoff, fixed), and a third hand-rolled tab pair inline on the Profile page (fixed).
- **CustomSheet pattern**: `ReusableSheet` (`sheet-component.tsx`) is the one real shared base
  behind most create/edit sheets — fixed once, cascades everywhere. shadcn's separate `Sheet`
  primitive (navbar/sidebar/leave-detail/application-detail) was already token-based.
- **Org Chart**: flagged case — it imports PrimeReact's `lara-light-green` theme directly.
  Extended the file's existing inline `<style>` override (previously only for connector lines)
  to also cover `.p-organizationchart-node-content` using `var(--card)`/`var(--border)`/
  `var(--foreground)`, so it now auto-adapts with the same tokens the rest of the app uses.
- Settings (main + Organization/Policies/Roles/Timeoff + shared `SettingsSection`/`DataRow`/
  `SettingsModal`/`QuickAccessCard`) and the Profile page/tabs fixed. Status badge pill colors
  (e.g. `bg-green-100 text-green-800`) deliberately left as-is — matches the existing
  convention on already-dark-mode pages like Assets.

### Testing this part

- Toggle light/dark on every page in the target list, specifically: **Settings → Roles** and
  **Settings → Timeoff** (the `SettingsTabs` fix), **Org Chart** (PrimeReact override — check
  node cards _and_ the connector lines), and any `ReusableSheet`-based create/edit flow.
- Check the Roles page's "restricted access" info banner and the sheet title's brand-green
  text specifically — both needed explicit `dark:` overrides beyond a plain token swap.
- No visual/browser check was done this session (no browser tool available) — this is the
  first real look at all of it in a live browser.

## Part 3 — Profile page rework

The spec doc (`MOD-01-employees-core.md`) is stale on this — it names `GET /hr/me` /
`PATCH /hr/me/profile` and self-editable fields including `emergency_contact`/`bio`. None of
that is real; actual routes are `/hr/employees/me(/profile)` and the real
`SELF_EDITABLE_FIELDS` is `phone, picture, personal_email, home_city, home_country,
citizenship`. Built against the real backend, not the doc.

- Added display of `personal_email`, `citizenship` (previously editable but never _shown_),
  `employment_type`, `employee_number`, `manager`, and `counts` (assets/open leave/documents)
  — all real fields from the actual API response, confirmed against `getMyEmployeeRecord`.
  Removed dead-end placeholder sub-tabs/cards that linked to `href="#"`.
- Profile picture: replaced the URL text input with a real `<input type="file">` + live
  preview (`URL.createObjectURL`, same cleanup pattern as `create-asset-sheet.tsx`).
- Backend: reused the Assets multer-S3 `upload` middleware — `upload.single("picture")` added
  to `PATCH /hr/employees/me/profile` (no-op for plain-JSON requests), controller resolves the
  uploaded file to a CDN URL via the same `getFileUrl()` helper `assets.controller.ts` uses.
  Did not build new upload infrastructure, and deliberately didn't reuse the
  Documents-based contract-agreement pattern (that's for real document records with
  metadata/access control — wrong shape for a plain avatar).
- Layout matches `EmployeeSheet`'s `Profile` tab (`view-employee-contents.tsx`) — the one real
  content-rich detail-page convention in the app: identity card, "Employment details" section
  labeled "Managed by HR — contact HR to change," "Personal & contact details" section labeled
  as self-editable. Field-editable split itself was not touched.

### Testing this part

- Edit each self-editable field individually and confirm it saves and re-renders correctly.
- Upload a profile picture (try a large image and a non-image file to see the failure path),
  confirm the preview shows immediately and the saved photo persists after a reload.
- Confirm HR-owned fields (job title, department, status, employee number, work email, hire
  date) render read-only with no edit affordance, and that editing them still only happens
  through the HR edit sheet elsewhere, not this page.
- Confirm the "at a glance" counts tiles (assets/open leave/documents) only render when the API
  actually returns `counts` (they're optional on the type).
- Check the manager link (if the account has one) navigates correctly.

## Commit message

```
feat(hr): app-wide toast system, dark mode pass, profile page rework

Three-part pass on apps/hr:

- Toast: replace the dead sonner setup (Toaster never mounted, ~49 silent
  calls across 14 files) with a HeroUI singleton toast API, a global
  MutationCache.onError handler, and onSuccess wiring across every real
  CRUD hook that had no prior feedback.
- Dark mode: extend the existing next-themes mechanism to the shared
  DataTable/ReusableSheet, the org chart's PrimeReact override, Settings
  (+ Organization/Policies/Roles/Timeoff), and the Profile page. Found
  and fixed two additional hand-rolled tabs implementations duplicating
  the shared one.
- Profile page: show real API fields that were never displayed
  (personal_email, citizenship, employment_type, manager, counts),
  replace the picture URL text input with a real file upload reusing
  the Assets multer-S3 middleware, and match the employee detail
  sheet's layout convention instead of inventing a new one.

Backend: upload.single("picture") added to PATCH /hr/employees/me/profile
(no-op for JSON requests); controller resolves it via the same
getFileUrl() helper assets.controller.ts uses.

Verification: tsc/build/vitest clean on both frontend and backend;
full MOD-01 integration suite (43 tests) re-run after the upload
middleware change. No browser click-through — not available this
session.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

## PR description

**Title:** HR: reusable toast system, dark mode pass, profile page rework

**Summary**

- Turns the pasted HeroUI toast snippet into an actual app-wide singleton and wires it into
  every real CRUD mutation hook. In the process, found the app's _existing_ toast system
  (`sonner`) was silently broken — `<Toaster>` was never mounted — across 14 files, not the 5
  it first looked like from a shallow grep; all 14 migrated onto the new system and the dead
  `sonner`/shim code removed.
- Extends the app's existing dark-mode mechanism (already partially applied) to the shared
  table/sheet components, the PrimeReact org chart, Settings + its four nested pages, and the
  Profile page. Found two extra, undocumented duplicate tabs implementations along the way and
  fixed those too rather than leaving them half-themed.
- Reworks the Profile page: surfaces real API fields (`personal_email`, `citizenship`,
  `employment_type`, `manager`, `counts`) that existed in the response but were never shown,
  replaces the profile-picture URL text input with a real file uploader (reusing the Assets
  module's existing multer-S3 middleware — no new upload infrastructure), and matches the
  layout convention already established by the employee detail sheet.

**Test plan**

- [ ] Toggle light/dark on every touched page, especially Settings → Roles/Timeoff (duplicate
      `SettingsTabs` fix) and the Org Chart (PrimeReact CSS-variable override).
- [ ] Trigger a few CRUD failures/successes across assets, recruitment, leave, and policies —
      confirm exactly one toast per action (no duplicates from the local + global handlers).
- [ ] Edit each self-editable profile field individually; confirm HR-owned fields stay
      read-only with no edit affordance.
- [ ] Upload a profile picture (including an oversized/non-image file for the failure path);
      confirm the preview appears immediately and the photo persists after reload.
- [ ] Confirm the manager link and the assets/leave/documents count tiles render correctly
      when present, and don't break when absent.

**Verification already done**

- `tsc --noEmit` clean on both `apps/hr` and `backend`.
- `next build` clean; `vitest run` 126/126 in `apps/hr` (one pre-existing, unrelated failure
  from a test importing an already-deleted page).
- Backend: full MOD-01 integration suite (43 tests) re-run after the profile-photo upload
  middleware change — all pass, including the field-set matrix and the `picture` field case.
- No browser automation was available this session — nothing above was visually
  screenshotted or clicked through in a real browser.

## Overall verification already run (this session)

- Frontend: `tsc --noEmit` clean, `next build` clean, `vitest run` 126/126 passing across all
  three parts (one pre-existing unrelated failure — a test importing an already-deleted
  `/leave/approvals` page — present before this work started).
- Backend: `tsc --noEmit` clean; ran the full MOD-01 integration suite (43 tests) after the
  Part 3 upload-middleware change specifically — all pass, including the picture field test.
- No browser automation was available this session, so nothing above was visually
  screenshotted or clicked through — that's the main gap for you to close in testing.
