import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URL);
let db;

export async function getMongoDb() {
  if (!db) {
    await client.connect();
    db = client.db("maets");
  }
  return db;
}
