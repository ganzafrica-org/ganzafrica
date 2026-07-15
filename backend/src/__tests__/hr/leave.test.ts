import sinon, { SinonSandbox } from "sinon";
import { describe, it, beforeEach, afterEach } from "mocha";
import { expect, createRequest } from "../helpers/http";
import { stubHrAuthDb } from "../helpers/auth";
import { IDS } from "../helpers/test-ids";
import * as leaveService from "../../services/hr/leave.service";
import * as jwt from "jsonwebtoken";
import { env } from "../../config";

const request = createRequest();

describe("HR System - Leave Management", () => {
  let sandbox: SinonSandbox;
  let hrToken: string;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    hrToken = jwt.sign({ id: IDS.hr, role: "HR", type: "access" }, env.JWT_SECRET);
    stubHrAuthDb(sandbox, IDS.hr);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("GET /api/hr/leave", () => {
    it("should allow HR to list all leaves", async () => {
      const listStub = sandbox
        .stub(leaveService, "listAllLeaves")
        .resolves([{ id: IDS.leave, status: "PENDING" } as any]);

      const res = await request.get("/api/hr/leave").set("Authorization", `Bearer ${hrToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(listStub.calledOnce).to.be.true;
    });
  });

  describe("POST /api/hr/leave/:id/approve", () => {
    it("should allow HR to approve leave", async () => {
      const approveStub = sandbox.stub(leaveService, "approveLeave").resolves({
        id: IDS.leave,
        status: "APPROVED",
      } as any);

      const res = await request
        .post(`/api/hr/leave/${IDS.leave}/approve`)
        .set("Authorization", `Bearer ${hrToken}`);

      expect(res.status).to.equal(200);
      expect(approveStub.calledOnce).to.be.true;
    });
  });

  describe("POST /api/hr/leave/:id/reject", () => {
    it("should allow HR to reject leave", async () => {
      const rejectStub = sandbox.stub(leaveService, "rejectLeave").resolves({
        id: IDS.leave,
        status: "REJECTED",
      } as any);

      const res = await request
        .post(`/api/hr/leave/${IDS.leave}/reject`)
        .set("Authorization", `Bearer ${hrToken}`);

      expect(res.status).to.equal(200);
      expect(rejectStub.calledOnce).to.be.true;
    });
  });
});
