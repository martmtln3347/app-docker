import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Charger les variables d’environnement
dotenv.config();

// --- DB SQL (MariaDB avec Sequelize) --- //
import sequelize from "./config/sequelize.js";
import "./Modele/associations.js"; // associations entre User, Game, Role, Library

// --- Express --- //
const app = express();
const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques du dossier public
app.use(express.static("public"));

app.use(express.json());

// --- Routes principales --- //
import userRoutes from "./routes/user.routes.js";
import gameRoutes from "./routes/game.routes.js";
import libraryRoutes from "./routes/library.routes.js";
import configRoutes from "./routes/config.routes.js";

// Expose API under /api to provide a clear API prefix for consumers
app.use("/api/auth", userRoutes);          // Register / Login
app.use("/api/games", gameRoutes);         // CRUD des jeux
app.use("/api/me/library", libraryRoutes); // Librairie utilisateur
app.use("/api/me/configs", configRoutes);  // Configurations de jeux

// Backward compatibility: also mount routes without the `/api` prefix so
// older tests/clients that call the root paths continue to work.
app.use("/auth", userRoutes);
app.use("/games", gameRoutes);
app.use("/me/library", libraryRoutes);
app.use("/me/configs", configRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", ts: new Date() });
});

// Route racine
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l’API Maets 🚀" });
});

// --- Middleware d’erreurs --- //
import { errorHandler } from "./middlewares/error.js";
app.use(errorHandler);

// --- Swagger --- //
import setupSwagger from "./config/swagger.js";
setupSwagger(app);

// ✅ Export de l’app pour les tests
export default app;

// --- DB NoSQL (MongoDB) --- //
// Toujours se connecter à MongoDB (y compris en mode test) pour que
// les modèles Mongoose utilisés pendant les tests puissent effectuer
// des opérations sans buffering timeout.
import("./Modele/config.model.js").then(({ default: GameConfig }) => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(async () => {
      console.log("✅ MongoDB OK");
      try {
        await GameConfig.syncIndexes();
        console.log("🧱 Index MongoDB synchronisés (GameConfig)");
      } catch (e) {
        console.error("⚠️ syncIndexes(GameConfig) a échoué:", e.message);
      }
    })
    .catch((err) => console.error("❌ MongoDB KO:", err));
});

// Lancement du serveur uniquement si pas en mode test
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, async () => {
    try {
      await sequelize.authenticate();
      console.log("✅ Connexion MariaDB OK");
    } catch (err) {
      console.error("❌ Erreur connexion MariaDB :", err);
    }
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  });

}

import fs from "fs";
import https from "https";

if (process.env.NODE_ENV !== "test") {
  const SSL_PORT = process.env.SSL_PORT || 3443;

  // ⚠️ Utilise bien les PEM générés par mkcert ci-dessus
  const keyPath = "./ssl/localhost-key.pem";
  const certPath = "./ssl/localhost-cert.pem";

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const key = fs.readFileSync(keyPath);
    const cert = fs.readFileSync(certPath);

    try {
      const httpsServer = https.createServer({ key, cert }, app);
      httpsServer.on("error", (err) => {
        console.error(`⚠️  HTTPS server error: ${err.message}`);
      });
      httpsServer.listen(SSL_PORT, () => {
        console.log(`🔒 HTTPS (mkcert) sur https://localhost:${SSL_PORT}`);
      });
    } catch (err) {
      console.error("⚠️  Impossible de démarrer le serveur HTTPS:", err.message);
    }
  } else {
    console.log("⚠️  Certificats SSL non trouvés, HTTPS désactivé.");
  }
}

