import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const UserRole = sequelize.define(
  "user_role",
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    timestamps: false,
    tableName: "user_role",
  }
);

export default UserRole;