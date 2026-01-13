const express = require('express');
const router = express.Router();
const FocusSession = require('../models/focusTemp'); // corretto

// GET tutte le sessioni
router.get('/', async (req, res) => {
  try {
    const sessions = await FocusSession.find(); // <-- qui
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST nuova sessione
router.post('/', async (req, res) => {
  const session = new FocusSession({        // <-- qui
    subject: req.body.subject,
    minutes: req.body.minutes,
    completed: req.body.completed,
    day: req.body.day ?? new Date()
  });

  try {
    const newSession = await session.save();
    res.status(201).json(newSession);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
