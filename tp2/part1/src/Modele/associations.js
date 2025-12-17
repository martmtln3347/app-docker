import User from "./user.model.js";
import Game from "./game.model.js";
import Library from "./library.model.js";
import Role from "./role.model.js";
import UserRole from "./user_role.model.js";

// === User ↔ Game via Library ===
User.belongsToMany(Game, {
  through: Library,
  as: "games",
  foreignKey: "userId",
});
Game.belongsToMany(User, {
  through: Library,
  as: "users",
  foreignKey: "gameId",
});

// === User ↔ Role via user_role ===
User.belongsToMany(Role, {
  through: UserRole,
  as: "roles",
  foreignKey: "userId",
});
Role.belongsToMany(User, {
  through: UserRole,
  as: "users",
  foreignKey: "roleId",
});

export { User, Game, Library, Role, UserRole };