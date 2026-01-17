const express = require('express');
const router = express.Router();
const Task = require('../models/taskTemp'); // <-- assicurati che il file sia Task.js

// GET: tutte le task
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: crea nuova task
router.post('/', async (req, res) => {
  const task = new Task({
    title: req.body.title,
    description: req.body.description,
    time: req.body.time,
    subject: req.body.subject,
    priority: req.body.priority,
    duration: req.body.duration,
    day: req.body.day,
    completedAt: req.body.completedAt
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: cancella per id
router.delete('/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: 'Task non trovata' });
    res.json({ message: 'Task cancellata' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT: aggiorna per id
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task non trovata' });

    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    task.time = req.body.time ?? task.time;
    task.subject = req.body.subject ?? task.subject;
    task.priority = req.body.priority ?? task.priority;
    task.duration = req.body.duration ?? task.duration;
    task.day = req.body.day ?? task.day;
    task.completed = req.body.completed ?? task.completed;
    task.completedAt = req.body.completedAt ?? task.completedAt; // <-- aggiunta

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
