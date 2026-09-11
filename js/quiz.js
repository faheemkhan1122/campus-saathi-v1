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
                        >

                            <input
                                type="radio"
                                name="question-${i}"
                                value="${answerIndex}"
                            >

                            <span>
                                ${escapeHTML(answer)}
                            </span>

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

            <div class="quiz-submit-area">

                <button
                    type="button"
                    id="submitQuiz"
                    class="submit-quiz-btn"
                >
                    ✓ Submit Quiz
                </button>

            </div>

            <div
                id="quizScore"
                class="quiz-score"
                style="display:none;"
            ></div>

        `;


        quizResult.innerHTML =
            html;


        /* =========================
           SUBMIT EVENT
        ========================== */

        const submitQuiz =
            document.getElementById("submitQuiz");


        if (submitQuiz) {

            submitQuiz.addEventListener(
                "click",
                () => {

                    checkQuizAnswers(
                        questions
                    );

                }
            );

        }


        quizResult.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    /* =========================
       CHECK QUIZ ANSWERS
    ========================== */

    function checkQuizAnswers(questions) {

        let score = 0;

        let answered = 0;


        questions.forEach((current, questionIndex) => {

            const questionCard =
                quizResult.querySelector(
                    `[data-question-index="${questionIndex}"]`
                );


            if (!questionCard) {
                return;
            }


            const selected =
                questionCard.querySelector(
                    `input[name="question-${questionIndex}"]:checked`
                );


            const answerOptions =
                questionCard.querySelectorAll(
                    ".answer-option"
                );


            /* =========================
               FIND CORRECT ANSWER
            ========================== */

            const correctAnswer =
                getCorrectAnswer(current);


            /* =========================
               REMOVE OLD RESULTS
            ========================== */

            answerOptions.forEach(option => {

                option.classList.remove(
                    "correct-answer",
                    "wrong-answer"
                );

            });


            /* =========================
               MARK CORRECT ANSWER
            ========================== */

            answerOptions.forEach((option, index) => {

                const answerText =
                    getAnswerText(
                        option
                    );


                const isCorrect =
                    isCorrectAnswer(
                        current,
                        correctAnswer,
                        answerText,
                        index
                    );


                if (isCorrect) {

                    option.classList.add(
                        "correct-answer"
                    );

                }

            });


            /* =========================
               USER DID NOT ANSWER
            ========================== */

            if (!selected) {
                return;
            }


            answered++;


            const selectedIndex =
                Number(
                    selected.value
                );


            const selectedOption =
                selected.closest(
                    ".answer-option"
                );


            const selectedText =
                selectedOption
                    ? getAnswerText(selectedOption)
                    : "";


            const userIsCorrect =
                isCorrectAnswer(
                    current,
                    correctAnswer,
                    selectedText,
                    selectedIndex
                );


            /* =========================
               CORRECT
            ========================== */

            if (userIsCorrect) {

                score++;

                selectedOption.classList.add(
                    "correct-answer"
                );

            }


            /* =========================
               WRONG
            ========================== */

            else {

                selectedOption.classList.add(
                    "wrong-answer"
                );

            }

        });


        /* =========================
           SHOW SCORE
        ========================== */

        const scoreBox =
            document.getElementById(
                "quizScore"
            );


        if (scoreBox) {

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
                    "Good job! Keep going! 👍";

            }


            scoreBox.style.display =
                "block";


            scoreBox.innerHTML = `

                <div class="score-number">
                    ${score} / ${total}
                </div>

                <div class="score-percentage">
                    ${percentage}%
                </div>

                <div class="score-message">
                    ${message}
                </div>

                <div class="answered-count">
                    ${answered} of ${total} answered
                </div>

                <button
                    type="button"
                    id="retryQuiz"
                    class="retry-quiz-btn"
                >
                    ↻ Try Again
                </button>

            `;


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
                            document.querySelector(".quiz-meta")
                                ? ""
                                : "",
                            ""
                        );

                    }
                );

            }

        }


        /* =========================
           DISABLE SUBMIT AFTER CHECK
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

    }


    /* =========================
       GET CORRECT ANSWER
       SUPPORT MULTIPLE AI FORMATS
    ========================== */

    function getCorrectAnswer(question) {

        if (
            question.correctAnswer !== undefined
        ) {
            return question.correctAnswer;
        }


        if (
            question.correct_answer !== undefined
        ) {
            return question.correct_answer;
        }


        if (
            question.correct !== undefined
        ) {
            return question.correct;
        }


        if (
            question.answer !== undefined
        ) {
            return question.answer;
        }


        if (
            question.correctIndex !== undefined
        ) {
            return question.correctIndex;
        }


        if (
            question.correct_index !== undefined
        ) {
            return question.correct_index;
        }


        if (
            question.answerIndex !== undefined
        ) {
            return question.answerIndex;
        }


        if (
            question.answer_index !== undefined
        ) {
            return question.answer_index;
        }


        return null;

    }


    /* =========================
       GET ANSWER TEXT
    ========================== */

    function getAnswerText(option) {

        const span =
            option.querySelector("span");


        if (span) {

            return span.textContent.trim();

        }


        return option.textContent.trim();

    }


    /* =========================
       CHECK CORRECT ANSWER
    ========================== */

    function isCorrectAnswer(
        question,
        correctAnswer,
        answerText,
        answerIndex
    ) {

        if (correctAnswer === null) {
            return false;
        }


        /* Correct answer is index */

        if (
            typeof correctAnswer === "number"
        ) {

            return (
                answerIndex === correctAnswer
            );

        }


        const correctString =
            String(
                correctAnswer
            ).trim();


        /* Correct answer is answer text */

        if (
            correctString.toLowerCase() ===
            answerText.toLowerCase()
        ) {

            return true;

        }


        /* Correct answer is A/B/C/D */

        const letters =
            ["A", "B", "C", "D", "E", "F"];


        const letterIndex =
            letters.indexOf(
                correctString.toUpperCase()
            );


        if (
            letterIndex !== -1 &&
            letterIndex === answerIndex
        ) {

            return true;

        }


        /* Correct answer may be "Option 1" etc. */

        const optionMatch =
            correctString.match(
                /(?:option|answer)\s*(\d+)/i
            );


        if (optionMatch) {

            const correctIndex =
                Number(
                    optionMatch[1]
                ) - 1;


            if (
                correctIndex === answerIndex
            ) {

                return true;

            }

        }


        return false;

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
