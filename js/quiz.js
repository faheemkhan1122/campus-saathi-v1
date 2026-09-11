// =========================================
// CAMPUS SAATHI - NOTES TO QUIZ
// =========================================

// -------------------------------
// USER STORAGE
// -------------------------------
const userId = localStorage.getItem("userId");

const quizStorageKey = userId
    ? `userQuizzes_${userId}`
    : "userQuizzes_guest";

// -------------------------------
// ELEMENTS
// -------------------------------
const notesInput = document.getElementById("notesInput");
const wordCount = document.getElementById("wordCount");
const clearNotes = document.getElementById("clearNotes");
const generateQuiz = document.getElementById("generateQuiz");
const quizResult = document.getElementById("quizResult");
const difficultyButtons = document.querySelectorAll(".difficulty");

// -------------------------------
// CHECK REQUIRED ELEMENTS
// -------------------------------
if (!notesInput || !generateQuiz || !quizResult) {
    console.error("Quiz elements not found.");
}

// -------------------------------
// WORD COUNT
// -------------------------------
function updateWordCount() {
    if (!notesInput || !wordCount) return;

    const text = notesInput.value.trim();

    if (!text) {
        wordCount.textContent = "0 words";
        return;
    }

    const words = text.split(/\s+/).filter(Boolean);

    wordCount.textContent = `${words.length} words`;
}

if (notesInput) {
    notesInput.addEventListener("input", updateWordCount);
}

// -------------------------------
// CLEAR NOTES
// -------------------------------
if (clearNotes) {
    clearNotes.addEventListener("click", function () {
        notesInput.value = "";
        updateWordCount();
        notesInput.focus();
    });
}

// -------------------------------
// DIFFICULTY BUTTONS
// -------------------------------
difficultyButtons.forEach((button) => {
    button.addEventListener("click", function () {

        difficultyButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

        this.classList.add("active");
    });
});

// -------------------------------
// SAVE QUIZ
// -------------------------------
function saveQuiz(quiz) {
    try {
        const oldQuizzes =
            JSON.parse(localStorage.getItem(quizStorageKey)) || [];

        oldQuizzes.push({
            ...quiz,
            savedAt: new Date().toISOString()
        });

        localStorage.setItem(
            quizStorageKey,
            JSON.stringify(oldQuizzes)
        );

    } catch (error) {
        console.error("Quiz save error:", error);
    }
}

// -------------------------------
// GENERATE QUIZ
// -------------------------------
if (generateQuiz) {

    generateQuiz.addEventListener("click", async function () {

        const notes = notesInput.value.trim();

        if (!notes) {
            alert("Please enter your notes first.");
            notesInput.focus();
            return;
        }

        const questionCountElement =
            document.getElementById("questionCount");

        const quizTypeElement =
            document.getElementById("quizType");

        const questionCount =
            questionCountElement
                ? questionCountElement.value
                : "5";

        const difficultyElement =
            document.querySelector(".difficulty.active");

        const difficulty =
            difficultyElement
                ? difficultyElement.dataset.level
                : "Easy";

        const quizType =
            quizTypeElement
                ? quizTypeElement.value
                : "multiple";

        // -------------------------------
        // LOADING STATE
        // -------------------------------
        const originalButtonText =
            generateQuiz.textContent;

        generateQuiz.disabled = true;
        generateQuiz.textContent = "Generating...";

        quizResult.innerHTML = `
            <div style="
                padding:30px;
                text-align:center;
                font-size:16px;
            ">
                🤖 AI is creating your quiz...
            </div>
        `;

        try {

            // -------------------------------
            // API REQUEST
            // -------------------------------
            const response = await fetch("/api/generate-quiz", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    notes: notes,
                    questionCount: Number(questionCount),
                    difficulty: difficulty,
                    quizType: quizType
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Quiz generation failed."
                );
            }

            if (
                !data.questions ||
                !Array.isArray(data.questions) ||
                data.questions.length === 0
            ) {
                throw new Error(
                    "AI did not return valid questions."
                );
            }

            // -------------------------------
            // SAVE QUIZ
            // -------------------------------
            saveQuiz({
                questions: data.questions,
                difficulty: difficulty,
                quizType: quizType,
                notes: notes
            });

            // -------------------------------
            // SHOW QUIZ
            // -------------------------------
            createQuiz(
                data.questions,
                difficulty,
                quizType
            );

        } catch (error) {

            console.error("Quiz generation error:", error);

            quizResult.innerHTML = `
                <div style="
                    padding:20px;
                    text-align:center;
                    color:#ef4444;
                ">
                    ❌ AI quiz generate nahi ho saka.
                    <br>
                    <small>Please try again.</small>
                </div>
            `;

        } finally {

            generateQuiz.disabled = false;
            generateQuiz.textContent = originalButtonText;
        }
    });
}

// -------------------------------
// CREATE QUIZ
// -------------------------------
function createQuiz(questions, difficulty, quizType) {

    let html = `
        <div class="quiz-container">

            <div class="quiz-header">

                <h2>📝 Your Quiz</h2>

                <p>
                    ${questions.length} Questions
                    • ${escapeHTML(difficulty)}
                </p>

            </div>
    `;

    questions.forEach((question, questionIndex) => {

        html += `
            <div
                class="question-card"
                data-question-index="${questionIndex}"
                style="
                    margin-bottom:20px;
                    padding:20px;
                    border-radius:12px;
                "
            >

                <h3 style="margin-bottom:15px;">
                    ${questionIndex + 1}.
                    ${escapeHTML(question.question)}
                </h3>
        `;

        if (
            !question.answers ||
            !Array.isArray(question.answers)
        ) {
            html += `
                <p style="color:#ef4444;">
                    Invalid answer options.
                </p>
            `;
        } else {

            question.answers.forEach(
                (answer, answerIndex) => {

                    const safeAnswer =
                        escapeHTML(answer);

                    html += `
                        <label
                            class="quiz-answer"
                            data-answer="${safeAnswer}"
                            style="
                                display:block;
                                padding:12px;
                                margin:8px 0;
                                border:1px solid rgba(255,255,255,0.12);
                                border-radius:10px;
                                cursor:pointer;
                                transition:0.2s;
                            "
                        >

                            <input
                                type="radio"
                                name="question-${questionIndex}"
                                value="${answerIndex}"
                                style="margin-right:8px;"
                            >

                            <span>
                                ${safeAnswer}
                            </span>

                        </label>
                    `;
                }
            );
        }

        html += `
            </div>
        `;
    });

    html += `

            <div style="
                text-align:center;
                margin-top:25px;
            ">

                <button
                    type="button"
                    id="submitQuiz"
                    class="generate-btn"
                >
                    Submit Quiz
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
                    font-size:18px;
                "
            ></div>

        </div>
    `;

    quizResult.innerHTML = html;

    // -------------------------------
    // SUBMIT BUTTON
    // -------------------------------
    const submitQuiz =
        document.getElementById("submitQuiz");

    if (submitQuiz) {

        submitQuiz.addEventListener(
            "click",
            function () {

                checkQuiz(questions);

            }
        );
    }

    // -------------------------------
    // SCROLL TO QUIZ
    // -------------------------------
    quizResult.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// -------------------------------
// CHECK QUIZ
// -------------------------------
function checkQuiz(questions) {

    let score = 0;

    questions.forEach(
        (question, questionIndex) => {

            const selected =
                document.querySelector(
                    `input[name="question-${questionIndex}"]:checked`
                );

            const questionCard =
                document.querySelector(
                    `[data-question-index="${questionIndex}"]`
                );

            if (!questionCard) return;

            const answerLabels =
                questionCard.querySelectorAll(
                    ".quiz-answer"
                );

            // -------------------------------
            // RESET ANSWERS
            // -------------------------------
            answerLabels.forEach((label) => {

                label.style.background = "";
                label.style.border = "1px solid rgba(255,255,255,0.12)";

            });

            // -------------------------------
            // ALWAYS SHOW CORRECT ANSWER
            // -------------------------------
            answerLabels.forEach((label) => {

                const answer =
                    label.dataset.answer || "";

                if (
                    answer.trim().toLowerCase() ===
                    String(question.correctAnswer)
                        .trim()
                        .toLowerCase()
                ) {

                    label.style.background =
                        "rgba(34,197,94,0.15)";

                    label.style.border =
                        "2px solid #22c55e";
                }
            });

            // -------------------------------
            // CHECK SELECTED ANSWER
            // -------------------------------
            if (selected) {

                const selectedLabel =
                    selected.closest(".quiz-answer");

                const selectedAnswer =
                    selectedLabel
                        ? selectedLabel.dataset.answer
                        : "";

                const isCorrect =
                    selectedAnswer
                        .trim()
                        .toLowerCase() ===
                    String(question.correctAnswer)
                        .trim()
                        .toLowerCase();

                if (isCorrect) {

                    score++;

                } else if (selectedLabel) {

                    selectedLabel.style.background =
                        "rgba(239,68,68,0.15)";

                    selectedLabel.style.border =
                        "2px solid #ef4444";
                }
            }
        }
    );

    // -------------------------------
    // SCORE
    // -------------------------------
    const total = questions.length;

    const percentage =
        total > 0
            ? Math.round((score / total) * 100)
            : 0;

    const scoreBox =
        document.getElementById("quizScore");

    if (scoreBox) {

        let message = "";

        if (percentage === 100) {
            message = "🎉 Perfect! Excellent work!";
        } else if (percentage >= 80) {
            message = "🔥 Great job!";
        } else if (percentage >= 60) {
            message = "👍 Good effort!";
        } else {
            message = "💪 Keep practicing!";
        }

        scoreBox.innerHTML = `
            <strong>
                Your Score: ${score}/${total}
            </strong>

            <br>

            <span>
                ${percentage}%
            </span>

            <br><br>

            <span>
                ${message}
            </span>
        `;

        scoreBox.style.display = "block";
        scoreBox.style.background =
            "rgba(128,92,255,0.12)";
    }

    // -------------------------------
    // DISABLE SUBMIT
    // -------------------------------
    const submitQuiz =
        document.getElementById("submitQuiz");

    if (submitQuiz) {

        submitQuiz.disabled = true;
        submitQuiz.textContent = "Quiz Submitted ✓";
    }
}

// -------------------------------
// ESCAPE HTML
// -------------------------------
function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// -------------------------------
// INITIAL WORD COUNT
// -------------------------------
updateWordCount();
