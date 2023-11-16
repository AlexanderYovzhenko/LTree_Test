const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

pool.query(`
  CREATE TABLE IF NOT EXISTS directories (
    id              SERIAL PRIMARY KEY,

    title           VARCHAR(255) NOT NULL,
    parent_id       INT,

    permission      INT NOT NULL,
    path            LTREE UNIQUE NOT NULL,

    CONSTRAINT directories__directories__parent_id_fk
      FOREIGN KEY(parent_id)
        REFERENCES directories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id              SERIAL PRIMARY KEY,

    title           VARCHAR(255) NOT NULL,
    directory_id    INT NOT NULL,
    parent_id       INT NOT NULL,

    permission      INT NOT NULL,
    path            LTREE NOT NULL,

    CONSTRAINT directories__tasks__directory_id_fk
      FOREIGN KEY(directory_id)
        REFERENCES directories(id) ON DELETE CASCADE,

    CONSTRAINT tasks__tasks__parent_id_fk
      FOREIGN KEY(parent_id)
        REFERENCES tasks(id) ON DELETE CASCADE
  );
`);

class Repository {
  // Create Directory ----------------------------------
  async createDirectory(directory) {
    try {
      const ltreePath = await this.#generateLtreePath(directory); 
      console.log(ltreePath);
      const result = await pool.query('INSERT INTO directories (title, parent_id, permission, path) VALUES ($1, $2, $3, $4) RETURNING *', [directory.title, directory.parent_id, directory.permission, ltreePath]);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing SQL query', error);
      throw error;
    }
  }

  async #generateLtreePath(directory) {
    if (!directory.parent_id) {
      // Если у каталога нет родительского каталога
      const directoriesFirstLevel =  await this.#getDirectoriesFirstLevel();

      if (directoriesFirstLevel.length) {
        return (directoriesFirstLevel.length + 1).toString();
      } else {
        return '1';
      }
    } else {
      // Если есть родительский каталог, формируем путь
      const parent = await this.#getParentDirectory(directory.parent_id);

      const firstLevelDescendants =  await this.#getFirstLevelDescendants(parent.id)

      if (firstLevelDescendants.length) {
        return `${parent.path}.${firstLevelDescendants.length + 1}`;
      } else{
        return `${parent.path}.${1}`;
      }
    }
  }

  async #getDirectoriesFirstLevel() {
    try {
      // Запрос для получения всех directories первого уровня
      const result = await pool.query('SELECT * FROM directories WHERE parent_id IS NULL');
  
      return result.rows;
    } catch (error) {
      console.error('Error executing SQL query', error);
      throw error;
    }
  }
  
  async #getParentDirectory(parentId) {
    const result = await pool.query('SELECT * FROM directories WHERE id = $1', [parentId]);
    return result.rows[0];
  }

  async #getFirstLevelDescendants(directoryId) {
    try { 
      // Запрос на получение прямых потомков
      const result = await pool.query('SELECT * FROM directories WHERE parent_id = $1', [directoryId]);
  
      return result.rows;
    } catch (error) {
      console.error('Error executing SQL query', error);
      throw error;
    }
  }

  // Get Descendants Directory ----------------------------------
  async getDescendantsDirectoryById(id) {
    try {
      const result = await pool.query('SELECT * FROM directories WHERE id = $1', [id]);
      const descendants = await this.#getDescendantsByPath(result.rows[0].path);
      return descendants;
    } catch (error) {
      console.error('Error executing SQL query', error);
      throw error;
    }
  }

  async #getDescendantsByPath(ltreePath) {
    try {
      const result = await pool.query('SELECT * FROM directories WHERE path <@ $1', [ltreePath]);
      return result.rows;
    } catch (error) {
      console.error('Error executing SQL query', error);
      throw error;
    }
  }

  // Update Descendants Directory ----------------------------------
  async updatePermissionAllDescendants(directoryId, newPermission) {
    try {
      const directory = await this.#getDirectoryById(directoryId);

      // Обновляем разрешения для всех потомков
      const updateDescendants = await pool.query(`
        UPDATE directories
        SET permission = $2
        WHERE path <@ $1
    `, [directory.path, newPermission]);
      return updateDescendants;
    } catch (error) {
      console.error('Error executing SQL query', error);
      throw error;
    }
  }

  async #getDirectoryById(directoryId) {
    try {
      const result = await pool.query('SELECT * FROM directories WHERE id = $1', [directoryId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing SQL query', error);
      throw error;
    }
  }
  
}

module.exports = Repository;
