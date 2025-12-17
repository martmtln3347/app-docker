import request from "supertest";
import { expect } from "chai";
import app from "../app.js";

let adminToken;
let createdGameId;

describe("Games routes (CRUD)", () => {
  before(async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "admin@maets.com", password: "password" });

    if (res.status !== 200) {
      console.error("⚠️  Échec login admin:", res.body);
    }

    adminToken = res.body?.token;
  });

  it("✅ GET /games doit renvoyer la liste des jeux", async () => {
    const res = await request(app).get("/games");
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });

  it("✅ POST /games doit créer un nouveau jeu (ADMIN)", async () => {
    const res = await request(app)
      .post("/games")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        slug: `test-game-${Date.now()}`,
        title: "Test Game",
        publisher: "Test Studio",
        dateSortie: "2025-01-01",
      });

    expect([200, 201]).to.include(res.status);
    createdGameId = res.body.id;
  });

  it("✅ PATCH /games/:id doit modifier un jeu (ADMIN)", async () => {
    const res = await request(app)
      .patch(`/games/${createdGameId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Updated Test Game" });

    expect([200, 204]).to.include(res.status);
  });

  it("✅ DELETE /games/:id doit supprimer un jeu (ADMIN)", async () => {
    const res = await request(app)
      .delete(`/games/${createdGameId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect([200, 204]).to.include(res.status);
  });
});
