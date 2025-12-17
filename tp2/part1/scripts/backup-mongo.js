// scripts/backup-mongo.js
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const BACKUP_DIR = path.resolve("backups");

// 1) Candidats pour trouver mongodump (ordre de priorité)
const CANDIDATES = [
  process.env.MONGODUMP_PATH, // ex: "C:\\Program Files\\...\\bin\\mongodump.exe"
  // ton chemin exact (Windows)
  "C:\\Program Files\\mongodb-database-tools-windows-x86_64-100.13.0\\bin\\mongodump.exe",
  // fallback: compter sur le PATH
  "mongodump",
].filter(Boolean);

// 2) Choisir le premier exécutable valide
function getMongodumpExe() {
  for (const candidate of CANDIDATES) {
    try {
      // Si c'est un chemin absolu, vérifier que le fichier existe
      if (candidate.includes("\\") || candidate.includes("/")) {
        if (fs.existsSync(candidate)) return candidate;
      } else {
        // Si c'est juste "mongodump", on le teste en lançant --version
        execFileSync(candidate, ["--version"], { stdio: "ignore" });
        return candidate;
      }
    } catch {
      // continue
    }
  }
  return null;
}

const mongodump = getMongodumpExe();
if (!mongodump) {
  console.error("❌ Impossible de trouver 'mongodump'.");
  console.error("   ➤ Solutions :");
  console.error("   1) Installe les MongoDB Database Tools et mets ce chemin dans ta variable d'env MONGODUMP_PATH :");
  console.error('      C:\\Program Files\\mongodb-database-tools-windows-x86_64-100.13.0\\bin\\mongodump.exe');
  console.error("   2) Ou ajoute ce dossier à ton PATH Windows et rouvre ton terminal.");
  process.exit(1);
}

// 3) Préparer dossier backup + nom horodaté
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);
const stamp = new Date().toISOString().replace(/[:T]/g, "-").split(".")[0];
const outDir = path.join(BACKUP_DIR, `mongo-${stamp}`);

// 4) URI Mongo (utilise MONGO_URL si dispo, sinon défaut local)
const uri = process.env.MONGO_URL || "mongodb://localhost:27017/maets_nosql";

console.log("📦 Sauvegarde MongoDB en cours…");
console.log(`   → binaire : ${mongodump}`);
console.log(`   → uri     : ${uri}`);
console.log(`   → out     : ${outDir}`);

try {
  execFileSync(
    mongodump,
    [`--uri=${uri}`, `--out=${outDir}`],
    { stdio: "inherit", windowsHide: true }
  );
  console.log(`✅ Sauvegarde MongoDB terminée → ${outDir}`);
} catch (err) {
  console.error("❌ Erreur lors du backup MongoDB :", err.message);
  process.exit(1);
}
