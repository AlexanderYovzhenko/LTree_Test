const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

pool.query(`
  CREATE TABLE IF NOT EXISTS folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
  );
`);

class FolderRepository {
  async createFolder(name) {
    try {
      const result = await pool.query('INSERT INTO folders (name) VALUES ($1) RETURNING *', [name]);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing SQL query', error);
      throw error;
    }
  }

  async getFolderByName(name) {
    try {
      const result = await pool.query('SELECT * FROM folders WHERE name = $1', [name]);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing SQL query', error);
      throw error;
    }
  }

  async getAllFolders() {
    try {
      const result = await pool.query('SELECT * FROM folders');
      return result.rows;
    } catch (error) {
      console.error('Error executing SQL query', error);
      throw error;
    }
  }
}

module.exports = FolderRepository;
