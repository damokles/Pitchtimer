let currentRound = 1;
let totalRounds = 0;

let exerciseTime = 0;
let pauseTime = 0;

let timeLeft = 0;
let interval = null;

let isExercise = true;

let wakeLock = null;

async function keepAwake() {

    try {

        wakeLock =
            await navigator.wakeLock.request("screen");

    } catch (err) {

        console.log("WakeLock nicht verfügbar");

    }

}

function beep(duration = 300, frequency = 800) {

    const audioContext =
        new (window.AudioContext || window.webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    oscillator.start();

    setTimeout(() => {
        oscillator.stop();
    }, duration);
}

function longWhistle() {
    beep(700, 600);
}

function doubleWhistle() {

    beep(300, 1000);

    setTimeout(() => {
        beep(300, 1000);
    }, 400);
}

function updateDisplay() {

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    document.getElementById("timer").textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

    document.getElementById("round").textContent =
        `Runde ${currentRound} / ${totalRounds}`;

    const timer = document.getElementById("timer");

    if (timeLeft <= 5) {
        timer.classList.add("blink");
        timer.classList.add("warning");
    } else {
        timer.classList.remove("blink");
        timer.classList.remove("warning");
    }

    if (isExercise) {
        document.getElementById("nextAction").textContent =
            `Danach: ${pauseTime} Sekunden Pause`;
    } else {
        document.getElementById("nextAction").textContent =
            `Danach: Runde ${currentRound + 1}`;
    }
}

async function startTimer() {

    if (interval) return;

    await keepAwake();

    exerciseTime =
        Number(document.getElementById("exerciseTime").value);

    pauseTime =
        Number(document.getElementById("pauseTime").value);

    totalRounds =
        Number(document.getElementById("rounds").value);

    if (timeLeft === 0) {

        currentRound = 1;
        isExercise = true;
        timeLeft = exerciseTime;

        document.getElementById("status").textContent =
            "ÜBUNG";

        document.body.style.background = "#16a34a";
    }

    updateDisplay();

    interval = setInterval(runTimer, 1000);
}

function pauseTimer() {

    clearInterval(interval);
    interval = null;
}

function runTimer() {

    timeLeft--;

    updateDisplay();

    if (timeLeft > 0) return;

    if (isExercise) {

        longWhistle();

        if (pauseTime > 0) {

            isExercise = false;

            document.getElementById("status").textContent =
                "PAUSE";

            document.body.style.background = "#ea580c";

            timeLeft = pauseTime;

        } else {

            currentRound++;

            if (currentRound > totalRounds) {
                finishTraining();
                return;
            }

            timeLeft = exerciseTime;
        }

    } else {

        doubleWhistle();

        currentRound++;

        if (currentRound > totalRounds) {
            finishTraining();
            return;
        }

        isExercise = true;

        document.getElementById("status").textContent =
            "ÜBUNG";

        document.body.style.background = "#16a34a";

        timeLeft = exerciseTime;
    }
}

function finishTraining() {

    clearInterval(interval);

    interval = null;

    document.body.style.background = "#1f2937";

    document.getElementById("status").textContent =
        "TRAINING BEENDET ✅";

    document.getElementById("nextAction").textContent =
        "Gut gemacht! ⚽";
}

function resetTimer() {

    clearInterval(interval);

    interval = null;

    currentRound = 1;

    timeLeft = 0;

    document.body.style.background = "#1f2937";

    document.getElementById("status").textContent =
        "Bereit";

    document.getElementById("timer").textContent =
        "00:00";

    document.getElementById("round").textContent =
        "Runde 0 / 0";

    document.getElementById("nextAction").textContent =
        "";
}

function toggleFullscreen() {

    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}
function changeValue(id, amount) {

    const input = document.getElementById(id);

    let value = Number(input.value);

    value += amount;

    if (value < 0) {
        value = 0;
    }

    input.value = value;
}
document.addEventListener("visibilitychange", async () => {

    if (
        wakeLock !== null &&
        document.visibilityState === "visible"
    ) {

        wakeLock =
        await navigator.wakeLock.request("screen");

    }

});
