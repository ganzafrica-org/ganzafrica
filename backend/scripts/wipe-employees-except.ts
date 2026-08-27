/**
 * Deletes every employee EXCEPT the ones in the keep-list, for resetting a dev/test DB back to
 * just a handful of known accounts. Reuses (and extends) the exact FK-safe deletion order from
 * wipe-employee.ts, one employee at a time, each in its own transaction — so if a wipe fails on
 * one employee, the ones already done stay deleted rather than the whole run rolling back.
 *
 * Beyond what wipe-employee.ts handles (that script only ever targeted a single freshly-created
 * test employee, which never has history hanging off it in other people's records), this also
 * clears RESTRICT-constrained references an employee can leave in OTHER rows just by having used
 * the app: authored documents/policies (created_by_employee_id — nulled, the row itself is kept),
 * requested asset maintenance (requester_employee_id — nulled), and asset-assignment history
 * (employee_id is NOT NULL — those history rows are deleted, matching hr_assets' own
 * assigned_to_employee_id ON DELETE SET NULL for the current-holder field).
 *
 * Defaults to keeping the three seed-test-users.ts accounts. Pass emails to override the
 * keep-list entirely.
 *
 * Refuses to delete anything without --yes — without it, this only prints who WOULD be deleted.
 *
 * Usage:
 *   DATABASE_URL=... pnpm db:wipe-employees-except                        # dry run, default keep-list
 *   DATABASE_URL=... pnpm db:wipe-employees-except --yes                  # delete, default keep-list
 *   DATABASE_URL=... pnpm db:wipe-employees-except --yes a@x.com b@x.com  # delete, custom keep-list
 */
import { Pool, type PoolClient } from "pg";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const DEFAULT_KEEP = ["hr@test.local", "employee@test.local", "admin@test.local"];

const args = process.argv.slice(2);
const yes = args.includes("--yes");
const emailArgs = args.filter((a) => a !== "--yes");
const keepEmails = emailArgs.length ? emailArgs : DEFAULT_KEEP;

async function wipeOne(client: PoolClient, employeeId: string, userId: number) {
  await client.query(
    `DELETE FROM signature_events WHERE request_id IN (
       SELECT id FROM signature_requests
       WHERE (ref_kind = 'contract' AND ref_id IN (SELECT id::text FROM hr_contracts WHERE employee_ref_id = $1))
          OR signer_user_id = $2
     )`,
    [employeeId, userId],
  );
  await client.query(
    `DELETE FROM signature_requests
     WHERE (ref_kind = 'contract' AND ref_id IN (SELECT id::text FROM hr_contracts WHERE employee_ref_id = $1))
        OR signer_user_id = $2`,
    [employeeId, userId],
  );
  await client.query(`DELETE FROM password_reset_tokens WHERE user_id = $1`, [userId]);
  await client.query(`DELETE FROM verification_tokens WHERE user_id = $1`, [userId]);
  await client.query(`DELETE FROM two_factor_temp_tokens WHERE user_id = $1`, [userId]);
  await client.query(`DELETE FROM two_factor_credentials WHERE user_id = $1`, [userId]);
  await client.query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
  // Not this employee's own — someone else's task they were assigned/completed as a reviewer.
  // Unassign rather than delete so we don't touch another employee's onboarding record.
  await client.query(
    `UPDATE process_tasks SET assignee_user_id = NULL WHERE assignee_user_id = $1`,
    [userId],
  );
  await client.query(`UPDATE process_tasks SET completed_by = NULL WHERE completed_by = $1`, [
    userId,
  ]);

  // RESTRICT references this employee can leave in OTHER people's records just by having used
  // the app — must be cleared before the employees row can be deleted. Nulled (not deleted): the
  // authored/requested row itself belongs to someone else's history, not this employee's.
  await client.query(
    `UPDATE hr_documents SET created_by_employee_id = NULL WHERE created_by_employee_id = $1`,
    [employeeId],
  );
  await client.query(
    `UPDATE hr_policies SET created_by_employee_id = NULL WHERE created_by_employee_id = $1`,
    [employeeId],
  );
  await client.query(
    `UPDATE hr_asset_maintenance SET requester_employee_id = NULL WHERE requester_employee_id = $1`,
    [employeeId],
  );
  // employee_id here is NOT NULL (append-only assignment-history timeline) — can't null it, so
  // the history rows go. The denormalized current-holder field on hr_assets itself is unaffected
  // (ON DELETE SET NULL, handled automatically by the employees delete below).
  await client.query(`DELETE FROM hr_asset_assignments WHERE employee_id = $1`, [employeeId]);

  // hr_documents.contract_id has no cascade, so contract-linked documents must go before the
  // employee's own contracts get cascade-deleted.
  await client.query(
    `DELETE FROM hr_documents WHERE contract_id IN (
       SELECT id FROM hr_contracts WHERE employee_ref_id = $1
     )`,
    [employeeId],
  );

  // Cascades to hr_contracts, process_instances, process_tasks, hr_leaves, hr_leave_balances,
  // hr_policy_acknowledgements, hr_helpdesk_tickets (submitted_by); sets manager_id/reviewed_by/
  // assigned_to fields on other rows to NULL, per each FK's own onDelete rule.
  await client.query(`DELETE FROM employees WHERE id = $1`, [employeeId]);

  // users has a prevent_user_delete_trigger that no-ops any DELETE (the app's normal path is
  // deactivation, not deletion). This script's whole point is a clean reset, so it deliberately
  // disables that guard for this one statement, in this one transaction, then restores it.
  // user_roles cascades; auth_handoff_codes cascades.
  await client.query(`ALTER TABLE users DISABLE TRIGGER prevent_user_delete_trigger`);
  await client.query(`DELETE FROM users WHERE id = $1`, [userId]);
  await client.query(`ALTER TABLE users ENABLE TRIGGER prevent_user_delete_trigger`);
}

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try {
    const { rows: targets } = await client.query<{
      id: string;
      user_id: number;
      login_email: string;
      first_name: string;
      last_name: string;
    }>(
      `SELECT e.id, e.user_id, u.email AS login_email, e.first_name, e.last_name
       FROM employees e
       JOIN users u ON u.id = e.user_id
       WHERE u.email <> ALL($1::text[])
         AND (e.personal_email IS NULL OR e.personal_email <> ALL($1::text[]))`,
      [keepEmails],
    );

    console.log(`Keep-list: ${keepEmails.join(", ")}`);

    if (!targets.length) {
      console.log(`\nNothing to do — no employees outside the keep-list.`);
      return;
    }

    console.log(`\n${yes ? "Deleting" : "Would delete"} ${targets.length} employee(s):`);
    for (const t of targets) {
      console.log(`  - ${t.first_name} ${t.last_name} <${t.login_email}> (employee ${t.id})`);
    }

    if (!yes) {
      console.log(`\nDry run only — re-run with --yes to actually delete.`);
      return;
    }

    let failed = 0;
    for (const t of targets) {
      await client.query("BEGIN");
      try {
        await wipeOne(client, t.id, t.user_id);
        await client.query("COMMIT");
        console.log(`Wiped ${t.first_name} ${t.last_name} <${t.login_email}>`);
      } catch (err) {
        await client.query("ROLLBACK");
        failed++;
        console.error(`Failed to wipe ${t.login_email}:`, (err as Error).message);
      }
    }

    console.log(`\nDone. ${targets.length - failed} wiped, ${failed} failed.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("\nwipe-employees-except failed:", err.message ?? err);
  process.exit(1);
});
