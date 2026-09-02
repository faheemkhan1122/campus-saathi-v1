document.addEventListener("DOMContentLoaded", () => {

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


        const formattedDate =
            new Date(date).toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "2-digit"
                }
            );


        const card =
            document.createElement("article");

        card.className = "assignment-card";

        card.dataset.status = "pending";

        card.innerHTML = `

            <div class="subject-icon purple">
                ${subject.substring(0, 3).toUpperCase()}
            </div>

            <div class="assignment-info">

                <strong></strong>

                <span>
                    ${subject}
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

            <span class="status pending">
                Pending
            </span>

            <button class="complete-btn" title="Mark complete">
                ✓
            </button>
        `;


        card
            .querySelector(".assignment-info strong")
            .textContent = title;


        list.prepend(card);

        form.reset();

        modal.classList.remove("show");

        updateNumbers();

    });


    /* =========================
       COMPLETE ASSIGNMENT
    ========================== */

    list.addEventListener("click", (event) => {

        const button =
            event.target.closest(".complete-btn");

        if (!button) {
            return;
        }

        const card =
            button.closest(".assignment-card");

        const status =
            card.querySelector(".status");

        if (card.dataset.status === "completed") {

            card.dataset.status = "pending";

            status.textContent = "Pending";

            status.className = "status pending";

            button.classList.remove("checked");

        } else {

            card.dataset.status = "completed";

            status.textContent = "Completed";

            status.className = "status completed";

            button.classList.add("checked");

        }

        updateNumbers();

    });


    /* =========================
       SEARCH
    ========================== */

    searchInput.addEventListener("input", () => {

        const query =
            searchInput.value
                .toLowerCase()
                .trim();

        const cards =
            list.querySelectorAll(".assignment-card");

        cards.forEach(card => {

            const text =
                card.textContent.toLowerCase();

            card.style.display =
                text.includes(query)
                    ? ""
                    : "none";

        });

    });


    /* =========================
       FILTER
    ========================== */

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            filterButtons.forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            const filter =
                button.dataset.filter;

            const cards =
                list.querySelectorAll(".assignment-card");

            cards.forEach(card => {

                if (filter === "all") {

                    card.style.display = "";

                    return;
                }

                const status =
                    card.dataset.status;

                if (
                    filter === "pending" &&
                    status === "pending"
                ) {
                    card.style.display = "";
                }

                else if (
                    filter === "progress" &&
                    status === "progress"
                ) {
                    card.style.display = "";
                }

                else if (
                    filter === "completed" &&
                    status === "completed"
                ) {
                    card.style.display = "";
                }

                else {
                    card.style.display = "none";
                }

            });

        });

    });


    /* =========================
       COUNTERS
    ========================== */

    function updateNumbers() {

        const cards =
            list.querySelectorAll(".assignment-card");

        let completed = 0;
        let progress = 0;
        let pending = 0;

        cards.forEach(card => {

            const status =
                card.dataset.status;

            if (status === "completed") {
                completed++;
            }

            else if (status === "progress") {
                progress++;
            }

            else {
                pending++;
            }

        });


        document.getElementById(
            "totalAssignments"
        ).textContent = cards.length;


        document.getElementById(
            "completedCount"
        ).textContent = completed;


        document.getElementById(
            "inProgress"
        ).textContent = progress;


        document.getElementById(
            "dueSoon"
        ).textContent = pending;


        document.getElementById(
            "assignmentCount"
        ).textContent =
            `${cards.length} assignments`;

    }

});