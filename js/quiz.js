```javascript
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
                            ${escapeHTML(error.message)}
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
                        ${escapeHTML(difficulty)} • ${escapeHTML(quizType)}
                    </span>

                </div>

                <span class="quiz-meta">
                    ${questions.length} questions
                </span>

            </div>

        `;


        questions.forEach((current, i) => {

            html += `

                <div
                    class="question-card"
                    data-question-index="${i}"
                >

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

                current.answers.forEach((answer, answerIndex) => {

                    html += `

                        <label
                            class="answer-option"
                            data-answer-index="${answerIndex}"
                            style="display:block; cursor:pointer;"
                        >

                            <input
                                type="radio"
                                name="question-${i}"
                                value="${answerIndex}"
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


        /* =========================
           SUBMIT BUTTON
        ========================== */

        html += `

            <div
                style="
                    margin-top:25px;
                    text-align:center;
                "
            >

                <button
                    type="button"
                    id="submitQuiz"
                    style="
                        padding:12px 28px;
                        border:none;
                        border-radius:10px;
                        cursor:pointer;
                        font-weight:600;
                        font-size:15px;
                    "
                >
                    ✓ Submit Quiz
                </button>

            </div>

            <div
                id="quizScore"
                style="
                    display:none;
                    margin-top:20px;
                    padding:20px;
                    border-radius:12px;
                    text-align:center;
                "
            ></div>

        `;


        quizResult.innerHTML =
            html;


        /* =========================
           SUBMIT EVENT
        ========================== */

        const submitQuiz =
            document.getElementById(
                "submitQuiz"
            );


        submitQuiz.addEventListener(
            "click",
            () => {

                checkQuiz(
                    questions
                );

            }
        );


        quizResult.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    /* =========================
       CHECK QUIZ
    ========================== */

    function checkQuiz(questions) {

        let score = 0;

        let answered = 0;


        questions.forEach((question, index) => {

            const card =
                quizResult.querySelector(
                    `[data-question-index="${index}"]`
                );


            if (!card) {
                return;
            }


            const options =
                card.querySelectorAll(
                    ".answer-option"
                );


            const selected =
                card.querySelector(
                    `input[name="question-${index}"]:checked`
                );


            /* =========================
               FIND CORRECT ANSWER
            ========================== */

            const correctAnswer =
                String(
                    question.correctAnswer || ""
                ).trim();


            /* =========================
               SHOW CORRECT ANSWER
            ========================== */

            options.forEach((option, optionIndex) => {

                const input =
                    option.querySelector("input");


                const answerText =
                    option.textContent.trim();


                option.style.background = "";
                option.style.border = "";


                if (
                    answerText.toLowerCase() ===
                    correctAnswer.toLowerCase()
                ) {

                    option.style.background =
                        "rgba(34, 197, 94, 0.15)";

                    option.style.border =
                        "2px solid #22c55e";

                }


                /* =========================
                   WRONG SELECTED ANSWER
                ========================== */

                if (
                    selected &&
                    input &&
                    input.checked &&
                    optionIndex ===
                    Number(input.value) &&
                    answerText.toLowerCase() !==
                    correctAnswer.toLowerCase()
                ) {

                    option.style.background =
                        "rgba(239, 68, 68, 0.15)";

                    option.style.border =
                        "2px solid #ef4444";

                }

            });


            /* =========================
               CHECK SCORE
            ========================== */

            if (selected) {

                answered++;

                const selectedOption =
                    selected.closest(
                        ".answer-option"
                    );


                const selectedText =
                    selectedOption
                        ? selectedOption.textContent.trim()
                        : "";


                if (
                    selectedText.toLowerCase() ===
                    correctAnswer.toLowerCase()
                ) {

                    score++;

                }

            }

        });


        /* =========================
           SCORE
        ========================== */

        const total =
            questions.length;


        const percentage =
            Math.round(
                (score / total) * 100
            );


        let message =
            "Keep practicing! 💪";


        if (percentage === 100) {

            message =
                "Perfect score! 🎉";

        } else if (percentage >= 80) {

            message =
                "Excellent work! 🔥";

        } else if (percentage >= 60) {

            message =
                "Good job! 👍";

        }


        const scoreBox =
            document.getElementById(
                "quizScore"
            );


        scoreBox.style.display =
            "block";


        scoreBox.innerHTML = `

            <h2>
                Your Score
            </h2>

            <div
                style="
                    font-size:32px;
                    font-weight:700;
                    margin:10px 0;
                "
            >
                ${score} / ${total}
            </div>

            <div>
                ${percentage}%
            </div>

            <p>
                ${message}
            </p>

            <p>
                ${answered} of ${total} questions answered
            </p>

            <button
                type="button"
                id="retryQuiz"
                style="
                    margin-top:10px;
                    padding:10px 22px;
                    border:none;
                    border-radius:8px;
                    cursor:pointer;
                "
            >
                ↻ Try Again
            </button>

        `;


        /* =========================
           DISABLE SUBMIT
        ========================== */

        const submitQuiz =
            document.getElementById(
                "submitQuiz"
            );


        if (submitQuiz) {

            submitQuiz.disabled = true;

            submitQuiz.textContent =
                "✓ Quiz Submitted";

        }


        /* =========================
           TRY AGAIN
        ========================== */

        const retryQuiz =
            document.getElementById(
                "retryQuiz"
            );


        if (retryQuiz) {

            retryQuiz.addEventListener(
                "click",
                () => {

                    createQuiz(
                        questions,

                        document.querySelector(
                            ".difficulty.active"
                        )
                            ? document.querySelector(
                                ".difficulty.active"
                            ).dataset.level
                            : "Easy",

                        document.getElementById(
                            "quizType"
                        ).value
                    );

                }
            );

        }

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
```
