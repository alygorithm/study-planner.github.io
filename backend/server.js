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

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connesso'))
  .catch(err => console.error('Errore connessione MongoDB:', err));

app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/focus-sessions', require('./routes/focus'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server in ascolto su http://0.0.0.0:${PORT}`);
});
