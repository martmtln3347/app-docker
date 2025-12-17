import sequelize from './config/sequelize.js';
import User from './Modele/user.model.js';
import Game from './Modele/game.model.js';
import Library from './Modele/library.model.js';

(async () => {
  try {
    await sequelize.sync({ force: true }); // ⚠️ recrée les tables à vide
    console.log("✅ Tables SQL créées !");
    process.exit(0);
  } catch (e) {
    console.error("❌ Erreur sync:", e);
    process.exit(1);
  }
})();
