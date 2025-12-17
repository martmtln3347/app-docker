// ========================================
// RESET + SEED + CHECK game_configs
// ========================================

db = connect("mongodb://localhost:27017/maets");

// 1. Nettoyage
db.game_configs.drop();

// 2. Insertion de configs de test
db.game_configs.insertMany([
  {
    userId: 2, // Alice
    gameId: 1, // Zelda
    settings: {
      difficulty: "normal",
      resolution: "1080p",
      language: "fr",
      dlcs: false
    }
  },
  {
    userId: 2, // Alice
    gameId: 3, // Minecraft
    settings: {
      difficulty: "peaceful",
      resolution: "720p",
      language: "en",
      dlcs: false
    }
  },
  {
    userId: 3, // Bob
    gameId: 2, // Witcher 3
    settings: {
      difficulty: "hard",
      resolution: "1440p",
      language: "fr",
      dlcs: true
    }
  }
]);

// 3. Vérification
print("📂 Collections dans la base :");
printjson(db.getCollectionNames());

print("\n📊 Nombre de documents dans game_configs :");
printjson(db.game_configs.countDocuments({}));

print("\n📄 Contenu de game_configs :");
db.game_configs.find().forEach(doc => printjson(doc));
