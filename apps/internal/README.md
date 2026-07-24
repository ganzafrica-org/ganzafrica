# internal (payroll payslips)

> Being absorbed into `apps/hr` (see `docs/specs/modules/MOD-07-payroll-in-hr.md`), then retired.

## Payroll CSV data — do NOT commit

The `Payroll 2026-*.csv` files are **real salary data** and are gitignored
(`apps/internal/*.csv` in the root `.gitignore`). They are inputs to the payroll importer,
not source. Keep them in local/secure storage, not in the repo.

For automated tests, anonymized fixture copies (fake names/amounts, one per format) live in
`backend/tests/fixtures/payroll/`. Add fixtures there — never real data.

The four formats: format1 = Rwanda RWF, format2 = RWF/USD, format3 = Burkina Faso XOF,
format4 = international WOP/USD. Column mappings are in `backend/src/db/schema/payroll.ts`.
