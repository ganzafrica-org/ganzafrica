## Summary

<!-- What and why, in 2-4 sentences. Link the spec/ticket: docs/specs/... or docs/tickets/... -->

Spec/ticket:

## Changes

<!-- Bullet the notable changes. -->

## Testing

- [ ] Tests written first (TDD) per the spec's §6
- [ ] `pnpm turbo run lint test build --filter=<pkg>` green locally
- [ ] For DB changes: migration reviewed; `pnpm db:generate` produced exactly the intended SQL
- [ ] For UI changes: screenshots / recording attached below

## Checklist

- [ ] Branched off `dev` (not committed directly to `dev`)
- [ ] No secrets added to the repo
- [ ] Docs/spec updated if behavior changed
