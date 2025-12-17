// test/setup.test.js
import { execSync } from "child_process";
import dotenv from "dotenv";
import mongoose from "mongoose";
import sequelize from "../config/sequelize.js";

dotenv.config();

before(async function () {
  this.timeout(20000); // marge pour le seed SQL

  // Message informatif pour l'utilisateur : où activer/désactiver le reset
  console.log(
    "ℹ️  Pour activer la réinitialisation automatique de la base avant les tests, définissez RESET_DB_ON_TEST=true (fichier: test/setup.test.js).\n" +
      "   PowerShell : $env:RESET_DB_ON_TEST='true'; npm test\n" +
      "   Bash / WSL : RESET_DB_ON_TEST=true npm test"
  );

  // Optionnel : ne reset la base que si la variable d'environnement
  // RESET_DB_ON_TEST est définie à 'true'. Permet d'accélérer les runs
  // locaux quand on ne veut pas recharger le dump SQL à chaque exécution.
  if (String(process.env.RESET_DB_ON_TEST).toLowerCase() === "true") {
    console.log("♻️  Réinitialisation de la base de données avant les tests...");
    try {
      execSync(
        `mysql -h ${process.env.MYSQL_HOST} -P ${process.env.MYSQL_PORT} -u ${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} ${process.env.MYSQL_DATABASE} < seed.sql`,
        { stdio: "inherit", shell: true }
      );
      console.log("✅ Base de test réinitialisée !");
    } catch (err) {
      console.error("❌ Erreur lors du reset de la base :", err.message);
      throw err;
    }
  } else {
    console.log("ℹ️  RESET_DB_ON_TEST !== true — réinitialisation de la base SKIPPÉE");
  }
});

after(async function () {
  this.timeout(10000);
  console.log("🔌 Fermeture des connexions après les tests...");
  try {
    await mongoose.disconnect();
    if (sequelize && typeof sequelize.close === "function") {
      await sequelize.close();
    }
    console.log("✅ Connexions fermées");
  } catch (err) {
    console.error("⚠️ Erreur lors de la fermeture des connexions :", err);
  }
});
