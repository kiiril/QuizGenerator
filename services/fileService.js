const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractTextFromFile(file) {
  let text = '';
  if (file.mimetype === 'text/plain') {
    text = fs.readFileSync(file.path, 'utf8');
  } else if (file.mimetype === 'application/pdf') {
    const dataBuffer = fs.readFileSync(file.path);
    const data = await pdfParse(dataBuffer);
    text = data.text;
  } else if (
    file.mimetype ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const data = await mammoth.extractRawText({ path: file.path });
    text = data.value;
  } else {
    throw new Error('Unsupported file type');
  }
  fs.unlinkSync(file.path); // Clean up
  return text;
}

module.exports = { extractTextFromFile };
