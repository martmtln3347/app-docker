import request from "supertest";
import { expect } from "chai";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";
import app from "../app.js";
import User from "../Modele/user.model.js";

const testPassword = "password123";

describe("User routes (Register & Login)", () => {
  before(async () => {
    // Nettoyage minimal avant tests register
    await User.destroy({ where: { email: { [Op.like]: "test_%@maets.com" } } });
  });

  it("✅ doit créer un nouvel utilisateur avec /auth/register", async () => {
    const uniqueEmail = `test_${uuidv4()}@maets.com`;

    const res = await request(app)
      .post("/auth/register")
      .send({ email: uniqueEmail, password: testPassword });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
    expect(res.body).to.have.property("email", uniqueEmail);
  });

  it("🚫 ne doit pas créer deux fois le même utilisateur", async () => {
    const duplicateEmail = `dup_${uuidv4()}@maets.com`;

    await request(app)
      .post("/auth/register")
      .send({ email: duplicateEmail, password: testPassword });

    const res = await request(app)
      .post("/auth/register")
      .send({ email: duplicateEmail, password: testPassword });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error");
  });

  it("✅ doit se connecter avec /auth/login et renvoyer un JWT", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "alice@maets.com", password: "password" });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("token");

    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded).to.have.property("id");
    expect(decoded).to.have.property("email", "alice@maets.com");
  });

  it("🚫 doit refuser login avec mauvais mot de passe", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "alice@maets.com", password: "wrongpass" });

    expect(res.status).to.equal(401);
    expect(res.body).to.have.property("error", "Mot de passe invalide");
  });
});
