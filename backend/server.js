const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI non definita');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging semplice per debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Rotta di controllo (health check / homepage)
app.get('/', (req, res) => {
  res.status(200).send('Backend MyStudyPlanner attivo');
});

// Rotta di test
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Connessione a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connesso'))
  .catch(err => console.error('Errore connessione MongoDB:', err));

// API routes
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/focus-sessions', require('./routes/focus'));

// Gestione 404 per endpoint non esistenti
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint non trovato' });
});

// Avvio server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server in ascolto su http://0.0.0.0:${PORT}`);
});
