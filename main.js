import { startRunner } from './runner.js';
import { startRace } from './race.js';
import { startNotes } from './notes.js';

const canvas = document.getElementById('gameCanvas');
const scoreEl = document.getElementById('score');
const joystickContainer = document.getElementById('joystickContainer');
const notesContainer = document.getElementById('notesContainer');
const btnRunner = document.getElementById('btnRunner');
const btnRace = document.getElementById('btnRace');

let currentGame = null;

function updateScore(text) {
  scoreEl.textContent = text;
}

function enterNotes() {
  canvas.style.display = 'none';
  joystickContainer.style.display = 'none';
  notesContainer.style.display = 'block';

  if (currentGame) {
    currentGame.stop();
    currentGame = null;
  }

  startNotes(notesContainer, exitNotes);
}

function exitNotes() {
  notesContainer.style.display = 'none';
  canvas.style.display = 'block';
  joystickContainer.style.display = 'block';
  updateScore('Wähle ein Spiel und starte!');

  // Reset canvas for next game
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

btnRunner.addEventListener('click', () => {
  notesContainer.style.display = 'none';
  canvas.style.display = 'block';
  joystickContainer.style.display = 'block';
  updateScore('Runner Spiel gestartet!');

  if (currentGame) currentGame.stop();
  currentGame = startRunner(canvas, updateScore, enterNotes, joystickContainer);
});

btnRace.addEventListener('click', () => {
  notesContainer.style.display = 'none';
  canvas.style.display = 'block';
  joystickContainer.style.display = 'block';
  updateScore('Rennspiel gestartet!');

  if (currentGame) currentGame.stop();
  currentGame = startRace(canvas, updateScore, enterNotes, joystickContainer);
});

// Initial Setup
updateScore('Wähle ein Spiel und starte!');
notesContainer.style.display = 'none';
