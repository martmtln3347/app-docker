import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const BACKUP_DIR = path.resolve("backups");
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

const date = new Date().toISOString().replace(/[:T]/g, "-").split(".")[0];
const backupPath = path.join(BACKUP_DIR, `mysql-${date}.sql`);

try {
  console.log("💾 Sauvegarde SQL en cours...");
  const cmd = `mysqldump -h ${process.env.MYSQL_HOST} -P ${process.env.MYSQL_PORT} -u ${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} ${process.env.MYSQL_DATABASE} > "${backupPath}"`;
  execSync(cmd, { stdio: "inherit", shell: true });
  console.log(`✅ Sauvegarde SQL terminée → ${backupPath}`);
} catch (err) {
  console.error("❌ Erreur backup SQL :", err.message);
  process.exit(1);
}
