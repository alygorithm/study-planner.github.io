const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connessione MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connesso'))
  .catch(err => console.log('Errore connessione MongoDB:', err));

// --- ROUTES API ---
const tasksRouter = require('./routes/tasks');
app.use('/api/tasks', tasksRouter);

const focusSessionRouter = require('./routes/focus');
app.use('/api/focus-sessions', focusSessionRouter);

// --- SERVE FRONTEND ---
app.use(express.static(path.join(__dirname, 'www')));

// fallback per routing Angular/Ionic
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

// Avvio server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server in ascolto su http://0.0.0.0:${PORT}`);
});