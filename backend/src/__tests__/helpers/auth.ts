import type { SinonSandbox, SinonStub } from "sinon";
import * as jwt from "jsonwebtoken";

type HrUserRow = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  work_email?: string;
  personal_email?: string;
};

const HR_USERS: Record<string, HrUserRow> = {
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa": {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    first_name: "Admin",
    last_name: "User",
    role: "IT",
    status: "ACTIVE",
    personal_email: "admin@example.com",
  },
  "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb": {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    first_name: "HR",
    last_name: "User",
    role: "HR",
    status: "ACTIVE",
    personal_email: "hr@example.com",
  },
  "cccccccc-cccc-cccc-cccc-cccccccccccc": {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    first_name: "Employee",
    last_name: "User",
    role: "EMPLOYEE",
    status: "ACTIVE",
    personal_email: "emp@example.com",
  },
  "dddddddd-dddd-dddd-dddd-dddddddddddd": {
    id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    first_name: "Other",
    last_name: "Employee",
    role: "EMPLOYEE",
    status: "ACTIVE",
    personal_email: "other@example.com",
  },
};

function hrUserForId(userId: string): HrUserRow {
  return (
    HR_USERS[userId] ?? {
      id: userId,
      first_name: "Test",
      last_name: "User",
      role: "HR",
      status: "ACTIVE",
      personal_email: "test@example.com",
    }
  );
}

function getOrCreateSelectStub(sandbox: SinonSandbox, db: { select: unknown }): SinonStub {
  const existing = db.select;
  if (
    typeof existing === "function" &&
    "restore" in existing &&
    typeof (existing as SinonStub).restore === "function"
  ) {
    return existing as SinonStub;
  }

  return sandbox.stub(db, "select");
}

export function stubHrAuthDb(
  sandbox: SinonSandbox,
  defaultUserId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
) {
  const { db } = require("../../db/client");
  const selectStub = getOrCreateSelectStub(sandbox, db);

  selectStub.callsFake(() => ({
    from: sandbox.stub().returns({
      where: sandbox.stub().returns({
        limit: sandbox.stub().callsFake(async () => [hrUserForId(defaultUserId)]),
      }),
    }),
  }));
}

export function stubHrAuthDbForToken(sandbox: SinonSandbox, token: string) {
  const decoded = jwt.decode(token) as { id?: string } | null;
  stubHrAuthDb(sandbox, decoded?.id ?? "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
}

export function stubPortalAuth(sandbox: SinonSandbox) {
  const authService = require("../../services/auth.service");
  const { db } = require("../../db/client");

  sandbox.stub(authService, "verifyToken").resolves({ id: 1, jti: "test-session" });

  const userRow = {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    role_id: 1,
    is_active: true,
    email_verified: true,
  };
  const roleRow = { id: 1, name: "admin" };
  const additionalRoles = [{ role_name: "admin" }];

  let selectCall = 0;
  const selectStub = getOrCreateSelectStub(sandbox, db);

  selectStub.callsFake((selection?: Record<string, unknown>) => {
    selectCall += 1;

    if (selection && "count" in selection) {
      return {
        from: () => ({
          where: async () => [{ count: 0 }],
        }),
      };
    }

    if (selection && "role_name" in selection) {
      return {
        from: () => ({
          innerJoin: () => ({
            where: async () => additionalRoles,
          }),
        }),
      };
    }

    if (selection && "payroll" in selection) {
      return {
        from: () => ({
          leftJoin: () => ({
            where: () => ({
              orderBy: () => ({
                limit: () => ({
                  offset: async () => [],
                }),
              }),
            }),
          }),
        }),
      };
    }

    if (selectCall === 2) {
      return {
        from: () => ({
          where: async () => [roleRow],
        }),
      };
    }

    return {
      from: () => ({
        where: async () => [userRow],
      }),
    };
  });
}
