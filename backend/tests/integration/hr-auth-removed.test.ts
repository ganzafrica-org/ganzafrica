import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const SRC = path.resolve(__dirname, "../../src");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".ts")) out.push(full);
  }
  return out;
}

/**
 * The HR auth stack is retired (FND-07). These files legitimately still reference the retired
 * names: the schema definitions of the tables (kept until the DROP migration) and their relations.
 */
const ALLOWED = [
  path.join(SRC, "db", "schema", "hr", "employee.ts"),
  path.join(SRC, "db", "schema", "hr", "relations.ts"),
];

describe("HR auth stack is fully removed from source (FND-07)", () => {
  const files = walk(SRC).filter((f) => !ALLOWED.includes(f));

  it("no source references authenticateHr / enforceHrPasswordPolicy", () => {
    const offenders = files.filter((f) =>
      /authenticateHr|enforceHrPasswordPolicy/.test(fs.readFileSync(f, "utf-8")),
    );
    expect(offenders, offenders.map((f) => path.relative(SRC, f)).join(", ")).toHaveLength(0);
  });

  it("the deleted hr auth files no longer exist", () => {
    expect(fs.existsSync(path.join(SRC, "services", "hr", "hr.auth.service.ts"))).toBe(false);
    expect(fs.existsSync(path.join(SRC, "controllers", "hr", "hr.auth.controller.ts"))).toBe(false);
    expect(fs.existsSync(path.join(SRC, "routes", "hr", "auth.routes.ts"))).toBe(false);
    expect(fs.existsSync(path.join(SRC, "middlewares", "hr", "hr.auth.middleware.ts"))).toBe(false);
  });
});
