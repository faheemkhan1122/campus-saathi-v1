document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       CURRENT USER
    ========================== */

    const userId = localStorage.getItem("userId");

    const doubtStorageKey = userId
        ? `doubts_${userId}`
        : "doubts_guest";


    /* =========================
       ELEMENTS
    ========================== */

    const modal =
        document.getElementById("doubtModal");

    const openModal =
        document.getElementById("openModal");

    const closeModal =
        document.getElementById("closeModal");

    const doubtForm =
        document.getElementById("doubtForm");

    const doubtList =
        document.getElementById("doubtList");

    const doubtCount =
        document.getElementById("doubtCount");

    const searchInput =
        document.getElementById("searchDoubts");

    const filterButtons =
        document.querySelectorAll(".filter-btn");


    if (
        !modal ||
        !openModal ||
        !closeModal ||
        !doubtForm ||
        !doubtList ||
        !doubtCount
    ) {
        console.error("Doubt elements not found.");
        return;
    }


    /* =========================
       LOAD USER DOUBTS
    ========================== */

    let doubts = [];

    try {

        doubts =
            JSON.parse(
                localStorage.getItem(
                    doubtStorageKey
                )
            ) || [];

    } catch (error) {

        console.error(
            "Could not load doubts.",
            error
        );

        doubts = [];

    }


    /* =========================
       SAVE USER DOUBTS
    ========================== */

    function saveDoubts() {

        localStorage.setItem(
            doubtStorageKey,
            JSON.stringify(doubts)
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
       RENDER DOUBTS
    ========================== */

    function renderDoubts() {

        doubtList.innerHTML = "";


        doubts.forEach(doubt => {

            const newDoubt =
                document.createElement("article");


            newDoubt.className =
                "doubt-card";


            newDoubt.dataset.status =
                doubt.status;


            newDoubt.dataset.id =
                doubt.id;


            newDoubt.innerHTML = `

                <div class="doubt-top">

                    <div class="anonymous-user">

                        <span>AN</span>

                        <div>

                            <strong>
                                Anonymous Student
                            </strong>

                            <small></small>

                        </div>

                    </div>


                    <span class="unanswered-badge">
                        Needs help
                    </span>

                </div>


                <h3></h3>


                <div class="tags">

                    <span></span>

                    <span>New</span>

                </div>


                <div class="doubt-footer">

                    <span>
                        💬 0 answers
                    </span>

                    <button
                        class="answer-btn"
                        type="button"
                    >
                        Answer this →
                    </button>

                </div>

            `;


            /* =========================
               QUESTION
            ========================== */

            newDoubt
                .querySelector("h3")
                .textContent =
                    doubt.question;


            /* =========================
               SUBJECT
            ========================== */

            newDoubt
                .querySelector(
                    ".anonymous-user small"
                )
                .textContent =
                    `${doubt.subject} • ${doubt.time}`;


            newDoubt
                .querySelector(
                    ".tags span"
                )
                .textContent =
                    doubt.subject;


            doubtList.appendChild(
                newDoubt
            );

        });


        updateCount();

        applyFilters();

    }


    /* =========================
       POST DOUBT
    ========================== */

    doubtForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const question =
                document
                    .getElementById(
                        "questionInput"
                    )
                    .value
                    .trim();


            const subject =
                document
                    .getElementById(
                        "subjectInput"
                    )
                    .value;


            if (!question) {

                return;

            }


            /* =========================
               CREATE DOUBT
            ========================== */

            const newDoubt = {

                id: Date.now(),

                question: question,

                subject: subject,

                status: "unanswered",

                time: "just now"

            };


            /* =========================
               SAVE FOR CURRENT USER
            ========================== */

            doubts.unshift(
                newDoubt
            );


            saveDoubts();


            /* =========================
               UPDATE SCREEN
            ========================== */

            renderDoubts();


            doubtForm.reset();

            modal.classList.remove(
                "show"
            );

        }
    );


    /* =========================
       SEARCH
    ========================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                applyFilters();

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


                applyFilters();

            }
        );

    });


    /* =========================
       SEARCH + FILTER
    ========================== */

    function applyFilters() {

        const search =
            searchInput
                ? searchInput.value
                    .toLowerCase()
                    .trim()
                : "";


        const cards =
            doubtList.querySelectorAll(
                ".doubt-card"
            );


        cards.forEach(card => {

            const text =
                card.textContent
                    .toLowerCase();


            const status =
                card.dataset.status;


            const matchesSearch =
                text.includes(search);


            let matchesFilter = true;


            if (
                currentFilter !== "all"
            ) {

                matchesFilter =
                    status === currentFilter;

            }


            card.style.display =
                matchesSearch &&
                matchesFilter
                    ? ""
                    : "none";

        });

    }


    /* =========================
       COUNT
    ========================== */

    function updateCount() {

        const total =
            doubts.length;


        doubtCount.textContent =
            `${total} ${total === 1
                ? "doubt"
                : "doubts"}`;

    }


    /* =========================
       INITIAL LOAD
    ========================== */

    renderDoubts();

});
