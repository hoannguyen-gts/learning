const express = require('express');
const todoRepository = require('./todoRepository');

const app = express();

app.use(express.json());
app.use(express.static('public'));


app.get('/todos', async (req, res) => {
    const tasks = await todoRepository.findAll();

    res.json(tasks);
});

app.patch('/todos/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { completed } = req.body;

    try {
        const task = await todoRepository.update(id, completed);
        
        if (!task) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        
        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});


app.post('/todos', async (req, res) => {
    const { title } = req.body;

    if (!title || title.trim() === '') {
        return res.status(400).json({
            message: 'Title is required'
        });
    }

    const task = await todoRepository.create(title.trim());

    res.status(201).json(task);
});



app.delete('/todos/:id', async (req, res) => {
    const id = Number(req.params.id);

    const deleted = await todoRepository.delete(id);

    if (!deleted) {
        return res.status(404).json({
            message: 'Todo not found'
        });
    }

    res.json({
        message: 'Todo deleted'
    });
});


app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});


