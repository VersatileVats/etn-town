const help = document.querySelector("#help");
const words = document.querySelector("#words");
const timerDiv = document.querySelector("#npatTimer");
const wordsDiv = document.querySelector("#wordsDiv");
const qaSection = document.getElementById("qa-section");
const submitButton = document.getElementById("submit-button");
const alphaReasoning = document.querySelector("#alphaReasoning");
const questionsContainer = document.getElementById("questions-container");

// to adding it to the 3 games
let npatAlphabetIndex = null;

// populating the words
for (let i = 97; i <= 121; i++) {
  // z is not included (that's why till 121)
  words.innerHTML += `<img
    width="40"
    height="40"
    style="padding: 4px"
    src="assets/${String.fromCharCode(i)}.png"
    alt="a" />`;
}

// to show the timer for the current iteration
function timeLeftForNextDay() {
  setInterval(() => {
    const now = new Date();
    const nextDay = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1, // Move to next day in UTC
        0,
        0,
        0,
        0 // Midnight UTC
      )
    );

    const timeLeft = nextDay - now; // Difference in milliseconds

    if (timeLeft <= 0) {
      clearInterval(intervalId);
      location.reload();
      return;
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // timerDiv.innerHTML = `Ending in ${hours}h : ${minutes}m : ${seconds}s`;
    timerDiv.innerHTML = `New challenge starts in ${hours}h : ${minutes}m : ${seconds}s`;
  }, 1000); // Update every second
}

timeLeftForNextDay();

// Generate fill-in-the-blanks style questions
function createBlanks(answer) {
  return answer
    .split("")
    .map((char, index) => {
      if (index === 0) {
        return `<span>${char}</span>`;
      } else {
        return `<input id="qaInput" autocomplete="off" type="text" maxlength="1" class="blank-input" />`;
      }
    })
    .join("");
}

let qTimer = undefined;

// fetching the data from the object
function populateQuestions(qIndex) {
  Object.entries(npatQuestions[qIndex]).forEach((el) => {
    const questionDiv = document.createElement("div");
    questionDiv.style.marginLeft = "1rem";

    let imgSrc = `assets/${el[0]}.png`;

    questionDiv.innerHTML = `
      <p style="display: flex; align-items: center"><img style="margin-right: 4px" width="24" src=${imgSrc} />${
      el[1].hint
    }</p>
      <div>${createBlanks(el[1].ans)}</div><br>
    `;

    questionsContainer.appendChild(questionDiv);
  });

  document.querySelectorAll("#qaInput").forEach((ip) => {
    // for auto-shifting the input to the next one
    ip.addEventListener("keyup", async (el) => {
      if (el.target.value.length === el.target.maxLength) {
        const nextInput = el.target.nextElementSibling;
        if (nextInput && nextInput.tagName === "INPUT") {
          nextInput.focus();
        }
      }
    });

    // deleting via backspace
    ip.addEventListener("keydown", (el) => {
      // Move to previous input when backspace is pressed on an empty input
      if (el.key === "Backspace" && el.target.value === "") {
        const prevInput = el.target.previousElementSibling;
        if (prevInput && prevInput.tagName === "INPUT") {
          prevInput.focus();
        }
      }
    });
  });

  // Show Q&A Section
  qaSection.style.display = "flex";

  // 30 seconds timer
  let timeLeft = 30;

  document.querySelector("#questionTimer").style.visibility = "visible";

  const timerDisplay = document.getElementById("questionTime");
  timerDisplay.textContent = timeLeft;

  qTimer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(qTimer);
      submitAnswers();
    }
  }, 1000);
}

// Enable submit button when all blanks are filled
questionsContainer.addEventListener("input", () => {
  const allFilled = Array.from(document.querySelectorAll(".blank-input")).every(
    (input) => input.value.trim() !== ""
  );
  submitButton.disabled = !allFilled;
});

function arraysAreEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((value, index) => value === arr2[index]);
}

// clicked=true denotes the manual submitting
function submitAnswers(clicked = false) {
  const userAnswers = [];
  questionsContainer
    .querySelectorAll(":scope > div > div")
    .forEach((div, index) => {
      const inputs = Array.from(div.querySelectorAll(".blank-input"));
      const userAnswer = inputs.map((input) => input.value.trim()).join("");
      userAnswers.push(
        (
          questionsContainer.querySelectorAll(":scope > div > div span")[0]
            .textContent + userAnswer
        ).toLowerCase()
      );
    });

  let actualAnswers = [];

  Object.entries(npatQuestions[currSelectedAlphabetIndex]).forEach((el) => {
    actualAnswers.push(el[1].ans.toLowerCase());
  });

  // correct answers are provided
  if (arraysAreEqual(userAnswers, actualAnswers)) {
    // increasing the score
    incScore("5");

    // some UI manipulations
    help.style.display = "block";
    wordsDiv.style.display = "flex";
    qaSection.style.display = "none";
    document.querySelector("#questionTimer").style.visibility = "hidden";

    clearInterval(qTimer);
    qTimer = undefined;
    currSelectedAlphabetIndex = undefined;
    questionsContainer.innerHTML = "";

    claps.play();

    submitButton.setAttribute("disabled", "true");

    // return;
  } else {
    // decreasing the score
    incScore("-3");
    buzzer.play();
  }

  // timer ran out
  if (!clicked) {
    // some UI manipulations
    help.style.display = "block";
    wordsDiv.style.display = "flex";
    qaSection.style.display = "none";
    document.querySelector("#questionTimer").style.visibility = "hidden";

    clearInterval(qTimer);

    qTimer = undefined;
    currSelectedAlphabetIndex = undefined;
    questionsContainer.innerHTML = "";

    submitButton.setAttribute("disabled", "true");
  }

  document.querySelector("#backToGame").style.pointerEvents = "auto";

  signupResult.npatLevels += npatAlphabetIndex + "-";
  // console.log(`New signup npatLevels are: ${signupResult.npatLevels}`);

  // updating the same in the database
  callBackend(
    {
      wallet: changeAddress,
      npatLevel: signupResult.npatLevels,
    },
    "updateNPATLevel"
  );
}

// Handle submit
submitButton.addEventListener("click", () => {
  submitAnswers(true);
});

// for the extra stuff
let appRunningWeeks = undefined;

// to get the index which has to be used
function getAppRunningDays(startDateStr) {
  const startDate = new Date(
    Date.UTC(
      new Date(startDateStr).getUTCFullYear(),
      new Date(startDateStr).getUTCMonth(),
      new Date(startDateStr).getUTCDate()
    )
  );
  const now = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate()
    )
  );

  // Calculate the difference in days
  const diffInMs = now - startDate;
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  appRunningWeeks = Math.floor(days / 7);

  return days >= 7 ? days % 7 : days;
}

const alphabetsPerIteration = [
  "1-20-15-7", // A-T-O-G
  "2-21-16-8", // B-U-P-H
  "3-22-17-9", // C-V-Q-I
  "4-23-18-10", // D-W-R-J
  "5-24-19-11", // E-X-S-K
  "6-25-20-12", // F-Y-T-L
  "13", // M
];

let currSelectedAlphabetIndex = undefined;
const appRunningDays = getAppRunningDays("2025-3-08");

document.querySelector("#week").innerHTML = appRunningWeeks + 1;
document.querySelector("#day").innerHTML = appRunningDays + 1;

// now loop over each of the alphabets for the currentDay to grab the 1 (in case of last week day) or 4 alphabet(s)
alphabetsPerIteration[appRunningDays].split("-").forEach((day) => {
  words.children[day - 1].style.filter = "grayscale(0)";
  words.children[day - 1].style.pointerEvents = "auto";
  words.children[day - 1].style.cursor = "pointer";
  words.children[day - 1].addEventListener("click", async (el) => {
    document.querySelector("#backToGame").style.pointerEvents = "none";

    npatAlphabetIndex = day - 1;

    if (signupResult.npatLevels.includes(`${day - 1}-`)) {
      let mainAlphabet = npatQuestions[day - 1].name.ans.charAt(0);
      let appendString = "";

      Object.entries(npatQuestions[day - 1]).forEach((el) => {
        // console.log(el[0], el[1].brief);
        appendString += `<p style="display: flex; align-items: center; margin-bottom: 0.5rem">
              <img
                src="assets/${el[0]}.png"
                width="24"
                style="margin-right: 4px" />${el[1].brief}
            </p>`;
      });

      alphaReasoning.innerHTML = appendString;
      alphaReasoning.style.display = "flex";
      words.style.display = "none";

      // to reset the view after 5 seconds
      setTimeout(() => {
        alphaReasoning.style.display = "none";
        alphaReasoning.innerHTML = "";
        words.style.display = "flex";
        document.querySelector("#backToGame").style.pointerEvents = "auto";
      }, 5000);
    } else {
      help.style.display = "none";
      wordsDiv.style.display = "none";
      currSelectedAlphabetIndex = day - 1;
      populateQuestions(day - 1);
    }
  });
});

document.querySelector("#backToGame").addEventListener("click", () => {
  movePlayer = true;
  gameCanvas.style.display = "block";
  document.querySelector("#gameDiv").style.display = "none";
  document.querySelector("#username").style.display = "block";
});
