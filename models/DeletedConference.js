const mongoose = require('mongoose');

const deletedConferenceSchema = new mongoose.Schema({
  originalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conference' },
  title: String,
  speaker: String,
  date: Date,
  time: String,
  duration: Number,
  topic: String,
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  posterImage: String,
  synopsis: String,
  capacity: Number,
  seatMap: Array,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeletedConference', deletedConferenceSchema);
