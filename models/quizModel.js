const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

const QUIZ_FILE = path.join(__dirname, 'quizzes.json');

class QuizModel {
  constructor() {
    this._loadQuizzes();
  }

  _loadQuizzes() {
    try {
      const data = fs.readFileSync(QUIZ_FILE, 'utf-8');
      this.quizzes = JSON.parse(data);
    } catch (err) {
      this.quizzes = [];
    }
  }

  _saveQuizzes() {
    fs.writeFileSync(QUIZ_FILE, JSON.stringify(this.quizzes, null, 2));
  }

  addQuiz(quiz) {
    // Generate a unique id
    let id;
    do {
      id = nanoid();
    } while (this.quizzes.some(q => q.id === id));
    const quizObj = { id, ...quiz };
    this.quizzes.push(quizObj);
    this._saveQuizzes();
    return id;
  }

  getQuiz(id) {
    return this.quizzes.find(q => q.id === id);
  }

  getAllQuizzes() {
    return this.quizzes;
  }
}

module.exports = new QuizModel();
