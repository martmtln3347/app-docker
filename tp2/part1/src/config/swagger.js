// config/swagger.js
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de Swagger
const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Maets API",
      version: "1.0.0",
      description: `
        <h3>Documentation de l’API Maets 🚀</h3>
        <p>Projet de démonstration pour le Bloc 2 (Back-End) — SQL + NoSQL</p>
        <ul>
          <li>🔐 Authentification par JWT</li>
          <li>🗄️ Base SQL (MariaDB) pour les utilisateurs, jeux et rôles</li>
          <li>📦 Base NoSQL (MongoDB) pour les configurations de jeux</li>
        </ul>
      `,
    },
    // Prefer the /api prefix as the canonical API base. Keep root as legacy option.
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Serveur local - base API (/api)",
      },
      {
        url: "http://localhost:3000",
        description: "Serveur local - root (legacy)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.resolve(__dirname, "../routes/*.js"), // chemin vers tes fichiers de routes
  ],
};

const swaggerSpec = swaggerJSDoc(options);

// Fonction d'installation sur ton app Express
export default function setupSwagger(app) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📘 Swagger disponible sur http://localhost:3000/docs");
}
