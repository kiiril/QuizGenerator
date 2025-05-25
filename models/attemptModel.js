const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

const ATTEMPT_FILE = path.join(__dirname, 'attempts.json');

class AttemptModel {
  constructor() {
    this._loadAttempts();
  }

  _loadAttempts() {
    try {
      const data = fs.readFileSync(ATTEMPT_FILE, 'utf-8');
      this.attempts = JSON.parse(data);
    } catch (err) {
      this.attempts = [];
    }
  }

  _saveAttempts() {
    fs.writeFileSync(ATTEMPT_FILE, JSON.stringify(this.attempts, null, 2));
  }

  addAttempt({ quizId, userId, details, score, total, timestamp }) {
    const attemptId = nanoid();
    const attempt = {
      attemptId,
      quizId,
      userId: userId || null,
      details,
      score,
      total,
      timestamp: timestamp || new Date().toISOString(),
    };
    this.attempts.push(attempt);
    this._saveAttempts();
    return attemptId;
  }

  getAttemptsByQuizId(quizId) {
    return this.attempts.filter(a => a.quizId === quizId);
  }

  getAttempt(attemptId) {
    return this.attempts.find(a => a.attemptId === attemptId);
  }

  getAllAttempts() {
    return this.attempts;
  }
}

module.exports = new AttemptModel();
