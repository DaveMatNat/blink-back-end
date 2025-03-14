require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS to allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies

// Default to port 5000, but use a different port if it's busy
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scheduleDB';

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Define Course Schema
const courseSchema = new mongoose.Schema({
  term: String,
  courseReferenceNumber: String,
  subjectCourse: String,//courseNumber: String,
  courseTitle: String,
  courseMajor: String, // Updated field (formerly "courseDescription")
  courseDescription: String, // Newly added field
  faculty: Array,
  meetingsFaculty: Array,
  sectionAttributes: Array
});

const Course = mongoose.model('Course', courseSchema);

// Route to check if the server is running
app.get('/', (req, res) => {
  res.send('Schedule Maker API is running...');
});

// Place holder for future endpoints
// ****************************************************

// API Route to Fetch All Courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API Route to Fetch a Single Course by CRN
app.get('/api/courses/:crn', async (req, res) => {
  try {
    const course = await Course.findOne({ courseReferenceNumber: req.params.crn });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ****************************************************


// Start the server and handle potential errors
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle errors if the port is in use
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Trying a new port...`);
    const newPort = PORT + 1;
    server.listen(newPort, () => {
      console.log(`Server running on port ${newPort}`);
    });
  } else {
    console.error('Server error:', err);
  }
});