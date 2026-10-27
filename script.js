// Add more words here later.
// You can replace these definitions with your preferred wording.
const wordBank = [
    {word: "Amiela Earhart", definition: "Born in 1897, this pioneering pilot joined Purdue in 1935 as a career counselor for women and an adviser in aeronautics. During her campus visits, she stayed in South Hall, now called Duhme Hall. She encouraged women to pursue careers beyond traditional expectations. Earhart disappeared with navigator Fred Noonan on July 2, 1937, during an attempt to fly around the world.\n\nOctober 2026 update: Purdue helped investigate a possible aircraft-shaped object at Nikumaroro, an island where some researchers believe she may have landed. The expedition found that the object was likely washed-up trees and not her airplane. Her disappearance remains unresolved."},

    {word: "Neil Armstrong", definition: "A Purdue aeronautical engineering graduate from the Class of 1955 who became the first person to walk on the Moon on July 20, 1969. His Purdue experience included music and theater: he played baritone in the All-American Marching Band, was in Phi Delta Theta, and co-directed a student musical. Neil Armstrong Hall of Engineering opened in 2019, and the university continues to honor his legacy through the Neil Armstrong Scholarship and the Neil Armstrong Distinguished Visiting Professorship."},

    {word: "World's Largest Drum", definition: "The world's largest drum is located in Elliott Hall of Music. It was built in 1921 by the Ludwig & Ludwig Company of Chicago and is 8 feet in diameter and 42 inches deep. The drum is used for special performances, including the Purdue All-American Marching Band's halftime shows."},
    
    {word: "Purdue Pete", definition: "Purdue Pete is the official mascot of Purdue University. He was created in 1940 as a costumed character to represent the university at athletic events and other campus activities. Purdue Pete is known for his large head, muscular build, and friendly demeanor, and he has become an iconic symbol of school spirit at Purdue."},

    {word: "Clapping Circle", definition: "A circular space near the Memorial Union and Stewart Center. Stand in the center and clap to hear a high-pitched, chirping echo caused by sound reflecting off the surrounding steps!"},

    {word: "WALC", definition: "The Wilmeth Active Learning Center is a popular campus study spot. Students gather here for group projects, exam cramming, and all-nighters—usually with laptops and an energy drink. The building features a large, open atrium with plenty of natural light, as well as classrooms and collaborative spaces designed to facilitate active learning."},

    {word: "Den Pop", definition: "A giant fountain soda from the Discount Den near Purdue. You can mix different soda flavors to create your own combination—all for about $2"}
];

const screens = document.querySelectorAll(".screen");
const wordDisplay = document.querySelector("#word");
const timerDisplay = document.querySelector("#timer");
const testControls = document.querySelector("#test-controls");
const actionScreen = document.querySelector("#action-screen");
const actionText = document.querySelector("#action-text");

let deck = [];
let currentWord = null;
let answers = [];
let lastWord = "";
let state = "loading";
let endTime = 0;
let roundTimer = null;

function showScreen(id) {
    screens.forEach((screen) => {
        screen.hidden = screen.id !== id;
    });
}

function wait(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

function shuffle(items) {
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

function nextWord() {
    if (deck.length === 0) {
        deck = shuffle(wordBank);

        // Avoid repeating the previous word at a deck boundary.
        if (deck.length > 1 && deck[0].word === lastWord) {
            [deck[0], deck[1]] = [deck[1], deck[0]];
        }
    }

    currentWord = deck.shift();
    lastWord = currentWord.word;
    wordDisplay.textContent = currentWord.word;
}

async function startRound() {
    if (state !== "home" && state !== "results") {
        return;
    }

    answers = [];
    deck = [];
    lastWord = "";
    currentWord = null;
    state = "ready";

    showScreen("ready-screen");

    const hammer = document.querySelector("#hammer");
    hammer.classList.remove("swing");
    void hammer.getBoundingClientRect();
    hammer.classList.add("swing");

    await wait(1200);

    showScreen("round-screen");
    testControls.hidden = true;
    timerDisplay.textContent = "";

    for (let count = 3; count >= 1; count--) {
        wordDisplay.textContent = "Starting in " + count;
        await wait(1000);
    }

    nextWord();
    timerDisplay.textContent = "1:00";
    testControls.hidden = false;

    state = "playing";
    endTime = Date.now() + 60000;
    roundTimer = setInterval(updateTimer, 100);
}

function updateTimer() {
    const secondsLeft = Math.max(
        0,
        Math.ceil((endTime - Date.now()) / 1000)
    );

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = String(secondsLeft % 60).padStart(2, "0");

    timerDisplay.textContent = minutes + ":" + seconds;

    if (secondsLeft === 0) {
        finishRound();
    }
}

async function recordAnswer(correct) {
    if (state !== "playing") {
        return;
    }

    if (Date.now() >= endTime) {
        finishRound();
        return;
    }

    answers.push({
        ...currentWord,
        correct: correct
    });

    state = "action";

    actionScreen.classList.toggle("correct", correct);
    actionScreen.classList.toggle("pass", !correct);
    actionText.textContent = correct ? "HAMMER DOWN" : "PASS";

    showScreen("action-screen");

    // A quick action flash; the round timer keeps running.
    await wait(350);

    if (state !== "action") {
        return;
    }

    if (Date.now() >= endTime) {
        finishRound();
        return;
    }

    nextWord();
    showScreen("round-screen");
    state = "playing";
}

function finishRound() {
    if (state !== "playing" && state !== "action") {
        return;
    }

    clearInterval(roundTimer);
    state = "results";

    const correctCount = answers.filter((answer) => {
        return answer.correct;
    }).length;

    document.querySelector("#score").textContent =
        correctCount + " correct · " +
        (answers.length - correctCount) + " passed";

    const resultsList = document.querySelector("#results-list");
    resultsList.replaceChildren();

    answers.forEach((answer) => {
        const item = document.createElement("li");
        const title = document.createElement("strong");
        const definition = document.createElement("p");

        title.textContent =
            answer.word + " — " +
            (answer.correct ? "Correct" : "Passed");

        definition.textContent = answer.definition;

        item.append(title, definition);
        resultsList.append(item);
    });

    // Include the word that was still on screen when time ran out.
    if (currentWord && answers.length > 0) {
        const lastAnswer = answers[answers.length - 1];

        if (lastAnswer.word === currentWord.word && state === "results") {
            // Answered words are already included above.
        }
    }

    showScreen("results-screen");
}

document.querySelector("#start-button").addEventListener(
    "click",
    startRound
);

document.querySelector("#again-button").addEventListener(
    "click",
    startRound
);

document.querySelector("#correct-button").addEventListener("click", () => {
    recordAnswer(true);
});

document.querySelector("#pass-button").addEventListener("click", () => {
    recordAnswer(false);
});

document.querySelector("#home-button").addEventListener("click", () => {
    state = "home";
    showScreen("home-screen");
});

// Temporary keyboard controls for testing on your Mac.
document.addEventListener("keydown", (event) => {
    if (state !== "playing" || event.repeat) {
        return;
    }

    if (event.key === "ArrowDown") {
        event.preventDefault();
        recordAnswer(true);
    } else if (event.key === "ArrowUp") {
        event.preventDefault();
        recordAnswer(false);
    }
});

// Initial loading animation.
let progress = 0;

const loadingTimer = setInterval(() => {
    progress += 2;

    document.querySelector("#loading-fill").style.width =
        progress + "%";

    if (progress >= 100) {
        clearInterval(loadingTimer);
        state = "home";
        showScreen("home-screen");
    }
}, 30);
const exitButton = document.createElement("button");

exitButton.id = "exit-button";
exitButton.type = "button";
exitButton.textContent = "Exit";
exitButton.setAttribute("aria-label", "Exit round and return home");

// Appears with the gameplay controls after the countdown.
testControls.append(exitButton);

exitButton.addEventListener("click", () => {
    if (state !== "playing") {
        return;
    }

    clearInterval(roundTimer);
    state = "home";
    showScreen("home-screen");
});

// IPHONE TILT CONTROLS

// Tilt settings — easy to adjust later.
const TILT_ANGLE = 25;
const RESET_ANGLE = 20;
const TILT_HOLD_MS = 80;
const RESET_HOLD_MS = 100;

const tiltButton = document.createElement("button");
tiltButton.type = "button";
tiltButton.textContent = "Enable Tilt Controls";

const tiltStatus = document.createElement("p");
tiltStatus.style.maxWidth = "320px";
tiltStatus.style.lineHeight = "1.5";
tiltStatus.textContent =
    "Enable tilt, then hold your phone sideways to play.";

document.querySelector("#home-screen").append(
    tiltButton,
    tiltStatus
);

let tiltEnabled = false;
let tiltArmed = false;
let tiltReceivedData = false;

let tiltNeutralSince = null;
let tiltCandidate = null;
let tiltCandidateSince = null;

function handleTilt(event) {
    if (
        !Number.isFinite(event.beta) ||
        !Number.isFinite(event.gamma)
    ) {
        return;
    }

    if (!tiltReceivedData) {
        tiltReceivedData = true;
        tiltStatus.textContent =
            "Tilt is ready. Hold the phone sideways against your forehead.";
    }

    // Ignore movement outside an active round.
    if (state !== "playing") {
        tiltArmed = false;
        tiltNeutralSince = null;
        tiltCandidate = null;
        tiltCandidateSince = null;
        return;
    }

    const now = performance.now();

    const beta = event.beta * Math.PI / 180;
    const gamma = event.gamma * Math.PI / 180;

    const screenDirection = Math.cos(beta) * Math.cos(gamma);
    const triggerThreshold = Math.sin(TILT_ANGLE * Math.PI / 180);
    const resetThreshold = Math.sin(RESET_ANGLE * Math.PI / 180);

    // Hold approximately upright briefly to prepare the next tilt.
    if (Math.abs(screenDirection) <= resetThreshold) {
        tiltCandidate = null;
        tiltCandidateSince = null;

        if (tiltNeutralSince === null) {
            tiltNeutralSince = now;
        }

        if (now - tiltNeutralSince >= RESET_HOLD_MS) {
            tiltArmed = true;
        }

        return;
    }

    tiltNeutralSince = null;

    if (!tiltArmed) {
        return;
    }

    let direction = null;

    if (screenDirection < -triggerThreshold) {
        direction = "correct";
    } else if (screenDirection > triggerThreshold) {
        direction = "pass";
    }

    // The movement hasn't reached the required angle.
    if (direction === null) {
        tiltCandidate = null;
        tiltCandidateSince = null;
        return;
    }

    // Begin checking whether this is a deliberate tilt.
    if (tiltCandidate !== direction) {
        tiltCandidate = direction;
        tiltCandidateSince = now;
        return;
    }

    // Register one answer, then require an upright reset.
    if (now - tiltCandidateSince >= TILT_HOLD_MS) {
        tiltArmed = false;
        tiltCandidate = null;
        tiltCandidateSince = null;

        recordAnswer(direction === "correct");
    }
}

tiltButton.addEventListener("click", async () => {
    if (tiltEnabled) {
        return;
    }

    if (!window.isSecureContext) {
        tiltStatus.textContent =
            "Open the HTTPS game link to enable tilt.";
        return;
    }

    if (typeof DeviceOrientationEvent === "undefined") {
        tiltStatus.textContent =
            "Motion controls are unavailable in this browser. Use the buttons.";
        return;
    }

    tiltButton.disabled = true;

    try {
        if (
            typeof DeviceOrientationEvent.requestPermission === "function"
        ) {
            const permission =
                await DeviceOrientationEvent.requestPermission();

            if (permission !== "granted") {
                tiltStatus.textContent =
                    "Motion permission was not allowed. You can still use the buttons.";
                return;
            }
        }

        window.addEventListener("deviceorientation", handleTilt);

        tiltEnabled = true;
        tiltButton.textContent = "Tilt Enabled";
        tiltStatus.textContent = "Waiting for motion sensors...";

        setTimeout(() => {
            if (!tiltReceivedData) {
                tiltStatus.textContent =
                    "No motion data received. Try Safari on your iPhone, or use the buttons.";
            }
        }, 5000);
    } catch (error) {
        tiltStatus.textContent =
            "Could not enable motion. Try again or use the buttons.";
    } finally {
        tiltButton.disabled = tiltEnabled;
    }
});

// PAUSE AND RESUME

const pauseButton = document.createElement("button");
pauseButton.id = "pause-button";
pauseButton.type = "button";
pauseButton.textContent = "Pause";
pauseButton.setAttribute("aria-pressed", "false");
testControls.append(pauseButton);

const correctButton = document.querySelector("#correct-button");
const passButton = document.querySelector("#pass-button");

let pausedTimeLeft = 0;

function resetTiltAfterPause() {
    tiltArmed = false;
    tiltNeutralSince = null;
    tiltCandidate = null;
    tiltCandidateSince = null;
}

pauseButton.addEventListener("click", () => {
    if (state === "playing") {
        pausedTimeLeft = endTime - Date.now();

        if (pausedTimeLeft <= 0) {
            finishRound();
            return;
        }

        clearInterval(roundTimer);
        state = "paused";

        resetTiltAfterPause();
        wordDisplay.textContent = "PAUSED";
        pauseButton.textContent = "Resume";
        pauseButton.setAttribute("aria-pressed", "true");

        correctButton.disabled = true;
        passButton.disabled = true;
    } else if (state === "paused") {
        endTime = Date.now() + pausedTimeLeft;
        resetTiltAfterPause();

        wordDisplay.textContent = currentWord.word;
        pauseButton.textContent = "Pause";
        pauseButton.setAttribute("aria-pressed", "false");

        correctButton.disabled = false;
        passButton.disabled = false;

        state = "playing";
        updateTimer();
        roundTimer = setInterval(updateTimer, 100);
    }
});

// Allow Exit to work while paused, too.
exitButton.addEventListener("click", () => {
    if (state === "paused") {
        clearInterval(roundTimer);
        state = "home";
        showScreen("home-screen");
    }

    pausedTimeLeft = 0;
    pauseButton.textContent = "Pause";
    pauseButton.setAttribute("aria-pressed", "false");

    correctButton.disabled = false;
    passButton.disabled = false;
});