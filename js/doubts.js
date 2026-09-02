document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("doubtModal");
    const openModal = document.getElementById("openModal");
    const closeModal = document.getElementById("closeModal");

    const doubtForm = document.getElementById("doubtForm");
    const doubtList = document.getElementById("doubtList");
    const doubtCount = document.getElementById("doubtCount");

    const searchInput = document.getElementById("searchDoubts");

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
       POST DOUBT
    ========================== */

    doubtForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const question =
            document.getElementById("questionInput")
                .value
                .trim();

        const subject =
            document.getElementById("subjectInput")
                .value;

        if (!question) {
            return;
        }


        const newDoubt =
            document.createElement("article");

        newDoubt.className = "doubt-card";

        newDoubt.dataset.status = "unanswered";

        newDoubt.innerHTML = `

            <div class="doubt-top">

                <div class="anonymous-user">

                    <span>AN</span>

                    <div>

                        <strong>
                            Anonymous Student
                        </strong>

                        <small>
                            ${subject} • just now
                        </small>

                    </div>

                </div>

                <span class="unanswered-badge">
                    Needs help
                </span>

            </div>


            <h3></h3>


            <div class="tags">

                <span>${subject}</span>
                <span>New</span>

            </div>


            <div class="doubt-footer">

                <span>
                    💬 0 answers
                </span>

                <button class="answer-btn">
                    Answer this →
                </button>

            </div>
        `;


        newDoubt
            .querySelector("h3")
            .textContent = question;


        doubtList.prepend(newDoubt);


        updateCount();

        doubtForm.reset();

        modal.classList.remove("show");

    });


    /* =========================
       SEARCH
    ========================== */

    searchInput.addEventListener("input", () => {

        const search =
            searchInput.value
                .toLowerCase()
                .trim();


        const cards =
            document.querySelectorAll(".doubt-card");


        cards.forEach(card => {

            const text =
                card.textContent.toLowerCase();

            card.style.display =
                text.includes(search)
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
                document.querySelectorAll(".doubt-card");


            cards.forEach(card => {

                if (filter === "all") {

                    card.style.display = "";

                } else {

                    card.style.display =
                        card.dataset.status === filter
                            ? ""
                            : "none";

                }

            });

        });

    });


    /* =========================
       COUNT
    ========================== */

    function updateCount() {

        const total =
            doubtList.querySelectorAll(".doubt-card").length;

        doubtCount.textContent =
            `${total} ${total === 1 ? "doubt" : "doubts"}`;

    }

});