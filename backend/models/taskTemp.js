const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  time: { type: String },
  subject: { type: String },
  priority: { type: String },
  duration: { type: Number },
  day: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null}
});

module.exports = mongoose.model('Task', taskSchema);
