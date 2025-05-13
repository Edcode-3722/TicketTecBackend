const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  layout: {
    type: Map,
    of: Number,
    required: true,
    validate: {
      validator: function (v) {
        return v && v.size > 0;
      },
      message: 'El layout debe tener al menos una fila.'
    }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);
