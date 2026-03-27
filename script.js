// --- ELEMENTS ---
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const normalBtn = document.getElementById('normal-btn');
const timedBtn = document.getElementById('timed-btn');
const backButton = document.getElementById('back-button');
const gameBoard = document.getElementById('game-board');
const deckContainer = document.getElementById('deck-container'); // for deck animation
const statusText = document.getElementById('status');
const restartButton = document.getElementById('restart-button');
const timerDisplay = document.getElementById('timer');
const timeSpan = document.getElementById('time');
const starsContainer = document.getElementById('stars');

let timerInterval;
let timeLeft;

// --- CREATE BLINKING STARS ---
function createStars(count = 150) {
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.top = Math.random() * window.innerHeight + 'px';
    star.style.left = Math.random() * window.innerWidth + 'px';
    const size = 1 + Math.random() * 2;
    star.style.width = star.style.height = size + 'px';
    star.style.animationDelay = Math.random() * 3 + 's';
    starsContainer.appendChild(star);
  }
}
createStars();

// --- REALISTIC SHOOTING STARS ---
function shootingStar() {
  const star = document.createElement('div');
  star.classList.add('shooting-star');

  const startX = window.innerWidth - 50;
  const startY = 50;
  const endX = 50;
  const endY = window.innerHeight - 50;

  const angle = Math.atan2(endY - startY, endX - startX) * (285 / Math.PI);
  star.style.transform = `rotate(${angle}deg)`;

  star.style.left = startX + 'px';
  star.style.top = startY + 'px';

  starsContainer.appendChild(star);

  const duration = 1.5 + Math.random();
  const startTime = performance.now();

  function animate(time) {
    const elapsed = (time - startTime) / 1000;
    const progress = Math.min(elapsed / duration, 1);

    star.style.left = startX + (endX - startX) * progress + 'px';
    star.style.top = startY + (endY - startY) * progress + 'px';
    star.style.opacity = 1 - progress;

    if (progress < 1) requestAnimationFrame(animate);
    else star.remove();
  }

  requestAnimationFrame(animate);
}

setInterval(() => {
  shootingStar();
}, 2000 + Math.random() * 2000);

// --- START BUTTONS ---
normalBtn.addEventListener('click', () => startGame(false));
timedBtn.addEventListener('click', () => startGame(true));
backButton.addEventListener('click', () => {
  startScreen.style.display = 'block';
  gameScreen.style.display = 'none';
  clearInterval(timerInterval);
});

// --- GAME FUNCTION ---
function startGame(isTimed) {
  startScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  timerDisplay.style.display = isTimed ? 'block' : 'none';
  clearInterval(timerInterval);

  const pairs = parseInt(document.getElementById('card-count').value) || 6;

  // ✅ GRID FIX (HÄR ÄR DET NYA)
  const totalCards = pairs * 2;
  let columns;

  if (totalCards === 6) columns = 3;
  else if (totalCards === 8) columns = 4;
  else if (totalCards === 10) columns = 5;
  else columns = Math.ceil(Math.sqrt(totalCards));

  gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

  const symbols = [
    'images/1000002261.jpg',
    'images/1000002262.jpg',
    'images/1000002264.jpg',
    'images/1000002265.jpg',
    'images/1000002266.jpg',
    'images/20251214_191648 - kopia.jpg',
    'images/1000002825.jpg',
    'images/nedladdning - 2026-03-26T223312.704.jpg',
    'images/nedladdning - 2026-03-26T223525.210.jpg',
    'images/nedladdning.avif'
  ].slice(0, pairs);

  deckContainer.innerHTML = '';
  gameBoard.innerHTML = '';

  let cardsArray = shuffle([...symbols, ...symbols]);
  let firstCard = null;
  let secondCard = null;
  let lockBoard = true;
  let matchedPairs = 0;
  statusText.textContent = "Find all matching pairs!";

  // --- CREATE DECK CARDS AND DEAL ---
  cardsArray.forEach((src, index) => {
    const card = document.createElement('div');
    card.classList.add('Card', 'deck-card');
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"><img src="${src}"></div>
        <div class="card-back"><img src="images/HiPaint_1765728439769.png"></div>
      </div>
    `;
    deckContainer.appendChild(card);

    setTimeout(() => {
      const cell = document.createElement('div');
      cell.classList.add('Card');
      cell.innerHTML = card.innerHTML;
      gameBoard.appendChild(cell);
      card.remove();

      cell.addEventListener('click', () => {
        if (lockBoard || cell.classList.contains('flipped')) return;
        cell.classList.add('flipped');

        if (!firstCard) {
          firstCard = cell;
          return;
        }

        secondCard = cell;
        lockBoard = true;

        const firstImg = firstCard.querySelector('.card-front img').src;
        const secondImg = secondCard.querySelector('.card-front img').src;

        if (firstImg === secondImg) {
          matchedPairs++;
          resetTurn();
          if (matchedPairs === pairs) {
            statusText.textContent = "You won!";
            clearInterval(timerInterval);
            showConfetti();
          }
        } else {
          firstCard.classList.add('wrong');
          secondCard.classList.add('wrong');
          setTimeout(() => {
            firstCard.classList.remove('flipped','wrong');
            secondCard.classList.remove('flipped','wrong');
            resetTurn();
          }, 800);
        }
      });
    }, index * 200);
  });

  setTimeout(() => lockBoard = false, cardsArray.length * 200);

  // --- TIMER ---
  if (isTimed) {
    timeLeft = parseInt(document.getElementById('difficulty').value) || 60;
    timeSpan.textContent = timeLeft;
    timerInterval = setInterval(() => {
      timeLeft--;
      timeSpan.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        statusText.textContent = "Time's up!";
        document.querySelectorAll('.Card').forEach(c => c.classList.add('flipped'));
        lockBoard = true;
      }
    }, 1000);
  }

  restartButton.onclick = () => startGame(isTimed);

  function resetTurn() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

// --- CONFETTI ---
function showConfetti() {
  const confettiContainer = document.getElementById('confetti-container');
  confettiContainer.innerHTML = '';
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.background = `hsl(${Math.random()*360}, 70%, 60%)`;
    confetti.style.animation = `confetti-fall ${2 + Math.random()*2}s linear forwards`;
    confetti.style.transform = `rotate(${Math.random()*360}deg)`;
    confettiContainer.appendChild(confetti);
  }
  setTimeout(() => confettiContainer.innerHTML = '', 4000);
}