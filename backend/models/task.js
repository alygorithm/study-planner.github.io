const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  time: { type: String },
  completed: { type: Boolean, default: false },
  date: { type: Date, required: true }
});

module.exports = mongoose.models.Task || mongoose.model('Task', TaskSchema);