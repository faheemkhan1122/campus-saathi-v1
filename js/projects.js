document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       CURRENT USER
    ========================== */

    const userId = localStorage.getItem("userId");

    const projectStorageKey = userId
        ? `projects_${userId}`
        : "projects_guest";


    /* =========================
       ELEMENTS
    ========================== */

    const projectModal =
        document.getElementById("projectModal");

    const taskModal =
        document.getElementById("taskModal");

    const openProjectModal =
        document.getElementById("openProjectModal");

    const closeProjectModal =
        document.getElementById("closeProjectModal");

    const addTaskBtn =
        document.getElementById("addTaskBtn");

    const closeTaskModal =
        document.getElementById("closeTaskModal");

    const projectForm =
        document.getElementById("projectForm");

    const taskForm =
        document.getElementById("taskForm");

    const projectGrid =
        document.getElementById("projectGrid");

    const taskList =
        document.getElementById("taskList");


    if (
        !projectModal ||
        !taskModal ||
        !openProjectModal ||
        !closeProjectModal ||
        !addTaskBtn ||
        !closeTaskModal ||
        !projectForm ||
        !taskForm ||
        !projectGrid ||
        !taskList
    ) {
        console.error("Project elements not found.");
        return;
    }


    /* =========================
       LOAD USER PROJECTS
    ========================== */

    let projects = [];

    try {

        projects =
            JSON.parse(
                localStorage.getItem(
                    projectStorageKey
                )
            ) || [];

    } catch (error) {

        console.error(
            "Could not load projects.",
            error
        );

        projects = [];

    }


    /* =========================
       CURRENT PROJECT
    ========================== */

    let currentProjectId = null;


    /* =========================
       SAVE PROJECTS
    ========================== */

    function saveProjects() {

        localStorage.setItem(
            projectStorageKey,
            JSON.stringify(projects)
        );

    }


    /* =========================
       PROJECT MODAL
    ========================== */

    openProjectModal.addEventListener(
        "click",
        () => {

            projectModal.classList.add("show");

        }
    );


    closeProjectModal.addEventListener(
        "click",
        () => {

            projectModal.classList.remove("show");

        }
    );


    /* =========================
       TASK MODAL
    ========================== */

    addTaskBtn.addEventListener(
        "click",
        () => {

            if (!currentProjectId) {

                alert(
                    "Please create a project first."
                );

                return;

            }

            taskModal.classList.add("show");

        }
    );


    closeTaskModal.addEventListener(
        "click",
        () => {

            taskModal.classList.remove("show");

        }
    );


    /* =========================
       CLOSE BY BACKDROP
    ========================== */

    [projectModal, taskModal].forEach(
        modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        modal.classList.remove(
                            "show"
                        );

                    }

                }
            );

        }
    );


    /* =========================
       RENDER PROJECTS
    ========================== */

    function renderProjects() {

        projectGrid.innerHTML = "";


        projects.forEach(project => {

            const completedTasks =
                project.tasks.filter(
                    task => task.completed
                ).length;


            const totalTasks =
                project.tasks.length;


            const remainingTasks =
                totalTasks - completedTasks;


            const progress =
                totalTasks === 0
                    ? 0
                    : Math.round(
                        (completedTasks /
                            totalTasks) * 100
                    );


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "project-card";


            card.dataset.id =
                project.id;


            card.innerHTML = `

                <div class="project-top">

                    <div class="project-icon purple">
                        ${project.subject
                            .substring(0, 3)
                            .toUpperCase()}
                    </div>

                    <button
                        class="more-btn"
                        type="button"
                    >
                        •••
                    </button>

                </div>


                <div class="project-title-row">

                    <div>

                        <small>
                            ${project.subject.toUpperCase()}
                        </small>

                        <h2></h2>

                    </div>

                    <span class="project-percent">
                        ${progress}%
                    </span>

                </div>


                <p class="project-description">
                    New group project. Start by adding tasks and teammates.
                </p>


                <div class="project-progress">

                    <div>

                        <span>Progress</span>

                        <strong>
                            ${progress}%
                        </strong>

                    </div>


                    <div class="progress-bar">

                        <span
                            style="width:${progress}%"
                        ></span>

                    </div>

                </div>


                <div class="project-meta">

                    <div class="members">

                        <span>
                            LF
                        </span>

                    </div>

                    <small>
                        Due ${project.deadline}
                    </small>

                </div>


                <div class="task-summary">

                    <span>
                        ✓ ${completedTasks} completed
                    </span>

                    <span>
                        ○ ${remainingTasks} remaining
                    </span>

                </div>

            `;


            card
                .querySelector(
                    ".project-title-row h2"
                )
                .textContent =
                    project.name;


            projectGrid.appendChild(card);

        });


        updateProjectCount();

        renderTasks();

    }


    /* =========================
       CREATE PROJECT
    ========================== */

    projectForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const projectName =
                document
                    .getElementById(
                        "projectName"
                    )
                    .value
                    .trim();


            const subject =
                document
                    .getElementById(
                        "projectSubject"
                    )
                    .value;


            const deadline =
                document
                    .getElementById(
                        "projectDeadline"
                    )
                    .value;


            if (
                !projectName ||
                !deadline
            ) {

                return;

            }


            const project = {

                id: Date.now(),

                name: projectName,

                subject: subject,

                deadline: deadline,

                tasks: []

            };


            /* =========================
               SAVE FOR CURRENT USER
            ========================== */

            projects.unshift(
                project
            );


            currentProjectId =
                project.id;


            saveProjects();


            renderProjects();


            projectForm.reset();

            projectModal.classList.remove(
                "show"
            );

        }
    );


    /* =========================
       SELECT PROJECT
    ========================== */

    projectGrid.addEventListener(
        "click",
        event => {

            const card =
                event.target.closest(
                    ".project-card"
                );


            if (!card) {
                return;
            }


            const projectId =
                Number(card.dataset.id);


            currentProjectId =
                projectId;


            renderTasks();

        }
    );


    /* =========================
       ADD TASK
    ========================== */

    taskForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            if (!currentProjectId) {

                alert(
                    "Please select a project first."
                );

                return;

            }


            const taskName =
                document
                    .getElementById(
                        "taskName"
                    )
                    .value
                    .trim();


            const member =
                document
                    .getElementById(
                        "taskMember"
                    )
                    .value;


            if (!taskName) {

                return;

            }


            const project =
                projects.find(
                    item =>
                        item.id ===
                        currentProjectId
                );


            if (!project) {

                return;

            }


            const task = {

                id: Date.now(),

                name: taskName,

                member: member,

                completed: false

            };


            project.tasks.push(task);


            saveProjects();


            renderProjects();


            taskForm.reset();

            taskModal.classList.remove(
                "show"
            );

        }
    );


    /* =========================
       RENDER TASKS
    ========================== */

    function renderTasks() {

        taskList.innerHTML = "";


        if (!currentProjectId) {

            return;

        }


        const project =
            projects.find(
                item =>
                    item.id ===
                    currentProjectId
            );


        if (!project) {

            return;

        }


        project.tasks.forEach(task => {

            const taskElement =
                document.createElement(
                    "div"
                );


            taskElement.className =
                "project-task";


            if (task.completed) {

                taskElement.classList.add(
                    "completed"
                );

            }


            taskElement.dataset.id =
                task.id;


            taskElement.innerHTML = `

                <button
                    class="task-check"
                    type="button"
                >
                    ${task.completed
                        ? "✓"
                        : "+"}
                </button>


                <div>

                    <strong></strong>

                    <small>
                        ${task.member} • New task
                    </small>

                </div>


                <span class="${
                    task.completed
                        ? "done-label"
                        : "pending-label"
                }">

                    ${
                        task.completed
                            ? "Done"
                            : "Pending"
                    }

                </span>

            `;


            taskElement
                .querySelector(
                    "strong"
                )
                .textContent =
                    task.name;


            taskList.appendChild(
                taskElement
            );

        });

    }


    /* =========================
       COMPLETE TASK
    ========================== */

    taskList.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".task-check"
                );


            if (!button) {

                return;

            }


            const taskElement =
                button.closest(
                    ".project-task"
                );


            if (!taskElement) {

                return;

            }


            const taskId =
                Number(
                    taskElement.dataset.id
                );


            const project =
                projects.find(
                    item =>
                        item.id ===
                        currentProjectId
                );


            if (!project) {

                return;

            }


            const task =
                project.tasks.find(
                    item =>
                        item.id ===
                        taskId
                );


            if (!task) {

                return;

            }


            task.completed =
                !task.completed;


            saveProjects();


            renderProjects();

        }
    );


    /* =========================
       PROJECT COUNT
    ========================== */

    function updateProjectCount() {

        const count =
            projects.length;


        const activeProjects =
            document.getElementById(
                "activeProjects"
            );


        if (activeProjects) {

            activeProjects.textContent =
                count;

        }

    }


    /* =========================
       INITIAL LOAD
    ========================== */

    if (projects.length > 0) {

        currentProjectId =
            projects[0].id;

    }


    renderProjects();

});
