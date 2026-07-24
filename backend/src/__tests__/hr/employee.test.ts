import sinon, { SinonSandbox } from "sinon";
import { describe, it, beforeEach, afterEach } from "mocha";
import { expect, createRequest } from "../helpers/http";
import { stubHrAuthDb } from "../helpers/auth";
import { IDS } from "../helpers/test-ids";
import * as employeesService from "../../services/hr/employee.service";
import * as jwt from "jsonwebtoken";
import { env } from "../../config";
import { AppError } from "../../middlewares";

const request = createRequest();

describe("HR System - Employee Management", () => {
  let sandbox: SinonSandbox;
  let adminToken: string;
  let hrToken: string;
  let employeeToken: string;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    adminToken = jwt.sign({ id: IDS.admin, role: "IT", type: "access" }, env.JWT_SECRET);
    hrToken = jwt.sign({ id: IDS.hr, role: "HR", type: "access" }, env.JWT_SECRET);
    employeeToken = jwt.sign(
      { id: IDS.employee, role: "EMPLOYEE", type: "access" },
      env.JWT_SECRET,
    );

    stubHrAuthDb(sandbox, IDS.hr);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("POST /api/hr/employees", () => {
    it("should allow IT role to create an employee (Positive)", async () => {
      stubHrAuthDb(sandbox, IDS.admin);

      const createStub = sandbox.stub(employeesService, "createEmployee").resolves({
        id: IDS.otherEmployee,
        firstName: "New",
        lastName: "Employee",
        personalEmail: "new@example.com",
        role: "EMPLOYEE",
        status: "ACTIVE",
      } as any);

      const res = await request
        .post("/api/hr/employees")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "New",
          lastName: "Employee",
          personalEmail: "new@example.com",
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.firstName).to.equal("New");
      expect(createStub.calledOnce).to.be.true;
    });

    it("should return 403 for HR role creating an employee (Authorization)", async () => {
      stubHrAuthDb(sandbox, IDS.hr);

      const res = await request
        .post("/api/hr/employees")
        .set("Authorization", `Bearer ${hrToken}`)
        .send({
          firstName: "New",
          lastName: "Employee",
          personalEmail: "new@example.com",
        });

      expect(res.status).to.equal(403);
    });

    it("should return 400 for missing required fields (Negative)", async () => {
      stubHrAuthDb(sandbox, IDS.admin);

      const res = await request
        .post("/api/hr/employees")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          lastName: "Employee",
        });

      expect(res.status).to.equal(400);
    });
  });

  describe("GET /api/hr/employees", () => {
    it("should allow HR role to list employees (Positive)", async () => {
      stubHrAuthDb(sandbox, IDS.hr);

      const listStub = sandbox.stub(employeesService, "listEmployees").resolves({
        data: [{ id: IDS.employee, firstName: "E1" } as any],
        total: 1,
      });

      const res = await request.get("/api/hr/employees").set("Authorization", `Bearer ${hrToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an("array");
      expect(listStub.calledOnce).to.be.true;
    });

    it("should return 403 for EMPLOYEE role listing employees (Authorization)", async () => {
      stubHrAuthDb(sandbox, IDS.employee);

      const res = await request
        .get("/api/hr/employees")
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(res.status).to.equal(403);
    });
  });

  describe("GET /api/hr/employees/:id", () => {
    it("should allow HR to get any employee (Positive)", async () => {
      stubHrAuthDb(sandbox, IDS.hr);

      const getStub = sandbox.stub(employeesService, "getEmployeeById").resolves({
        id: IDS.employee,
        firstName: "Target",
      } as any);

      const res = await request
        .get(`/api/hr/employees/${IDS.employee}`)
        .set("Authorization", `Bearer ${hrToken}`);

      expect(res.status).to.equal(200);
      expect(getStub.calledOnce).to.be.true;
    });

    it("should return 404 if employee not found (Edge Case)", async () => {
      stubHrAuthDb(sandbox, IDS.hr);

      sandbox.stub(employeesService, "getEmployeeById").rejects(new AppError("Not Found", 404));

      const res = await request
        .get(`/api/hr/employees/${IDS.employee}`)
        .set("Authorization", `Bearer ${hrToken}`);

      expect(res.status).to.equal(404);
    });
  });

  describe("PATCH /api/hr/employees/:id", () => {
    it("should allow employee to update their own profile (Positive)", async () => {
      const myToken = jwt.sign(
        { id: IDS.employee, role: "EMPLOYEE", type: "access" },
        env.JWT_SECRET,
      );
      stubHrAuthDb(sandbox, IDS.employee);

      const updateStub = sandbox.stub(employeesService, "updateEmployee").resolves({
        id: IDS.employee,
        firstName: "Updated",
      } as any);

      const res = await request
        .patch(`/api/hr/employees/${IDS.employee}`)
        .set("Authorization", `Bearer ${myToken}`)
        .send({ firstName: "Updated" });

      expect(res.status).to.equal(200);
      expect(updateStub.calledOnce).to.be.true;
    });

    it("should return 403 if employee tries to update someone else's profile (Authorization)", async () => {
      const myToken = jwt.sign(
        { id: IDS.employee, role: "EMPLOYEE", type: "access" },
        env.JWT_SECRET,
      );
      stubHrAuthDb(sandbox, IDS.employee);

      const res = await request
        .patch(`/api/hr/employees/${IDS.otherEmployee}`)
        .set("Authorization", `Bearer ${myToken}`)
        .send({ firstName: "Stolen" });

      expect(res.status).to.equal(403);
    });
  });

  describe("DELETE /api/hr/employees/:id", () => {
    it("should allow HR to delete an employee (Positive)", async () => {
      stubHrAuthDb(sandbox, IDS.hr);

      const deleteStub = sandbox.stub(employeesService, "softDeleteEmployee").resolves({} as any);

      const res = await request
        .delete(`/api/hr/employees/${IDS.employee}`)
        .set("Authorization", `Bearer ${hrToken}`);

      expect(res.status).to.equal(200);
      expect(deleteStub.calledOnce).to.be.true;
    });

    it("should return 403 for IT role deleting an employee (Authorization)", async () => {
      stubHrAuthDb(sandbox, IDS.admin);

      const res = await request
        .delete(`/api/hr/employees/${IDS.employee}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).to.equal(403);
    });
  });

  describe("Authentication Boundaries", () => {
    it("should return 401 if no token provided", async () => {
      const res = await request.get("/api/hr/employees");

      expect(res.status).to.equal(401);
    });

    it("should return 401 for invalid token", async () => {
      const res = await request
        .get("/api/hr/employees")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).to.equal(401);
    });
  });
});
