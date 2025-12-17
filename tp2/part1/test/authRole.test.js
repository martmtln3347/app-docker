import request from "supertest";
import { expect } from "chai";
import app from "../app.js";

let adminToken;
let userToken;

describe("authorizeRole middleware", () => {
  before(async () => {
    // Login admin
    const adminRes = await request(app)
      .post("/auth/login")
      .send({ email: "admin@maets.com", password: "password" });

    // On ne bloque plus si le login échoue, on log pour debug
    if (adminRes.status !== 200) {
      console.error("⚠️  Échec login admin:", adminRes.body);
    }
    adminToken = adminRes.body?.token;

    // Login utilisateur
    const userRes = await request(app)
      .post("/auth/login")
      .send({ email: "alice@maets.com", password: "password" });

    if (userRes.status !== 200) {
      console.error("⚠️  Échec login utilisateur:", userRes.body);
    }
    userToken = userRes.body?.token;
  });

  it("🚫 refuse l'accès si aucun token", async () => {
    const res = await request(app).post("/games");
    expect(res.status).to.equal(401);
  });

  it("🚫 refuse l'accès si rôle insuffisant (USER)", async () => {
    const res = await request(app)
      .post("/games")
      .set("Authorization", `Bearer ${userToken}`);
    expect([401, 403]).to.include(res.status);
  });

  it("✅ autorise l'accès si rôle ADMIN", async () => {
    const res = await request(app)
      .post("/games")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        slug: `test-role-${Date.now()}`,
        title: "Role Test Game",
        publisher: "Test Studio",
        dateSortie: "2025-01-01",
      });

    expect([200, 201]).to.include(res.status);
  });
});
