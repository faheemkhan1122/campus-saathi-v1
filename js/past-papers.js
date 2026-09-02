document.addEventListener("DOMContentLoaded", () => {

    const searchInput =
        document.getElementById("paperSearch");

    const searchBtn =
        document.getElementById("searchBtn");

    const institution =
        document.getElementById("institution");

    const subject =
        document.getElementById("subject");

    const year =
        document.getElementById("year");

    const clearFilters =
        document.getElementById("clearFilters");

    const paperList =
        document.getElementById("paperList");

    const paperCount =
        document.getElementById("paperCount");

    const modal =
        document.getElementById("paperModal");

    const closePaper =
        document.getElementById("closePaper");

    const modalTitle =
        document.getElementById("modalTitle");

    const modalDetails =
        document.getElementById("modalDetails");

    const downloadPaper =
        document.getElementById("downloadPaper");


    /* =========================
       FILTER PAPERS
    ========================== */

    function filterPapers() {

        const query =
            searchInput.value
                .toLowerCase()
                .trim();

        const selectedInstitution =
            institution.value;

        const selectedSubject =
            subject.value;

        const selectedYear =
            year.value;


        const cards =
            paperList.querySelectorAll(".paper-card");

        let visibleCount = 0;


        cards.forEach(card => {

            const text =
                card.textContent.toLowerCase();

            const cardInstitution =
                card.dataset.institution;

            const cardSubject =
                card.dataset.subject;

            const cardYear =
                card.dataset.year;


            const matchesSearch =
                text.includes(query);

            const matchesInstitution =
                selectedInstitution === "all" ||
                cardInstitution === selectedInstitution;

            const matchesSubject =
                selectedSubject === "all" ||
                cardSubject === selectedSubject;

            const matchesYear =
                selectedYear === "all" ||
                cardYear === selectedYear;


            const show =
                matchesSearch &&
                matchesInstitution &&
                matchesSubject &&
                matchesYear;


            card.style.display =
                show ? "" : "none";


            if (show) {
                visibleCount++;
            }

        });


        paperCount.textContent =
            `${visibleCount} ${visibleCount === 1 ? "paper" : "papers"}`;
    }


    searchBtn.addEventListener(
        "click",
        filterPapers
    );


    searchInput.addEventListener(
        "input",
        filterPapers
    );


    institution.addEventListener(
        "change",
        filterPapers
    );


    subject.addEventListener(
        "change",
        filterPapers
    );


    year.addEventListener(
        "change",
        filterPapers
    );


    /* =========================
       CLEAR
    ========================== */

    clearFilters.addEventListener("click", () => {

        searchInput.value = "";

        institution.value = "all";

        subject.value = "all";

        year.value = "all";

        filterPapers();

    });


    /* =========================
       VIEW PAPER
    ========================== */

    paperList.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(".view-paper");

            if (!button) {
                return;
            }


            const card =
                button.closest(".paper-card");


            const title =
                card.querySelector(
                    ".paper-info strong"
                ).textContent;


            const details =
                card.querySelector(
                    ".paper-info span"
                ).textContent
                + " • "
                + card.dataset.year;


            modalTitle.textContent = title;

            modalDetails.textContent = details;


            modal.classList.add("show");

        }
    );


    closePaper.addEventListener(
        "click",
        () => {
            modal.classList.remove("show");
        }
    );


    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {
                modal.classList.remove("show");
            }

        }
    );


    /* =========================
       DOWNLOAD DEMO
    ========================== */

    downloadPaper.addEventListener(
        "click",
        () => {

            alert(
                "Paper download will be connected to the real PDF library in the backend version."
            );

        }
    );

});