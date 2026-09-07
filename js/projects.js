document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       CURRENT USER
    ========================== */

    const userId =
        localStorage.getItem("userId");

    const savedUserName =
        localStorage.getItem("userName") ||
        "Student";

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

    const memberModal =
        document.getElementById("memberModal");

    const openProjectModal =
        document.getElementById("openProjectModal");

    const closeProjectModal =
        document.getElementById("closeProjectModal");

    const addTaskBtn =
        document.getElementById("addTaskBtn");

    const closeTaskModal =
        document.getElementById("closeTaskModal");

    const inviteMemberBtn =
        document.getElementById("inviteMemberBtn");

    const closeMemberModal =
        document.getElementById("closeMemberModal");

    const projectForm =
        document.getElementById("projectForm");

    const taskForm =
        document.getElementById("taskForm");

    const memberForm =
        document.getElementById("memberForm");

    const projectGrid =
        document.getElementById("projectGrid");

    const taskList =
        document.getElementById("taskList");

    const memberList =
        document.getElementById("memberList");

    const taskMember =
        document.getElementById("taskMember");

    const selectedProjectName =
        document.getElementById(
            "selectedProjectName"
        );

    const memberCount =
        document.getElementById(
            "memberCount"
        );


    if (
        !projectModal ||
        !taskModal ||
        !memberModal ||
        !openProjectModal ||
        !closeProjectModal ||
        !addTaskBtn ||
        !closeTaskModal ||
        !inviteMemberBtn ||
        !closeMemberModal ||
        !projectForm ||
        !taskForm ||
        !memberForm ||
        !projectGrid ||
        !taskList ||
        !memberList ||
        !taskMember
    ) {

        console.error(
            "Project elements not found."
        );

        return;

    }


    /* =========================
       LOAD PROJECTS
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
       FIX OLD PROJECT DATA
    ========================== */

    projects.forEach(project => {

        if (!Array.isArray(project.members)) {

            project.members = [

                {
                    id: "owner",
                    name: savedUserName,
                    role: "Project Owner",
                    owner: true
                }

            ];

        }

        if (!Array.isArray(project.tasks)) {

            project.tasks = [];

        }

    });


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
       GET INITIALS
    ========================== */

    function getInitials(name) {

        if (!name) {
            return "ST";
        }

        return name
            .trim()
            .split(/\s+/)
            .map(word =>
                word.charAt(0)
            )
            .join("")
            .substring(0, 2)
            .toUpperCase();

    }


    /* =========================
       OPEN PROJECT MODAL
    ========================== */

    openProjectModal.addEventListener(
        "click",
        () => {

            projectModal.classList.add(
                "show"
            );

        }
    );


    /* =========================
       CLOSE PROJECT MODAL
    ========================== */

    closeProjectModal.addEventListener(
        "click",
        () => {

            projectModal.classList.remove(
                "show"
            );

        }
    );


    /* =========================
       ADD TASK MODAL
    ========================== */

    addTaskBtn.addEventListener(
        "click",
        () => {

            if (!currentProjectId) {

                alert(
                    "Please create or select a project first."
                );

                return;

            }

            populateTaskMembers();

            taskModal.classList.add(
                "show"
            );

        }
    );


    /* =========================
       CLOSE TASK MODAL
    ========================== */

    closeTaskModal.addEventListener(
        "click",
        () => {

            taskModal.classList.remove(
                "show"
            );

        }
    );


    /* =========================
       INVITE MEMBER MODAL
    ========================== */

    inviteMemberBtn.addEventListener(
        "click",
        () => {

            if (!currentProjectId) {

                alert(
                    "Please create or select a project first."
                );

                return;

            }

            memberModal.classList.add(
                "show"
            );

        }
    );


    /* =========================
       CLOSE MEMBER MODAL
    ========================== */

    closeMemberModal.addEventListener(
        "click",
        () => {

            memberModal.classList.remove(
                "show"
            );

        }
    );


    /* =========================
       CLOSE MODALS BY BACKDROP
    ========================== */

    [
        projectModal,
        taskModal,
        memberModal
    ].forEach(modal => {

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

    });


    /* =========================
       RENDER PROJECTS
    ========================== */

    function renderProjects() {

        projectGrid.innerHTML = "";


        projects.forEach(project => {

            const completedTasks =
                project.tasks.filter(
                    task =>
                        task.completed
                ).length;


            const totalTasks =
                project.tasks.length;


            const remainingTasks =
                totalTasks -
                completedTasks;


            const progress =
                totalTasks === 0
                    ? 0
                    : Math.round(
                        (
                            completedTasks /
                            totalTasks
                        ) * 100
                    );


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "project-card";


            card.dataset.id =
                project.id;


            const members =
                project.members || [];


            const visibleMembers =
                members.slice(0, 4);


            const memberHTML =
                visibleMembers
                    .map(
                        member =>
                            `<span title="${member.name}">
                                ${getInitials(member.name)}
                            </span>`
                    )
                    .join("");


            const extraMembers =
                members.length > 4
                    ? `<span>+${members.length - 4}</span>`
                    : "";


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

                        <h2>
                            ${project.name}
                        </h2>

                    </div>

                    <span class="project-percent">
                        ${progress}%
                    </span>

                </div>


                <p class="project-description">
                    Group project. Start by adding tasks and teammates.
                </p>


                <div class="project-progress">

                    <div>

                        <span>
                            Progress
                        </span>

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

                        ${memberHTML}

                        ${extraMembers}

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


            projectGrid.appendChild(
                card
            );

        });


        updateProjectSummary();

        renderTasks();

        renderMembers();

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

                name:
                    projectName,

                subject:
                    subject,

                deadline:
                    deadline,

                members: [

                    {
                        id:
                            "owner",

                        name:
                            savedUserName,

                        role:
                            "Project Owner",

                        owner:
                            true

                    }

                ],

                tasks: []

            };


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
                Number(
                    card.dataset.id
                );


            currentProjectId =
                projectId;


            renderTasks();

            renderMembers();

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

                id:
                    Date.now(),

                name:
                    taskName,

                member:
                    member,

                completed:
                    false

            };


            project.tasks.push(
                task
            );


            saveProjects();


            renderProjects();


            taskForm.reset();


            taskModal.classList.remove(
                "show"
            );

        }
    );


    /* =========================
       POPULATE TASK MEMBERS
    ========================== */

    function populateTaskMembers() {

        taskMember.innerHTML = "";


        const project =
            projects.find(
                item =>
                    item.id ===
                    currentProjectId
            );


        if (
            !project ||
            !project.members ||
            project.members.length === 0
        ) {

            const option =
                document.createElement(
                    "option"
                );

            option.textContent =
                "No members yet";

            option.value = "";

            taskMember.appendChild(
                option
            );

            return;

        }


        project.members.forEach(
            member => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    member.name;

                option.textContent =
                    member.name;

                taskMember.appendChild(
                    option
                );

            }
        );

    }


    /* =========================
       RENDER TASKS
    ========================== */

    function renderTasks() {

        taskList.innerHTML = "";


        if (!currentProjectId) {

            if (selectedProjectName) {

                selectedProjectName.textContent =
                    "No project selected";

            }

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


        if (selectedProjectName) {

            selectedProjectName.textContent =
                project.name;

        }


        if (
            project.tasks.length === 0
        ) {

            taskList.innerHTML = `

                <div class="project-task">

                    <div>

                        <strong>
                            No tasks yet
                        </strong>

                        <small>
                            Click "+ Add task" to create the first task.
                        </small>

                    </div>

                </div>

            `;

            return;

        }


        project.tasks.forEach(
            task => {

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
                            ${task.member} • Team task
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

            }
        );

    }


    /* =========================
       RENDER MEMBERS
    ========================== */

    function renderMembers() {

        memberList.innerHTML = "";


        if (!currentProjectId) {

            if (memberCount) {
                memberCount.textContent =
                    "0 people";
            }

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


        const members =
            project.members || [];


        if (memberCount) {

            memberCount.textContent =
                `${members.length} ${
                    members.length === 1
                        ? "person"
                        : "people"
                }`;

        }


        members.forEach(
            (member, index) => {

                const memberElement =
                    document.createElement(
                        "div"
                    );


                memberElement.className =
                    "member-card";


                const colors = [
                    "purple",
                    "blue",
                    "green",
                    "orange"
                ];


                const color =
                    colors[
                        index %
                        colors.length
                    ];


                const removeButton =
                    member.owner
                        ? ""
                        : `
                            <button
                                type="button"
                                class="remove-member"
                                data-member-id="${member.id}"
                                title="Remove member"
                            >
                                ×
                            </button>
                        `;


                memberElement.innerHTML = `

                    <div
                        class="member-avatar ${color}"
                    >
                        ${getInitials(
                            member.name
                        )}
                    </div>


                    <div>

                        <strong>
                            ${member.name}
                        </strong>

                        <small>
                            ${member.role}
                        </small>

                    </div>


                    <span>
                        ${
                            member.owner
                                ? "You"
                                : "Member"
                        }
                    </span>

                    ${removeButton}

                `;


                memberList.appendChild(
                    memberElement
                );

            }
        );

    }


    /* =========================
       ADD MEMBER
    ========================== */

    memberForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            if (!currentProjectId) {

                return;

            }


            const memberName =
                document
                    .getElementById(
                        "memberName"
                    )
                    .value
                    .trim();


            const memberRole =
                document
                    .getElementById(
                        "memberRole"
                    )
                    .value
                    .trim();


            if (
                !memberName ||
                !memberRole
            ) {

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


            if (!Array.isArray(
                project.members
            )) {

                project.members = [];

            }


            const alreadyExists =
                project.members.some(
                    member =>
                        member.name
                            .toLowerCase() ===
                        memberName
                            .toLowerCase()
                );


            if (alreadyExists) {

                alert(
                    "This member is already added."
                );

                return;

            }


            project.members.push({

                id:
                    `member_${Date.now()}`,

                name:
                    memberName,

                role:
                    memberRole,

                owner:
                    false

            });


            saveProjects();


            renderProjects();


            memberForm.reset();


            memberModal.classList.remove(
                "show"
            );

        }
    );


    /* =========================
       REMOVE MEMBER
    ========================== */

    memberList.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".remove-member"
                );


            if (!button) {

                return;

            }


            const memberId =
                button.dataset.memberId;


            const project =
                projects.find(
                    item =>
                        item.id ===
                        currentProjectId
                );


            if (!project) {

                return;

            }


            project.members =
                project.members.filter(
                    member =>
                        member.id !==
                        memberId
                );


            saveProjects();


            renderProjects();

        }
    );


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
       PROJECT SUMMARY
    ========================== */

    function updateProjectSummary() {

        const activeProjects =
            document.getElementById(
                "activeProjects"
            );


        const openTasks =
            document.getElementById(
                "openTasks"
            );


        const completedTasks =
            document.getElementById(
                "completedTasks"
            );


        const teamProgress =
            document.getElementById(
                "teamProgress"
            );


        let totalTasks = 0;

        let completedTotal = 0;


        projects.forEach(
            project => {

                totalTasks +=
                    project.tasks.length;


                completedTotal +=
                    project.tasks.filter(
                        task =>
                            task.completed
                    ).length;

            }
        );


        const openTotal =
            totalTasks -
            completedTotal;


        const progress =
            totalTasks === 0
                ? 0
                : Math.round(
                    (
                        completedTotal /
                        totalTasks
                    ) * 100
                );


        if (activeProjects) {

            activeProjects.textContent =
                projects.length;

        }


        if (openTasks) {

            openTasks.textContent =
                openTotal;

        }


        if (completedTasks) {

            completedTasks.textContent =
                completedTotal;

        }


        if (teamProgress) {

            teamProgress.textContent =
                `${progress}%`;

        }

    }


    /* =========================
       INITIAL LOAD
    ========================== */

    if (projects.length > 0) {

        currentProjectId =
            projects[0].id;

    }


    saveProjects();

    renderProjects();

});
