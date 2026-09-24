const express = require('express');
const todoRepository = require('./todoRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userRepository = require('./userRepository');
const authMiddleware = require('./authMiddleware');

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.post('/auth/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json(
            { message: 'Vui lòng nhập đầy đủ username và password' }
        );
    }

    try {
        const existingUser = await userRepository.findByUsername(username.trim());
        if (existingUser) {
            return res.status(400).json({ message: 'Username đã tồn tại' });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const newUser = await userRepository.create(username.trim(), passwordHash);

        res.status(201).json({
            message: 'Đăng ký tài khoản thành công',
            user: { id: newUser.id, username: newUser.username }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

app.post('/auth/login', async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ message: 'Missing username or password' });
    }

    try {
        const user = await userRepository.findByUsername(identifier.trim());

        if (!user) {
            return res.status(401).json({ message: 'Thông tin đăng nhập không chính xác' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Thông tin đăng nhập không chính xác' });
        }

        const payload = { id: user.id, username: user.username };
        const secret = 'super_secret_jwt_key_12345';
        const options = { expiresIn: '1h' };

        const token = jwt.sign(payload, secret, options);

        res.json({
            message: 'Đăng nhập thành công',
            access_token: token,
            user: { id: user.id, username: user.username }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

app.get('/todos', authMiddleware, async (req, res) => {
    try {
        const tasks = await todoRepository.findAll(req.user.id);
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.patch('/todos/:id', authMiddleware, async (req, res) => {
    const id = Number(req.params.id);
    const { completed } = req.body;

    try {
        const task = await todoRepository.update(id, completed, req.user.id);

        if (!task) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

app.post('/todos', authMiddleware, async (req, res) => {
    const { title } = req.body;

    if (!title || title.trim() === '') {
        return res.status(400).json({
            message: 'Title is required'
        });
    }

    try {
        const task = await todoRepository.create(title.trim(), req.user.id);
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/todos/:id', authMiddleware, async (req, res) => {
    const id = Number(req.params.id);

    try {
        const deleted = await todoRepository.delete(id, req.user.id);

        if (!deleted) {
            return res.status(404).json({
                message: 'Todo not found'
            });
        }

        res.json({ message: 'Todo deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
