const pool = require('./db');

class TodoRepository {

    // Lấy tất cả todo
    async findAll() {
        const query = `
            SELECT id, title, completed, created_at
            FROM todos
            ORDER BY created_at DESC;
        `;

        const result = await pool.query(query);

        return result.rows;
    }


    // Tìm một todo theo id
    async findById(id) {
        const query = `
            SELECT id, title, completed, created_at
            FROM todos
            WHERE id = $1;
        `;

        const result = await pool.query(query, [id]);

        // Không tìm thấy
        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }


    // Tạo todo
    async create(title) {
        const query = `
            INSERT INTO todos (title, completed)
            VALUES ($1, $2)
            RETURNING id, title, completed, created_at;
        `;

        const result = await pool.query(query, [title, false]);

        return result.rows[0];
    }


    async update(id, completed) {
        const query = `
            UPDATE todos
            SET completed = $1
            WHERE id = $2
            RETURNING id, title, completed, created_at;
        `;

        const result = await pool.query(query, [completed, id]);
        return result.rows[0];
    }


    // Xóa todo
    async delete(id) {
        const query = `
            DELETE FROM todos
            WHERE id = $1;
        `;

        const result = await pool.query(query, [id]);

        return result.rowCount > 0;
    }
}

module.exports = new TodoRepository();
