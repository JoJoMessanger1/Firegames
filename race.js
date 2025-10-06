export function startRace(canvas, updateScore, enterNotes, joystickContainer) {
  const ctx = canvas.getContext('2d');

  // Rennstrecke
  const track = {
    x: 50,
    y: 50,
    width: canvas.width - 100,
    height: canvas.height - 100,
  };

  // Spielerauto
  const playerCar = {
    x: canvas.width / 2,
    y: canvas.height - 150,
    width: 50,
    height: 100,
    speed: 0,
    maxSpeed: 8,
    acceleration: 0.3,
    friction: 0.1,
    angle: 0, // in rad
    dx: 0,
    dy: 0,
  };

  // Gegnerautos
  const enemyCars = [];
  const numEnemies = 3;

  // Steuerung
  const keys = { left: false, right: false, up: false, down: false };

  // Runden
  const totalLaps = 2;
  let currentLap = 1;
  let gameOver = false;

  // Portal für Notizen (grünes Rohr)
  const portal = {
    x: track.x + track.width / 2 - 30,
    y: track.y + 20,
    width: 60,
    height: 60,
  };

  // Joystick Setup
  setupJoystick();

  // Tastatursteuerung
  function keyDownHandler(e) {
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        keys.left = true;
        break;
      case 'ArrowRight':
      case 'd':
        keys.right = true;
        break;
      case 'ArrowUp':
      case 'w':
        keys.up = true;
        break;
      case 'ArrowDown':
      case 's':
        keys.down = true;
        break;
    }
  }
  function keyUpHandler(e) {
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        keys.left = false;
        break;
      case 'ArrowRight':
      case 'd':
        keys.right = false;
        break;
      case 'ArrowUp':
      case 'w':
        keys.up = false;
        break;
      case 'ArrowDown':
      case 's':
        keys.down = false;
        break;
    }
  }

  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);

  // Gegnerautos erzeugen (zufällige Startpositionen auf der Strecke)
  function spawnEnemies() {
    enemyCars.length = 0;
    for (let i = 0; i < numEnemies; i++) {
      const enemy = {
        x: track.x + 50 + i * 100,
        y: track.y + 100 - i * 120,
        width: 50,
        height: 100,
        speed: 4 + Math.random() * 2,
        angle: 0,
        color: `hsl(${Math.random() * 360}, 80%, 50%)`,
      };
      enemyCars.push(enemy);
    }
  }

  spawnEnemies();

  // Joystick
  let joystick = null;

  function setupJoystick() {
    joystickContainer.innerHTML = '';
    joystick = createJoystick(joystickContainer, (xDir, yDir) => {
      // xDir, yDir zwischen -1 und 1
      if (xDir) {
        if (xDir < -0.1) keys.left = true;
        else keys.left = false;
        if (xDir > 0.1) keys.right = true;
        else keys.right = false;
      } else {
        keys.left = false;
        keys.right = false;
      }
      if (yDir) {
        if (yDir < -0.1) keys.up = true;
        else keys.up = false;
        if (yDir > 0.1) keys.down = true;
        else keys.down = false;
      } else {
        keys.up = false;
        keys.down = false;
      }
    });
  }

  function createJoystick(container, onMove) {
    const base = document.createElement('div');
    const stick = document.createElement('div');

    Object.assign(base.style, {
      width: '120px',
      height: '120px',
      background: 'rgba(0,255,0,0.25)',
      borderRadius: '50%',
      position: 'relative',
      touchAction: 'none',
      userSelect: 'none',
    });

    Object.assign(stick.style, {
      width: '60px',
      height: '60px',
      background: 'limegreen',
      borderRadius: '50%',
      position: 'absolute',
      left: '30px',
      top: '30px',
      transition: '0.1s',
      userSelect: 'none',
    });

    base.appendChild(stick);
    container.appendChild(base);

    let dragging = false;
    let startX = 0;
    let startY = 0;

    base.addEventListener('pointerdown', (e) => {
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      e.preventDefault();
    });

    base.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const dist = Math.min(40, Math.sqrt(dx * dx + dy * dy));
      const angle = Math.atan2(dy, dx);

      const stickX = 60 + dist * Math.cos(angle) - 30;
      const stickY = 60 + dist * Math.sin(angle) - 30;
      stick.style.left = stickX + 'px';
      stick.style.top = stickY + 'px';

      const normX = dist > 5 ? Math.cos(angle) : 0;
      const normY = dist > 5 ? Math.sin(angle) : 0;
      onMove(normX, normY);
      e.preventDefault();
    });

    function reset() {
      dragging = false;
      stick.style.left = '30px';
      stick.style.top = '30px';
      onMove(0, 0);
    }

    base.addEventListener('pointerup', reset);
    base.addEventListener('pointerleave', reset);

    return { base, stick };
  }

  // Auto zeichnen (Spieler & Gegner)
  function drawCar(car, isPlayer = false) {
    ctx.save();
    ctx.translate(car.x + car.width / 2, car.y + car.height / 2);
    ctx.rotate(car.angle);
    ctx.fillStyle = isPlayer ? 'cyan' : car.color;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;

    // Karosserie
    ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);

    // Scheinwerfer vorne
    ctx.fillStyle = 'yellow';
    ctx.fillRect(-car.width / 2 + 10, -car.height / 2, 10, 20);
    ctx.fillRect(car.width / 2 - 20, -car.height / 2, 10, 20);

    ctx.restore();
  }

  // Bewegung des Spielerautos
  function updatePlayer() {
    if (keys.up) {
      playerCar.speed += playerCar.acceleration;
      if (playerCar.speed > playerCar.maxSpeed) playerCar.speed = playerCar.maxSpeed;
    } else if (keys.down) {
      playerCar.speed -= playerCar.acceleration;
      if (playerCar.speed < -playerCar.maxSpeed / 2) playerCar.speed = -playerCar.maxSpeed / 2;
    } else {
      // Reibung
      if (playerCar.speed > 0) {
        playerCar.speed -= playerCar.friction;
        if (playerCar.speed < 0) playerCar.speed = 0;
      } else if (playerCar.speed < 0) {
        playerCar.speed += playerCar.friction;
        if (playerCar.speed > 0) playerCar.speed = 0;
      }
    }

    // Lenken nur wenn Geschwindigkeit != 0
    if (playerCar.speed !== 0) {
      if (keys.left) playerCar.angle -= 0.04 * (playerCar.speed / playerCar.maxSpeed);
      if (keys.right) playerCar.angle += 0.04 * (playerCar.speed / playerCar.maxSpeed);
    }

    // Neue Position
    playerCar.dx = Math.sin(playerCar.angle) * playerCar.speed;
    playerCar.dy = -Math.cos(playerCar.angle) * playerCar.speed;
    playerCar.x += playerCar.dx;
    playerCar.y += playerCar.dy;

    // Begrenzung auf Track
    if (playerCar.x < track.x) playerCar.x = track.x;
    if (playerCar.x + playerCar.width > track.x + track.width) playerCar.x = track.x + track.width - playerCar.width;
    if (playerCar.y < track.y) playerCar.y = track.y;
    if (playerCar.y + playerCar.height > track.y + track.height) playerCar.y = track.y + track.height - playerCar.height;
  }

  // Gegnerautos bewegen
  function updateEnemies() {
    enemyCars.forEach(car => {
      car.y += car.speed;

      if (car.y > track.y + track.height) {
        car.y = track.y - car.height;
        car.x = track.x + Math.random() * (track.width - car.width);
        car.speed = 3 + Math.random() * 2;
      }
    });
  }

  // Kollisionsabfrage Spieler - Gegner
  function checkCollision() {
    return enemyCars.some(car => {
      return !(playerCar.x + playerCar.width < car.x ||
               playerCar.x > car.x + car.width ||
               playerCar.y + playerCar.height < car.y ||
               playerCar.y > car.y + car.height);
    });
  }

  // Check ob Spieler im Portal
  function checkPortal() {
    return !(playerCar.x + playerCar.width < portal.x ||
             playerCar.x > portal.x + portal.width ||
             playerCar.y + playerCar.height < portal.y ||
             playerCar.y > portal.y + portal.height);
  }

  // Zeichne Rennstrecke & Portal
  function drawTrack() {
    ctx.fillStyle = '#555';
    ctx.fillRect(track.x, track.y, track.width, track.height);

    // Trackrand
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.strokeRect(track.x, track.y, track.width, track.height);

    // Portal (grünes Rohr)
    ctx.fillStyle = 'limegreen';
    ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Notizen', portal.x + 5, portal.y + 35);
  }

  // Spiel Loop
  function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawTrack();

    updatePlayer();
    updateEnemies();

    drawCar(playerCar, true);
    enemyCars.forEach(drawCar);

    // Kollisionen prüfen
    if (checkCollision()) {
      gameOver = true;
      updateScore('Crash! Spiel vorbei. Neustart mit F5.');
      return;
    }

    // Portal Check
    if (checkPortal()) {
      gameOver = true;
      enterNotes();
      return;
    }

    updateScore(`Rennen Runde: ${currentLap}/${totalLaps}`);

    requestAnimationFrame(gameLoop);
  }

  gameLoop();

  return {
    stop() {
      gameOver = true;
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
    }
  };
}
