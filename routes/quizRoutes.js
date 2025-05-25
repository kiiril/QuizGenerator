const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const quizController = require('../controllers/quizController');
const attemptModel = require('../models/attemptModel');

router.post('/upload', upload.single('file'), quizController.uploadFile);
router.post('/generate-quiz', quizController.generateQuiz);
router.get('/quiz/:id', quizController.getQuiz);
router.post('/submit-quiz', quizController.submitQuiz);
router.get('/quizzes', quizController.getAllQuizzes);

// Get all attempts for a quiz
router.get('/quiz/:quizId/attempts', (req, res) => {
  const attempts = attemptModel.getAttemptsByQuizId(req.params.quizId);
  res.json({ attempts });
});

// Get a specific attempt by attemptId
router.get('/attempt/:attemptId', (req, res) => {
  const attempt = attemptModel.getAttempt(req.params.attemptId);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
  res.json({ attempt });
});

// Get all attempts
router.get('/attempts', (req, res) => {
  res.json({ attempts: attemptModel.getAllAttempts() });
});

module.exports = router;
