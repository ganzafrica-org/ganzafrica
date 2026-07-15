# COLLEAGUE-XX: Title

> **Spec:** link to the source spec (tickets are cut from specs — the spec is the authority;
> the ticket scopes which slice of it to do now)
> **Depends on:** ticket/spec IDs
> **Branch:** `feat/<ticket-id>-<slug>` off `dev`
> **Estimated size:** S / M / L

## What you are building

Plain-language description of the outcome, 3–6 sentences. No design decisions left open.

## Where things are

- Exact file paths: backend routes/controllers/services/schema involved, frontend pages/
  components/services/hooks involved.
- What already exists and works, what is mock, what is broken (with the symptom).

## Steps

Ordered list. Each step names the file(s) to create/modify and what goes in them.
Schema/API/UI details are in the spec — reference the spec section number rather than
duplicating, but inline anything small enough to save a lookup.

## Tests to write first

Copied/scoped from the spec's §6 — only the cases this ticket covers.

## Acceptance criteria

- [ ] Checkbox list, each verifiable. PR is not done until all check.

## Coordination warnings

Files the other track may touch, migration ordering, anything requiring a heads-up
before merging.
