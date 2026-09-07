document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       CURRENT USER
    ========================== */

    const userId = localStorage.getItem("userId");

    const taskStorageKey = userId
        ? `plannerTasks_${userId}`
        : "plannerTasks_guest";


    /* =========================
       USER NAME
    ========================== */

    const userName =
        localStorage.getItem("userName") ||
        localStorage.getItem("name") ||
        "Student";


    /* =========================
       USER PROFILE
    ========================== */

    const userProfileName =
        document.getElementById("userProfileName");

    const userAvatar =
        document.getElementById("userAvatar");

    if (userProfileName) {
        userProfileName.textContent = userName;
    }

    if (userAvatar) {

        const nameParts = userName.trim().split(/\s+/);

        let initials = "ST";

        if (nameParts.length >= 2) {
            initials =
                nameParts[0].charAt(0) +
                nameParts[1].charAt(0);
        } else if (nameParts.length === 1) {
            initials =
                nameParts[0].substring(0, 2);
        }

        userAvatar.textContent =
            initials.toUpperCase();
    }


    /* =========================
       15-MINUTE TIMER
    ========================== */

    let timeLeft = 15 * 60;
    let timerInterval = null;
    let isRunning = false;

    const timerDisplay =
        document.getElementById("timer");

    const startButton =
        document.getElementById("startTimer");

    const resetButton =
        document.getElementById("resetTimer");


    console.log("Timer elements:", {
        timerDisplay,
        startButton,
        resetButton
    });


    /* =========================
       UPDATE TIMER DISPLAY
    ========================== */

    function updateTimer() {

        const minutes =
            Math.floor(timeLeft / 60);

        const seconds =
            timeLeft % 60;

        if (timerDisplay) {

            timerDisplay.textContent =
                `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        }
    }


    /* =========================
       START / PAUSE TIMER
    ========================== */

    if (startButton && timerDisplay) {

        startButton.addEventListener("click", () => {

            // PAUSE
            if (isRunning) {

                clearInterval(timerInterval);

                timerInterval = null;

                isRunning = false;

                startButton.textContent =
                    "Resume Focus";

                return;
            }


            // SESSION COMPLETE
            if (timeLeft <= 0) {

                return;
            }


            // START
            isRunning = true;

            startButton.textContent =
                "Pause";


            timerInterval = setInterval(() => {

                timeLeft--;

                updateTimer();


                // TIMER FINISHED
                if (timeLeft <= 0) {

                    clearInterval(timerInterval);

                    timerInterval = null;

                    isRunning = false;

                    timeLeft = 0;

                    updateTimer();

                    startButton.textContent =
                        "Session Complete 🎉";
                }

            }, 1000);

        });

    }


    /* =========================
       RESET TIMER
    ========================== */

    if (resetButton) {

        resetButton.addEventListener("click", () => {

            clearInterval(timerInterval);

            timerInterval = null;

            isRunning = false;

            timeLeft = 15 * 60;

            updateTimer();

            if (startButton) {

                startButton.textContent =
                    "Start Focus";
            }

        });

    }


    // Initial timer display
    updateTimer();


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
       LOAD TASKS
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
       SAVE TASKS
    ========================== */

    function saveTasks() {

        localStorage.setItem(
            taskStorageKey,
            JSON.stringify(tasks)
        );
    }


    /* =========================
       TASK COUNTER
    ========================== */

    function updateTaskCounter() {

        const totalTasks =
            tasks.length;

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

            taskElement.addEventListener(
                "click",
                () => {

                    tasks.splice(index, 1);

                    saveTasks();

                    renderTasks();
                }
            );

            taskList.appendChild(taskElement);

        });

        updateTaskCounter();
    }


    /* =========================
       ADD TASK
    ========================== */

    taskForm.addEventListener(
        "submit",
        (event) => {

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


            if (!title) {

                titleInput.focus();

                return;
            }


            const task = {

                id: Date.now(),

                title: title,

                time: time,

                type: type

            };


            tasks.push(task);

            saveTasks();

            renderTasks();

            taskForm.reset();

        }
    );


    /* =========================
       INITIAL LOAD
    ========================== */

    renderTasks();

});
