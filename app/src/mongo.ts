import { MongoClient as _MongoClient, Db } from 'mongodb'
import dotenv from 'dotenv'
dotenv.config()



const url = process.env.MONGO_URL ?? ''

export class MongoClient {
  private mongoClient: _MongoClient;
  // @ts-ignore
  db: Db;

  constructor() {
    this.mongoClient = new _MongoClient(url);
  }

  async connect() {
    await this.mongoClient.connect();
    this.db = this.mongoClient.db("database");
  }

  async close() {
    await this.mongoClient.close();
  }
}