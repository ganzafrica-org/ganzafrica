import sinon, { SinonSandbox } from "sinon";
import { describe, it, beforeEach, afterEach } from "mocha";
import { expect, createRequest } from "../helpers/http";
import { stubPortalAuth } from "../helpers/auth";
import * as payrollService from "../../services/hr/payroll.service";
import * as jwt from "jsonwebtoken";
import { env } from "../../config";

const request = createRequest();

describe("HR System - Payroll Management", () => {
  let sandbox: SinonSandbox;
  let adminToken: string;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    adminToken = jwt.sign({ id: "1", type: "access" }, env.JWT_SECRET);
    stubPortalAuth(sandbox);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("GET /api/payroll", () => {
    it("should allow admin to list payrolls", async () => {
      const listStub = sandbox.stub(payrollService, "getPayrolls").resolves({
        data: [{ id: 1, name: "User 1" } as any],
        pagination: { page: 1, limit: 20, total: 1, total_pages: 1 },
      });

      const res = await request.get("/api/payroll").set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an("array");
      expect(listStub.calledOnce).to.be.true;
    });
  });

  describe("POST /api/payroll", () => {
    it("should allow admin to create payroll records", async () => {
      const createStub = sandbox.stub(payrollService, "createPayroll").resolves({
        id: 1,
        name: "User 1",
      } as any);

      const res = await request
        .post("/api/payroll")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          payrolls: [{ name: "User 1", basic_salary: "1000", payroll_period: "2024-01" }],
        });

      expect(res.status).to.equal(201);
      expect(createStub.calledOnce).to.be.true;
    });
  });

  describe("GET /api/payroll/:id", () => {
    it("should get payroll details", async () => {
      const getStub = sandbox.stub(payrollService, "getPayrollById").resolves({
        id: 1,
        name: "User 1",
      } as any);

      const res = await request.get("/api/payroll/1").set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(getStub.calledOnce).to.be.true;
    });
  });
});
