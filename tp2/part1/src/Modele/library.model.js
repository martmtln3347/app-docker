import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Library = sequelize.define("Library", {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  gameId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  dateAjout: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "user_game",
  timestamps: false,
});

export default Library;
