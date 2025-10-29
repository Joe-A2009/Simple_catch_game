const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const startButton = document.getElementById("startButton");

// Variables del juego
let basketX = canvas.width / 2;
let basketY = canvas.height - 55;
let basketSpeed = 13;

let vidas = 5;

let fruitX = Math.random(0.2,0.9) * canvas.width;
let fruitY = 15;
let fruitSpeed = 5;

let bombX = Math.random() * canvas.width;
let bombY = -50;
let bombSpeed = 5;
let bombActive = false; 
let bombTimer = 0;

let lifeX = Math.random() * canvas.width;
let lifeY = -50;
let lifeSpeed = 6;
let lifeActive = false;

let score = 0;
let rightPressed = false;
let leftPressed = false;
let gameStarted = false;
let highScore = localStorage.getItem("highScore") || 0;

// Audio
const bgMusic = new Audio("music/bg_music_Jumper.mp3");
const catchSound = new Audio("music/catch_fruit.mp3");
const lostSound = new Audio("music/catch_fail.mp3");
const bombaaaaa = new Audio("music/explosion.mp3");
const aumento = new Audio("music/upgrade.mp3");
const failed = new Audio("music/gitgud.mp3");
const esunsecreetoo = new Audio("music/secret_audio.mp3");

bgMusic.loop = true;

function goToMenu() {

  gameStarted = false;
  bgMusic.pause();
  bgMusic.currentTime = 0;

  canvas.style.display = "none";
  document.getElementById("menu").style.display = "flex";
  document.getElementById("menu").style.flexDirection = "column";
  document.getElementById("menu").style.alignItems = "center";

}


//  SISTEMA DE RANKING
function getRanking() {
  return JSON.parse(localStorage.getItem("ranking")) || [];
}

function saveRanking(ranking) {
  localStorage.setItem("ranking", JSON.stringify(ranking));
}

function addScoreToRanking(name, score) {
  let ranking = getRanking();
  ranking.push({ name, score });
  ranking.sort((a, b) => b.score - a.score);
  ranking = ranking.slice(0, 5);
  
  saveRanking(ranking);
}

function showRanking() {
  const rankingDiv = document.getElementById("ranking");
  const tableBody = document.querySelector("#rankingTable tbody");
  tableBody.innerHTML = ""; 

  const ranking = getRanking();

  if (ranking.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='2'>Sin registros aún</td></tr>";
  } else {
    ranking.forEach(r => {
      const row = `<tr><td>${r.name}</td><td>${r.score}</td></tr>`;
      tableBody.innerHTML += row;
    });
  }

  rankingDiv.style.display = "block";
}


//Dibujar fondo
function drawBackground() {
  //cielo
  let gradiente = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradiente.addColorStop(0, "#87CEEB");  // azul cielo
  gradiente.addColorStop(1, "#B0E0E6");  // azul más claro
  ctx.fillStyle = gradiente;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //nubes
  drawCloud(100, 120, 30);
  drawCloud(300, 50, 40);
  drawCloud(350, 150, 30);
  drawCloud(500, 120, 40);
  drawCloud(700, 140, 40);

  //cesped
  ctx.fillStyle = "#3CB371";
  ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
}

// Dibujar Nube
function drawCloud(x, y, size) {
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.arc(x + size * 0.7, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
  ctx.arc(x + size * 1.4, y, size, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}


//Dibujar fruta
function drawFruit(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fillStyle = "#e74c3c";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(x, y - 15);
  ctx.lineTo(x, y - 25);
  ctx.strokeStyle = "#3e2723";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.ellipse(x + 8, y - 22, 5, 3, Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = "#27ae60";
  ctx.fill();
  ctx.closePath();
}

// Dibujar Bomba
function drawBomb(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(x, y - 15);
  ctx.lineTo(x, y - 25);
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(x, y - 28, 3, 0, Math.PI * 2);
  ctx.fillStyle = "orange";
  ctx.fill();
  ctx.closePath();
}

function drawLife(x, y) {
  const r = 1;   // tamaño del corazón
  const paso = 0.1; // suavidad del trazo
  const puntos = [];

  //algoritmo matemático
  for (let a = 0; a < 2 * Math.PI; a += paso) {
    let px = x + 16 * r * Math.sin(a) ** 3;
    let py =
      y - (13 * r * Math.cos(a) - 5 * r * Math.cos(2 * a) - 2 * r * Math.cos(3 * a) - Math.cos(4 * a));
    puntos.push({ x: px, y: py });
  }

  // Dibujar y rellenar el corazón
  ctx.beginPath();
  ctx.moveTo(puntos[0].x, puntos[0].y);
  puntos.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.closePath();

  ctx.fillStyle = "red"; //en el algoritmo usan crimson
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#660000";
  ctx.stroke();
}


//Dibujar canasta
function drawBasket(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 40, 0, Math.PI, false);
  ctx.fillStyle = "#8d6e63";
  ctx.fill();
  ctx.closePath();

  ctx.strokeStyle = "#5d4037";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 37, y + 15);
  ctx.lineTo(x + 37, y + 15);
  ctx.stroke();
}


// Texto
function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("Puntos: " + score, 690, 25);
  ctx.fillText("Record: " + highScore, 690, 50);
}

function drawLives() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("Vidas: " + vidas, 10, 25);
}


// Activacion de efectos SFX
function onCatch() {
  catchSound.currentTime = 0;
  catchSound.volume = 0.5;
  catchSound.play();
}

function onMiss() {
  lostSound.currentTime = 0.5;
  lostSound.play();
}

function explode(){
  bombaaaaa.currentTime = 0;
  bombaaaaa.volume = 0.6;
  bombaaaaa.play();
}

function upgraded(){
  aumento.currentTime = 0;
  aumento.volume = 0.5;
  aumento.play();
}

function gameover(){
  failed.currentTime = 0;
  failed.volume = 0.5;
  failed.play();
}

function donthear(){
  esunsecreetoo.currentTime = 0;
  esunsecreetoo.volume = 0.7;
  esunsecreetoo.play();
}



//#########################  Bucle principal del juego  ########################################### 
function update() {
  if (!gameStarted) return;

  drawBackground();
  
  // Dibujar bomba si está activa
  if (bombActive) {
    drawBomb(bombX, bombY);
    bombY += bombSpeed;

    // Colisión bomba-canasta(aaaaaaaaaahhhhhh)
    if ( bombY + 15 >= basketY - 20 && bombX > basketX - 40 && bombX < basketX + 40) {
      explode();
      bombActive = false;
      bombY = -50;
      vidas -= 2;
    }

    // Si la bomba cae fuera de pantalla
    if (bombY > canvas.height) {
      bombActive = false;
      bombY = -50;
    }
  }
  // Si hay una vida activa
  if (lifeActive) {
    drawLife(lifeX, lifeY);
    lifeY += lifeSpeed;

    // colisión con la canasta
    if ( lifeY + 15 >= basketY - 20 && lifeX > basketX - 40 && lifeX < basketX + 40) {
      upgraded();
      if (vidas < 7) {
        vidas += 1;
      }

      lifeActive = false;
      lifeY = -50;
    }

    // si se cae fuera de la canasta
    if (lifeY > canvas.height) {
      lifeActive = false;
      lifeY = -50;
    }
  }

  drawFruit(fruitX, fruitY);
  drawBasket(basketX, basketY);
  drawScore();
  drawLives();

  bombTimer++;

  //Bomb has been planted... ¿or not?
  if (!bombActive && !lifeActive && bombTimer > 200) {
    bombTimer = 0;
    // probabilidad del 70% de acticar bomba o 20% de activar vida
    const randomChoice = Math.random();

    if (randomChoice < 0.7) {
      bombActive = true;
      bombX = Math.random() * canvas.width;
      bombY = -20;

      if (Math.abs(bombX - fruitX) < 60) {
        bombX = (bombX + 100) % canvas.width;
      }
    } else {
      lifeActive = true;
      lifeX = Math.random() * canvas.width;
      lifeY = -20;
    }
  }

  fruitY += fruitSpeed;

  // Colisión con la canasta (¡¡Bien!!)
  if (fruitY + 15 >= basketY - 20 && fruitX > basketX - 40 && fruitX < basketX + 40) {
    onCatch();
    score++;
    fruitY = 20;
    fruitX = Math.random(0.2,0.8) * canvas.width;
    
    // Verificar record muchiachio
    if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    }
    if(fruitSpeed <=9){
      fruitSpeed += 0.5;
    }
  }

  // Caida fuera de la canasta (piipipiii)
  if (fruitY > canvas.height) {
    onMiss();
    fruitY = 20;
    fruitX = Math.random(0.2,0.8) * canvas.width;
    vidas--;
    if (fruitSpeed >= 3){
      fruitSpeed -= 1;
    }
  }

  // GAME OVER
  if (vidas < 1) {
    vidas = 5;
    fruitSpeed = 5;
    fruitY = 20;
    rightPressed = false;
    leftPressed = false;
    const playerName = prompt("GAME OVER. Ingresa tu nombre para guardar tu puntaje:") || "Jugador";
    addScoreToRanking(playerName, score);
    score = 0;
    gameover();
    // pequeña pausa visual antes de volver al menú
    setTimeout(() => {
      goToMenu();
    }, 50);
  }

  if (rightPressed && basketX < canvas.width - 40){
    basketX += basketSpeed;
  }
  if (leftPressed && basketX > 40){
    basketX -= basketSpeed;
  }

  requestAnimationFrame(update);
}

//#############################################################################################################


// Controles
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight"){
    rightPressed = true;
  }
  if (e.key === "ArrowLeft"){
    leftPressed = true;
  }
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight"){ 
    rightPressed = false;
  }
  if (e.key === "ArrowLeft"){ 
    leftPressed = false;
  }
});

//Opcion Secreta para reiniciar el score
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "r") {
    localStorage.clear();
    highScore = 0;
    alert("Puntaje reiniciado");
  }
});

document.addEventListener("keydown", (t) => {
  if (t.key.toLowerCase() === "ñ") {
    donthear();
  }
});

// Iniciar juego
startButton.addEventListener("click", () => {
  menu.style.display = "none";
  canvas.style.display = "block";
  
  bgMusic.volume = 0.8;
  bgMusic.play();
  gameStarted = true;
  update();
});

// Botón para abrir ranking
document.getElementById("rankingButton").addEventListener("click", () => {
  document.getElementById("ranking").style.display = "block";
  showRanking();
});

// Botón para regresar al menú principal
document.getElementById("backButton").addEventListener("click", () => {
  document.getElementById("ranking").style.display = "none";
});

