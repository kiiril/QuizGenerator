const courseModel  = require('../models/courseModel');
const attemptModel = require('../models/attemptModel');

exports.listCourses = (req, res) => {
    const professorId = parseInt(req.params.professorId, 10);
    const courses = courseModel.getCoursesByProfessorId(professorId);
    res.json({ courses });
};

exports.listQuizAggregates = (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);
    // 1) all quizzes in this course
    const quizzes = courseModel.getQuizzesByCourseId(courseId);
    // 2) all attempts for those quizzes
    const allAttempts = attemptModel.getAllAttempts()
        .filter(a => quizzes.some(q => q.id === a.quizId))
        .map(a => ({
            id: a.attemptId,
            quizId: a.quizId,
            userId: a.userId,
            score: a.score,
            total: a.total,
            timestamp: a.timestamp,
            details: a.details
        }));

    const aggregates = quizzes.map(q => {
        const attempts = allAttempts.filter(a => a.quizId === q.id);
        const totalAttempts = attempts.length;
        const averageScore = totalAttempts > 0
            ? attempts.reduce((sum, a) => sum + (a.score / a.total * 100), 0) / totalAttempts
            : 0;
        return {
            id:            q.id,
            title:         q.title,
            totalAttempts,
            averageScore:  +averageScore.toFixed(1)
        };
    });

    res.json({ quizzes: aggregates });
};

exports.listStudentProgress = (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);
    // 1) students in this course
    const students = courseModel.getStudentsByCourseId(courseId);
    // 2) quizzes in this course
    const quizzes  = courseModel.getQuizzesByCourseId(courseId);
    // 3) all attempts for those quizzes
    const allAttempts = attemptModel.getAllAttempts()
        .filter(a => quizzes.some(q => q.id === a.quizId))
        .map(a => ({
            id: a.attemptId,
            quizId: a.quizId,
            userId: a.userId,
            score: a.score,
            total: a.total,
            timestamp: a.timestamp,
            details: a.details
        }));

    const progress = students.map(s => {
        // all attempts by this student
        const attempts = allAttempts.filter(a => a.userId === s.id);
        // distinct quizzes completed
        const completedQuizzes = new Set(attempts.map(a => a.quizId)).size;
        // average across all attempts
        const averageScore = attempts.length > 0
            ? attempts.reduce((sum, a) => sum + (a.score / a.total * 100), 0) / attempts.length
            : 0;
        // last activity
        const lastAttemptAt = attempts.length > 0
            ? attempts
                .map(a => new Date(a.timestamp))
                .sort((a,b) => b - a)[0]
                .toISOString()
            : null;

        return {
            id:               s.id,
            name:             s.name,
            completedQuizzes,
            avgScore:         +averageScore.toFixed(1),
            lastAttemptAt
        };
    });

    res.json({ students: progress });
};