import request from "supertest";
import { expect } from "chai";
import app from "../app.js";

let userToken;

describe("Routes /me (library & configs)", () => {
  before(async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "alice@maets.com", password: "password" });

    expect(res.status).to.equal(200);
    userToken = res.body.token;
  });

  it("✅ GET /me/library doit renvoyer la librairie d’Alice", async () => {
    const res = await request(app)
      .get("/me/library")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });

  it("✅ POST /me/library/:gameId doit ajouter un jeu", async () => {
    const res = await request(app)
      .post("/me/library/1")
      .set("Authorization", `Bearer ${userToken}`);

    expect([200, 201, 400]).to.include(res.status);
  });

  it("✅ GET /me/configs/:gameId doit renvoyer une config (ou 404)", async () => {
    const res = await request(app)
      .get("/me/configs/1")
      .set("Authorization", `Bearer ${userToken}`);

    expect([200, 404]).to.include(res.status);
  });

  it("✅ PUT /me/configs/:gameId doit créer ou mettre à jour une config", async () => {
    const res = await request(app)
      .put("/me/configs/1")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ settings: { difficulty: "hard", volume: 80 } });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("settings");
    expect(res.body.settings).to.have.property("difficulty", "hard");
  });
});





