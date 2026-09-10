document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       CURRENT USER
    ========================== */

    const userId = localStorage.getItem("userId");

    const quizStorageKey = userId
        ? `userQuizzes_${userId}`
        : "userQuizzes_guest";


    /* =========================
       ELEMENTS
    ========================== */

    const notesInput =
        document.getElementById("notesInput");

    const wordCount =
        document.getElementById("wordCount");

    const clearNotes =
        document.getElementById("clearNotes");

    const generateQuiz =
        document.getElementById("generateQuiz");

    const quizResult =
        document.getElementById("quizResult");

    const difficultyButtons =
        document.querySelectorAll(".difficulty");


    if (
        !notesInput ||
        !wordCount ||
        !clearNotes ||
        !generateQuiz ||
        !quizResult
    ) {
        console.error("Quiz elements not found.");
        return;
    }


    /* =========================
       WORD COUNT
    ========================== */

    function updateWordCount() {

        const text =
            notesInput.value.trim();

        const words =
            text === ""
                ? 0
                : text.split(/\s+/).length;

        wordCount.textContent =
            `${words} ${words === 1 ? "word" : "words"}`;

    }


    notesInput.addEventListener(
        "input",
        updateWordCount
    );


    /* =========================
       CLEAR NOTES
    ========================== */

    clearNotes.addEventListener("click", () => {

        notesInput.value = "";

        updateWordCount();

        notesInput.focus();

    });


    /* =========================
       DIFFICULTY
    ========================== */

    difficultyButtons.forEach(button => {

        button.addEventListener("click", () => {

            difficultyButtons.forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

        });

    });


    /* =========================
       SAVE QUIZ
    ========================== */

    function saveQuiz(quizData) {

        let quizzes = [];

        try {

            quizzes =
                JSON.parse(
                    localStorage.getItem(
                        quizStorageKey
                    )
                ) || [];

        } catch (error) {

            console.error(
                "Could not load quizzes.",
                error
            );

            quizzes = [];

        }


        quizzes.push(quizData);


        localStorage.setItem(
            quizStorageKey,
            JSON.stringify(quizzes)
        );

    }


    /* =========================
       GENERATE QUIZ
    ========================== */

    generateQuiz.addEventListener("click", async () => {

        const notes =
            notesInput.value.trim();


        if (notes === "") {

            notesInput.focus();

            alert(
                "Please paste your notes first."
            );

            return;

        }


        const questionCount =
            Number(
                document.getElementById(
                    "questionCount"
                ).value
            );


        const activeDifficulty =
            document.querySelector(
                ".difficulty.active"
            );


        const difficulty =
            activeDifficulty
                ? activeDifficulty.dataset.level
                : "Easy";


        const quizType =
            document.getElementById(
                "quizType"
            ).value;


        /* =========================
           LOADING
        ========================== */

        generateQuiz.disabled = true;

        generateQuiz.textContent =
            "Generating with AI...";


        quizResult.innerHTML = `
            <div class="quiz-header">
                <div>
                    <h2>Creating your quiz...</h2>
                    <span class="quiz-meta">
                        Gemini AI is reading your notes
                    </span>
                </div>
            </div>
        `;


        try {

            /* =========================
               SEND NOTES TO VERCEL API
            ========================== */

            const response =
                await fetch(
                    "/api/generate-quiz",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            notes: notes,

                            questionCount:
                                questionCount,

                            difficulty:
                                difficulty,

                            quizType:
                                quizType

                        })

                    }
                );


            const data =
                await response.json();


            /* =========================
               ERROR CHECK
            ========================== */

            if (!response.ok) {

                console.error(
                    "API Error:",
                    data
                );

                throw new Error(
                    data.error ||
                    "Could not generate quiz."
                );

            }


            if (
                !data.questions ||
                !Array.isArray(data.questions) ||
                data.questions.length === 0
            ) {

                throw new Error(
                    "AI did not return any questions."
                );

            }


            /* =========================
               SAVE QUIZ
            ========================== */

            const quizData = {

                id: Date.now(),

                notes: notes,

                questionCount:
                    data.questions.length,

                difficulty:
                    difficulty,

                quizType:
                    quizType,

                questions:
                    data.questions,

                createdAt:
                    new Date().toISOString()

            };


            saveQuiz(quizData);


            /* =========================
               DISPLAY QUIZ
            ========================== */

            createQuiz(
                data.questions,
                difficulty,
                quizType
            );


        } catch (error) {

            console.error(
                "Quiz generation error:",
                error
            );


            quizResult.innerHTML = `

                <div class="quiz-header">

                    <div>

                        <h2>
                            Unable to generate quiz
                        </h2>

                        <span class="quiz-meta">
                            ${error.message}
                        </span>

                    </div>

                </div>

            `;

            alert(
                "AI quiz generate nahi ho saka. Please try again."
            );

        } finally {

            generateQuiz.disabled = false;

            generateQuiz.textContent =
                "✦ Generate Quiz";

        }

    });


    /* =========================
       CREATE QUIZ HTML
    ========================== */

    function createQuiz(
        questions,
        difficulty,
        quizType
    ) {

        let html = `

            <div class="quiz-header">

                <div>

                    <h2>
                        AI Practice Quiz
                    </h2>

                    <span class="quiz-meta">
                        ${difficulty} • ${quizType}
                    </span>

                </div>


                <span class="quiz-meta">
                    ${questions.length} questions
                </span>

            </div>

        `;


        questions.forEach((current, i) => {

            html += `

                <div class="question-card">

                    <small>
                        QUESTION ${i + 1}
                    </small>

                    <h3>
                        ${escapeHTML(
                            current.question || ""
                        )}
                    </h3>

            `;


            if (
                current.answers &&
                Array.isArray(current.answers)
            ) {

                current.answers.forEach(answer => {

                    html += `

                        <label class="answer-option">

                            <input
                                type="radio"
                                name="question-${i}"
                            >

                            ${escapeHTML(answer)}

                        </label>

                    `;

                });

            }


            html += `

                </div>

            `;

        });


        quizResult.innerHTML =
            html;


        quizResult.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    /* =========================
       SECURITY
       ESCAPE AI TEXT
    ========================== */

    function escapeHTML(text) {

        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =========================
       INITIAL WORD COUNT
    ========================== */

    updateWordCount();

});
