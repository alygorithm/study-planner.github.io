const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connessione MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connesso'))
  .catch(err => console.log('Errore connessione MongoDB:', err));

// --- ROUTES ---
const tasksRouter = require('./routes/tasks');
app.use('/api/tasks', tasksRouter);

// Rotta di test
app.get('/', (req, res) => {
  res.send('Backend funzionante!');
});

// Avvio server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server in ascolto su http://0.0.0.0:${PORT}`);
});
