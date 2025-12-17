import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Role = sequelize.define("Role", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: "role",
  timestamps: false,
});

export default Role;
