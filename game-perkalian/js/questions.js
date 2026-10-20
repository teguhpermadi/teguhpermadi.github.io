// ===== Questions Module =====
// Generates multiplication questions (2×2 to 10×10)

const Questions = (() => {
  const HISTORY_SIZE = 5;
  let recentQuestions = [];

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateQuestion() {
    const a = randomInt(2, 10);
    const b = randomInt(2, 10);
    const product = a * b;
    const types = ['A', 'B', 'C', 'D', 'E'];
    const type = types[randomInt(0, types.length - 1)];

    let question, answer;
    switch (type) {
      case 'A': // a × b = ?
        question = `${a} × ${b} = ?`;
        answer = product;
        break;
      case 'B': // ? × b = product
        question = `? × ${b} = ${product}`;
        answer = a;
        break;
      case 'C': // a × ? = product
        question = `${a} × ? = ${product}`;
        answer = b;
        break;
      case 'D': // product = b × ?
        question = `${product} = ${b} × ?`;
        answer = a;
        break;
      case 'E': // a × _ = product
        question = `${a} × _ = ${product}`;
        answer = b;
        break;
    }

    // Ensure no consecutive duplicate
    if (recentQuestions.length > 0) {
      const last = recentQuestions[recentQuestions.length - 1];
      if (last.question === question && last.answer === answer) {
        return generateQuestion(); // retry
      }
    }

    const q = { question, answer, type, a, b, product };
    recentQuestions.push(q);
    if (recentQuestions.length > HISTORY_SIZE) {
      recentQuestions.shift();
    }
    return q;
  }

  function generateWrongAnswers(correctAnswer, count) {
    const wrongs = new Set();
    while (wrongs.size < count) {
      const offset = randomInt(2, 12);
      const sign = Math.random() < 0.5 ? -1 : 1;
      const wrong = correctAnswer + (sign * offset);
      if (wrong !== correctAnswer && wrong >= 2 && wrong <= 120) {
        wrongs.add(wrong);
      }
    }
    return Array.from(wrongs);
  }

  function getMeteorOptions(correctAnswer, totalCount) {
    const wrongCount = totalCount - 1;
    const wrongs = generateWrongAnswers(correctAnswer, wrongCount);
    const options = [correctAnswer, ...wrongs];
    // Shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = randomInt(0, i);
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  }

  function reset() {
    recentQuestions = [];
  }

  return { generateQuestion, getMeteorOptions, reset };
})();
