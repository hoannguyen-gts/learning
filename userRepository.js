const pool = require('./db');

class UserRepository {
    async findByUsername(username) {
        const query = `
        SELECT id, username, password_hash
        FROM users
        WHERE username = $1
        ;       
        `
        const result = await pool.query(query, [username]);
        return result.rows[0] || null;
    }

    async findById(id) {
        const query = `
        SELECT id, username, password_hash
        FROM users
        WHERE id = $1 
        ;       
        `
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async create(username, passwordHash) {
        const query = `
        INSERT INTO users (username, password_hash)
        VALUES ($1, $2)
        RETURNING id, username
        ;       
        `
        const result = await pool.query(query, [username, passwordHash]);
        return result.rows[0] || null;
    }

    async delete(id) {
        const query = `
        DELETE FROM users
        WHERE id = $1 
        ;       
        `
        const result = await pool.query(query, [id]);
        return result.rowCount > 0;
    }

}

module.exports = new UserRepository();
