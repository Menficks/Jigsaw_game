document.addEventListener("DOMContentLoaded", () => {
  /**************************************
   * PANTALLA DE CONTRASEÑA
   **************************************/
  // Configurar la música inicial para la pantalla de PIN (main.mp3)
  const backgroundMusic = document.getElementById("background-music");
  backgroundMusic.src = "assets/music/main.mp3";
  backgroundMusic.play().catch(err => console.log("Error main.mp3:", err));

  // Generar 50 corazones distribuidos en toda la pantalla
  function createHearts(num) {
    const heartsContainer = document.querySelector(".hearts-container");
    heartsContainer.innerHTML = "";
    for (let i = 0; i < num; i++) {
      const heart = document.createElement("div");
      heart.classList.add("heart");
      heart.style.left = Math.random() * 100 + "%";
      heart.style.top = Math.random() * 100 + "%";
      heart.style.animationDelay = Math.random() * 5 + "s";
      heartsContainer.appendChild(heart);
    }
  }
  createHearts(50);

  const correctPIN = "0507";
  let currentPIN = "";
  let attempts = 0;
  const maxAttempts = 3;

  const pinDisplay = document.getElementById("pin-display");
  const pinBtns = document.querySelectorAll(".pin-btn");
  const pinMessage = document.getElementById("pin-message");
  const passwordScreen = document.getElementById("password-screen");

  function updatePinDisplay() {
    pinDisplay.textContent = "*".repeat(currentPIN.length);
  }

  pinBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.innerText;
      if (val === "Borrar") {
        currentPIN = currentPIN.slice(0, -1);
      } else if (val === "OK") {
        if (currentPIN === correctPIN) {
          // Acceso correcto: ocultar pantalla de PIN y mostrar el juego
          passwordScreen.style.display = "none";
          document.getElementById("game-container").style.display = "block";
          loadLevel(); // Iniciar el puzzle
        } else {
          attempts++;
          if (attempts >= maxAttempts) {
            pinMessage.textContent = "Intentos máximos permitidos 😢 💔💔 me rompiste el cora.";
            pinBtns.forEach(b => b.disabled = true);
          } else {
            pinMessage.textContent = "PIN incorrecto. Intenta de nuevo.";
            currentPIN = "";
          }
        }
      } else {
        if (currentPIN.length < 4) {
          currentPIN += val;
        }
      }
      updatePinDisplay();
    });
  });

  /**************************************
   * ROMPECABEZAS (JUEGO)
   **************************************/
  // Niveles del puzzle
  const puzzleLevels = [
    { image: "img1.png", music: "music1.mp3", gridSize: 3 },
    { image: "img2.png", music: "music2.mp3", gridSize: 3 },
    { image: "img3.png", music: "music3.mp3", gridSize: 4 },
    { image: "img4.png", music: "music4.mp3", gridSize: 4 },
    { image: "img5.png", music: "music5.mp3", gridSize: 5 }
  ];
  let puzzleCurrentLevel = 0;

  const boardContainer = document.getElementById("board-container");
  const piecesContainer = document.getElementById("pieces-container");
  const checkButton = document.getElementById("check-button");
  const nextLevelButton = document.getElementById("next-level");

  // Tablero fijo: 300px en móvil, 400px en desktop
  const boardDimension = window.innerWidth < 600 ? 300 : 400;

  // Activar música en móviles para el puzzle
  document.addEventListener('touchstart', function initMusicPuzzle() {
    backgroundMusic.play().catch(err => console.log("Autoplay bloqueado puzzle:", err));
    document.removeEventListener('touchstart', initMusicPuzzle);
  });

  function loadLevel() {
    const levelData = puzzleLevels[puzzleCurrentLevel];
    const gridSize = levelData.gridSize;
    const pieceSize = boardDimension / gridSize;

    // Actualizar la música del nivel
    backgroundMusic.src = "assets/music/" + levelData.music;
    backgroundMusic.play().catch(err => console.log("Error audio:", err));

    boardContainer.innerHTML = "";
    piecesContainer.innerHTML = "";

    boardContainer.style.gridTemplateColumns = `repeat(${gridSize}, ${pieceSize}px)`;
    boardContainer.style.gridTemplateRows = `repeat(${gridSize}, ${pieceSize}px)`;
    boardContainer.style.width = boardDimension + "px";
    boardContainer.style.height = boardDimension + "px";

    // Crear celdas (drop zones)
    for (let i = 0; i < gridSize * gridSize; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.style.width = pieceSize + "px";
      cell.style.height = pieceSize + "px";
      cell.dataset.correct = i;
      cell.addEventListener("dragover", dragOver);
      cell.addEventListener("drop", dropPiece);
      boardContainer.appendChild(cell);
    }

    // Crear piezas del puzzle
    let pieces = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      const piece = document.createElement("div");
      piece.classList.add("puzzle-piece");
      piece.style.width = pieceSize + "px";
      piece.style.height = pieceSize + "px";
      piece.dataset.index = i;
      piece.draggable = true;
      piece.addEventListener("dragstart", dragStart);
      piece.addEventListener("dblclick", () => piecesContainer.appendChild(piece));
      piece.addEventListener("touchstart", touchStartPuzzle, { passive: false });
      piece.addEventListener("touchmove", touchMovePuzzle, { passive: false });
      piece.addEventListener("touchend", touchEndPuzzle, { passive: false });
      piece.style.backgroundImage = `url(assets/images/${levelData.image})`;
      piece.style.backgroundSize = `${boardDimension}px ${boardDimension}px`;
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      piece.style.backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`;
      pieces.push(piece);
    }
    pieces.sort(() => Math.random() - 0.5);
    pieces.forEach(piece => piecesContainer.appendChild(piece));
  }

  let draggedPiecePuzzle = null;
  function dragStart(e) {
    draggedPiecePuzzle = e.target;
  }
  function dragOver(e) {
    e.preventDefault();
  }
  function dropPiece(e) {
    e.preventDefault();
    const cell = e.currentTarget;
    if (cell && cell.classList.contains("cell") && cell.children.length === 0) {
      cell.appendChild(draggedPiecePuzzle);
      draggedPiecePuzzle = null;
    }
  }

  let puzzleOffsetX = 0, puzzleOffsetY = 0;
  function touchStartPuzzle(e) {
    e.preventDefault();
    const touch = e.touches[0];
    draggedPiecePuzzle = e.target;
    const rect = draggedPiecePuzzle.getBoundingClientRect();
    puzzleOffsetX = touch.clientX - rect.left;
    puzzleOffsetY = touch.clientY - rect.top;
    draggedPiecePuzzle.style.position = 'absolute';
    draggedPiecePuzzle.style.zIndex = 1000;
  }
  function touchMovePuzzle(e) {
    e.preventDefault();
    const touch = e.touches[0];
    draggedPiecePuzzle.style.left = (touch.clientX - puzzleOffsetX) + 'px';
    draggedPiecePuzzle.style.top = (touch.clientY - puzzleOffsetY) + 'px';
  }
  function touchEndPuzzle(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const boardRect = boardContainer.getBoundingClientRect();
    const gridSize = puzzleLevels[puzzleCurrentLevel].gridSize;
    const pieceSize = boardDimension / gridSize;
    if (touch.clientX >= boardRect.left && touch.clientX <= boardRect.right &&
        touch.clientY >= boardRect.top && touch.clientY <= boardRect.bottom) {
      const relativeX = touch.clientX - boardRect.left;
      const relativeY = touch.clientY - boardRect.top;
      const col = Math.floor(relativeX / pieceSize);
      const row = Math.floor(relativeY / pieceSize);
      const cellIndex = row * gridSize + col;
      const cell = boardContainer.children[cellIndex];
      if (cell && cell.children.length === 0) {
        cell.appendChild(draggedPiecePuzzle);
      } else {
        piecesContainer.appendChild(draggedPiecePuzzle);
      }
    } else {
      piecesContainer.appendChild(draggedPiecePuzzle);
    }
    draggedPiecePuzzle.style.position = '';
    draggedPiecePuzzle.style.left = '';
    draggedPiecePuzzle.style.top = '';
    draggedPiecePuzzle = null;
  }

  checkButton.addEventListener("click", () => {
    const cells = boardContainer.children;
    let correct = true;
    for (let cell of cells) {
      if (cell.children.length === 0) {
        correct = false;
        break;
      }
      const piece = cell.children[0];
      if (piece.dataset.index !== cell.dataset.correct) {
        correct = false;
        break;
      }
    }
    if (correct) {
      if (puzzleCurrentLevel === puzzleLevels.length - 1) {
        backgroundMusic.src = "assets/music/music6.mp3";
        backgroundMusic.play().catch(err => console.log("Error music6:", err));
        showFinalMessage();
      } else {
        alert("¡Felicidades, completaste el rompecabezas!");
        nextLevelButton.style.display = "block";
      }
    } else {
      alert("Aún faltan piezas o algunas están mal ubicadas.");
    }
  });

  nextLevelButton.addEventListener("click", () => {
    puzzleCurrentLevel++;
    if (puzzleCurrentLevel < puzzleLevels.length) {
      nextLevelButton.style.display = "none";
      loadLevel();
    } else {
      alert("¡Has completado todos los niveles!");
    }
  });

  // Collage final: 4 imágenes en esquinas y 1 en el centro; sin espacios.
  // El mensaje final se muestra en un recuadro debajo del tablero.
  function showFinalMessage() {
    boardContainer.innerHTML = "";
    piecesContainer.innerHTML = "";
    checkButton.style.display = "none";
    nextLevelButton.style.display = "none";

    boardContainer.style.width = boardDimension + "px";
    boardContainer.style.height = boardDimension + "px";
    boardContainer.style.position = "relative";
    boardContainer.style.overflow = "hidden";

    const collageContainer = document.createElement("div");
    collageContainer.style.position = "absolute";
    collageContainer.style.top = "0";
    collageContainer.style.left = "0";
    collageContainer.style.width = "100%";
    collageContainer.style.height = "100%";

    function createCornerImage(src, posStyles) {
      const img = document.createElement("img");
      img.src = "assets/images/" + src;
      img.style.position = "absolute";
      img.style.objectFit = "cover";
      img.style.width = "55%";
      img.style.height = "55%";
      for (let key in posStyles) {
        img.style[key] = posStyles[key];
      }
      return img;
    }

    const img1 = createCornerImage(puzzleLevels[0].image, { top: "0", left: "0" });
    const img2 = createCornerImage(puzzleLevels[1].image, { top: "0", right: "0" });
    const img3 = createCornerImage(puzzleLevels[2].image, { bottom: "0", left: "0" });
    const img4 = createCornerImage(puzzleLevels[3].image, { bottom: "0", right: "0" });
    
    const centerImg = document.createElement("img");
    centerImg.src = "assets/images/" + puzzleLevels[4].image;
    centerImg.style.position = "absolute";
    centerImg.style.objectFit = "cover";
    centerImg.style.width = "50%";
    centerImg.style.height = "50%";
    centerImg.style.top = "50%";
    centerImg.style.left = "50%";
    centerImg.style.transform = "translate(-50%, -50%)";
    centerImg.style.zIndex = "1";

    collageContainer.appendChild(img1);
    collageContainer.appendChild(img2);
    collageContainer.appendChild(img3);
    collageContainer.appendChild(img4);
    collageContainer.appendChild(centerImg);

    boardContainer.appendChild(collageContainer);

    const messageContainer = document.createElement("div");
    messageContainer.style.width = boardDimension + "px";
    messageContainer.style.margin = "15px auto 0 auto";
    messageContainer.style.padding = "10px";
    messageContainer.style.border = "2px solid #d63384";
    messageContainer.style.borderRadius = "10px";
    messageContainer.style.fontFamily = "'More Sugar', cursive, sans-serif";
    messageContainer.style.fontSize = "20px";
    messageContainer.style.color = "#d63384";
    messageContainer.style.textAlign = "center";
    messageContainer.innerText = "Eres la luz que ilumina mi camino, la inspiración que me impulsa a seguir adelante. Te amo con todo mi ser, mi pequeña. - ALizon ❤️❤️";

    document.getElementById("game-container").appendChild(messageContainer);
  }

  // Iniciar el primer nivel del puzzle (se llama después de PIN correcto)
  // loadLevel();  <-- Se llama en el PIN correcto.
});
