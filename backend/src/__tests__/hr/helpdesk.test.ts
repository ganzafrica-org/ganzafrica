import sinon, { SinonSandbox } from "sinon";
import { describe, it, beforeEach, afterEach } from "mocha";
import { expect, createRequest } from "../helpers/http";
import { stubHrAuthDb } from "../helpers/auth";
import { IDS } from "../helpers/test-ids";
import * as helpdeskService from "../../services/hr/helpdesk.service";
import * as jwt from "jsonwebtoken";
import { env } from "../../config";

const request = createRequest();

describe("HR System - Helpdesk Management", () => {
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

  describe("POST /api/hr/helpdesk", () => {
    it("should allow creating a helpdesk ticket", async () => {
      const createStub = sandbox.stub(helpdeskService, "createTicket").resolves({
        id: IDS.ticket,
        title: "IT Issue",
        status: "OPEN",
      } as any);

      const res = await request
        .post("/api/hr/helpdesk")
        .set("Authorization", `Bearer ${hrToken}`)
        .send({
          title: "IT Issue",
          description: "Cannot connect to VPN",
          submittedById: IDS.hr,
        });

      expect(res.status).to.equal(201);
      expect(createStub.calledOnce).to.be.true;
    });
  });

  describe("GET /api/hr/helpdesk", () => {
    it("should allow listing tickets", async () => {
      const listStub = sandbox.stub(helpdeskService, "listTickets").resolves([
        { id: IDS.ticket, title: "T1" } as any,
      ]);

      const res = await request
        .get("/api/hr/helpdesk")
        .set("Authorization", `Bearer ${hrToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(listStub.calledOnce).to.be.true;
    });
  });

  describe("PATCH /api/hr/helpdesk/:id/answer", () => {
    it("should allow answering a ticket", async () => {
      const answerStub = sandbox.stub(helpdeskService, "answerTicket").resolves({
        id: IDS.ticket,
        status: "RESOLVED",
        answer: "Fixed",
      } as any);

      const res = await request
        .patch(`/api/hr/helpdesk/${IDS.ticket}/answer`)
        .set("Authorization", `Bearer ${hrToken}`)
        .send({
          answer: "Fixed",
        });

      expect(res.status).to.equal(200);
      expect(answerStub.calledOnce).to.be.true;
    });
  });
});
