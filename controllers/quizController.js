const { extractTextFromFile } = require('../services/fileService');
const quizModel = require('../models/quizModel');
const { generateQuizFromText, gradeQuizSubmission } = require('../services/quizService');
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const attemptModel = require('../models/attemptModel');

exports.uploadFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const text = await extractTextFromFile(file);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: 'Failed to extract text' });
  }
};

exports.generateQuiz = async (req, res) => {
  const { text, questionType, difficulty } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });
  try {
    const quiz = await generateQuizFromText(text, questionType, difficulty);
    const id = quizModel.addQuiz(quiz);
    res.json({ id, quiz });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate quiz', details: err.message });
  }
};

exports.getQuiz = (req, res) => {
  const quiz = quizModel.getQuiz(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  res.json({ quiz });
};

exports.submitQuiz = async (req, res) => {
  const { id, answers } = req.body;
  const quiz = quizModel.getQuiz(id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  try {
    const result = await gradeQuizSubmission(quiz, answers);
    // Store the attempt
    const attemptId = attemptModel.addAttempt({
      quizId: id,
      userId: req.user ? req.user.id : null, // If you have user auth, otherwise null
      details: result.details,
      score: result.score,
      total: result.total,
      timestamp: new Date().toISOString(),
    });
    res.json({ ...result, attemptId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to grade quiz', details: err.message });
  }
};

exports.getAllQuizzes = (req, res) => {
  res.json({ quizzes: quizModel.getAllQuizzes() });
};
