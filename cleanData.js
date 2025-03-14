const fs = require("fs");

// Load existing courses.json
let courses = JSON.parse(fs.readFileSync("courses.json", "utf-8"));

// Clean courseDescription field
courses.forEach(course => {
    if (course.courseDescription) {
        course.courseDescription = course.courseDescription.replace(/<br\s*\/?>/gi, ' ').trim();
    }
});

// Save cleaned data back to courses.json
fs.writeFileSync("courses.json", JSON.stringify(courses, null, 2));

console.log("✅ Cleaned course descriptions and updated courses.json!");