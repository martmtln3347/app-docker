// ========================================
// Vérification de la collection game_configs
// ========================================

db = connect("mongodb://localhost:27017/maets");

// 1. Afficher les collections existantes
print("📂 Collections dans la base :");
printjson(db.getCollectionNames());

// 2. Nombre de documents dans game_configs
print("\n📊 Nombre de documents dans game_configs :");
printjson(db.game_configs.countDocuments({}));

// 3. Contenu détaillé
print("\n📄 Contenu de game_configs :");
db.game_configs.find().forEach(doc => printjson(doc));

// 4. Vérifier une jointure simulée (userId + gameId regroupés)
print("\n🔗 Groupement par userId + gameId :");
db.game_configs.aggregate([
  { $group: { _id: { userId: "$userId", gameId: "$gameId" }, total: { $sum: 1 } } }
]).forEach(doc => printjson(doc));
