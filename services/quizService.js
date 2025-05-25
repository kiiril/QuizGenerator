const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateQuizFromText(text, questionType, difficulty) {
  // Determine number of questions based on difficulty
  let numQuestions = 5;
  if (difficulty && typeof difficulty === 'string') {
    const diff = difficulty.toLowerCase();
    if (diff === 'easy') numQuestions = 5;
    else if (diff === 'medium') numQuestions = 8;
    else if (diff === 'hard') numQuestions = 12;
  }
  // Build a strict prompt
  let prompt = `Generate exactly ${numQuestions} quiz questions from the following text. Each question must match the type: ${questionType || 'mixed'} and difficulty: ${difficulty || 'auto'}. Return ONLY a JSON array, no markdown or code fences, with this structure: [{"question": string, "type": "mcq"|"truefalse"|"short", "options"?: string[], "answer": string, "difficulty": string}]. Text: ${text}`;
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a strict quiz generator. Always follow the user instructions exactly.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 1200,
    temperature: 0.7,
  });
  let content = completion.choices[0].message.content.trim();
  // No need to strip code fences, just parse
  return JSON.parse(content);
}

async function gradeQuizSubmission(quiz, answers) {
    if (!Array.isArray(quiz)) {
        // Try to convert object with numeric keys to array
        const keys = Object.keys(quiz).filter(k => !isNaN(Number(k)));
        if (keys.length > 0) {
            quiz = keys.sort((a, b) => Number(a) - Number(b)).map(k => quiz[k]);
            console.log('Quiz converted to array:', quiz);
        } else {
            console.log('Quiz is not an array and has no numeric keys.');
        }
    }
    let correct = 0;
    const details = [];
    for (let i = 0; i < quiz.length; i++) {
        const q = quiz[i];
        const userAnswer = answers[i] || '';
        let isCorrect = false;
        let aiFeedback = null;
        if (q.type === 'mcq' || q.type === 'truefalse') {
            isCorrect = userAnswer.toString().trim().toLowerCase() === (q.answer || '').toString().trim().toLowerCase();
        } else if (q.type === 'short') {
            try {
                const prompt = `Question: ${q.question}\nCorrect Answer: ${q.answer}\nStudent Answer: ${userAnswer}\nIs the student's answer correct or close enough to be accepted? Reply with only 'yes' or 'no' and a one-sentence explanation.`;
                const completion = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are a strict but fair quiz grader.' },
                        { role: 'user', content: prompt },
                    ],
                    max_tokens: 50,
                    temperature: 0.2,
                });
                const content = completion.choices[0].message.content.trim();
                isCorrect = /^yes\b/i.test(content);
                aiFeedback = content;
            } catch (err) {
                aiFeedback = 'AI grading error.';
            }
        }
        if (isCorrect) correct++;
        details.push({
            question: q.question,
            correctAnswer: q.answer,
            userAnswer,
            isCorrect,
            type: q.type,
            aiFeedback,
        });
    }
    console.log('Grading details:', details);
    return { score: correct, total: quiz.length, details };
}

module.exports = { generateQuizFromText, gradeQuizSubmission };
