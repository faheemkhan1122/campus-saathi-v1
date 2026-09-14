// =========================================
// CAMPUS SAATHI - DYNAMIC DASHBOARD
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    const userId = localStorage.getItem("userId");

    // User-specific storage keys
    const plannerKey = userId
        ? `plannerTasks_${userId}`
        : "plannerTasks_guest";

    const assignmentKey = userId
        ? `assignments_${userId}`
        : "assignments_guest";

    const projectKey = userId
        ? `projects_${userId}`
        : "projects_guest";

    const quizKey = userId
        ? `userQuizzes_${userId}`
        : "userQuizzes_guest";

    const pastPaperKey = userId
        ? `pastPapers_${userId}`
        : "pastPapers_guest";

    const doubtKey = userId
        ? `doubts_${userId}`
        : "doubts_guest";

    const wellbeingKey = userId
        ? `wellbeing_${userId}`
        : "wellbeing_guest";


    // =========================================
    // SAFE LOCAL STORAGE READER
    // =========================================

    function getStorage(key, fallback) {

        try {

            const data = localStorage.getItem(key);

            if (!data) {
                return fallback;
            }

            return JSON.parse(data);

        } catch (error) {

            console.error("Dashboard storage error:", error);

            return fallback;
        }
    }


    // =========================================
    // GET DATA
    // =========================================

    const plannerTasks =
        getStorage(plannerKey, []);

    const assignments =
        getStorage(assignmentKey, []);

    const projects =
        getStorage(projectKey, []);

    const quizzes =
        getStorage(quizKey, []);

    const pastPapers =
        getStorage(pastPaperKey, {
            viewedPapers: []
        });

    const doubts =
        getStorage(doubtKey, []);

    const wellbeing =
        getStorage(wellbeingKey, {
            silentMode: false,
            mood: null
        });


    // =========================================
    // DATE
    // =========================================

    const dateElement =
        document.getElementById("dashboardDate");

    if (dateElement) {

        const today = new Date();

        dateElement.textContent =
            today.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric"
            }).toUpperCase();
    }


    // =========================================
    // ASSIGNMENTS
    // =========================================

    const totalAssignments =
        assignments.length;

    const completedAssignments =
        assignments.filter(
            assignment =>
                assignment.status === "completed"
        ).length;

    const todayString =
        new Date().toISOString().split("T")[0];

    const dueToday =
        assignments.filter(assignment => {

            if (assignment.status === "completed") {
                return false;
            }

            return assignment.date === todayString;

        }).length;


    // =========================================
    // PROJECTS
    // =========================================

    const activeProjects =
        projects.length;

    let totalProjectTasks = 0;

    let completedProjectTasks = 0;


    projects.forEach(project => {

        const tasks =
            Array.isArray(project.tasks)
                ? project.tasks
                : [];

        totalProjectTasks += tasks.length;

        completedProjectTasks +=
            tasks.filter(
                task => task.completed === true
            ).length;

    });


    const openProjectTasks =
        totalProjectTasks -
        completedProjectTasks;


    // =========================================
    // REAL OVERALL PROGRESS
    // =========================================

    const totalTrackable =
        totalAssignments +
        totalProjectTasks;

    const completedTrackable =
        completedAssignments +
        completedProjectTasks;

    let progress = 0;


    if (totalTrackable > 0) {

        progress =
            Math.round(
                (completedTrackable /
                    totalTrackable) * 100
            );
    }


    // =========================================
    // PROGRESS TEXT
    // =========================================

    const overallProgress =
        document.getElementById(
            "overallProgress"
        );

    const progressRingNumber =
        document.getElementById(
            "progressRingNumber"
        );

    const progressMessage =
        document.getElementById(
            "progressMessage"
        );


    if (overallProgress) {

        overallProgress.textContent =
            `${progress}%`;
    }


    if (progressRingNumber) {

        progressRingNumber.textContent =
            progress;
    }


    if (progressMessage) {

        if (progress === 0) {

            progressMessage.textContent =
                "Start completing your work!";

        }
        else if (progress < 40) {

            progressMessage.textContent =
                "Good start! Keep going 💪";

        }
        else if (progress < 70) {

            progressMessage.textContent =
                "You're making great progress! 🔥";

        }
        else if (progress < 100) {

            progressMessage.textContent =
                "Almost there! Keep pushing! 🚀";

        }
        else {

            progressMessage.textContent =
                "Amazing! Everything is completed! 🎉";
        }
    }


    // =========================================
    // PROGRESS RING VISUAL UPDATE
    // =========================================

    const progressRing =
        document.querySelector(".progress-ring");


    if (progressRing) {

        const progressDegrees =
            Math.round(
                (progress / 100) * 360
            );


        progressRing.style.background = `
            conic-gradient(
                #8a69ff 0deg,
                #49a8ff ${progressDegrees}deg,
                rgba(255, 255, 255, 0.06) ${progressDegrees}deg,
                rgba(255, 255, 255, 0.06) 360deg
            )
        `;
    }


    // =========================================
    // TASK COUNTS
    // =========================================

    const dashboardTaskCount =
        document.getElementById(
            "dashboardTaskCount"
        );

    const dashboardDueCount =
        document.getElementById(
            "dashboardDueCount"
        );


    if (dashboardTaskCount) {

        dashboardTaskCount.textContent =
            String(
                plannerTasks.length
            ).padStart(2, "0");
    }


    if (dashboardDueCount) {

        dashboardDueCount.textContent =
            dueToday;
    }


    // =========================================
    // PLANNED STUDY TIME
    // =========================================

    function getTaskMinutes(timeText) {

        if (!timeText) {
            return 15;
        }

        const text =
            String(timeText).toLowerCase();


        if (text.includes("15")) {
            return 15;
        }

        if (text.includes("30")) {
            return 30;
        }

        if (text.includes("45")) {
            return 45;
        }

        if (text.includes("60")) {
            return 60;
        }

        if (text.includes("hour")) {
            return 60;
        }

        return 15;
    }


    let plannedMinutes = 0;


    plannerTasks.forEach(task => {

        plannedMinutes +=
            getTaskMinutes(task.time);
    });


    function formatStudyTime(minutes) {

        if (minutes < 60) {

            return `${minutes}m`;
        }


        const hours =
            Math.floor(minutes / 60);

        const remaining =
            minutes % 60;


        if (remaining === 0) {

            return `${hours}h`;
        }


        return `${hours}h ${remaining}m`;
    }


    const dashboardStudyTime =
        document.getElementById(
            "dashboardStudyTime"
        );


    if (dashboardStudyTime) {

        dashboardStudyTime.textContent =
            formatStudyTime(
                plannedMinutes
            );
    }


    // =========================================
    // ACTIVE PROJECTS
    // =========================================

    const dashboardProjectCount =
        document.getElementById(
            "dashboardProjectCount"
        );

    const dashboardOpenProjectTasks =
        document.getElementById(
            "dashboardOpenProjectTasks"
        );


    if (dashboardProjectCount) {

        dashboardProjectCount.textContent =
            String(
                activeProjects
            ).padStart(2, "0");
    }


    if (dashboardOpenProjectTasks) {

        dashboardOpenProjectTasks.textContent =
            openProjectTasks;
    }


    // =========================================
    // TODAY'S PLAN
    // =========================================

    const dashboardTaskList =
        document.getElementById(
            "dashboardTaskList"
        );


    if (dashboardTaskList) {

        dashboardTaskList.innerHTML = "";


        if (plannerTasks.length === 0) {

            dashboardTaskList.innerHTML = `

                <div class="dashboard-task">

                    <div class="task-check">
                        —
                    </div>

                    <div class="task-detail">

                        <strong>
                            No tasks planned yet
                        </strong>

                        <small>
                            Add your first task from the planner.
                        </small>

                    </div>

                    <span class="task-status">
                        —
                    </span>

                </div>

            `;

        }
        else {

            plannerTasks
                .slice(0, 4)
                .forEach(task => {

                    const taskElement =
                        document.createElement("div");


                    taskElement.className =
                        "dashboard-task";


                    taskElement.innerHTML = `

                        <div class="task-check">
                            ✓
                        </div>

                        <div class="task-detail">

                            <strong>
                                ${escapeHTML(
                                    task.title ||
                                    "Study Task"
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    task.type ||
                                    "Study"
                                )}
                                •
                                ${escapeHTML(
                                    task.time ||
                                    "15 minutes"
                                )}
                            </small>

                        </div>

                        <span class="task-status">
                            Planned
                        </span>

                    `;


                    dashboardTaskList
                        .appendChild(
                            taskElement
                        );

                });
        }
    }


    // =========================================
    // FOCUS MINUTES
    // =========================================

    const dashboardFocusMinutes =
        document.getElementById(
            "dashboardFocusMinutes"
        );


    if (dashboardFocusMinutes) {

        if (plannerTasks.length > 0) {

            dashboardFocusMinutes.textContent =
                getTaskMinutes(
                    plannerTasks[0].time
                );

        }
        else {

            dashboardFocusMinutes.textContent =
                "15";
        }
    }


    // =========================================
    // UPCOMING DEADLINES
    // =========================================

    const dashboardDeadlines =
        document.getElementById(
            "dashboardDeadlines"
        );


    if (dashboardDeadlines) {

        const upcomingAssignments =
            assignments
                .filter(assignment =>
                    assignment.status !== "completed" &&
                    assignment.date
                )
                .sort((a, b) =>
                    new Date(a.date) -
                    new Date(b.date)
                )
                .slice(0, 3);


        dashboardDeadlines.innerHTML =
            "";


        if (upcomingAssignments.length === 0) {

            dashboardDeadlines.innerHTML = `

                <div class="deadline-item">

                    <div>

                        <strong>
                            No upcoming deadlines
                        </strong>

                        <small>
                            You're all clear! 🎉
                        </small>

                    </div>

                </div>

            `;

        }
        else {

            upcomingAssignments
                .forEach(assignment => {

                    const deadlineDate =
                        new Date(
                            assignment.date
                        );


                    const formattedDate =
                        deadlineDate
                            .toLocaleDateString(
                                "en-US",
                                {
                                    month: "short",
                                    day: "2-digit"
                                }
                            )
                            .toUpperCase();


                    const today =
                        new Date();

                    today.setHours(
                        0, 0, 0, 0
                    );


                    deadlineDate.setHours(
                        0, 0, 0, 0
                    );


                    const difference =
                        Math.ceil(
                            (
                                deadlineDate -
                                today
                            ) /
                            (
                                1000 *
                                60 *
                                60 *
                                24
                            )
                        );


                    let remainingText;


                    if (difference < 0) {

                        remainingText =
                            "Overdue";

                    }
                    else if (difference === 0) {

                        remainingText =
                            "Due today";

                    }
                    else if (difference === 1) {

                        remainingText =
                            "Due tomorrow";

                    }
                    else {

                        remainingText =
                            `${difference} days left`;
                    }


                    const deadlineElement =
                        document.createElement(
                            "div"
                        );


                    deadlineElement.className =
                        "deadline-item";


                    deadlineElement.innerHTML = `

                        <div>
                            <strong>
                                ${escapeHTML(
                                    assignment.title ||
                                    "Assignment"
                                )}
                            </strong>

                            <small>
                                ${formattedDate}
                                •
                                ${remainingText}
                            </small>

                        </div>

                        <span class="deadline-priority">

                            ${escapeHTML(
                                assignment.subject ||
                                "Task"
                            )}

                        </span>

                    `;


                    dashboardDeadlines
                        .appendChild(
                            deadlineElement
                        );

                });
        }
    }


    // =========================================
    // DASHBOARD DATA SUMMARY
    // =========================================

    const dashboardDataSummary =
        document.getElementById(
            "dashboardDataSummary"
        );


    const viewedPapers =
        Array.isArray(
            pastPapers.viewedPapers
        )
            ? pastPapers.viewedPapers.length
            : 0;


    const unansweredDoubts =
        doubts.filter(
            doubt =>
                doubt.status === "unanswered"
        ).length;


    const totalQuestions =
        quizzes.reduce(
            (total, quiz) =>
                total +
                Number(
                    quiz.questionCount || 0
                ),
            0
        );


    if (dashboardDataSummary) {

        dashboardDataSummary.innerHTML = `

            <div>

                <strong>
                    ${quizzes.length}
                </strong>

                <span>
                    Quizzes
                </span>

            </div>


            <div>

                <strong>
                    ${totalQuestions}
                </strong>

                <span>
                    Quiz Questions
                </span>

            </div>


            <div>

                <strong>
                    ${viewedPapers}
                </strong>

                <span>
                    Papers Viewed
                </span>

            </div>


            <div>

                <strong>
                    ${doubts.length}
                </strong>

                <span>
                    Doubts Asked
                </span>

            </div>


            <div>

                <strong>
                    ${unansweredDoubts}
                </strong>

                <span>
                    Unanswered
                </span>

            </div>


            <div>

                <strong>
                    ${wellbeing.silentMode
                        ? "ON"
                        : "OFF"}
                </strong>

                <span>
                    Silent Mode
                </span>

            </div>

        `;
    }


    // =========================================
    // FOCUS TIMER LINK
    // =========================================

    const focusButton =
        document.querySelector(
            ".focus-btn"
        );


    if (
        focusButton &&
        plannerTasks.length > 0
    ) {

        focusButton.addEventListener(
            "click",
            () => {

                const minutes =
                    getTaskMinutes(
                        plannerTasks[0].time
                    );


                const focusMinutes =
                    document.getElementById(
                        "dashboardFocusMinutes"
                    );


                if (focusMinutes) {

                    focusMinutes.textContent =
                        minutes;
                }

            }
        );
    }


    // =========================================
    // CONSOLE INFORMATION
    // =========================================

    console.log(
        "Campus Saathi Dashboard updated successfully."
    );

    console.log(
        "Progress:",
        progress + "%"
    );

    console.log(
        "Planner Tasks:",
        plannerTasks.length
    );

    console.log(
        "Assignments:",
        assignments.length
    );

    console.log(
        "Projects:",
        projects.length
    );

    console.log(
        "Quizzes:",
        quizzes.length
    );


    // =========================================
    // SECURITY / HTML ESCAPE
    // =========================================

    function escapeHTML(value) {

        return String(value)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );
    }

});
