document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       TIMER
    ========================== */

    let timeLeft = 15 * 60;
    let timerInterval = null;
    let isRunning = false;

    const timerDisplay = document.getElementById("timer");
    const startButton = document.getElementById("startTimer");
    const resetButton = document.getElementById("resetTimer");

    if (!timerDisplay || !startButton || !resetButton) {
        console.error("Timer elements not found.");
        return;
    }

    function updateTimer() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        timerDisplay.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    startButton.addEventListener("click", () => {

        if (isRunning) {

            clearInterval(timerInterval);

            timerInterval = null;
            isRunning = false;

            startButton.textContent = "Resume Focus";

            return;
        }

        isRunning = true;
        startButton.textContent = "Pause";

        timerInterval = setInterval(() => {

            if (timeLeft <= 0) {

                clearInterval(timerInterval);

                timerInterval = null;
                isRunning = false;

                startButton.textContent = "Session Complete 🎉";

                return;
            }

            timeLeft--;

            updateTimer();

        }, 1000);

    });


    resetButton.addEventListener("click", () => {

        clearInterval(timerInterval);

        timerInterval = null;
        isRunning = false;

        timeLeft = 15 * 60;

        updateTimer();

        startButton.textContent = "Start Focus";

    });


    /* =========================
       ADD TASK
    ========================== */

    const taskForm = document.getElementById("taskForm");
    const taskList = document.getElementById("taskList");
    const taskCounter = document.getElementById("taskCounter");

    if (!taskForm || !taskList || !taskCounter) {
        console.error("Task elements not found.");
        return;
    }

    function updateTaskCounter() {

        const totalTasks =
            taskList.querySelectorAll(".planner-task").length;

        taskCounter.textContent =
            `${totalTasks} ${totalTasks === 1 ? "task" : "tasks"}`;
    }


    taskForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const titleInput =
            document.getElementById("taskTitle");

        const timeInput =
            document.getElementById("taskTime");

        const typeInput =
            document.getElementById("taskType");

        const title = titleInput.value.trim();
        const time = timeInput.value;
        const type = typeInput.value;

        if (title === "") {
            titleInput.focus();
            return;
        }

        const task = document.createElement("div");

        task.className = "planner-task";

        task.innerHTML = `
            <div class="task-check">
                +
            </div>

            <div class="planner-task-info">
                <strong></strong>
                <small></small>
            </div>

            <span class="planner-status">
                Later
            </span>
        `;

        task.querySelector("strong").textContent = title;

        task.querySelector("small").textContent =
            `${type} • ${time}`;

        taskList.appendChild(task);

        updateTaskCounter();

        taskForm.reset();

    });


    updateTimer();
    updateTaskCounter();

});