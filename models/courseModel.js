const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const userModel = require('./userModel');
const quizModel = require('./quizModel');
const courses = require("./courses.json");

const COURSE_FILE = path.join(__dirname, 'courses.json');

class CourseModel {
    constructor() {
        this._loadCourses();
    }

    _loadCourses() {
        try {
            const data = fs.readFileSync(COURSE_FILE, 'utf-8');
            this.courses = JSON.parse(data);
        } catch (err) {
            this.courses = [];
        }
    }

    getCoursesByProfessorId(professorId) {
        return this.courses.filter(course => course.professorId === professorId);
    }

    getQuizzesByCourseId(courseId) {
        const quizzes = quizModel.getAllQuizzes();
        return quizzes.filter(quiz => quiz.courseId === courseId);
    }

    getStudentsByCourseId(courseId) {
        const students = userModel.getUsers().filter(user => user.role === 'student');

        const course = courses.find(c => c.id === courseId);
        if (!course) {
            return [];
        }

        return students.filter(student => course.studentIds.includes(student.id));
    }
}

module.exports = new CourseModel();
