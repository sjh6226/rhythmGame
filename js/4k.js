const gameArea = document.getElementById("gameArea");
const comboDisplay = document.getElementById("combo");
const increaseSpeedButton = document.getElementById("increaseSpeed");
const decreaseSpeedButton = document.getElementById("decreaseSpeed");
const scoreDisplay = document.getElementById("score"); // 점수 표시 요소

let combo = 0;
let speed = 25;
let judgeLinePosition = 450; // 판정선 위치 기본값
let score = 0;
let gameTimer = null;
let noteInterval = null;
let gameTimeLimit = 160; // 2분 40초(초)
let timeLeft = gameTimeLimit;
let timerDisplay = document.getElementById("timer"); // 타이머 표시 요소
let gameActive = false; // 게임 진행 중 여부

const keys = ["1", "2", "8", "9"];

function createNote() {
    if (!gameActive) return; // 게임 중이 아니면 노트 생성 안함
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const note = document.createElement("div");
    note.classList.add("note");
    note.innerText = randomKey;
    note.style.left = (keys.indexOf(randomKey) * (gameArea.clientWidth / keys.length)) + "px";
    note.style.top = "0px";
    gameArea.appendChild(note);

    let position = 0;
    const interval = setInterval(() => {
        position += speed;
        note.style.top = position + "px";

        if (position >= judgeLinePosition + 30) {
            clearInterval(interval);
            if (gameArea.contains(note)) gameArea.removeChild(note);
            combo = 0; // 노트 놓치면 콤보 0
            comboDisplay.innerText = combo;
            comboDisplay.style.visibility = "hidden"; // 콤보가 0일 때만 숨김
        }
        // 게임 종료시 노트 자동 제거
        if (!gameActive) {
            clearInterval(interval);
            if (gameArea.contains(note)) gameArea.removeChild(note);
        }
    }, 50);
    note._interval = interval; // interval 참조를 note에 저장
}

function startGame() {
    clearInterval(noteInterval);
    noteInterval = setInterval(() => {
        createNote();
    }, 800 / (speed / 25));
}

increaseSpeedButton.addEventListener("click", () => {
    speed = Math.min(speed + 1, 50);
    if (noteInterval && gameActive) startGame();
});

decreaseSpeedButton.addEventListener("click", () => {
    speed = Math.max(speed - 1, 1);
    if (noteInterval && gameActive) startGame();
});

document.addEventListener("keypress", (event) => {
    if (!gameActive) return;
    const notes = document.querySelectorAll(".note");
    let comboIncreased = false;
    notes.forEach(note => {
        const notePosition = parseInt(note.style.top);
        if (
            keys.includes(event.key) &&
            note.innerText === event.key &&
            notePosition >= judgeLinePosition - 20 &&
            notePosition <= judgeLinePosition + 50
        ) {
            if (note._interval) clearInterval(note._interval); // 노트 맞추면 interval 정지
            if (gameArea.contains(note)) gameArea.removeChild(note);
            if (!comboIncreased) {
                comboIncreased = true;
                combo++; // 콤보 증가
                comboDisplay.innerText = combo;
                comboDisplay.style.visibility = "visible"; // 콤보 항상 표시
            }
            score += 10; // 점수 증가
            scoreDisplay.innerText = score;
        }
    });
});

// 타이머 함수
function updateTimer() {
    if (timerDisplay) {
        const min = Math.floor(timeLeft / 60);
        const sec = timeLeft % 60;
        timerDisplay.innerText = `${min}:${sec.toString().padStart(2, "0")}`;
    }
}

// 게임 시작 함수
function gameStart() {
    combo = 0;
    score = 0;
    timeLeft = gameTimeLimit;
    comboDisplay.innerText = combo;
    comboDisplay.style.visibility = "hidden"; // 시작 시 콤보 숨김
    scoreDisplay.innerText = score;
    if (timerDisplay) updateTimer();
    document.querySelectorAll(".note").forEach(note => note.remove());
    clearInterval(noteInterval);
    clearInterval(gameTimer);

    gameActive = true;
    startGame();

    gameTimer = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(noteInterval);
            clearInterval(gameTimer);
            gameActive = false;
            // 남아있는 노트 제거
            document.querySelectorAll(".note").forEach(note => note.remove());
            alert(`게임 종료! 최종 점수: ${score}`);
        }
    }, 1000);
}
