const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  videoUrl: { type: String, required: true },
});

module.exports = mongoose.model('Media', mediaSchema);
