const pool = require('./db');

class TodoRepository {

    // Lấy tất cả todo
    async findAll(userId) {
        const query = `
            SELECT id, title, completed, created_at
            FROM todos
            WHERE user_id = $1
            ORDER BY created_at DESC;
        `;

        const result = await pool.query(query, [userId]);

        return result.rows;
    }

    // Tạo todo
    async create(title, userId) {
        const query = `
            INSERT INTO todos (title, completed, user_id)
            VALUES ($1, $2, $3)
            RETURNING id, title, completed, created_at;
        `;

        const result = await pool.query(query, [title, false, userId]);

        return result.rows[0];
    }


    async update(id, completed, userId) {
        const query = `
            UPDATE todos
            SET completed = $1
            WHERE id = $2 AND user_id = $3
            RETURNING id, title, completed, created_at;
        `;

        const result = await pool.query(query, [completed, id, userId]);
        return result.rows[0];
    }


    // Xóa todo
    async delete(id, userId) {
        const query = `
            DELETE FROM todos
            WHERE id = $1 AND user_id = $2;
        `;

        const result = await pool.query(query, [id, userId]);

        return result.rowCount > 0;
    }
}

module.exports = new TodoRepository();
