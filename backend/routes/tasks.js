const express = require('express');
const router = express.Router();
const Task = require('../models/task');

// --- GET tutte le task
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- GET task di un giorno specifico
router.get('/day/:date', async (req, res) => {
  try {
    const day = new Date(req.params.date);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const tasks = await Task.find({
      date: { $gte: day, $lt: nextDay }
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- POST nuova task
router.post('/', async (req, res) => {
  const { title, description, time, date } = req.body;

  const task = new Task({ title, description, time, date });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- PUT aggiorna task
router.put('/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- DELETE task
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task eliminata' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;