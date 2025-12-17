import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Game = sequelize.define("Game", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  publisher: {
    type: DataTypes.STRING,
  },
  dateSortie: {
    type: DataTypes.DATE,
  },
}, {
  tableName: "jeux",
  timestamps: false,
});

export default Game;
