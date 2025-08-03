const mongoose = require('mongoose');

const TimerSchema = new mongoose.Schema({
  shop: { type: String, required: true, index: true },
  productId: { type: String, default: null },

  timerName: { type: String, required: true },
  promotion: { type: String },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  color: { type: String, default: '#00ff00' },
  timerSize: { type: String, enum: ['Small', 'Medium', 'Large'], default: 'Medium' },
  timerPosition: { type: String, enum: ['Top', 'Bottom', 'AboveButton', 'BelowImage'], default: 'Top' },
  urgency: { type: String, enum: ['Color pulse', 'Banner', 'Blink'] },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Timer', TimerSchema);
