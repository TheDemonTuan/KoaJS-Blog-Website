import mysql from "mysql2";

// Database config
export default mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: "tdt_nodejs",
  connectionLimit: 100,
  waitForConnections: true,
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});


