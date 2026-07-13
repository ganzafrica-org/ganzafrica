import sinon, { SinonSandbox } from "sinon";
import { describe, it, beforeEach, afterEach } from "mocha";
import { expect, createRequest } from "../helpers/http";
import { stubHrAuthDb } from "../helpers/auth";
import { IDS, VALID_CONTRACT_BODY } from "../helpers/test-ids";
import * as contractService from "../../services/hr/contract.service";
import * as jwt from "jsonwebtoken";
import { env } from "../../config";

const request = createRequest();

describe("HR System - Contract Management", () => {
  let sandbox: SinonSandbox;
  let hrToken: string;
  let employeeToken: string;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    hrToken = jwt.sign({ id: IDS.hr, role: "HR", type: "access" }, env.JWT_SECRET);
    employeeToken = jwt.sign({ id: IDS.employee, role: "EMPLOYEE", type: "access" }, env.JWT_SECRET);
    stubHrAuthDb(sandbox, IDS.hr);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("POST /api/hr/employees/:employeeId/contracts", () => {
    it("should allow HR to create a contract", async () => {
      const createStub = sandbox.stub(contractService, "createContract").resolves({
        id: IDS.contract,
        jobTitle: "Software Engineer",
        status: "ACTIVE",
      } as any);

      const res = await request
        .post(`/api/hr/employees/${IDS.employee}/contracts`)
        .set("Authorization", `Bearer ${hrToken}`)
        .send(VALID_CONTRACT_BODY);

      expect(res.status).to.equal(201);
      expect(createStub.calledOnce).to.be.true;
    });

    it("should return 403 for EMPLOYEE role", async () => {
      stubHrAuthDb(sandbox, IDS.employee);

      const res = await request
        .post(`/api/hr/employees/${IDS.employee}/contracts`)
        .set("Authorization", `Bearer ${employeeToken}`)
        .send(VALID_CONTRACT_BODY);

      expect(res.status).to.equal(403);
    });
  });

  describe("GET /api/hr/employees/:employeeId/contracts", () => {
    it("should allow HR to list contracts", async () => {
      const listStub = sandbox.stub(contractService, "listContractsByEmployee").resolves([
        { id: IDS.contract, jobTitle: "Software Engineer" } as any,
      ]);

      const res = await request
        .get(`/api/hr/employees/${IDS.employee}/contracts`)
        .set("Authorization", `Bearer ${hrToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(listStub.calledOnce).to.be.true;
    });
  });

  describe("GET /api/hr/employees/:employeeId/contracts/:contractId", () => {
    it("should allow HR to get contract details", async () => {
      const getStub = sandbox.stub(contractService, "getContractById").resolves({
        id: IDS.contract,
        jobTitle: "Software Engineer",
      } as any);

      const res = await request
        .get(`/api/hr/employees/${IDS.employee}/contracts/${IDS.contract}`)
        .set("Authorization", `Bearer ${hrToken}`);

      expect(res.status).to.equal(200);
      expect(getStub.calledOnce).to.be.true;
    });
  });

  describe("PATCH /api/hr/employees/:employeeId/contracts/:contractId", () => {
    it("should allow HR to update a contract", async () => {
      const updateStub = sandbox.stub(contractService, "updateContract").resolves({
        id: IDS.contract,
        status: "TERMINATED",
      } as any);

      const res = await request
        .patch(`/api/hr/employees/${IDS.employee}/contracts/${IDS.contract}`)
        .set("Authorization", `Bearer ${hrToken}`)
        .send({ status: "TERMINATED" });

      expect(res.status).to.equal(200);
      expect(updateStub.calledOnce).to.be.true;
    });
  });

  describe("DELETE /api/hr/employees/:employeeId/contracts/:contractId", () => {
    it("should allow HR to delete a contract", async () => {
      const deleteStub = sandbox.stub(contractService, "deleteContract").resolves({} as any);

      const res = await request
        .delete(`/api/hr/employees/${IDS.employee}/contracts/${IDS.contract}`)
        .set("Authorization", `Bearer ${hrToken}`);

      expect(res.status).to.equal(200);
      expect(deleteStub.calledOnce).to.be.true;
    });
  });
});
