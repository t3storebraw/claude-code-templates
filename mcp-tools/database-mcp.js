const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();

class DatabaseMCP {
  constructor() {
    this.name = 'database_mcp';
    this.description = 'Database operations and data manipulation';
    this.version = '1.0.0';
    this.connections = new Map();
  }

  async initialize() {
    console.log(`Initializing ${this.name} MCP tool`);
    return { success: true, message: 'Database MCP initialized' };
  }

  async connect(config) {
    try {
      const { type, host, port, user, password, database, connectionId } = config;
      
      let connection;
      
      switch (type.toLowerCase()) {
        case 'mysql':
          connection = await mysql.createConnection({
            host,
            port: port || 3306,
            user,
            password,
            database
          });
          break;
          
        case 'postgresql':
        case 'postgres':
          connection = new Pool({
            host,
            port: port || 5432,
            user,
            password,
            database
          });
          break;
          
        case 'sqlite':
          connection = new Promise((resolve, reject) => {
            const db = new sqlite3.Database(database, (err) => {
              if (err) reject(err);
              else resolve(db);
            });
          });
          break;
          
        default:
          throw new Error(`Unsupported database type: ${type}`);
      }
      
      this.connections.set(connectionId, {
        connection,
        type,
        config
      });
      
      return {
        success: true,
        data: {
          connectionId,
          type,
          message: `Connected to ${type} database`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async disconnect(connectionId) {
    try {
      const connInfo = this.connections.get(connectionId);
      if (!connInfo) {
        throw new Error(`Connection ${connectionId} not found`);
      }
      
      const { connection, type } = connInfo;
      
      if (type === 'mysql') {
        await connection.end();
      } else if (type === 'postgresql' || type === 'postgres') {
        await connection.end();
      } else if (type === 'sqlite') {
        connection.close();
      }
      
      this.connections.delete(connectionId);
      
      return {
        success: true,
        data: {
          connectionId,
          message: 'Connection closed successfully'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async executeQuery(connectionId, query, params = []) {
    try {
      const connInfo = this.connections.get(connectionId);
      if (!connInfo) {
        throw new Error(`Connection ${connectionId} not found`);
      }
      
      const { connection, type } = connInfo;
      let result;
      
      if (type === 'mysql') {
        const [rows, fields] = await connection.execute(query, params);
        result = {
          rows,
          fields: fields.map(field => ({
            name: field.name,
            type: field.type,
            length: field.length
          }))
        };
      } else if (type === 'postgresql' || type === 'postgres') {
        const queryResult = await connection.query(query, params);
        result = {
          rows: queryResult.rows,
          fields: queryResult.fields.map(field => ({
            name: field.name,
            type: field.dataTypeID
          }))
        };
      } else if (type === 'sqlite') {
        result = await new Promise((resolve, reject) => {
          connection.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve({ rows, fields: [] });
          });
        });
      }
      
      return {
        success: true,
        data: {
          connectionId,
          query,
          result,
          rowCount: result.rows.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getTableInfo(connectionId, tableName) {
    try {
      const connInfo = this.connections.get(connectionId);
      if (!connInfo) {
        throw new Error(`Connection ${connectionId} not found`);
      }
      
      const { type } = connInfo;
      let query;
      
      switch (type) {
        case 'mysql':
          query = `DESCRIBE ${tableName}`;
          break;
        case 'postgresql':
        case 'postgres':
          query = `
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = $1
            ORDER BY ordinal_position
          `;
          break;
        case 'sqlite':
          query = `PRAGMA table_info(${tableName})`;
          break;
      }
      
      const result = await this.executeQuery(connectionId, query, type === 'postgresql' || type === 'postgres' ? [tableName] : []);
      
      return {
        success: true,
        data: {
          connectionId,
          tableName,
          columns: result.data.result.rows
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async listTables(connectionId) {
    try {
      const connInfo = this.connections.get(connectionId);
      if (!connInfo) {
        throw new Error(`Connection ${connectionId} not found`);
      }
      
      const { type } = connInfo;
      let query;
      
      switch (type) {
        case 'mysql':
          query = 'SHOW TABLES';
          break;
        case 'postgresql':
        case 'postgres':
          query = `
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
          `;
          break;
        case 'sqlite':
          query = "SELECT name FROM sqlite_master WHERE type='table'";
          break;
      }
      
      const result = await this.executeQuery(connectionId, query);
      
      return {
        success: true,
        data: {
          connectionId,
          tables: result.data.result.rows.map(row => 
            type === 'mysql' ? Object.values(row)[0] : row.table_name || row.name
          )
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async analyzeQuery(connectionId, query) {
    try {
      const connInfo = this.connections.get(connectionId);
      if (!connInfo) {
        throw new Error(`Connection ${connectionId} not found`);
      }
      
      const { type } = connInfo;
      let explainQuery;
      
      switch (type) {
        case 'mysql':
          explainQuery = `EXPLAIN ${query}`;
          break;
        case 'postgresql':
        case 'postgres':
          explainQuery = `EXPLAIN (ANALYZE, BUFFERS) ${query}`;
          break;
        case 'sqlite':
          explainQuery = `EXPLAIN QUERY PLAN ${query}`;
          break;
      }
      
      const result = await this.executeQuery(connectionId, explainQuery);
      
      return {
        success: true,
        data: {
          connectionId,
          originalQuery: query,
          explainPlan: result.data.result.rows
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async backupDatabase(connectionId, backupPath) {
    try {
      const connInfo = this.connections.get(connectionId);
      if (!connInfo) {
        throw new Error(`Connection ${connectionId} not found`);
      }
      
      const { type, config } = connInfo;
      
      // This is a simplified backup - in production, you'd use proper backup tools
      const tables = await this.listTables(connectionId);
      
      const backup = {
        timestamp: new Date().toISOString(),
        database: config.database,
        type,
        tables: tables.data.tables,
        backupPath
      };
      
      return {
        success: true,
        data: {
          connectionId,
          backup,
          message: 'Backup information generated (actual backup would require database-specific tools)'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async execute(operation, params) {
    switch (operation) {
      case 'connect':
        return await this.connect(params);
      case 'disconnect':
        return await this.disconnect(params.connectionId);
      case 'query':
        return await this.executeQuery(params.connectionId, params.query, params.params);
      case 'table_info':
        return await this.getTableInfo(params.connectionId, params.tableName);
      case 'list_tables':
        return await this.listTables(params.connectionId);
      case 'analyze_query':
        return await this.analyzeQuery(params.connectionId, params.query);
      case 'backup':
        return await this.backupDatabase(params.connectionId, params.backupPath);
      default:
        return {
          success: false,
          error: `Unknown operation: ${operation}`
        };
    }
  }
}

module.exports = DatabaseMCP;