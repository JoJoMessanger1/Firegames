export function startRunner(canvas, updateScore, enterNotes, joystickContainer) {
  const ctx = canvas.getContext('2d');

  // Spieler Eigenschaften
  const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 100,
    width: 40,
    height: 70,
    speed: 5,
    dx: 0,
  };

  let obstacles = [];
  let frameCount = 0;
  let gameOver = false;
  let score = 0;

  // Steuerung via Tastatur
  const keys = { left: false, right: false };

  // Joystick Setup
  setupJoystick();

  function setupJoystick() {
    joystickContainer.innerHTML = '';
    createJoystick(joystickContainer, (dx) => {
      player.dx = dx * player.speed;
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

    base.addEventListener('pointerdown', (e) => {
      dragging = true;
      startX = e.clientX;
      e.preventDefault();
    });

    base.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const clamped = Math.max(-40, Math.min(40, dx));
      stick.style.left = 30 + clamped + 'px';
      onMove(Math.abs(clamped) > 5 ? clamped / 40 : 0);
      e.preventDefault();
    });

    base.addEventListener('pointerup', reset);
    base.addEventListener('pointerleave', reset);

    function reset() {
      dragging = false;
      stick.style.left = '30px';
      onMove(0);
    }
  }

  // Tastatursteuerung
  function keyDownHandler(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
  }

  function keyUpHandler(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
  }

  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);

  // Hindernisse (Autos, Trucks, Flugzeuge, Züge)
  function spawnObstacle() {
    const types = ['car', 'truck', 'plane', 'train'];
    const type = types[Math.floor(Math.random() * types.length)];
    let width, height, color;
    switch (type) {
      case 'car': width = 60; height = 30; color = 'red'; break;
      case 'truck': width = 100; height = 40; color = 'blue'; break;
      case 'plane': width = 120; height = 50; color = 'purple'; break;
      case 'train': width = 150; height = 35; color = 'orange'; break;
    }
    const x = Math.random() * (canvas.width - width);
    const speed = 3 + Math.random() * 2;
    obstacles.push({ x, y: -height, width, height, speed, color, type });
  }

  // Zeichne Spieler als einfachen Menschen (Kopf, Körper, Beine)
  function drawPlayer() {
    const { x, y, width, height } = player;

    // Kopf
    ctx.fillStyle = '#ffe0bd';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + 20, 15, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Körper
    ctx.fillStyle = '#4287f5';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + 55, 20, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Beine
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x + width / 2 - 10, y + 85);
    ctx.lineTo(x + width / 2 - 10, y + 110);
    ctx.moveTo(x + width / 2 + 10, y + 85);
    ctx.lineTo(x + width / 2 + 10, y + 110);
    ctx.stroke();
  }

  // Zeichne Hindernisse
  function drawObstacles() {
    obstacles.forEach(({ x, y, width, height, color, type }) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      if (type === 'plane') {
        // Flugzeug stilisiert
        ctx.moveTo(x, y + height / 2);
        ctx.lineTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height / 2);
        ctx.lineTo(x + width / 2, y + height);
        ctx.closePath();
      } else {
        // Rechteckige Hindernisse
        ctx.rect(x, y, width, height);
      }
      ctx.fill();
    });
  }

  // Check Kollision Spieler - Hindernis
  function checkCollision() {
    return obstacles.some(({ x, y, width, height }) => {
      return !(player.x + player.width < x ||
               player.x > x + width ||
               player.y + player.height < y ||
               player.y > y + height);
    });
  }

  // Zeichne grünes Rohr als Portal
  function drawPortal() {
    const portalX = canvas.width / 2 - 30;
    const portalY = 20;
    ctx.fillStyle = 'limegreen';
    ctx.beginPath();
    ctx.moveTo(portalX, portalY + 60);
    ctx.lineTo(portalX + 60, portalY + 60);
    ctx.lineTo(portalX + 60, portalY);
    ctx.lineTo(portalX, portalY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Notizen', portalX + 5, portalY + 40);

    return { x: portalX, y: portalY, width: 60, height: 60 };
  }

  // Check ob Spieler im Portal
  function checkPortal(portal) {
    return (player.x + player.width > portal.x &&
            player.x < portal.x + portal.width &&
            player.y < portal.y + portal.height);
  }

  // Spiel loop
  function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spieler bewegen
    if (keys.left) player.dx = -player.speed;
    else if (keys.right) player.dx = player.speed;
    else if (player.dx !== 0 && joystick) {} // joystick setzt dx bereits

    player.x += player.dx;

    // Spielfeldbegrenzung
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    drawPlayer();

    // Hindernisse erzeugen
    if (frameCount % 90 === 0) spawnObstacle();

    // Hindernisse bewegen & zeichnen
    obstacles.forEach(obstacle => {
      obstacle.y += obstacle.speed;
    });
    obstacles = obstacles.filter(ob => ob.y < canvas.height + 100);

    drawObstacles();

    // Portal zeichnen & checken
    const portal = drawPortal();
    if (checkPortal(portal)) {
      gameOver = true;
      enterNotes();
      return;
    }

    // Kollisionscheck
    if (checkCollision()) {
      gameOver = true;
      updateScore('Game Over! Neu starten mit F5.');
      return;
    }

    // Score erhöhen
    score = Math.floor(frameCount / 30);
    updateScore(`Laufspiel Score: ${score}`);

    frameCount++;
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
