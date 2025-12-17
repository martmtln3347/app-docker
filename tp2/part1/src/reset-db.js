import { execSync } from "child_process";
import dotenv from "dotenv";

dotenv.config();

try {
  console.log("♻️  Réinitialisation de la base...");
  execSync(
    `mysql --ssl=0 -h ${process.env.MYSQL_HOST} -P ${process.env.MYSQL_PORT} -u ${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} ${process.env.MYSQL_DATABASE} < reset.sql`,
    { stdio: "inherit", shell: true }
  );
  console.log("✅ Base réinitialisée avec succès !");
} catch (err) {
  console.error("❌ Erreur reset DB :", err.message);
  process.exit(1);
}
