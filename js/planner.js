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
       TIMER
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


    /* =========================
       UPDATE TIMER
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
       SET TIMER
    ========================== */

    function setTimer(minutes) {

        clearInterval(timerInterval);

        timerInterval = null;

        isRunning = false;

        timeLeft = minutes * 60;

        updateTimer();

        if (startButton) {
            startButton.textContent = "Start Focus";
        }
    }


    /* =========================
       START / PAUSE
    ========================== */

    if (startButton) {

        startButton.addEventListener("click", () => {

            if (isRunning) {

                clearInterval(timerInterval);

                timerInterval = null;

                isRunning = false;

                startButton.textContent =
                    "Resume Focus";

                return;
            }


            if (timeLeft <= 0) {
                return;
            }


            isRunning = true;

            startButton.textContent =
                "Pause";


            timerInterval = setInterval(() => {

                timeLeft--;

                updateTimer();


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
       RESET
    ========================== */

    if (resetButton) {

        resetButton.addEventListener("click", () => {

            setTimer(15);

        });

    }


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
       GET MINUTES FROM TASK
    ========================== */

    function getTaskMinutes(timeText) {

        if (timeText.includes("15")) {
            return 15;
        }

        if (timeText.includes("30")) {
            return 30;
        }

        if (timeText.includes("45")) {
            return 45;
        }

        if (
            timeText.includes("60") ||
            timeText.toLowerCase().includes("hour")
        ) {
            return 60;
        }

        return 15;
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
                .textContent =
                    task.title;


            taskElement
                .querySelector("small")
                .textContent =
                    `${task.type} • ${task.time}`;


            /* =========================
               TASK CLICK
            ========================== */

            taskElement.addEventListener(
                "click",
                (event) => {

                    // Don't start timer when deleting
                    if (
                        event.target.closest(".task-check")
                    ) {
                        tasks.splice(index, 1);

                        saveTasks();

                        renderTasks();

                        return;
                    }


                    // Set timer according to task time
                    const minutes =
                        getTaskMinutes(task.time);

                    setTimer(minutes);

                    // Scroll to timer
                    if (timerDisplay) {

                        timerDisplay.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });
                    }

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
