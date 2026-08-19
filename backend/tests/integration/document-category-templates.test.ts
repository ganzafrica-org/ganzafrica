/**
 * Document category templates — additive, standalone v1 entity for
 * "Add the option to create a document template" (Things-to-work-on.md). Lets HR design how
 * documents in a category should look (name + one of green/yellow/blue/orange + simple
 * branding fields), decoupled from hr_documents.category and its fixed enum.
 *
 * Same permission as the rest of the documents module: documents:read / documents:manage.
 */
import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import app from "../../src/app";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares/auth.middleware";
import { db } from "../../src/db/client";
import { hr_document_category_templates } from "../../src/db/schema";
import { eq } from "drizzle-orm";

const API = "/api/hr/document-category-templates";

async function loginAsManager() {
  return loginAs("hr");
}

async function loginAsEmployee() {
  return loginAs("employee");
}

describe("document category templates", () => {
  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    await grant("hr", "documents", "manage");
    await grant("hr", "documents", "read");
    await grant("employee", "documents", "read");
  });

  describe("create", () => {
    it("lets HR create a category template with a valid color", async () => {
      const { agent } = await loginAsManager();

      const res = await agent.post(API).send({
        name: "Onboarding Materials",
        color: "green",
        header_text: "Welcome to GanzAfrica",
        description: "Used for all onboarding paperwork",
      });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe("Onboarding Materials");
      expect(res.body.data.color).toBe("green");

      const [row] = await db
        .select()
        .from(hr_document_category_templates)
        .where(eq(hr_document_category_templates.id, res.body.data.id));
      expect(row).toBeDefined();
      expect(row.color).toBe("green");
    });

    for (const color of ["green", "yellow", "blue", "orange"] as const) {
      it(`accepts color "${color}"`, async () => {
        const { agent } = await loginAsManager();
        const res = await agent.post(API).send({ name: `Category ${color}`, color });
        expect(res.status).toBe(201);
        expect(res.body.data.color).toBe(color);
      });
    }

    it("rejects a color outside the four allowed values", async () => {
      const { agent } = await loginAsManager();
      const res = await agent.post(API).send({ name: "Bad Color", color: "purple" });
      expect(res.status).toBe(400);
    });

    it("rejects a missing name", async () => {
      const { agent } = await loginAsManager();
      const res = await agent.post(API).send({ color: "green" });
      expect(res.status).toBe(400);
    });

    it("409s creating a second template with a duplicate name", async () => {
      const { agent } = await loginAsManager();
      await agent.post(API).send({ name: "Compliance & Legal", color: "blue" });

      const res = await agent.post(API).send({ name: "Compliance & Legal", color: "orange" });
      expect(res.status).toBe(409);
    });

    it("403s an employee creating a template (documents:manage required)", async () => {
      const { agent } = await loginAsEmployee();
      const res = await agent.post(API).send({ name: "Employee Attempt", color: "green" });
      expect(res.status).toBe(403);
    });

    it("requires authentication", async () => {
      const res = await supertest(app).post(API).send({ name: "No Auth", color: "green" });
      expect(res.status).toBe(401);
    });
  });

  describe("list / get", () => {
    it("lists templates, alphabetically by name", async () => {
      const { agent } = await loginAsManager();
      await agent.post(API).send({ name: "Zeta Category", color: "orange" });
      await agent.post(API).send({ name: "Alpha Category", color: "blue" });

      const res = await agent.get(API);
      expect(res.status).toBe(200);
      expect(res.body.data.map((t: { name: string }) => t.name)).toEqual([
        "Alpha Category",
        "Zeta Category",
      ]);
    });

    it("an employee (documents:read) can list and get a template", async () => {
      const { agent: hrAgent } = await loginAsManager();
      const created = await hrAgent.post(API).send({ name: "Readable", color: "yellow" });

      const { agent: employeeAgent } = await loginAsEmployee();
      const listRes = await employeeAgent.get(API);
      expect(listRes.status).toBe(200);

      const getRes = await employeeAgent.get(`${API}/${created.body.data.id}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.name).toBe("Readable");
    });

    it("404s getting a nonexistent template", async () => {
      const { agent } = await loginAsManager();
      const res = await agent.get(`${API}/00000000-0000-0000-0000-000000000000`);
      expect(res.status).toBe(404);
    });
  });

  describe("update", () => {
    it("lets HR update the color and branding fields", async () => {
      const { agent } = await loginAsManager();
      const created = await agent.post(API).send({ name: "Forms", color: "blue" });

      const res = await agent
        .patch(`${API}/${created.body.data.id}`)
        .send({ color: "orange", header_text: "Updated header" });

      expect(res.status).toBe(200);
      expect(res.body.data.color).toBe("orange");
      expect(res.body.data.header_text).toBe("Updated header");
    });

    it("409s renaming a template to another template's existing name", async () => {
      const { agent } = await loginAsManager();
      await agent.post(API).send({ name: "First", color: "green" });
      const second = await agent.post(API).send({ name: "Second", color: "blue" });

      const res = await agent.patch(`${API}/${second.body.data.id}`).send({ name: "First" });
      expect(res.status).toBe(409);
    });

    it("403s an employee updating a template", async () => {
      const { agent: hrAgent } = await loginAsManager();
      const created = await hrAgent.post(API).send({ name: "Locked", color: "green" });

      const { agent: employeeAgent } = await loginAsEmployee();
      const res = await employeeAgent
        .patch(`${API}/${created.body.data.id}`)
        .send({ color: "blue" });
      expect(res.status).toBe(403);
    });
  });

  describe("delete", () => {
    it("lets HR delete a template", async () => {
      const { agent } = await loginAsManager();
      const created = await agent.post(API).send({ name: "Temp", color: "yellow" });

      const res = await agent.delete(`${API}/${created.body.data.id}`);
      expect(res.status).toBe(200);

      const rows = await db
        .select()
        .from(hr_document_category_templates)
        .where(eq(hr_document_category_templates.id, created.body.data.id));
      expect(rows).toHaveLength(0);
    });

    it("404s deleting a nonexistent template", async () => {
      const { agent } = await loginAsManager();
      const res = await agent.delete(`${API}/00000000-0000-0000-0000-000000000000`);
      expect(res.status).toBe(404);
    });

    it("403s an employee deleting a template", async () => {
      const { agent: hrAgent } = await loginAsManager();
      const created = await hrAgent.post(API).send({ name: "NotYours", color: "green" });

      const { agent: employeeAgent } = await loginAsEmployee();
      const res = await employeeAgent.delete(`${API}/${created.body.data.id}`);
      expect(res.status).toBe(403);
    });
  });
});
