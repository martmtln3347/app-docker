import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

console.log("DB Config:", process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_HOST);

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: "mariadb",
    logging: false,
  }
);

export default sequelize;
