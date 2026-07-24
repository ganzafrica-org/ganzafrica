# Quarantined legacy HR tests

These mocha + sinon + chai tests mock the drizzle query chain and the RETIRED HR auth
(`hr_users`, `role: "HR"` JWTs). They are excluded from the vitest run (`vitest.config.ts`
→ `exclude`).

Do not port them mechanically. They are rewritten as real-DB integration tests (vitest +
supertest + `loginAs`, per docs/architecture/testing-strategy.md) when FND-05/07 replace the
HR auth and the module specs (MOD-04..08) are implemented. Kept here only to preserve the
originally-intended test cases as a reference.
