const pool = require('./db');

class UserRepository {
    async findByUserNname(indentifier) {
        const query = `
        SELECT id, username, password_hash
        FROM users
        WHERE username = $1 
        ;       
        `
        const result = await pool.query(query, [indentifier]);
        return result.rows || null;
    }

    async findById(id) {
        const query = `
        SELECT id, username, password_hash
        FROM users
        WHERE id = $1 
        ;       
        `
        const result = await pool.query(query, [id]);
        return result.rows || null;
    }

    async create(username, passwordHash) {
        const query = `
        INSERT INTO users (username, password_hash)
        VALUE ($1, $2, $3)
        RETURNING id, username, email
        ;       
        `
        const result = await pool.query(query, [username, email, passwordHash]);
        return result.rows || null;
    }
}

module.exports = new UserRepository();