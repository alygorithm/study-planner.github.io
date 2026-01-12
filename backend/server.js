const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json()); // sostituisce body-parser in Node moderno

// --- Connessione a MongoDB ---
mongoose.connect('mongodb://127.0.0.1:27017/plannerDB')
  .then(() => console.log('MongoDB connesso'))
  .catch(err => console.error('Errore connessione MongoDB:', err));

// --- Routes ---
const tasksRouter = require('./routes/tasks');
app.use('/api/tasks', tasksRouter);

// --- Start server ---
app.listen(PORT, () => console.log(`Server in ascolto su http://localhost:${PORT}`));