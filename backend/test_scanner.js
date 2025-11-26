const path = require('path');
const { getCourses } = require('./utils/scanner');

const coursesPath = path.join(__dirname, '../courses');
console.log('Scanning courses in:', coursesPath);

try {
    const courses = getCourses(coursesPath);
    console.log(JSON.stringify(courses, null, 2));
} catch (error) {
    console.error('Error:', error);
}
