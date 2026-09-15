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

    it("defaults the four branding fields when none are provided", async () => {
      const { agent } = await loginAsManager();
      const res = await agent.post(API).send({ name: "No Branding", color: "green" });

      expect(res.status).toBe(201);
      expect(res.body.data.titleColor).toBe("#1a1a1a");
      expect(res.body.data.borderStyle).toBe("NONE");
      expect(res.body.data.logoUrl).toBe("");
      expect(res.body.data.logoPosition).toBe("TOP_LEFT");
    });

    it("defaults category to null (universal) when not provided", async () => {
      const { agent } = await loginAsManager();
      const res = await agent.post(API).send({ name: "No Category", color: "green" });
      expect(res.status).toBe(201);
      expect(res.body.data.category).toBeNull();
    });

    for (const category of [
      "Contract Templates",
      "Policies & Procedures",
      "Forms & Applications",
      "Training Materials",
      "Compliance & Legal",
      "Onboarding Materials",
    ] as const) {
      it(`accepts category "${category}"`, async () => {
        const { agent } = await loginAsManager();
        const res = await agent
          .post(API)
          .send({ name: `Category for ${category}`, color: "green", category });
        expect(res.status).toBe(201);
        expect(res.body.data.category).toBe(category);
      });
    }

    it("rejects a category outside the allowed set", async () => {
      const { agent } = await loginAsManager();
      const res = await agent
        .post(API)
        .send({ name: "Bad Category", color: "green", category: "Leave Attachment" });
      expect(res.status).toBe(400);
    });

    it("accepts a data: URI logoUrl well over the old 2000-char cap", async () => {
      const { agent } = await loginAsManager();
      const bigDataUri = `data:image/png;base64,${"A".repeat(50_000)}`;
      const res = await agent
        .post(API)
        .send({ name: "Big Logo", color: "green", logoUrl: bigDataUri });
      expect(res.status).toBe(201);
      expect(res.body.data.logoUrl).toBe(bigDataUri);
    });

    it("accepts explicit branding fields", async () => {
      const { agent } = await loginAsManager();
      const res = await agent.post(API).send({
        name: "Branded",
        color: "blue",
        titleColor: "#ff00aa",
        borderStyle: "ACCENT",
        logoUrl: "https://example.com/logo.png",
        logoPosition: "BOTTOM_LEFT",
      });

      expect(res.status).toBe(201);
      expect(res.body.data.titleColor).toBe("#ff00aa");
      expect(res.body.data.borderStyle).toBe("ACCENT");
      expect(res.body.data.logoUrl).toBe("https://example.com/logo.png");
      expect(res.body.data.logoPosition).toBe("BOTTOM_LEFT");
    });

    it("accepts a data: URI for logoUrl", async () => {
      const { agent } = await loginAsManager();
      const res = await agent.post(API).send({
        name: "Data URI Logo",
        color: "green",
        logoUrl: "data:image/png;base64,iVBORw0KGgo=",
      });
      expect(res.status).toBe(201);
      expect(res.body.data.logoUrl).toBe("data:image/png;base64,iVBORw0KGgo=");
    });

    it("rejects a titleColor that isn't a 6-digit hex string", async () => {
      const { agent } = await loginAsManager();
      const res = await agent
        .post(API)
        .send({ name: "Bad Title Color", color: "green", titleColor: "red" });
      expect(res.status).toBe(400);
    });

    it("rejects a borderStyle outside the four allowed values", async () => {
      const { agent } = await loginAsManager();
      const res = await agent
        .post(API)
        .send({ name: "Bad Border", color: "green", borderStyle: "FANCY" });
      expect(res.status).toBe(400);
    });

    it("rejects a logoPosition outside the two allowed values", async () => {
      const { agent } = await loginAsManager();
      const res = await agent
        .post(API)
        .send({ name: "Bad Logo Position", color: "green", logoPosition: "CENTER" });
      expect(res.status).toBe(400);
    });

    it("rejects a relative logoUrl (won't resolve at server-side render time)", async () => {
      const { agent } = await loginAsManager();
      const res = await agent
        .post(API)
        .send({ name: "Bad Logo Url", color: "green", logoUrl: "/uploads/logo.png" });
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

    it("lets HR update just the branding fields, leaving color/name/description untouched", async () => {
      const { agent } = await loginAsManager();
      const created = await agent
        .post(API)
        .send({ name: "Rebrand Me", color: "yellow", description: "keep me" });

      const res = await agent.patch(`${API}/${created.body.data.id}`).send({
        titleColor: "#00aabb",
        borderStyle: "DOUBLE",
        logoUrl: "https://example.com/l.png",
        logoPosition: "BOTTOM_LEFT",
      });

      expect(res.status).toBe(200);
      expect(res.body.data.color).toBe("yellow");
      expect(res.body.data.description).toBe("keep me");
      expect(res.body.data.titleColor).toBe("#00aabb");
      expect(res.body.data.borderStyle).toBe("DOUBLE");
      expect(res.body.data.logoUrl).toBe("https://example.com/l.png");
      expect(res.body.data.logoPosition).toBe("BOTTOM_LEFT");
    });

    it("rejects an invalid titleColor on update", async () => {
      const { agent } = await loginAsManager();
      const created = await agent.post(API).send({ name: "Update Bad Color", color: "green" });

      const res = await agent
        .patch(`${API}/${created.body.data.id}`)
        .send({ titleColor: "not-a-hex-color" });
      expect(res.status).toBe(400);
    });

    it("lets HR set the category after creation", async () => {
      const { agent } = await loginAsManager();
      const created = await agent.post(API).send({ name: "Assign Category Later", color: "green" });
      expect(created.body.data.category).toBeNull();

      const res = await agent
        .patch(`${API}/${created.body.data.id}`)
        .send({ category: "Training Materials" });
      expect(res.status).toBe(200);
      expect(res.body.data.category).toBe("Training Materials");
    });

    it("lets HR clear the category back to null (universal)", async () => {
      const { agent } = await loginAsManager();
      const created = await agent
        .post(API)
        .send({ name: "Clear Category", color: "green", category: "Forms & Applications" });

      const res = await agent.patch(`${API}/${created.body.data.id}`).send({ category: null });
      expect(res.status).toBe(200);
      expect(res.body.data.category).toBeNull();
    });
  });

  describe("backward compatibility", () => {
    it("a template created before branding fields existed still returns the default branding values on read", async () => {
      // Simulates a pre-existing row: insert directly at the DB layer with only the original
      // (pre-branding) columns, exactly like a template created before this migration ran.
      const [row] = await db
        .insert(hr_document_category_templates)
        .values({ name: "Legacy Template", color: "blue", header_text: "Old header" })
        .returning();

      const { agent } = await loginAsManager();
      const res = await agent.get(`${API}/${row.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.header_text).toBe("Old header");
      expect(res.body.data.titleColor).toBe("#1a1a1a");
      expect(res.body.data.borderStyle).toBe("NONE");
      expect(res.body.data.logoUrl).toBe("");
      expect(res.body.data.logoPosition).toBe("TOP_LEFT");
      expect(res.body.data.category).toBeNull();
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
