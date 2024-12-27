require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');  // Import the path module
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Media = require('./models/Media');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage for file uploads
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'media',
    allowed_formats: ['jpg', 'png', 'mp4', 'jpeg'],
  },
});

// If you want to upload directly to Cloudinary, use CloudinaryStorage

const upload = multer({ storage: cloudinaryStorage });

// Media upload route
app.post('/api/upload', upload.fields([{ name: 'thumbnail' }, { name: 'video' }]), async (req, res) => {
  try {
    console.log('Request body:', req.body);  // Log the request body
    console.log('Files:', req.files);         // Log the files being uploaded

    // Check if both files are uploaded
    if (!req.files || !req.files.thumbnail || !req.files.video) {
      return res.status(400).json({ message: 'Both thumbnail and video files are required' });
    }

    // Extract fields from request body
    const { title, description } = req.body;

    // Extract file paths from uploaded files
    const thumbnailUrl = req.files.thumbnail[0].path;
    const videoUrl = req.files.video[0].path;

    // Check if title and description are provided
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // Create a new Media object
    const newMedia = new Media({
      title,
      description,
      thumbnailUrl,
      videoUrl
    });

    // Save the media object to the database
    await newMedia.save();

    // Send back the saved media as response
    res.status(201).json(newMedia);

  } catch (err) {
    console.error('Error during media upload:', err);  // Log the error
    res.status(500).json({ message: 'Error uploading media' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
