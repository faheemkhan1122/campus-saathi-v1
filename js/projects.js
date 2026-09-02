document.addEventListener("DOMContentLoaded", () => {

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
            taskModal.classList.add("show");
        }
    );


    closeTaskModal.addEventListener(
        "click",
        () => {
            taskModal.classList.remove("show");
        }
    );


    /* CLOSE BY BACKDROP */

    [projectModal, taskModal].forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if (event.target === modal) {
                    modal.classList.remove("show");
                }

            }
        );

    });


    /* =========================
       CREATE PROJECT
    ========================== */

    projectForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const projectName =
                document
                    .getElementById("projectName")
                    .value
                    .trim();


            const subject =
                document
                    .getElementById("projectSubject")
                    .value;


            const deadline =
                document
                    .getElementById("projectDeadline")
                    .value;


            if (!projectName || !deadline) {
                return;
            }


            const project =
                document.createElement("article");


            project.className =
                "project-card";


            project.innerHTML = `

                <div class="project-top">

                    <div class="project-icon purple">
                        ${subject.substring(0, 3).toUpperCase()}
                    </div>

                    <button class="more-btn">
                        •••
                    </button>

                </div>


                <div class="project-title-row">

                    <div>

                        <small>
                            ${subject.toUpperCase()}
                        </small>

                        <h2></h2>

                    </div>

                    <span class="project-percent">
                        0%
                    </span>

                </div>


                <p class="project-description">
                    New group project. Start by adding tasks and teammates.
                </p>


                <div class="project-progress">

                    <div>

                        <span>Progress</span>

                        <strong>
                            0%
                        </strong>

                    </div>

                    <div class="progress-bar">

                        <span style="width:0%"></span>

                    </div>

                </div>


                <div class="project-meta">

                    <div class="members">

                        <span>LF</span>

                    </div>

                    <small>
                        Due ${deadline}
                    </small>

                </div>


                <div class="task-summary">

                    <span>
                        ✓ 0 completed
                    </span>

                    <span>
                        ○ 0 remaining
                    </span>

                </div>
            `;


            project
                .querySelector(".project-title-row h2")
                .textContent =
                projectName;


            projectGrid.prepend(project);


            projectForm.reset();

            projectModal.classList.remove("show");


            updateProjectCount();

        }
    );


    /* =========================
       ADD TASK
    ========================== */

    taskForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const taskName =
                document
                    .getElementById("taskName")
                    .value
                    .trim();


            const member =
                document
                    .getElementById("taskMember")
                    .value;


            if (!taskName) {
                return;
            }


            const task =
                document.createElement("div");


            task.className =
                "project-task";


            task.innerHTML = `

                <button class="task-check">
                    +
                </button>

                <div>

                    <strong></strong>

                    <small>
                        ${member} • New task
                    </small>

                </div>

                <span class="pending-label">
                    Pending
                </span>

            `;


            task.querySelector("strong")
                .textContent = taskName;


            taskList.appendChild(task);


            taskForm.reset();

            taskModal.classList.remove("show");

        }
    );


    /* =========================
       COMPLETE TASK
    ========================== */

    taskList.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(".task-check");


            if (!button) {
                return;
            }


            const task =
                button.closest(".project-task");


            const status =
                task.querySelector("span");


            task.classList.toggle("completed");


            if (
                task.classList.contains("completed")
            ) {

                button.textContent = "✓";

                status.textContent = "Done";

                status.className =
                    "done-label";

            } else {

                button.textContent = "+";

                status.textContent = "Pending";

                status.className =
                    "pending-label";

            }

        }
    );


    /* =========================
       PROJECT COUNT
    ========================== */

    function updateProjectCount() {

        const count =
            projectGrid.querySelectorAll(
                ".project-card"
            ).length;


        document.getElementById(
            "activeProjects"
        ).textContent = count;

    }

});