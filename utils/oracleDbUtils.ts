/**
 * Oracle Database Utilities
 * These functions handle secure communication with Oracle Database
 */
import oracledb from 'oracledb';

// Database configuration
const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECTION_STRING,
  // Optional configurations
  poolMin: 2,
  poolMax: 5,
  poolIncrement: 1
};

// Initialize connection pool once during startup
let pool: oracledb.Pool;

/**
 * Initialize the Oracle connection pool
 */
export async function initOraclePool() {
  try {
    // Set connection pool properties
    oracledb.poolTimeout = 60;
    oracledb.autoCommit = true;
    
    // Create a connection pool which will be used throughout the application
    pool = await oracledb.createPool(dbConfig);
    
    console.log("Oracle Database connection pool initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Oracle connection pool:", error);
    throw error;
  }
}

/**
 * Get a connection from the pool
 */
export async function getConnection(): Promise<oracledb.Connection> {
  if (!pool) {
    throw new Error("Oracle connection pool has not been initialized");
  }
  
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error("Error getting connection from pool:", error);
    throw error;
  }
}

/**
 * Execute a query with parameters
 */
export async function executeQuery<T>(
  sql: string, 
  bindParams: any = {}, 
  options: oracledb.ExecuteOptions = {}
): Promise<T[]> {
  let connection: oracledb.Connection | undefined;
  
  try {
    connection = await getConnection();
    
    // Set default options for getting result as objects
    const defaultOptions: oracledb.ExecuteOptions = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...options
    };
    
    // Execute the query
    const result = await connection.execute(sql, bindParams, defaultOptions);
    
    // Convert the rows to the expected type
    return result.rows as unknown as T[];
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  } finally {
    // Always release the connection back to the pool
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

/**
 * Close the connection pool when shutting down
 */
export async function closePool() {
  if (pool) {
    try {
      await pool.close(10); // Wait up to 10 seconds for connections to close
      console.log("Oracle connection pool closed successfully");
    } catch (error) {
      console.error("Error closing Oracle connection pool:", error);
      throw error;
    }
  }
}

/**
 * Safely handle LOB data types
 */
export async function readLob(lob: oracledb.Lob): Promise<string> {
  try {
    let data = '';
    
    // Set up event handlers for the lob
    lob.on('data', chunk => {
      data += chunk;
    });
    
    // Return a promise that resolves when the lob is fully read
    return new Promise((resolve, reject) => {
      lob.on('error', reject);
      lob.on('end', () => resolve(data));
    });
  } catch (error) {
    console.error("Error reading LOB data:", error);
    throw error;
  }
} 