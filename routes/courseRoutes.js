const express = require('express');
const router = express.Router();
const courseController = require("../controllers/courseController");

router.get('/courses/:professorId', courseController.listCourses);
router.get('/courses/:courseId/quizzes', courseController.listQuizAggregates);
router.get('/courses/:courseId/students', courseController.listStudentProgress);


module.exports = router;