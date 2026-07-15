import sinon, { SinonSandbox } from "sinon";
import { describe, it, beforeEach, afterEach } from "mocha";
import { expect, createRequest } from "../helpers/http";
import { stubHrAuthDb } from "../helpers/auth";
import { IDS, VALID_ASSET_BODY, VALID_MAINTENANCE_BODY } from "../helpers/test-ids";
import * as assetsService from "../../services/hr/assets.service";
import * as jwt from "jsonwebtoken";
import { env } from "../../config";

const request = createRequest();

describe("HR System - Asset Management", () => {
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

  describe("POST /api/hr/assets", () => {
    it("should allow HR to create an asset", async () => {
      const createStub = sandbox.stub(assetsService, "createAsset").resolves({
        id: IDS.asset,
        deviceName: "Laptop",
        serialNumber: "SN123",
      } as any);

      const res = await request
        .post("/api/hr/assets")
        .set("Authorization", `Bearer ${hrToken}`)
        .send(VALID_ASSET_BODY);

      expect(res.status).to.equal(201);
      expect(createStub.calledOnce).to.be.true;
    });
  });

  describe("GET /api/hr/assets", () => {
    it("should allow HR to list assets", async () => {
      const listStub = sandbox
        .stub(assetsService, "listAssets")
        .resolves([{ id: IDS.asset, deviceName: "Laptop" } as any]);

      const res = await request.get("/api/hr/assets").set("Authorization", `Bearer ${hrToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an("array");
      expect(listStub.calledOnce).to.be.true;
    });
  });

  describe("GET /api/hr/assets/categories", () => {
    it("should allow HR to list categories", async () => {
      const listStub = sandbox
        .stub(assetsService, "listAssetCategories")
        .resolves([{ id: IDS.category, name: "Electronics" } as any]);

      const res = await request
        .get("/api/hr/assets/categories")
        .set("Authorization", `Bearer ${hrToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an("array");
      expect(listStub.calledOnce).to.be.true;
    });
  });

  describe("POST /api/hr/assets/maintenance", () => {
    it("should allow HR to record maintenance", async () => {
      const createStub = sandbox.stub(assetsService, "createAssetMaintenance").resolves({
        id: IDS.maintenance,
        assetId: IDS.asset,
      } as any);

      const res = await request
        .post("/api/hr/assets/maintenance")
        .set("Authorization", `Bearer ${hrToken}`)
        .send(VALID_MAINTENANCE_BODY);

      expect(res.status).to.equal(201);
      expect(createStub.calledOnce).to.be.true;
    });
  });
});
