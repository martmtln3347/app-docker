// scripts/seed.js — version sécurisée avec mysql2
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

// charge .env
dotenv.config();

const sqlPath = path.resolve(process.cwd(), "seed.sql");

// Liste minimale de variables requises
const requiredEnv = ["MYSQL_HOST", "MYSQL_USER", "MYSQL_PASSWORD"];

function checkEnv() {
  const missing = requiredEnv.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(
      `❌ Variables d'environnement manquantes: ${missing.join(", ")}`
    );
    console.error("➡️ Ajoute-les dans ton fichier .env et relance le script.");
    process.exit(1);
  }
}

function getDatabaseName() {
  // Si on est en test, on préfère MYSQL_DATABASE_TEST s'il est fourni
  if (process.env.NODE_ENV === "test") {
    return process.env.MYSQL_DATABASE_TEST || process.env.MYSQL_DATABASE;
  }
  return process.env.MYSQL_DATABASE;
}

async function run() {
  if (!fs.existsSync(sqlPath)) {
    console.error("❌ Fichier seed.sql introuvable :", sqlPath);
    process.exit(1);
  }

  checkEnv();

  const database = getDatabaseName();
  if (!database) {
    console.error(
      "❌ Aucune base de données configurée (MYSQL_DATABASE ou MYSQL_DATABASE_TEST)."
    );
    console.error("➡️ Ajoute MYSQL_DATABASE dans ton .env (ex: MYSQL_DATABASE=maets)");
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, "utf8");

  const connConfig = {
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database,
    multipleStatements: true, // permet d’exécuter tout le fichier
  };

  console.log("📘 Configuration utilisée pour le seed:", {
    host: connConfig.host,
    port: connConfig.port,
    user: connConfig.user,
    database: connConfig.database,
  });

  let connection;
  try {
    console.log("🌱 Connexion à MariaDB...");
    connection = await mysql.createConnection(connConfig);

    console.log("🌱 Injection du seed SQL...");
    await connection.query(sql);

    console.log("✅ Données SQL injectées avec succès !");
  } catch (err) {
    console.error("❌ Erreur lors du seed SQL :", err.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        // best-effort close
      }
    }
  }
}

run();
