const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scheduleDB';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Define Course Schema
const courseSchema = new mongoose.Schema({
  term: String,
  courseReferenceNumber: String,
  subjectCourse: String, //courseNumber: String,
  courseTitle: String,
  courseMajor: String, // Updated field (formerly "courseDescription")
  courseDescription: String, // Newly added field
  faculty: Array,
  meetingsFaculty: Array,
  sectionAttributes: Array
});

const Course = mongoose.model('Course', courseSchema);

// Read scraped data from JSON
const loadCourses = async () => {
  try {
    const courses = JSON.parse(fs.readFileSync('courses.json', 'utf-8'));

    // Clean up potential duplicate records
    await Course.deleteMany({});
    console.log("🧹 Removed old courses before inserting new ones.");

    // Insert new data
    await Course.insertMany(courses);
    console.log('✅ Data successfully loaded into MongoDB');

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error inserting data:', err);
  }
};

loadCourses();