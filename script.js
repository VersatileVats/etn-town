let judgeMode = false;

const atlassianBitbucketGame = document.querySelector(
  "div#atlassianBitbucketGame"
);
const atlassianJiraGame = document.querySelector("div#atlassianJiraGame");
const CANVAS = document.querySelector("canvas");
const ctx = CANVAS.getContext("2d");

const jiraCanvas = document.querySelector("#jiraGame");
const jiraCtx = jiraCanvas.getContext("2d");

const gameCanvas = document.querySelector("#gameCanvas");

const width = (CANVAS.width = jiraCanvas.width = 1024);
const height = (CANVAS.height = jiraCanvas.height = 576);

const playerSpeed = 4;
let currentActiveGame = "";

let villageCollisionMap = [];
// 50 for the old, & 95 for the new one (number of tiles in the map, width wise)
for (let i = 0; i < villageCollision.length; i += 95) {
  villageCollisionMap.push(villageCollision.slice(i, i + 95));
}

let mazeCollisionMap = [];
for (let i = 0; i < mazeColiision.length; i += 180) {
  mazeCollisionMap.push(mazeColiision.slice(i, i + 180));
}

const offset = {
  x: -2050,
  y: -1500,
};

const villageBoundaries = [];
villageCollisionMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol !== 0)
      villageBoundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
          isMaze: false,
        })
      );
  });
});

let mazeBoundaries = [];
mazeCollisionMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol !== 0)
      mazeBoundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width - 1400,
            y: i * Boundary.height - 1200,
          },
          isMaze: true,
        })
      );
  });
});

const village = new Image();
village.src = "./img/village.png";

const maze = new Image();
maze.src = "./img/mazeMap.png";

const playerImage = new Image();
playerImage.src = "./img/playerDown.png";

const playerImageUp = new Image();
playerImageUp.src = "./img/playerUp.png";

const playerImageLeft = new Image();
playerImageLeft.src = "./img/playerLeft.png";

const playerImageRight = new Image();
playerImageRight.src = "./img/playerRight.png";

const player = new Sprite({
  position: {
    // 192*68 is the dimension of the playerDown.png
    x: CANVAS.width / 4 + 5,
    y: CANVAS.height / 2 + 100,
  },
  image: playerImage,
  frames: {
    max: 4,
    hold: 10,
  },
  sprites: {
    down: playerImage,
    up: playerImageUp,
    left: playerImageLeft,
    right: playerImageRight,
  },
});

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: village,
});

const mazeBackground = new Sprite({
  position: {
    x: -1400,
    y: -1200,
  },
  image: maze,
  context: jiraCtx,
});

const mazePlayer = new Sprite({
  position: {
    x: 450,
    y: 480,
  },
  image: playerImageLeft,
  frames: {
    max: 4,
    hold: 10,
  },
  sprites: {
    down: playerImage,
    up: playerImageUp,
    left: playerImageLeft,
    right: playerImageRight,
  },
  context: jiraCtx,
});

const keys = {
  up: { pressed: false },
  down: { pressed: false },
  left: { pressed: false },
  right: { pressed: false },
};

const villageMovables = [background, ...villageBoundaries];
const mazeMovables = [mazeBackground, ...mazeBoundaries];

const collisionDetection = ({ rect1, rect2 }) => {
  return (
    // for right side detection
    rect1.position.x + rect1.width >= rect2.position.x &&
    // for left side detection
    rect1.position.x <= rect2.position.x + rect2.width &&
    // for topside detection (upside)
    rect1.position.y <= rect2.position.y + rect2.height &&
    // for downside detection
    rect1.position.y + rect1.height >= rect2.position.y
  );
};

let insideRoom = false;
let jiraGameZone = false;
let videoGameZone = false;
let electroneumFacts = false;
let bitbucketGameZone = false;

let detailsDiv = document.querySelector("div#homeDiv");

let jiraX = 0;
let jiraY = 0;

// function to control the player's movements
function navigatePlayer(playerType, movingBool, boundaryType, movableType) {
  if (keys.up.pressed && lastKey === "up") {
    playerType.image = playerType.sprites.up;
    playerType.animate = true;
    for (let i = 0; i < boundaryType.length; i++) {
      const boundary = boundaryType[i];
      if (
        collisionDetection({
          rect1: playerType,
          rect2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + playerSpeed,
            },
          },
        })
      ) {
        movingBool = false;
        break;
      }
    }
    if (movingBool) {
      if (currentActiveGame == "jira") {
        jiraY++;
      }
      movableType.forEach((movable) => {
        movable.position.y += playerSpeed;
      });
    }
  } else if (keys.down.pressed && lastKey === "down") {
    playerType.image = playerType.sprites.down;
    playerType.animate = true;
    for (let i = 0; i < boundaryType.length; i++) {
      const boundary = boundaryType[i];
      if (
        collisionDetection({
          rect1: playerType,
          rect2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - playerSpeed,
            },
          },
        })
      ) {
        movingBool = false;
        break;
      }
    }
    if (movingBool) {
      if (currentActiveGame == "jira") {
        jiraY--;
      }
      movableType.forEach((movable) => {
        movable.position.y -= playerSpeed;
      });
    }
  } else if (keys.left.pressed && lastKey === "left") {
    playerType.image = playerType.sprites.left;
    playerType.animate = true;
    for (let i = 0; i < boundaryType.length; i++) {
      const boundary = boundaryType[i];
      if (
        collisionDetection({
          rect1: playerType,
          rect2: {
            ...boundary,
            position: {
              x: boundary.position.x + playerSpeed,
              y: boundary.position.y,
            },
          },
        })
      ) {
        movingBool = false;
        break;
      }
    }
    if (movingBool) {
      if (currentActiveGame == "jira") {
        jiraX++;
      }
      movableType.forEach((movable) => {
        movable.position.x += playerSpeed;
      });
    }
  } else if (keys.right.pressed && lastKey === "right") {
    playerType.image = playerType.sprites.right;
    playerType.animate = true;
    for (let i = 0; i < boundaryType.length; i++) {
      const boundary = boundaryType[i];
      if (
        collisionDetection({
          rect1: playerType,
          rect2: {
            ...boundary,
            position: {
              x: boundary.position.x - playerSpeed,
              y: boundary.position.y,
            },
          },
        })
      ) {
        movingBool = false;
        break;
      }
    }
    if (movingBool) {
      if (currentActiveGame == "jira") {
        jiraX--;
      }
      movableType.forEach((movable) => {
        movable.position.x -= playerSpeed;
      });
    }
  }
}

// function to show detailed info about the house and keys to be pressed for further interactions
let houseName = "";
let showInfoString = "";
function showInfo() {
  if (
    background.position.x <= -2514 &&
    background.position.x >= -2550 &&
    background.position.y <= -1640 &&
    background.position.y >= -1664
  ) {
    return {
      showInfoString:
        "<b>Personal Room</b> <br>Press <b>s key</b> to see the stats",
      houseName: "personalHouse",
      result: true,
    };
  } else if (
    background.position.x <= -1474 &&
    background.position.x >= -1642 &&
    background.position.y <= -584 &&
    background.position.y >= -684
  ) {
    return {
      showInfoString:
        "Game #1 <br>Press <b>m  key</b> to play Maze Runner game",
      houseName: "maze",
      result: true,
    };
  } else if (
    background.position.x <= -1454 &&
    background.position.x >= -1550 &&
    background.position.y <= -1112 &&
    background.position.y >= -1130
  ) {
    return {
      showInfoString:
        "<b>Game #2 </b> <br>Press <b>f key</b> to play Flip the Tiles game",
      houseName: "bitbucket",
      result: true,
    };
  } else if (
    background.position.x <= -1678 &&
    background.position.x >= -1846 &&
    background.position.y <= -1508 &&
    background.position.y >= -1564
  ) {
    return {
      showInfoString:
        "<b>Game #3 </b> <br>Press <b>n key</b> to play Alpha Quest game",
      houseName: "npat",
      result: true,
    };
  } else if (
    background.position.x <= -1958 &&
    background.position.x >= -2154 &&
    background.position.y <= -628 &&
    background.position.y >= -640
  ) {
    return {
      showInfoString:
        "<b>Game #4 </b> <br>Press <b>v key</b> to Video Q&A game",
      houseName: "video",
      result: true,
    };
  } else if (
    background.position.x <= -2726 &&
    background.position.x >= -2990 &&
    background.position.y <= -540 &&
    background.position.y >= -684
  ) {
    return {
      showInfoString:
        "<b>Electroneum Fun Fact</b> <br>Press <b>e key</b> & see at the bottom of the screen",
      houseName: "electroneum",
      result: true,
    };
  } else return { result: false };
}

let animationId;
function animate() {
  // console.log(`X: ${background.position.x} Y: ${background.position.y}`);
  animationId = window.requestAnimationFrame(animate);
  background.draw();
  villageBoundaries.forEach((villageBoundary) => {
    villageBoundary.draw();
  });

  player.draw();

  let moving = true;
  player.animate = false;

  const travelToRoom = showInfo();

  insideRoom = false;
  jiraGameZone = false;
  npatGameZone = false;
  videoGameZone = false;
  electroneumFacts = false;
  bitbucketGameZone = false;

  if (travelToRoom.result) {
    detailsDiv.innerHTML = travelToRoom.showInfoString;
    switch (travelToRoom.houseName) {
      case "personalHouse":
        insideRoom = true;
        break;
      case "maze":
        jiraGameZone = true;
        break;
      case "bitbucket":
        bitbucketGameZone = true;
        break;
      case "npat":
        npatGameZone = true;
        break;
      case "video":
        videoGameZone = true;
      case "electroneum":
        electroneumFacts = true;
    }
  } else {
    detailsDiv.innerHTML = "";
  }

  // navigatePlayer function call
  navigatePlayer(player, moving, villageBoundaries, villageMovables);
}

function initBitbucketGame() {
  // calling the function that will start the setup for bitbucketGame
  initializeLevel({ level: signupResult.flipLevel });
  document.querySelector("body").style.background =
    "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('./img/bgd.jpg')";
  document.querySelector("body").style.backgroundPosition = "center";
  document.querySelector("body").style.backgroundRepeat = "no-repeat";
  document.querySelector("body").style.backgroundSize = "cover";
  document.querySelector("body").style.height = "100vh";
  document.querySelector("body").style.overflow = "hidden";

  bitGameSong.play();

  playedBitbucketGame = true;
  currentActiveGame = "bitbucket";
  CANVAS.style.display = "none";
  gameCanvas.style.display = "none";

  detailsDiv.style.display = "none";
  atlassianBitbucketGame.style.display = "flex";
  document.querySelector("#username").style.display = "none";
}

const jiraLevelsArray = {
  1: {
    x: -1952,
    y: {
      first: -1635,
      second: -1659,
    },
    duration: 60,
  },
  2: {
    x: -2915,
    y: {
      first: -1155,
      second: -1179,
    },
    duration: 60,
  },
  3: {
    x: -3863,
    y: {
      first: -627,
      second: -651,
    },
    duration: 60,
  },
  4: {
    x: -4820,
    y: {
      first: -1155,
      second: -1179,
    },
    duration: 60,
  },
  5: {
    x: -5789,
    y: {
      first: -1683,
      second: -1707,
    },
    duration: 45,
  },
  6: {
    x: -6668,
    y: {
      first: -1683,
      second: -1707,
    },
    duration: 45,
  },
};

const jiraFirstLevelCoordinates = [-1400, -1200];

let mazeId;
let intervalName;
let currentJiraLevel = 0;
let passedAllJiraLevels = false;
let countdownTimer = jiraLevelsArray[currentJiraLevel + 1].duration;

function initJiraGame() {
  currentActiveGame = "jira";
  CANVAS.style.display = "none";
  gameCanvas.style.display = "none";
  document.querySelector("#timeJira").style.display = "block";
  document.querySelector("#levelJira").style.display = "block";

  if (passedAllJiraLevels) {
    document.querySelector("#clearedJiraLevels").style.display = "block";
  } else {
    intervalName = setInterval(changeTimer, 1000);
    jiraCanvas.style.display = "block";
    atlassianJiraGame.style.display = "block";
    initiateMaze();
  }
}

function checkLevel(x, y) {
  if (
    currentJiraLevel <= 5 &&
    x <= jiraLevelsArray[currentJiraLevel + 1].x &&
    (y <= jiraLevelsArray[currentJiraLevel + 1].y.first ||
      y <= jiraLevelsArray[currentJiraLevel + 1].y.second)
  ) {
    incScore("5");

    document.querySelector("#levelJira").innerHTML = `Level:<br> <b>0${
      currentJiraLevel + 2
    }/06</b>`;
    currentJiraLevel++;

    if (currentJiraLevel <= 5) {
      countdownTimer = jiraLevelsArray[currentJiraLevel + 1].duration;
    }
    clearInterval(intervalName);
    intervalName = setInterval(changeTimer, 1000);
  } else if (
    currentJiraLevel == 6 &&
    x <= jiraLevelsArray[6].x &&
    (y <= jiraLevelsArray[6].y.first || y <= jiraLevelsArray[6].y.second)
  ) {
    document.querySelector("#levelJira").innerHTML = `Completed`;

    incScore("5");
    showNotification("Hurray 🥳, you completed all 6 levels");

    clearInterval(intervalName);
    passedAllJiraLevels = true;
    // countdownTimer = 60
  }
}

function initiateMaze() {
  checkLevel(mazeBackground.position.x, mazeBackground.position.y);
  // console.log(`X: ${mazeBackground.position.x} Y: ${mazeBackground.position.y}`);
  mazeId = requestAnimationFrame(initiateMaze);

  mazeBackground.draw();

  mazeBoundaries.forEach((mazeBoundary) => {
    mazeBoundary.draw();
  });

  mazePlayer.draw();

  let moving = true;
  mazePlayer.animate = false;
  navigatePlayer(mazePlayer, moving, mazeBoundaries, mazeMovables);
}

function changeTimer() {
  if (countdownTimer < 10)
    document.querySelector("#timeJira").textContent = `0${countdownTimer}`;
  else document.querySelector("#timeJira").textContent = countdownTimer;

  countdownTimer--;
  if (countdownTimer < 0) {
    clearInterval(intervalName);

    showNotification(
      "Sorry, the time is over. Now, you have to start from level 1.<br>Best of luck and buck up your shoes & run fats",
      "rgba(255, 0, 0, 0.6)"
    );

    // decreasing the score
    incScore("-3");

    countdownTimer = 60;
    // GREAT EXECUTION (ALMOST UNBELIEVABLE TO ACHIEVE THIS)
    mazeMovables.forEach((movable) => {
      if (jiraY != 0) {
        movable.position.y = movable.position.y - playerSpeed * jiraY;
      }
      if (jiraX != 0) {
        movable.position.x = movable.position.x - playerSpeed * jiraX;
      }
    });
    jiraX = 0;
    jiraY = 0;
    currentJiraLevel = 0;
    intervalName = setInterval(changeTimer, 1000);
    document.querySelector("#levelJira").innerHTML = `Level:<br> <b>01/06</b>`;
  }
}

animate();
// initiateRoom()

let lastKey = "";
window.addEventListener("keydown", (e) => {
  if (movePlayer) {
    switch (e.key) {
      case "ArrowUp":
        keys.up.pressed = true;
        lastKey = "up";
        break;
      case "ArrowDown":
        keys.down.pressed = true;
        lastKey = "down";
        break;
      case "ArrowLeft":
        keys.left.pressed = true;
        lastKey = "left";
        break;
      case "ArrowRight":
        keys.right.pressed = true;
        lastKey = "right";
        break;
    }
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "ArrowUp":
      keys.up.pressed = false;
      break;
    case "ArrowDown":
      keys.down.pressed = false;
      break;
    case "ArrowLeft":
      keys.left.pressed = false;
      break;
    case "ArrowRight":
      keys.right.pressed = false;
      break;
  }
});

// eventlistener for entering into the room
window.addEventListener("keydown", (e) => {
  if (jiraGameZone && (e.key === "m" || e.key === "M")) {
    cancelAnimationFrame(animationId);
    initJiraGame();
  }
  if (bitbucketGameZone && (e.key === "f" || e.key === "F")) {
    initBitbucketGame();
    movePlayer = false;
  }
  if (videoGameZone && (e.key === "v" || e.key === "V")) {
    movePlayer = false;
    document.querySelector("#score").textContent =
      document.querySelector("#overAllScore").textContent;
    document.querySelector("#game").style.display = "none";
    document.querySelector("#thetaGame").style.display = "block";

    currentActiveGame = "thetaVideo";

    video.style.display = "none";
    videoQuestions.style.display = "none";
    startDiv.style.display = "flex";
  }
  if (npatGameZone && (e.key === "n" || e.key === "N")) {
    movePlayer = false;
    currentActiveGame = "npat";
    gameCanvas.style.display = "none";
    document.querySelector("#username").style.display = "none";
    document.querySelector("#gameDiv").style.display = "flex";
  }
  if (insideRoom && (e.key === "s" || e.key === "S")) {
    document.querySelector("#finalStats").style.display = "block";
    document.querySelector(
      "#finalStats"
    ).innerHTML = `<span style="color: green">${personalHomeStats.easyBitPair}</span> easy tile
      pairs made,
      <span style="color: green">${personalHomeStats.wrongBitPair}</span> hard
      tile pairs made,
      <span style="color: green">${personalHomeStats.hardBitPair}</span> wrong
      pairs made, <span style="color: green">${currentJiraLevel}</span> level(s)
      completed in Maze runner game,
      <span style="color: green">${totalVideoLevels}</span> level(s) completed in
      video game,
      <span style="color: green">${personalHomeStats.runOutOfTime}</span> time(s)
      you ran out of time`;

    setTimeout(() => {
      document.querySelector("#finalStats").style.display = "none";
    }, 5000);
  }
  if (electroneumFacts && (e.key === "e" || e.key === "E")) {
    // show a fun fact about Electroneum
    let electroneumFunFacts = [
      "<b>Mobile-First Cryptocurrency:</b> Electroneum was one of the first blockchains designed for easy mobile usage, allowing users to send and receive ETN with just a smartphone.",
      "<b>Instant Transactions:</b> Electroneum introduced an Instant Payment System, enabling near-instant ETN transactions for everyday purchases.",
      "<b>Low-Cost Microtransactions:</b> With minimal fees, Electroneum is ideal for microtransactions, making it perfect for digital services and small payments.",
      "<b>Energy Efficient:</b> Unlike traditional Proof-of-Work blockchains, ETN runs on a more energy-efficient model, reducing environmental impact.",
      "<b>ETN Everywhere:</b> A global ecosystem where merchants, freelancers, and businesses accept ETN for goods and services.",
      "<b>Built for the Unbanked:</b> Electroneum focuses on financial inclusion, helping the world’s unbanked population access digital payments and financial services.",
      "<b>Hybrid Blockchain Model:</b> ETN blends the best of blockchain security with centralized compliance measures to meet regulatory standards.",
      "<b>Strong Compliance:</b> Electroneum was one of the first cryptocurrencies to voluntarily comply with AML (Anti-Money Laundering) and KYC (Know Your Customer) regulations.",
      "<b>Smart Chain Technology:</b> The Electroneum Smart Chain (ESC) allows developers to build and deploy decentralized applications (dApps) with low fees.",
      "<b>Lightning-Fast Blocks:</b> ETN has fast block confirmation times, ensuring transactions are processed quickly compared to other blockchains.",
      "<b>ETN Rewards System:</b> Users can earn ETN through various incentive programs, helping to increase adoption and engagement.",
      "<b>Freelancer-Friendly:</b> ETN integrates with platforms like AnyTask, allowing freelancers to get paid in ETN without requiring a bank account.",
      "<b>Zero-Cost Transfers:</b> Some transactions within the Electroneum ecosystem can be completed with zero fees, making it even more user-friendly.",
      "<b>Regulatory-Friendly Approach:</b> Unlike many cryptocurrencies, Electroneum works closely with governments and regulators to ensure long-term adoption.",
      "<b>Bridging Traditional and Crypto:</b> Electroneum aims to bridge the gap between traditional finance and crypto, making digital payments accessible to all.",
    ];

    document.querySelector("#finalStats").style.display = "block";
    document.querySelector("#finalStats").innerHTML =
      electroneumFunFacts[Math.floor(Math.random() * 15)];

    setTimeout(() => {
      document.querySelector("#finalStats").style.display = "none";
    }, 5000);
  }
  // going back to the canvas/game
  if (
    e.key === "Backspace" &&
    document.querySelector("#levelsCompletedDiv").style.display == "none"
  ) {
    if (currentActiveGame === "thetaVideo") {
      const tags = ["technology", "environment", "history"];
      tags.forEach((el) => {
        document.querySelector(`#${el}`).style.display = "none";
      });
      clearInterval(qnaInterval);
      clearInterval(videoInterval);

      movePlayer = true;
      document.querySelector("#thetaGame").style.display = "none";
      document.querySelector("#game").style.display = "block";
      if (document.querySelector("iframe")) {
        document.querySelector("iframe").remove();
      }
      correct.style.display = "none";
      wrong.style.display = "none";
      instructions.style.display = "block";

      proceedBtn.textContent = "Proceed";
    } else if (currentActiveGame === "bitbucket") {
      movePlayer = true;
      bitGameSong.stop();
      bitbucketGameDiv.innerHTML = "";
      arrayForHints = [];
      selectedTiles = [];
      currentlyFlipped = [];
      correctOrderAnsArray = [];
      gameCanvas.style.display = "block";
      atlassianBitbucketGame.style.display = "none";
      document.querySelector("#username").style.display = "block";

      totalLives = lives.childElementCount;

      document.querySelector("body").style = "";
    } else if (currentActiveGame === "jira") {
      movePlayer = true;

      if (!passedAllJiraLevels) {
        mazeMovables.forEach((movable) => {
          if (jiraY != 0) {
            movable.position.y = movable.position.y - 3 * jiraY;
          }
          if (jiraX != 0) {
            movable.position.x = movable.position.x - 3 * jiraX;
          }
        });
        jiraX = 0;
        jiraY = 0;

        document.querySelector("#timeJira").style.display = "none";
        document.querySelector("#levelJira").style.display = "none";

        // setting back the variables to the initial value
        countdownTimer = 40;
        clearInterval(intervalName);
        currentJiraLevel = 1;
        document.querySelector(
          "#levelJira"
        ).innerHTML = `Level:<br> <b>01/06</b>`;

        cancelAnimationFrame(mazeId);
        // document.querySelector("#selectMusic").style.display = "block";
        atlassianJiraGame.style.display = "none";
      } else {
        atlassianJiraGame.style.display = "block";
      }

      gameCanvas.style.display = "block";

      animate();
    } else return;

    currentActiveGame = "";
    jiraCanvas.style.display = "none";
    CANVAS.style.display = "inline-block";
    detailsDiv.style.display = "inline-block";
    atlassianJiraGame.style.display = "none";
  }
});

// for provisioning the judges a special access
async function loginAsJudge() {
  judgeMode = true;

  signupResult = {
    streak: 5,
    earnedTRX: "2.25000",
    score: 10,
    songs: "123456",
    txnHashes: [
      {
        explorer: "https://blockexplorer.electroneum.com",
        txnHash:
          "0x0290d5067b1244242bf13f0d26cf5d036e6e7382113fb7b931ade2671efccf7e",
        memo: "Getting a hint for  Level-2 Triplet-2",
        trx: "1741525290591",
      },
      {
        explorer: "https://blockexplorer.electroneum.com",
        txnHash:
          "0x07c0f8b04675ad1f4d14d3678dd904cd906cc74d1bebff663a8a9dc54675ffaf",
        memo: "Buying the fluffingDuck music Track",
        trx: "1741525376250",
      },
    ],
    loggedInToday: true,
    npatLevels: "2-",
    visited: 1,
    flipLevel: "2",
    mazeLevel: "1",
    videoLevel: "1",
  };

  document.querySelector("#username").innerHTML =
    "Hello judge, you are in the <b>Privileged Mode</b> and using the project without the web3 wallet <br />Scores and progress will not be synced to the server";

  videoLevels.textContent = signupResult.videoLevel;

  // setting up the variables for the game
  score = signupResult.score;
  streak = signupResult.streak;
  purchasedSongs = signupResult.songs;
  transactions = signupResult.txnHashes;

  const visited = signupResult.visited;

  if (streak == 1 && !visited) await payUser(0.000015, "Day 1 streak reward");
  else if (streak == 2 && !visited)
    await payUser(0.000017, "Day 2 streak reward");
  else if (streak >= 3 && !visited)
    await payUser(0.000019, "Day 3+ streak reward");

  document.querySelector("#overAllScore").innerHTML = signupResult.score;
  balanceDiv.textContent = `${26.3759} ETN`;

  // this is the thing called after use clicks "Play Game"
  document.querySelector("#walletError").style.visibility = "hidden";

  document.querySelector("#loader").style.display = "block";
  document.querySelector("#landing-section").style.display = "none";
  document.querySelector("#game").style.display = "block";
  document.querySelector("#loader").style.display = "none";
  document.querySelector("#tutorialImage").style.display = "none";

  movePlayer = true;

  controlMainSong(defaultSong, "play");
  attachEventListeners();
}
