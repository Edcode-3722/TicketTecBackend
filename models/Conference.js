const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  code: { type: String, required: true },
  reserved: { type: Boolean, default: false },
  reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  qrCode: { type: String, default: null }
}, { _id: false });

const conferenceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  speaker: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true },
  topic: { type: String, required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  posterImage: { type: String, required: true },
  synopsis: { type: String, required: true },
  capacity: { type: Number, required: true },
  seatMap: { type: [seatSchema], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conference', conferenceSchema);
