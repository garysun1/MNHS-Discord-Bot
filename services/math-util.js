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
  const digitCopy = [...digits];
  const numbers = expr.match(/\d+/g) || [];

  for (const numStr of numbers) {
    for (const digitChar of numStr) {
      const digit = parseInt(digitChar);
      const idx = digitCopy.indexOf(digit);
      if (idx === -1) return false;
      digitCopy.splice(idx, 1);
    }
  }
  return true;
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