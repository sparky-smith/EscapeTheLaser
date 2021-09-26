// Dom variables

const scoreDiv = document.querySelector(".score");
const msgDiv = document.querySelector(".msg");
const gameContainer = document.querySelector(".game");
const playerDiv = document.querySelector(".player");
const buildingsDiv = document.querySelector(".buildings");
const road = document.querySelector(".road");

// Game const / variables

const g = 0.098;
const buildings = [];
const player = {
  x: 320,
  y: 0,
  v: 0,
};

let gameStatus = "start";
let speed, score, nextBuildingX, gameProgress, lastHeight, lastTime;

// The click event
gameContainer.addEventListener("click", () => {
  switch (gameStatus) {
    case "start":
    case "end":
      startGame();
      break;
    case "on":
      jump();
      break;
  }
});

// helper functions
function startGame() {
  // reset off variables
  buildings.splice(0, buildings.length);
  buildingsDiv.innerHTML = "";

  player.x = 480;
  player.y = 0;
  player.v = 0;

  speed = 1;
  score = 0;
  nextBuildingX = 960;
  gameProgress = 0;
  lastHeight = 0;
  lastTime = 0;
  // start game
  gameStatus = "on";
  render();
  msgDiv.innerHTML = `<h2>Escape the Laser!</h2>(Click to jump)`;
  setTimeout(() => {
    msgDiv.classList = "msg off";
  }, 3000);
}
function jump() {
  if (player.v !== 0) {
    return false;
  }
  player.v = 3.2;
}
function render() {
  // set delta time
  const thistime = performance.now();
  //   const dt = Math.min(32, Math.max(8, thistime - lastTime)) / 16.666;
  lastTime = thistime;
  if (gameStatus === "dead") {
    if (player.y > 0) {
      player.y = Math.max(0, player.y + player.v);
      player.v -= g;
      playerDiv.style.setProperty("--player-y", 320 - player.y + "px");
      requestAnimationFrame(render);
    } else {
      gameStatus = "end";
      msgDiv.innerHTML += `Click to restart`;
    }
    return false;
  }
  // render buildings
  if (nextBuildingX < gameProgress + 960 + speed) {
    createBuilding();
  }

  let base = 0;
  const destroyBuildings = [];
  let nextBuilding = buildings[0];

  buildings.forEach((building, ix) => {
    if (building.x < player.x) {
      base = building.height;
      nextBuilding = buildings[ix + 1];
    }
    if (building.x < gameProgress + 180) {
      destroyBuildings.push(ix);
    }
    building.div.style.setProperty(
      "--building-x",
      building.x - gameProgress + "px"
    );
  });

  // render player
  if (player.v > 0) {
    player.y += player.v;
    player.v = Math.max(0, player.v - g);
  } else if (base < player.y) {
    player.y = Math.max(base, player.y + player.v);
    player.v -= g;
  } else {
    player.v = 0;
  }
  playerDiv.classList = `player ${player.v === 0 ? "run" : "jump"}`;

  let nextPlayerX = player.x + speed;

  if (nextPlayerX - gameProgress < 720) {
    nextPlayerX += 1 / speed;
  }
  if (nextPlayerX > nextBuilding.x && nextBuilding.height > player.y) {
    nextPlayerX = nextBuilding.x;
  }
  player.x = nextPlayerX;

  playerDiv.style.setProperty("--player-x", nextPlayerX - gameProgress + "px");
  playerDiv.style.setProperty("--player-y", 320 - player.y + "px");
  // render road
  road.style.left = (gameProgress % 10) * -1 + "px";
  // render buildings
  destroyBuildings.forEach((ix) => {
    const thisDiv = buildings[ix].div;
    thisDiv.classList.add("destroy");

    setTimeout(() => {
      thisDiv.parentNode.removeChild(thisDiv);
    }, 1000);

    if (
      player.x <= buildings[ix].x + buildings[ix].width &&
      player.y <= buildings[ix].height
    ) {
      gameStatus = "dead";
      playerDiv.classList = "player dead";

      msgDiv.innerHTML = `<h2>You're dead!</h2>`;
      msgDiv.classList = "msg";
    } else {
      buildings.splice(ix, 1);
      score++;
    }
  });
  // set progress and rerender
  speed += 0.001;
  gameProgress += speed;
  if (gameStatus == "on" || gameStatus === "dead") {
    requestAnimationFrame(render);
  }
}
function createBuilding() {
  const building = {
    x: nextBuildingX,
    width: 60 + Math.random() * 60,
    height: Math.min(
      Math.max(30 + Math.random() * 120, lastHeight - 30),
      lastHeight + 30
    ),
  };
  const buildingDiv = document.createElement("div");
  buildingDiv.classList = "building";
  buildingDiv.style.width = building.width + "px";
  buildingDiv.style.height = building.height + "px";
  buildingDiv.style.setProperty("--hue", Math.random() * 360 + "deg");
  buildingDiv.style.setProperty(
    "--buildingImageX",
    Math.floor(Math.random() * 4) * 27.08333 + "%"
  );
  for (let i = 0; i < 12; i++) {
    const fragmentDiv = document.createElement("div");
    fragmentDiv.classList = "building_fragment";
    fragmentDiv.style.setProperty("--tx", Math.random() * -120 + "px");
    fragmentDiv.style.setProperty("--ty", Math.random() * -160 + "px");
    fragmentDiv.style.setProperty("--rx", Math.random() * 360 + "deg");
    fragmentDiv.style.setProperty("--ry", Math.random() * 360 + "deg");
    fragmentDiv.style.setProperty("--rz", Math.random() * 360 + "deg");

    buildingDiv.appendChild(fragmentDiv);
  }
  building.div = buildingDiv;
  buildingsDiv.appendChild(buildingDiv);
  buildings.push(building);
  nextBuildingX += building.width;
  lastHeight = building.height;
}
