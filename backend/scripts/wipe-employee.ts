/**
 * Deletes an employee (and everything that hangs off them) by email, for repeatedly recreating
 * the same test employee during manual invite-email testing. Looks the employee up by
 * personal_email OR their linked user's login email, so it works whichever one you pass.
 *
 * Deletes, in FK-safe order: password reset/verification/2FA tokens, sessions, signature
 * requests+events and documents tied to their contracts, then the employee row (which cascades to
 * hr_contracts, process_instances, process_tasks, hr_leaves, etc. per the schema's ON DELETE
 * CASCADE), then the linked user account (user_roles cascades).
 *
 * Usage:  DATABASE_URL=... pnpm db:wipe-employee ntirukelly@gmail.com
 */
import { Pool } from "pg";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: pnpm db:wipe-employee <email>");
  process.exit(1);
}

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try {
    // Two separate lookups (not one join) so an orphan on either side — a users row left over
    // from a partial wipe, or an employee row whose user_id is null — still gets found and
    // cleaned up, not just the common case where both exist and agree.
    const { rows: employeeRows } = await client.query(
      `SELECT id, user_id FROM employees WHERE personal_email = $1`,
      [email],
    );
    const { rows: userRows } = await client.query(`SELECT id FROM users WHERE email = $1`, [email]);

    const employeeId: string | undefined = employeeRows[0]?.id;
    const userId: number | undefined = employeeRows[0]?.user_id ?? userRows[0]?.id;

    if (!employeeId && !userId) {
      console.log(`Nothing found for ${email} — nothing to do.`);
      return;
    }

    console.log(
      `Wiping employee ${employeeId ?? "none"} (user ${userId ?? "none"}) for ${email}...`,
    );

    await client.query("BEGIN");

    if (userId) {
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
    }

    if (employeeId) {
      // hr_documents.contract_id has no cascade, so contract-linked documents must go first.
      await client.query(
        `DELETE FROM hr_documents WHERE contract_id IN (
           SELECT id FROM hr_contracts WHERE employee_ref_id = $1
         )`,
        [employeeId],
      );

      // Cascades to hr_contracts, process_instances, process_tasks, hr_leaves, hr_leave_balances,
      // hr_policy_acknowledgements, org_backfill_unresolved, hr_helpdesk_tickets (submitted_by).
      await client.query(`DELETE FROM employees WHERE id = $1`, [employeeId]);
    }

    if (userId) {
      // users has a prevent_user_delete_trigger that no-ops any DELETE (the app's normal path is
      // deactivation, not deletion). This script's whole point is a clean slate for re-testing the
      // invite flow, so it deliberately disables that guard for this one statement, in this one
      // transaction, then restores it. user_roles cascades; auth_handoff_codes cascades.
      await client.query(`ALTER TABLE users DISABLE TRIGGER prevent_user_delete_trigger`);
      await client.query(`DELETE FROM users WHERE id = $1`, [userId]);
      await client.query(`ALTER TABLE users ENABLE TRIGGER prevent_user_delete_trigger`);
    }

    await client.query("COMMIT");
    console.log("Done.");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("\nwipe-employee failed:", err.message ?? err);
  process.exit(1);
});
