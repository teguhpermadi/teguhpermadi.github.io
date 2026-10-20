// ===== UI Module =====
// HUD updates and overlay management

const UI = (() => {
  const scoreEl = document.getElementById('score-display');
  const questionEl = document.getElementById('question-display');
  const livesEl = document.getElementById('lives-display');
  const streakEl = document.getElementById('streak-display');
  const stageEl = document.getElementById('stage-display');
  const timerEl = document.getElementById('timer-display');
  const overlayEl = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayText = document.getElementById('overlay-text');
  const btnStart = document.getElementById('btn-start');
  const btnShoot = document.getElementById('btn-shoot');

  function updateScore(score) {
    scoreEl.textContent = `Skor: ${score}`;
  }

  function updateQuestion(text) {
    questionEl.textContent = text;
  }

  function updateLives(lives, maxLives) {
    const hearts = '❤️'.repeat(lives) + '🖤'.repeat(maxLives - lives);
    livesEl.textContent = hearts;
  }

  function updateStreak(streak) {
    streakEl.textContent = `Streak: ${streak}`;
  }

  function updateStage(stage) {
    stageEl.textContent = `Tahap ${stage}`;
  }

  function updateTimer(time) {
    timerEl.textContent = time;
    // Warnai merah saat kurang dari 10 detik
    timerEl.style.color = time <= 10 ? '#f44336' : '#00d4ff';
  }

  function showOverlay(title, text, buttonText = 'Mulai') {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    btnStart.textContent = buttonText;
    overlayEl.classList.remove('hidden');
  }

  function hideOverlay() {
    overlayEl.classList.add('hidden');
  }

  function setGameOver() {
    overlayEl.classList.add('game-over');
    overlayTitle.textContent = 'Game Over';
    overlayText.textContent = 'Nyawa habis!';
    btnStart.textContent = 'Main Lagi';
    overlayEl.classList.remove('hidden');
  }

  function getStartButton() {
    return btnStart;
  }

  function getShootButton() {
    return btnShoot;
  }

  function hideTouchControls() {
    document.getElementById('touch-controls').style.display = 'none';
  }

  return {
    updateScore, updateQuestion, updateLives, updateStreak,
    updateStage, updateTimer, showOverlay, hideOverlay, setGameOver,
    getStartButton, getShootButton, hideTouchControls
  };
})();
