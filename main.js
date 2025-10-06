import { startRunner } from './runner.js';
import { startRace } from './race.js';

const menu = document.getElementById('menu');
const game = document.getElementById('game');
const canvas = document.getElementById('gameCanvas');
const scoreEl = document.getElementById('score');
const backBtn = document.getElementById('btnBack');
const joystickContainer = document.getElementById('joystickContainer');

let currentGame = null;

document.getElementById('btnRunner').addEventListener('click', () => {
  startGame('runner');
});
document.getElementById('btnRace').addEventListener('click', () => {
  startGame('race');
});
backBtn.addEventListener('click', () => {
  if (currentGame && currentGame.stop) currentGame.stop();
  game.style.display = 'none';
  joystickContainer.style.display = 'none';
  menu.style.display = 'block';
  scoreEl.textContent = '';
  // Clear canvas:
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

function startGame(type) {
  menu.style.display = 'none';
  game.style.display = 'block';
  joystickContainer.style.display = 'block';

  if (currentGame && currentGame.stop) currentGame.stop();

  if (type === 'runner') {
    currentGame = startRunner(canvas, updateScore, enterNotes, joystickContainer);
  } else if (type === 'race') {
    currentGame = startRace(canvas, updateScore, enterNotes, joystickContainer);
  }
}

function updateScore(text) {
  scoreEl.textContent = text;
}

function enterNotes() {
  window.location.href = 'notes/notes.html';
}
