import sinon, { SinonSandbox } from "sinon";
import { describe, it, beforeEach, afterEach } from "mocha";
import { expect, createRequest } from "../helpers/http";
import { stubHrAuthDb } from "../helpers/auth";
import { IDS, VALID_DOCUMENT_BODY } from "../helpers/test-ids";
import * as documentService from "../../services/hr/document.service";
import * as jwt from "jsonwebtoken";
import { env } from "../../config";

const request = createRequest();

describe("HR System - Document Management", () => {
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

  describe("POST /api/hr/document", () => {
    it("should allow HR to create a document record", async () => {
      const createStub = sandbox.stub(documentService, "createDocument").resolves({
        id: IDS.document,
        document_name: "Employee Handbook",
      } as any);

      const res = await request
        .post("/api/hr/document")
        .set("Authorization", `Bearer ${hrToken}`)
        .send(VALID_DOCUMENT_BODY);

      expect(res.status).to.equal(201);
      expect(createStub.calledOnce).to.be.true;
    });
  });

  describe("GET /api/hr/document", () => {
    it("should list documents", async () => {
      const listStub = sandbox.stub(documentService, "listDocuments").resolves({
        data: [{ id: IDS.document, document_name: "D1" } as any],
        total: 1,
      });

      const res = await request
        .get("/api/hr/document")
        .set("Authorization", `Bearer ${hrToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an("array");
      expect(listStub.calledOnce).to.be.true;
    });
  });

  describe("GET /api/hr/document/:id", () => {
    it("should get document details", async () => {
      const getStub = sandbox.stub(documentService, "getDocument").resolves({
        id: IDS.document,
        document_name: "D1",
      } as any);

      const res = await request
        .get(`/api/hr/document/${IDS.document}`)
        .set("Authorization", `Bearer ${hrToken}`);

      expect(res.status).to.equal(200);
      expect(getStub.calledOnce).to.be.true;
    });
  });
});
