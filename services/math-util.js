function generateDigits(n) {
  const digits = [];
  for (let i = 0; i < n; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }
  return digits;
}

function generateTarget(n) {
  const min = 0;
  const max = n*10;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isValidExpression(expr, digits) {
  const freq = {};
  for (const d of digits) freq[d] = (freq[d] || 0) + 1;

  for (const ch of expr.replace(/[^0-9]/g, '')) {
    const d = +ch;
    if (!freq[d]) return false;
    freq[d]--;
  }
  return Object.values(freq).every(c => c === 0);
}

function isCorrectAnswer(expr, digits, target) {
  try {
    const result = evaluate(expr);
    return Math.abs(result - target) < 1e-6 && isValidExpression(expr, digits);
  } catch {
    return false;
  }
}

const { evaluate } = require('mathjs');
module.exports = { generateDigits, generateTarget, isValidExpression, isCorrectAnswer };