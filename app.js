const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const levelDisplay = document.getElementById("level");
const pauseBtn = document.getElementById("pauseBtn");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const gameOverScreen = document.getElementById("gameOverScreen");
const restartBtn = document.getElementById("restartBtn");

let level = 1;
let isPaused = false;
let isRunning = false;
let bricks = [];
let rightPressed = false;
let leftPressed = false;
let touchStartX = null;

const sounds = {
  hit: document.getElementById("hitSound"),
  brick: document.getElementById("brickSound"),
  win: document.getElementById("winSound"),
  lose: document.getElementById("loseSound"),
};

const paddle = {
  height: 10,
  width: 100,
  x: canvas.width / 2 - 50,
  y: canvas.height - 20,
  speed: 7,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  radius: 8,
  dx: 4,
  dy: -4,
};

function createBricks(level) {
  const rowCount = Math.min(3 + level, 10);
  const columnCount = 10;
  const width = 70;
  const height = 20;
  const padding = 10;
  const offsetTop = 50;
  const offsetLeft = 35;

  bricks = [];
  for (let r = 0; r < rowCount; r++) {
    bricks[r] = [];
    for (let c = 0; c < columnCount; c++) {
      bricks[r][c] = { x: 0, y: 0, status: 1 };
    }
  }
}

function drawBricks() {
  for (let r = 0; r < bricks.length; r++) {
    for (let c = 0; c < bricks[r].length; c++) {
      if (bricks[r][c].status === 1) {
        let brickX = c * (70 + 10) + 35;
        let brickY = r * (20 + 10) + 50;
        bricks[r][c].x = brickX;
        bricks[r][c].y = brickY;
        ctx.fillStyle = "#00FFCC";
        ctx.fillRect(brickX, brickY, 70, 20);
      }
    }
  }
}

function drawPaddle() {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#FF4081";
  ctx.fill();
  ctx.closePath();
}

function drawPausedText() {
  ctx.fillStyle = "white";
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Pauzēts", canvas.width / 2, canvas.height / 2);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawPaddle();
  drawBall();

  if (!isRunning) return;

  if (isPaused) {
    drawPausedText();
    requestAnimationFrame(draw);
    return;
  }

  moveBall();
  movePaddle();
  collisionDetection();
  requestAnimationFrame(draw);
}

function movePaddle() {
  if (rightPressed && paddle.x < canvas.width - paddle.width) {
    paddle.x += paddle.speed;
  } else if (leftPressed && paddle.x > 0) {
    paddle.x -= paddle.speed;
  }
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
    sounds.hit.play();
  }

  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
    sounds.hit.play();
  }

  if (ball.y + ball.radius > canvas.height) {
    sounds.lose.play();
    setTimeout(() => {
      showGameOver();
    }, 1000);
  }

  if (
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width &&
    ball.y + ball.radius > paddle.y
  ) {
    ball.dy = -ball.dy;
    sounds.hit.play();
  }
}

function collisionDetection() {
  let destroyed = 0;
  for (let r = 0; r < bricks.length; r++) {
    for (let c = 0; c < bricks[r].length; c++) {
      let b = bricks[r][c];
      if (b.status === 1) {
        if (
          ball.x > b.x &&
          ball.x < b.x + 70 &&
          ball.y > b.y &&
          ball.y < b.y + 20
        ) {
          ball.dy = -ball.dy;
          b.status = 0;
          sounds.brick.play();
        }
      } else {
        destroyed++;
      }
    }
  }

  if (destroyed === bricks.length * bricks[0].length) {
    sounds.win.play();
    levelUp();
  }
}

function levelUp() {
  level++;
  if (level > 100) level = 100;
  levelDisplay.textContent = level;
  resetBall();
  createBricks(level);
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 30;
  ball.dx = 4 + Math.min(level, 10);
  ball.dy = -4 - Math.min(level, 10);
  paddle.x = canvas.width / 2 - paddle.width / 2;
}

function stopGame() {
  isRunning = false;
  isPaused = false;
  resetBall();
  createBricks(level);
  draw();
}

function startGame() {
  isRunning = true;
  isPaused = false;
  startScreen.style.display = "none";
  levelDisplay.textContent = level;
  createBricks(level);
  resetBall();
  draw();
}

function showGameOver() {
  gameOverScreen.style.display = "flex";
  isRunning = false; // Pārtrauc spēli, kad ir "Game Over"
}

// Restartē spēli
restartBtn.addEventListener("click", () => {
  gameOverScreen.style.display = "none"; // Paslēpt Game Over ekrānu
  level = 1; // Sākam no pirmā līmeņa
  startGame();
});

// Vadība: klaviatūra un pauze
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    isPaused = !isPaused;
  }
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
});

pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
});

// Swipe uz vairoga mobilajām ierīcēm
canvas.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
});

canvas.addEventListener("touchmove", (e) => {
  if (touchStartX) {
    const deltaX = e.touches[0].clientX - touchStartX;
    if (deltaX > 0 && paddle.x < canvas.width - paddle.width) {
      paddle.x += 7;
    } else if (deltaX < 0 && paddle.x > 0) {
      paddle.x -= 7;
    }
    touchStartX = e.touches[0].clientX;
  }
});

startBtn.addEventListener("click", startGame);
