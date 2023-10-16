import oracledb from 'oracledb';


export async function initDB() {
  try {
    // Create a connection pool which will later be accessed via the
    // pool cache as the 'default' pool.
    await oracledb.createPool({
      user: 'SYSTEM',
      password: 'password',
      connectionString: 'localhost:1521/xe',
      // connectString: dbConfig.connectString,
      // edition: 'ORA$BASE', // used for Edition Based Redefintion
      // events: false, // whether to handle Oracle Database FAN and RLB events or support CQN
      // externalAuth: false, // whether connections should be established using External Authentication
      // homogeneous: true, // all connections in the pool have the same credentials
      // poolAlias: 'default', // set an alias to allow access to the pool via a name.
      // poolIncrement: 1, // only grow the pool by one connection at a time
      // poolMax: 4, // maximum size of the pool. (Note: Increase UV_THREADPOOL_SIZE if you increase poolMax in Thick mode)
      // poolMin: 0, // start with no connections; let the pool shrink completely
      // poolPingInterval: 60, // check aliveness of connection if idle in the pool for 60 seconds
      // poolTimeout: 60, // terminate connections that are idle in the pool for 60 seconds
      // queueMax: 500, // don't allow more than 500 unsatisfied getConnection() calls in the pool queue
      // queueTimeout: 60000, // terminate getConnection() calls queued for longer than 60000 milliseconds
      // sessionCallback: myFunction, // function invoked for brand new connections or by a connection tag mismatch
      // sodaMetaDataCache: false, // Set true to improve SODA collection access performance
      // stmtCacheSize: 30, // number of statements that are cached in the statement cache of each connection
      // enableStatistics: false // record pool usage for oracledb.getPool().getStatistics() and logStatistics()
    });
    console.log('Connection pool started');

    // // Now the pool is running, it can be used
    // await dostuff();

  } catch (err: any) {
    console.error('init() error: ' + err.message);
  } 
}
