document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       CURRENT USER
    ========================== */

    const userId = localStorage.getItem("userId");

    if (!userId) {
        console.warn("No logged-in user found.");
    }

    // Har user ke tasks ki alag storage
    const taskStorageKey = userId
        ? `plannerTasks_${userId}`
        : "plannerTasks_guest";


    /* =========================
       TIMER
    ========================== */

    let timeLeft = 15 * 60;
    let timerInterval = null;
    let isRunning = false;

    const timerDisplay = document.getElementById("timer");
    const startButton = document.getElementById("startTimer");
    const resetButton = document.getElementById("resetTimer");

    if (timerDisplay && startButton && resetButton) {

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

                    startButton.textContent =
                        "Session Complete 🎉";

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

            startButton.textContent =
                "Start Focus";

        });


        updateTimer();

    } else {

        console.warn("Timer elements not found.");

    }


    /* =========================
       TASK ELEMENTS
    ========================== */

    const taskForm =
        document.getElementById("taskForm");

    const taskList =
        document.getElementById("taskList");

    const taskCounter =
        document.getElementById("taskCounter");


    if (!taskForm || !taskList || !taskCounter) {

        console.error("Task elements not found.");

        return;

    }


    /* =========================
       LOAD USER TASKS
    ========================== */

    let tasks = [];

    try {

        tasks =
            JSON.parse(
                localStorage.getItem(taskStorageKey)
            ) || [];

    } catch (error) {

        console.error(
            "Could not load planner tasks.",
            error
        );

        tasks = [];

    }


    /* =========================
       SAVE USER TASKS
    ========================== */

    function saveTasks() {

        localStorage.setItem(
            taskStorageKey,
            JSON.stringify(tasks)
        );

    }


    /* =========================
       UPDATE COUNTER
    ========================== */

    function updateTaskCounter() {

        const totalTasks = tasks.length;

        taskCounter.textContent =
            `${totalTasks} ${totalTasks === 1 ? "task" : "tasks"}`;

    }


    /* =========================
       DISPLAY TASKS
    ========================== */

    function renderTasks() {

        taskList.innerHTML = "";


        tasks.forEach((task, index) => {

            const taskElement =
                document.createElement("div");

            taskElement.className =
                "planner-task";


            taskElement.innerHTML = `
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


            taskElement
                .querySelector("strong")
                .textContent = task.title;


            taskElement
                .querySelector("small")
                .textContent =
                    `${task.type} • ${task.time}`;


            /* =========================
               TASK CLICK
            ========================== */

            taskElement.addEventListener("click", () => {

                tasks.splice(index, 1);

                saveTasks();

                renderTasks();

            });


            taskList.appendChild(taskElement);

        });


        updateTaskCounter();

    }


    /* =========================
       ADD TASK
    ========================== */

    taskForm.addEventListener("submit", (event) => {

        event.preventDefault();


        const titleInput =
            document.getElementById("taskTitle");

        const timeInput =
            document.getElementById("taskTime");

        const typeInput =
            document.getElementById("taskType");


        const title =
            titleInput.value.trim();

        const time =
            timeInput.value;

        const type =
            typeInput.value;


        if (title === "") {

            titleInput.focus();

            return;

        }


        /* =========================
           CREATE TASK
        ========================== */

        const task = {

            id: Date.now(),

            title: title,

            time: time,

            type: type

        };


        /* =========================
           ADD TO CURRENT USER
        ========================== */

        tasks.push(task);


        /* =========================
           SAVE
        ========================== */

        saveTasks();


        /* =========================
           DISPLAY
        ========================== */

        renderTasks();


        /* =========================
           RESET FORM
        ========================== */

        taskForm.reset();

    });


    /* =========================
       INITIAL LOAD
    ========================== */

    renderTasks();

});
