// ===== Game Module =====
// Main game loop, state management, and orchestration

const Game = (() => {
  // Game state
  let score = 0;
  let lives = 5;
  let maxLives = 5;
  let streak = 0;
  let stage = 1;
  let question = null;
  let options = [];
  let running = false;
  let animFrame = null;
  let meteorCount = 3;
  let consecutiveCorrect = 0;

  const STAGE_THRESHOLDS = [
    { meteors: 3, score: 0, streak: 0 },
    { meteors: 4, score: 50, streak: 5 },
    { meteors: 5, score: 120, streak: 8 },
    { meteors: 6, score: 220, streak: 12 },
    { meteors: 7, score: 350, streak: 16 },
    { meteors: 8, score: 500, streak: 20 },
  ];

  // Speed meteor naik tiap tahap
  function getMeteorSpeed() {
    return 1.0 + (stage - 1) * 0.5;
  }
  let timer = 30;
  let timerInterval = null;

  const STAGE_TIMES = [30, 25, 20, 15, 10, 5];

  function getQuestionTime() {
    return STAGE_TIMES[Math.min(stage - 1, 5)];
  }

  function startTimer() {
    timer = getQuestionTime();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!running) return;
      timer--;
      UI.updateTimer(timer);
      if (timer <= 0) {
        // Waktu habis - lanjut soal berikutnya
        timer = 0;
        UI.updateTimer(0);
        setTimeout(() => {
          if (running) nextQuestion();
        }, 500);
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function getStage() {
    for (let i = STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
      const t = STAGE_THRESHOLDS[i];
      if (score >= t.score || streak >= t.streak) {
        return i + 1;
      }
    }
    return 1;
  }

  function getMeteorCount() {
    return STAGE_THRESHOLDS[stage - 1].meteors;
  }

  function resetTimer() {
    timer = getQuestionTime();
    UI.updateTimer(timer);
  }

  function start() {
    score = 0;
    lives = 5;
    streak = 0;
    stage = 1;
    consecutiveCorrect = 0;
    Questions.reset();

    UI.updateScore(0);
    UI.updateLives(5, maxLives);
    UI.updateStreak(0);
    UI.updateStage(1);
    UI.updateTimer(30);

    Ship.resetPos();
    Shot.clear();
    Meteor.clear();
    Explosion.clear();

    startTimer();
    nextQuestion();
    running = true;
    UI.hideOverlay();
    loop();
  }

  function nextQuestion() {
    resetTimer();
    question = Questions.generateQuestion();
    meteorCount = getMeteorCount();
    options = Questions.getMeteorOptions(question.answer, meteorCount);

    UI.updateQuestion(question.question);
    Meteor.spawn(question, options, stage, getMeteorSpeed());
  }

  function handleMeteorClick(meteor) {
    if (!running) return;
    const shipPos = Ship.getPosition();
    if (meteor) {
      // Tembak ke meteor
      Shot.create(shipPos.x, shipPos.y, meteor.x, meteor.y);
    } else {
      // Tembak lurus ke atas
      Shot.create(shipPos.x, shipPos.y, shipPos.x, shipPos.y - 200);
    }
  }

  function checkCollisions() {
    const shots = Shot.getAll();
    const meteors = Meteor.getAll();
    const hits = Physics.checkShotMeteorCollisions(shots, meteors);

    for (const { shot, meteor } of hits) {
      Shot.remove(shot);
      checkHit(meteor);
    }
  }

  function checkHit(meteor) {
    if (!running) return;

    if (meteor.isCorrect) {
      // CORRECT HIT
      streak++;
      consecutiveCorrect++;
      const multiplier = streak >= 10 ? 3 : streak >= 5 ? 2 : 1;
      const points = 10 * multiplier;
      score += points;

      Explosion.create(meteor.x, meteor.y, '#4caf50', 16);
      Meteor.remove(meteor);

      if (consecutiveCorrect >= 10 && lives < maxLives) {
        lives++;
        consecutiveCorrect = 0;
        UI.updateLives(lives, maxLives);
      }

      UI.updateScore(score);
      UI.updateStreak(streak);
      UI.updateLives(lives, maxLives);

      const newStage = getStage();
      if (newStage !== stage) {
        stage = newStage;
        UI.updateStage(stage);
      }

      setTimeout(() => {
        if (running) nextQuestion();
      }, 600);

    } else {
      // WRONG HIT
      streak = 0;
      consecutiveCorrect = 0;
      lives--;

      Explosion.create(meteor.x, meteor.y, '#f44336', 10);
      Meteor.remove(meteor);

      UI.updateScore(score);
      UI.updateStreak(streak);
      UI.updateLives(lives, maxLives);

      if (lives <= 0) {
        gameOver();
      }
    }
  }

  function handleMeteorMiss(meteor) {
    // Correct meteor reached bottom without being hit
    lives--;
    streak = 0;
    consecutiveCorrect = 0;
    Meteor.remove(meteor);

    UI.updateLives(lives, maxLives);
    UI.updateStreak(streak);

    // Soal baru muncul meski meteor meleset
    setTimeout(() => {
      if (running) nextQuestion();
    }, 600);

    if (lives <= 0) {
      gameOver();
    }
  }

  function gameOver() {
    running = false;
    stopTimer();
    if (animFrame) cancelAnimationFrame(animFrame);
    Meteor.clear();
    Shot.clear();
    Explosion.clear();
    UI.setGameOver();
  }

  function loop() {
    if (!running) return;

    Ship.update();
    Meteor.update();
    Shot.update();
    Explosion.update();
    checkCollisions();

    animFrame = requestAnimationFrame(loop);
  }

  function init() {
    const svgEl = document.getElementById('game-svg');
    const shipGroup = document.getElementById('ship-group');
    const meteorsGroup = document.getElementById('meteors-group');
    const shotsGroup = document.getElementById('shots-group');
    const explosionsGroup = document.getElementById('explosions-group');

    Ship.mount(shipGroup);
    Meteor.mount(meteorsGroup);
    Shot.mount(shotsGroup);
    Explosion.mount(explosionsGroup);

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      Ship.setKey(e.code, true);
      if (e.code === 'Space') {
        e.preventDefault();
        // Tembak lurus ke atas (Space) atau ke meteor klik (tombol tembak)
        if (running) handleMeteorClick(null);
      }
    });

    document.addEventListener('keyup', (e) => {
      Ship.setKey(e.code, false);
    });

    // Start button
    UI.getStartButton().addEventListener('click', () => {
      UI.hideOverlay();
      start();
    });

    // Initial overlay
    UI.showOverlay('Game Perkalian', 'Tembak meteor dengan jawaban benar!', 'Mulai');

    // Handle window resize (SVG viewBox handles responsiveness)
    window.addEventListener('resize', () => {
      // SVG scales automatically via preserveAspectRatio
    });
  }

  return { init, start, handleMeteorClick, handleMeteorMiss };
})();

// Boot
document.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
