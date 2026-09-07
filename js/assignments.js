document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       CURRENT USER
    ========================== */

    const userId = localStorage.getItem("userId");

    const assignmentStorageKey = userId
        ? `assignments_${userId}`
        : "assignments_guest";


    /* =========================
       ELEMENTS
    ========================== */

    const modal =
        document.getElementById("assignmentModal");

    const openModal =
        document.getElementById("openAssignmentModal");

    const closeModal =
        document.getElementById("closeAssignmentModal");

    const form =
        document.getElementById("assignmentForm");

    const list =
        document.getElementById("assignmentList");

    const searchInput =
        document.getElementById("searchAssignments");

    const filterButtons =
        document.querySelectorAll(".filter-btn");


    if (
        !modal ||
        !openModal ||
        !closeModal ||
        !form ||
        !list
    ) {
        console.error("Assignment elements not found.");
        return;
    }


    /* =========================
       LOAD ASSIGNMENTS
    ========================== */

    let assignments = [];

    try {

        assignments =
            JSON.parse(
                localStorage.getItem(
                    assignmentStorageKey
                )
            ) || [];

    } catch (error) {

        console.error(
            "Could not load assignments.",
            error
        );

        assignments = [];

    }


    /* =========================
       SAVE ASSIGNMENTS
    ========================== */

    function saveAssignments() {

        localStorage.setItem(
            assignmentStorageKey,
            JSON.stringify(assignments)
        );

    }


    /* =========================
       MODAL
    ========================== */

    openModal.addEventListener("click", () => {

        modal.classList.add("show");

    });


    closeModal.addEventListener("click", () => {

        modal.classList.remove("show");

    });


    modal.addEventListener("click", (event) => {

        if (event.target === modal) {

            modal.classList.remove("show");

        }

    });


    /* =========================
       RENDER ASSIGNMENTS
    ========================== */

    function renderAssignments() {

        list.innerHTML = "";


        assignments.forEach(assignment => {

            const formattedDate =
                new Date(
                    assignment.date
                ).toLocaleDateString(
                    "en-US",
                    {
                        month: "short",
                        day: "2-digit"
                    }
                );


            const card =
                document.createElement("article");

            card.className =
                "assignment-card";


            card.dataset.status =
                assignment.status;


            card.dataset.id =
                assignment.id;


            card.innerHTML = `

                <div class="subject-icon purple">
                    ${assignment.subject
                        .substring(0, 3)
                        .toUpperCase()}
                </div>

                <div class="assignment-info">

                    <strong></strong>

                    <span>
                        ${assignment.subject}
                    </span>

                </div>

                <div class="deadline">

                    <small>
                        DUE
                    </small>

                    <strong>
                        ${formattedDate}
                    </strong>

                    <span>
                        New
                    </span>

                </div>

                <span class="status">
                    ${assignment.status === "completed"
                        ? "Completed"
                        : "Pending"}
                </span>

                <button
                    class="complete-btn ${assignment.status === "completed" ? "checked" : ""}"
                    title="Mark complete"
                >
                    ✓
                </button>

            `;


            card
                .querySelector(
                    ".assignment-info strong"
                )
                .textContent =
                    assignment.title;


            const status =
                card.querySelector(".status");


            if (assignment.status === "completed") {

                status.className =
                    "status completed";

            } else {

                status.className =
                    "status pending";

            }


            list.appendChild(card);

        });


        updateNumbers();

        applyCurrentFilters();

    }


    /* =========================
       ADD ASSIGNMENT
    ========================== */

    form.addEventListener("submit", (event) => {

        event.preventDefault();


        const title =
            document
                .getElementById("assignmentTitle")
                .value
                .trim();


        const subject =
            document
                .getElementById("assignmentSubject")
                .value;


        const date =
            document
                .getElementById("assignmentDate")
                .value;


        if (!title || !date) {

            return;

        }


        const assignment = {

            id: Date.now(),

            title: title,

            subject: subject,

            date: date,

            status: "pending"

        };


        /* =========================
           SAVE FOR CURRENT USER
        ========================== */

        assignments.unshift(
            assignment
        );


        saveAssignments();


        /* =========================
           UPDATE SCREEN
        ========================== */

        renderAssignments();


        form.reset();

        modal.classList.remove("show");

    });


    /* =========================
       COMPLETE ASSIGNMENT
    ========================== */

    list.addEventListener("click", (event) => {

        const button =
            event.target.closest(
                ".complete-btn"
            );


        if (!button) {

            return;

        }


        const card =
            button.closest(
                ".assignment-card"
            );


        if (!card) {

            return;

        }


        const assignmentId =
            Number(card.dataset.id);


        const assignment =
            assignments.find(
                item =>
                    item.id === assignmentId
            );


        if (!assignment) {

            return;

        }


        /* =========================
           TOGGLE STATUS
        ========================== */

        if (
            assignment.status ===
            "completed"
        ) {

            assignment.status =
                "pending";

        } else {

            assignment.status =
                "completed";

        }


        saveAssignments();

        renderAssignments();

    });


    /* =========================
       SEARCH
    ========================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                applyCurrentFilters();

            }
        );

    }


    /* =========================
       FILTER
    ========================== */

    let currentFilter = "all";


    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter;


                applyCurrentFilters();

            }
        );

    });


    /* =========================
       APPLY SEARCH + FILTER
    ========================== */

    function applyCurrentFilters() {

        const query =
            searchInput
                ? searchInput.value
                    .toLowerCase()
                    .trim()
                : "";


        const cards =
            list.querySelectorAll(
                ".assignment-card"
            );


        cards.forEach(card => {

            const text =
                card.textContent
                    .toLowerCase();


            const status =
                card.dataset.status;


            const matchesSearch =
                text.includes(query);


            let matchesFilter = true;


            if (currentFilter !== "all") {

                matchesFilter =
                    status === currentFilter;

            }


            if (
                matchesSearch &&
                matchesFilter
            ) {

                card.style.display = "";

            } else {

                card.style.display = "none";

            }

        });

    }


    /* =========================
       COUNTERS
    ========================== */

    function updateNumbers() {

        const total =
            assignments.length;


        let completed = 0;

        let progress = 0;

        let pending = 0;


        assignments.forEach(
            assignment => {

                if (
                    assignment.status ===
                    "completed"
                ) {

                    completed++;

                }

                else if (
                    assignment.status ===
                    "progress"
                ) {

                    progress++;

                }

                else {

                    pending++;

                }

            }
        );


        const totalElement =
            document.getElementById(
                "totalAssignments"
            );


        const completedElement =
            document.getElementById(
                "completedCount"
            );


        const progressElement =
            document.getElementById(
                "inProgress"
            );


        const dueSoonElement =
            document.getElementById(
                "dueSoon"
            );


        const countElement =
            document.getElementById(
                "assignmentCount"
            );


        if (totalElement) {

            totalElement.textContent =
                total;

        }


        if (completedElement) {

            completedElement.textContent =
                completed;

        }


        if (progressElement) {

            progressElement.textContent =
                progress;

        }


        if (dueSoonElement) {

            dueSoonElement.textContent =
                pending;

        }


        if (countElement) {

            countElement.textContent =
                `${total} assignments`;

        }

    }


    /* =========================
       INITIAL LOAD
    ========================== */

    renderAssignments();

});
