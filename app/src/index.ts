import { initOracleDB } from "./connection";
import Menu from "./models/menu";
import { MongoClient } from "./mongo";
import oracledb from 'oracledb';



const collections = ['aluno', 'instrutor', 'pagamento']

const mongoClient = new MongoClient();

(async () => {
  await initOracleDB();

  await mongoClient.connect();

  const oracleClient = await oracledb.getConnection();

  console.log('Connected successfully to server');

  const existing_collections = (await mongoClient.db.listCollections().toArray()).map(({name}) => name);

  const createCollections = collections.map(async (collection) => {
    if (existing_collections.includes(collection)) {
      console.log(`Dropping collection ${collection}`)
      await mongoClient.db.dropCollection(collection);
      await mongoClient.db.createCollection(collection);
    }
    else {
      console.log(`Creating collection ${collection}`)
      await mongoClient.db.createCollection(collection);
    }
  })

  await Promise.all(createCollections);

  const insertValues = collections.map(async (collection) => {
    const result = await oracleClient.execute(`
      SELECT * FROM ${collection.toUpperCase()}
    `, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    await mongoClient.db.collection(collection).insertMany(result.rows as any[]);
  })

  await Promise.all(insertValues);

  await mongoClient.close();

  Menu.run();
})()