```javascript
// =========================================
// CAMPUS SAATHI - DYNAMIC DASHBOARD
// SAFE V1 UPDATE
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // USER
    // =========================================

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

            const parsed = JSON.parse(data);

            return parsed ?? fallback;

        } catch (error) {

            console.error(
                `Dashboard storage error for ${key}:`,
                error
            );

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


    // Make sure arrays are actually arrays.
    const safePlannerTasks =
        Array.isArray(plannerTasks)
            ? plannerTasks
            : [];

    const safeAssignments =
        Array.isArray(assignments)
            ? assignments
            : [];

    const safeProjects =
        Array.isArray(projects)
            ? projects
            : [];

    const safeQuizzes =
        Array.isArray(quizzes)
            ? quizzes
            : [];

    const safeDoubts =
        Array.isArray(doubts)
            ? doubts
            : [];


    // =========================================
    // DATE HELPERS
    // =========================================

    function getLocalDateString(date = new Date()) {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    const todayString =
        getLocalDateString();


    // =========================================
    // DASHBOARD DATE
    // =========================================

    const dateElement =
        document.getElementById("dashboardDate");

    if (dateElement) {

        const today = new Date();

        dateElement.textContent =
            today.toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                }
            ).toUpperCase();
    }


    // =========================================
    // USER NAME
    // =========================================

    function getStoredUserName() {

        const possibleKeys = [
            "userName",
            "studentName",
            "fullName",
            "name"
        ];

        for (const key of possibleKeys) {

            const value =
                localStorage.getItem(key);

            if (
                value &&
                value.trim()
            ) {
                return value.trim();
            }
        }

        return "Student";
    }


    const userName =
        getStoredUserName();


    const userGreetingName =
        document.getElementById(
            "userGreetingName"
        );

    const userProfileName =
        document.getElementById(
            "userProfileName"
        );

    const userAvatar =
        document.getElementById(
            "userAvatar"
        );


    if (userGreetingName) {

        userGreetingName.textContent =
            userName;
    }


    if (userProfileName) {

        userProfileName.textContent =
            userName;
    }


    if (userAvatar) {

        const initials =
            userName
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(
                    word =>
                        word
                            .charAt(0)
                            .toUpperCase()
                )
                .join("");

        userAvatar.textContent =
            initials || "ST";
    }


    // =========================================
    // ASSIGNMENTS
    // =========================================

    const totalAssignments =
        safeAssignments.length;

    const completedAssignments =
        safeAssignments.filter(
            assignment =>
                String(
                    assignment.status || ""
                ).toLowerCase() === "completed"
        ).length;


    const dueToday =
        safeAssignments.filter(
            assignment => {

                if (
                    String(
                        assignment.status || ""
                    ).toLowerCase() === "completed"
                ) {
                    return false;
                }

                return (
                    assignment.date ===
                    todayString
                );
            }
        ).length;


    // =========================================
    // PROJECTS
    // =========================================

    const activeProjects =
        safeProjects.length;

    let totalProjectTasks = 0;

    let completedProjectTasks = 0;


    safeProjects.forEach(project => {

        const tasks =
            Array.isArray(project.tasks)
                ? project.tasks
                : [];


        totalProjectTasks +=
            tasks.length;


        completedProjectTasks +=
            tasks.filter(
                task =>
                    task &&
                    (
                        task.completed === true ||
                        task.status === "completed"
                    )
            ).length;

    });


    const openProjectTasks =
        Math.max(
            0,
            totalProjectTasks -
            completedProjectTasks
        );


    // =========================================
    // PLANNER TASK STATUS
    // =========================================

    function isTaskCompleted(task) {

        if (!task) {
            return false;
        }

        return (
            task.completed === true ||
            task.status === "completed" ||
            task.isCompleted === true
        );
    }


    const completedPlannerTasks =
        safePlannerTasks.filter(
            task =>
                isTaskCompleted(task)
        ).length;


    // =========================================
    // REAL OVERALL PROGRESS
    // =========================================
    //
    // Keep existing dashboard logic:
    // Assignments + Project tasks.
    //
    // Planner tasks are not added here because
    // the planner may represent study planning
    // rather than completed academic work.
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
                (
                    completedTrackable /
                    totalTrackable
                ) * 100
            );
    }


    progress =
        Math.min(
            100,
            Math.max(
                0,
                progress
            )
        );


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
    // PROGRESS RING VISUAL
    // =========================================

    const progressRing =
        document.querySelector(
            ".progress-ring"
        );


    if (progressRing) {

        const progressDegrees =
            Math.round(
                (
                    progress /
                    100
                ) * 360
            );


        if (progress === 0) {

            progressRing.style.background =
                `
                conic-gradient(
                    rgba(255, 255, 255, 0.06) 0deg,
                    rgba(255, 255, 255, 0.06) 360deg
                )
                `;

        }
        else if (progress === 100) {

            progressRing.style.background =
                `
                conic-gradient(
                    #8a69ff 0deg,
                    #49a8ff 360deg
                )
                `;

        }
        else {

            progressRing.style.background =
                `
                conic-gradient(
                    #8a69ff 0deg,
                    #49a8ff ${progressDegrees}deg,
                    rgba(255, 255, 255, 0.06)
                    ${progressDegrees}deg,
                    rgba(255, 255, 255, 0.06)
                    360deg
                )
                `;
        }
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
                safePlannerTasks.length
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
            String(timeText)
                .toLowerCase()
                .trim();


        const numberMatch =
            text.match(
                /(\d+)\s*(?:min|minute|minutes|m|hour|hours|h)?/
            );


        if (numberMatch) {

            const value =
                Number(
                    numberMatch[1]
                );


            if (
                text.includes("hour") ||
                text.includes("hours") ||
                text.endsWith("h")
            ) {

                return value * 60;
            }


            if (value > 0) {

                return value;
            }
        }


        if (text.includes("hour")) {
            return 60;
        }


        return 15;
    }


    let plannedMinutes = 0;


    safePlannerTasks.forEach(task => {

        plannedMinutes +=
            getTaskMinutes(
                task.time
            );
    });


    function formatStudyTime(minutes) {

        minutes =
            Math.max(
                0,
                Number(minutes) || 0
            );


        if (minutes < 60) {

            return `${minutes}m`;
        }


        const hours =
            Math.floor(
                minutes / 60
            );

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


    const studyTimeMessage =
        document.getElementById(
            "studyTimeMessage"
        );


    if (dashboardStudyTime) {

        dashboardStudyTime.textContent =
            formatStudyTime(
                plannedMinutes
            );
    }


    if (studyTimeMessage) {

        if (plannedMinutes === 0) {

            studyTimeMessage.textContent =
                "No study time planned yet";

        }
        else {

            studyTimeMessage.textContent =
                "From your planner";
        }
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


        if (
            safePlannerTasks.length === 0
        ) {

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

            safePlannerTasks
                .slice(0, 4)
                .forEach(task => {

                    const taskElement =
                        document.createElement(
                            "div"
                        );


                    const completed =
                        isTaskCompleted(task);


                    taskElement.className =
                        completed
                            ? "dashboard-task completed"
                            : "dashboard-task";


                    taskElement.innerHTML = `

                        <div class="task-check">
                            ${completed ? "✓" : "○"}
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

                        <span class="task-status ${
                            completed
                                ? ""
                                : "current"
                        }">
                            ${
                                completed
                                    ? "Completed"
                                    : "Planned"
                            }
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

        if (
            safePlannerTasks.length > 0
        ) {

            dashboardFocusMinutes.textContent =
                getTaskMinutes(
                    safePlannerTasks[0].time
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
            safeAssignments
                .filter(
                    assignment =>
                        String(
                            assignment.status || ""
                        ).toLowerCase() !==
                            "completed" &&
                        assignment.date
                )
                .sort(
                    (a, b) => {

                        return (
                            new Date(
                                a.date
                            ) -
                            new Date(
                                b.date
                            )
                        );
                    }
                )
                .slice(0, 3);


        dashboardDeadlines.innerHTML =
            "";


        if (
            upcomingAssignments.length === 0
        ) {

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


                    if (
                        Number.isNaN(
                            deadlineDate.getTime()
                        )
                    ) {
                        return;
                    }


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
                        0,
                        0,
                        0,
                        0
                    );


                    deadlineDate.setHours(
                        0,
                        0,
                        0,
                        0
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
                    else if (
                        difference === 0
                    ) {

                        remainingText =
                            "Due today";

                    }
                    else if (
                        difference === 1
                    ) {

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


                    const priorityClass =
                        difference <= 1
                            ? "deadline-priority"
                            : "deadline-normal";


                    deadlineElement.innerHTML = `

                        <div class="deadline-date">

                            <strong>
                                ${deadlineDate.getDate()}
                            </strong>

                            <span>
                                ${deadlineDate
                                    .toLocaleDateString(
                                        "en-US",
                                        {
                                            month: "short"
                                        }
                                    )
                                    .toUpperCase()}
                            </span>

                        </div>

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

                        <span class="${priorityClass}">

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
    // QUIZ / PAPER / DOUBT DATA
    // =========================================

    const viewedPapers =
        Array.isArray(
            pastPapers?.viewedPapers
        )
            ? pastPapers.viewedPapers.length
            : 0;


    const unansweredDoubts =
        safeDoubts.filter(
            doubt => {

                const status =
                    String(
                        doubt.status || ""
                    ).toLowerCase();


                return (
                    status ===
                    "unanswered" ||
                    status ===
                    "open" ||
                    !status
                );
            }
        ).length;


    const totalQuestions =
        safeQuizzes.reduce(
            (total, quiz) => {

                return (
                    total +
                    Number(
                        quiz.questionCount ||
                        (
                            Array.isArray(
                                quiz.questions
                            )
                                ? quiz.questions.length
                                : 0
                        ) ||
                        0
                    )
                );
            },
            0
        );


    // =========================================
    // DASHBOARD DATA SUMMARY
    // =========================================

    const dashboardDataSummary =
        document.getElementById(
            "dashboardDataSummary"
        );


    if (dashboardDataSummary) {

        dashboardDataSummary.innerHTML = `

            <div>

                <strong>
                    ${safeQuizzes.length}
                </strong>

                <span>
                    Quizzes Created
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
                    ${safeDoubts.length}
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
                    Unanswered Doubts
                </span>

            </div>


            <div>

                <strong>
                    ${
                        wellbeing &&
                        wellbeing.silentMode
                            ? "ON"
                            : "OFF"
                    }
                </strong>

                <span>
                    Silent Study
                </span>

            </div>

        `;
    }


    // =========================================
    // RECENT ACTIVITY
    // =========================================
    //
    // The existing dashboard HTML already contains
    // the summary container. We use it safely for
    // real available activity.
    // =========================================

    function getActivityDate(item) {

        if (!item) {
            return null;
        }


        const possibleDates = [
            item.createdAt,
            item.created_at,
            item.updatedAt,
            item.updated_at,
            item.date
        ];


        for (
            const value of possibleDates
        ) {

            if (!value) {
                continue;
            }


            const date =
                new Date(value);


            if (
                !Number.isNaN(
                    date.getTime()
                )
            ) {

                return date;
            }
        }


        return null;
    }


    function createActivityList() {

        const activities = [];


        // Quizzes
        safeQuizzes.forEach(
            quiz => {

                const date =
                    getActivityDate(
                        quiz
                    );


                activities.push({
                    type: "quiz",
                    title: "Quiz created",
                    detail:
                        quiz.title ||
                        "A new quiz was generated.",
                    date
                });
            }
        );


        // Doubts
        safeDoubts.forEach(
            doubt => {

                const date =
                    getActivityDate(
                        doubt
                    );


                activities.push({
                    type: "doubt",
                    title: "Doubt asked",
                    detail:
                        doubt.subject ||
                        doubt.title ||
                        "A doubt was posted.",
                    date
                });
            }
        );


        // Past papers viewed
        if (
            Array.isArray(
                pastPapers?.viewedPapers
            )
        ) {

            pastPapers.viewedPapers
                .forEach(
                    paper => {

                        const date =
                            getActivityDate(
                                paper
                            );


                        activities.push({
                            type: "paper",
                            title: "Past paper opened",
                            detail:
                                typeof paper ===
                                "string"
                                    ? paper
                                    : (
                                        paper.title ||
                                        paper.name ||
                                        "Past paper"
                                    ),
                            date
                        });
                    }
                );
        }


        // Completed assignments
        safeAssignments
            .filter(
                assignment =>
                    String(
                        assignment.status ||
                        ""
                    ).toLowerCase() ===
                    "completed"
            )
            .forEach(
                assignment => {

                    const date =
                        getActivityDate(
                            assignment
                        );


                    activities.push({
                        type: "assignment",
                        title: "Assignment completed",
                        detail:
                            assignment.title ||
                            "Assignment completed.",
                        date
                    });
                }
            );


        // Completed planner tasks
        safePlannerTasks
            .filter(
                task =>
                    isTaskCompleted(task)
            )
            .forEach(
                task => {

                    const date =
                        getActivityDate(
                            task
                        );


                    activities.push({
                        type: "planner",
                        title: "Study task completed",
                        detail:
                            task.title ||
                            "Study task completed.",
                        date
                    });
                }
            );


        // Silent study
        if (
            wellbeing &&
            (
                wellbeing.silentMode === true ||
                wellbeing.silentStudy === true
            )
        ) {

            activities.push({
                type: "wellbeing",
                title: "Silent Study active",
                detail:
                    "Your focus garden is active.",
                date:
                    getActivityDate(
                        wellbeing
                    )
            });
        }


        return activities
            .sort(
                (a, b) => {

                    const aTime =
                        a.date
                            ? a.date.getTime()
                            : 0;

                    const bTime =
                        b.date
                            ? b.date.getTime()
                            : 0;

                    return bTime - aTime;
                }
            )
            .slice(0, 5);
    }


    const recentActivities =
        createActivityList();


    // =========================================
    // ACTIVITY SUMMARY
    // =========================================

    if (dashboardDataSummary) {

        const activityWrapper =
            document.createElement(
                "div"
            );


        activityWrapper.className =
            "dashboard-recent-activity";


        activityWrapper.innerHTML = `

            <div class="recent-activity-header">

                <div>

                    <small>
                        RECENT ACTIVITY
                    </small>

                    <h2>
                        Your latest progress
                    </h2>

                </div>

            </div>

            <div class="recent-activity-list"></div>

        `;


        const activityList =
            activityWrapper.querySelector(
                ".recent-activity-list"
            );


        if (
            recentActivities.length === 0
        ) {

            activityList.innerHTML = `

                <div class="recent-activity-empty">

                    <span>✨</span>

                    <div>

                        <strong>
                            No recent activity yet
                        </strong>

                        <small>
                            Start using Campus Saathi and your activity will appear here.
                        </small>

                    </div>

                </div>

            `;

        }
        else {

            recentActivities
                .forEach(activity => {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "recent-activity-item";


                    let icon = "•";


                    if (
                        activity.type ===
                        "quiz"
                    ) {
                        icon = "🧠";
                    }
                    else if (
                        activity.type ===
                        "doubt"
                    ) {
                        icon = "💬";
                    }
                    else if (
                        activity.type ===
                        "paper"
                    ) {
                        icon = "📄";
                    }
                    else if (
                        activity.type ===
                        "assignment"
                    ) {
                        icon = "✓";
                    }
                    else if (
                        activity.type ===
                        "planner"
                    ) {
                        icon = "📚";
                    }
                    else if (
                        activity.type ===
                        "wellbeing"
                    ) {
                        icon = "🌱";
                    }


                    const timeText =
                        activity.date
                            ? formatRelativeTime(
                                activity.date
                            )
                            : "Recently";


                    item.innerHTML = `

                        <span class="recent-activity-icon">
                            ${icon}
                        </span>

                        <div>

                            <strong>
                                ${escapeHTML(
                                    activity.title
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    activity.detail
                                )}
                            </small>

                        </div>

                        <span class="recent-activity-time">
                            ${escapeHTML(
                                timeText
                            )}
                        </span>

                    `;


                    activityList
                        .appendChild(
                            item
                        );

                });
        }


        dashboardDataSummary
            .appendChild(
                activityWrapper
            );
    }


    // =========================================
    // RELATIVE TIME
    // =========================================

    function formatRelativeTime(date) {

        const now =
            new Date();


        const difference =
            Math.max(
                0,
                now.getTime() -
                date.getTime()
            );


        const minutes =
            Math.floor(
                difference /
                (1000 * 60)
            );


        if (minutes < 1) {
            return "Just now";
        }


        if (minutes < 60) {
            return `${minutes}m ago`;
        }


        const hours =
            Math.floor(
                minutes / 60
            );


        if (hours < 24) {
            return `${hours}h ago`;
        }


        const days =
            Math.floor(
                hours / 24
            );


        if (days < 7) {
            return `${days}d ago`;
        }


        return date.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric"
            }
        );
    }


    // =========================================
    // FOCUS BUTTON
    // =========================================

    const focusButton =
        document.querySelector(
            ".focus-btn"
        );


    if (
        focusButton &&
        safePlannerTasks.length > 0
    ) {

        focusButton.addEventListener(
            "click",
            () => {

                const minutes =
                    getTaskMinutes(
                        safePlannerTasks[0].time
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
    // SECURITY / HTML ESCAPE
    // =========================================

    function escapeHTML(value) {

        return String(value ?? "")

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


    // =========================================
    // CONSOLE INFORMATION
    // =========================================

    console.log(
        "Campus Saathi Dashboard loaded safely."
    );

    console.log(
        "User:",
        userId || "guest"
    );

    console.log(
        "Progress:",
        progress + "%"
    );

    console.log(
        "Planner Tasks:",
        safePlannerTasks.length
    );

    console.log(
        "Completed Planner Tasks:",
        completedPlannerTasks
    );

    console.log(
        "Assignments:",
        safeAssignments.length
    );

    console.log(
        "Projects:",
        safeProjects.length
    );

    console.log(
        "Quizzes:",
        safeQuizzes.length
    );

    console.log(
        "Doubts:",
        safeDoubts.length
    );

});
```
