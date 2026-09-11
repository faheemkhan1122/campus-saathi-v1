// =========================================
// CAMPUS SAATHI - NOTES TO QUIZ
// =========================================

const userId = localStorage.getItem("userId");

const quizStorageKey = userId
    ? `userQuizzes_${userId}`
    : "userQuizzes_guest";

// =========================================
// ELEMENTS
// =========================================

const notesInput = document.getElementById("notesInput");
const wordCount = document.getElementById("wordCount");
const clearNotes = document.getElementById("clearNotes");
const generateQuiz = document.getElementById("generateQuiz");
const quizResult = document.getElementById("quizResult");
const difficultyButtons = document.querySelectorAll(".difficulty");

// =========================================
// WORD COUNT
// =========================================

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

// =========================================
// CLEAR NOTES
// =========================================

if (clearNotes) {
    clearNotes.addEventListener("click", function () {
        notesInput.value = "";
        updateWordCount();
        notesInput.focus();
    });
}

// =========================================
// DIFFICULTY
// =========================================

difficultyButtons.forEach((button) => {

    button.addEventListener("click", function () {

        difficultyButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

        this.classList.add("active");
    });

});

// =========================================
// SAVE QUIZ
// =========================================

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

// =========================================
// GENERATE QUIZ
// =========================================

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

        const activeDifficulty =
            document.querySelector(".difficulty.active");

        const difficulty =
            activeDifficulty
                ? activeDifficulty.dataset.level
                : "Easy";

        const quizType =
            quizTypeElement
                ? quizTypeElement.value
                : "multiple";

        const oldButtonText =
            generateQuiz.textContent;

        generateQuiz.disabled = true;

        generateQuiz.textContent = "Generating...";

        quizResult.innerHTML = `
            <div style="
                min-height:200px;
                display:flex;
                align-items:center;
                justify-content:center;
                text-align:center;
                color:#aeb6c8;
                font-size:14px;
            ">
                🤖 AI is creating your quiz...
            </div>
        `;

        try {

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
                    data.error || "Quiz generation failed."
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

            saveQuiz({

                questions: data.questions,

                difficulty: difficulty,

                quizType: quizType,

                notes: notes

            });

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
                <div style="
                    padding:30px;
                    text-align:center;
                    color:#ef4444;
                ">
                    ❌ AI quiz generate nahi ho saka.
                    <br>
                    <small>
                        Please try again.
                    </small>
                </div>
            `;

        } finally {

            generateQuiz.disabled = false;

            generateQuiz.textContent = oldButtonText;

        }

    });

}

// =========================================
// CREATE QUIZ
// =========================================

function createQuiz(questions, difficulty, quizType) {

    let html = `

        <div
            id="generatedQuiz"
            style="
                width:100%;
                display:block;
            "
        >

            <div
                class="quiz-header"
                style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    margin-bottom:20px;
                "
            >

                <div>

                    <h2>
                        📝 Your Quiz
                    </h2>

                    <div
                        style="
                            color:#727d92;
                            font-size:9px;
                            margin-top:5px;
                        "
                    >
                        ${questions.length} Questions
                        • ${escapeHTML(difficulty)}
                    </div>

                </div>

            </div>
    `;

    questions.forEach((question, questionIndex) => {

        html += `

            <div
                class="question-card"
                data-question-index="${questionIndex}"
                style="
                    display:block;
                    width:100%;
                    padding:17px;
                    margin-bottom:14px;
                    border-radius:13px;
                    background:rgba(255,255,255,0.022);
                    border:1px solid rgba(255,255,255,0.05);
                "
            >

                <h3>
                    ${questionIndex + 1}.
                    ${escapeHTML(question.question)}
                </h3>

        `;

        if (
            question.answers &&
            Array.isArray(question.answers)
        ) {

            question.answers.forEach(
                (answer, answerIndex) => {

                    html += `

                        <label
                            class="answer-option"
                            data-answer-index="${answerIndex}"
                            data-answer="${escapeHTML(answer)}"
                            style="
                                display:block;
                                width:100%;
                                padding:11px 12px;
                                margin-top:7px;
                                border-radius:8px;
                                color:#7d879b;
                                background:rgba(255,255,255,0.025);
                                border:1px solid rgba(255,255,255,0.045);
                                font-size:9px;
                                cursor:pointer;
                            "
                        >

                            <input
                                type="radio"
                                name="question-${questionIndex}"
                                value="${answerIndex}"
                                style="
                                    margin-right:8px;
                                    cursor:pointer;
                                "
                            >

                            ${escapeHTML(answer)}

                        </label>

                    `;

                }
            );

        }

        html += `

            </div>

        `;

    });

    // =========================================
    // SUBMIT AREA
    // =========================================

    html += `

        <div
            id="quizSubmitArea"
            style="
                display:block !important;
                width:100%;
                margin-top:25px;
                margin-bottom:20px;
                padding:5px;
            "
        >

            <button
                type="button"
                id="submitQuiz"
                style="
                    display:block !important;
                    visibility:visible !important;
                    opacity:1 !important;
                    width:100%;
                    padding:15px;
                    border:none;
                    border-radius:11px;
                    cursor:pointer;
                    color:#ffffff;
                    background:linear-gradient(135deg,#795cff,#419cff);
                    font-size:12px;
                    font-weight:700;
                    box-shadow:0 12px 30px rgba(95,75,255,0.25);
                "
            >
                Submit Quiz
            </button>

        </div>

        <div
            id="quizScore"
            style="
                display:none;
                width:100%;
                margin-top:20px;
                margin-bottom:20px;
                padding:25px;
                border-radius:14px;
                text-align:center;
                color:#ffffff;
                background:rgba(128,92,255,0.12);
                border:1px solid rgba(128,92,255,0.25);
                font-size:18px;
                line-height:1.8;
            "
        ></div>

        </div>

    `;

    quizResult.innerHTML = html;

    // =========================================
    // SUBMIT BUTTON
    // =========================================

    const submitQuiz =
        document.getElementById("submitQuiz");

    if (submitQuiz) {

        submitQuiz.addEventListener(
            "click",
            function () {

                checkQuiz(questions);

            }
        );

    } else {

        console.error(
            "Submit Quiz button was not created."
        );

    }

    // =========================================
    // SCROLL
    // =========================================

    setTimeout(() => {

        quizResult.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 100);

}

// =========================================
// CHECK QUIZ
// =========================================

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
                    ".answer-option"
                );

            // Reset styles

            answerLabels.forEach((label) => {

                label.style.background =
                    "rgba(255,255,255,0.025)";

                label.style.border =
                    "1px solid rgba(255,255,255,0.045)";

            });

            // Show correct answer

            answerLabels.forEach((label) => {

                const answer =
                    label.dataset.answer || "";

                const correctAnswer =
                    String(
                        question.correctAnswer || ""
                    );

                if (
                    answer.trim().toLowerCase() ===
                    correctAnswer.trim().toLowerCase()
                ) {

                    label.style.background =
                        "rgba(34,197,94,0.15)";

                    label.style.border =
                        "2px solid #22c55e";

                    label.style.color =
                        "#ffffff";

                }

            });

            // Check selected answer

            if (selected) {

                const selectedLabel =
                    selected.closest(".answer-option");

                if (selectedLabel) {

                    const selectedAnswer =
                        selectedLabel.dataset.answer || "";

                    const correctAnswer =
                        String(
                            question.correctAnswer || ""
                        );

                    const correct =
                        selectedAnswer
                            .trim()
                            .toLowerCase() ===
                        correctAnswer
                            .trim()
                            .toLowerCase();

                    if (correct) {

                        score++;

                    } else {

                        selectedLabel.style.background =
                            "rgba(239,68,68,0.15)";

                        selectedLabel.style.border =
                            "2px solid #ef4444";

                        selectedLabel.style.color =
                            "#ffffff";

                    }

                }

            }

        }
    );

    // =========================================
    // SCORE
    // =========================================

    const total = questions.length;

    const percentage =
        total > 0
            ? Math.round((score / total) * 100)
            : 0;

    const scoreBox =
        document.getElementById("quizScore");

    if (scoreBox) {

        let message;

        if (percentage === 100) {

            message =
                "🎉 Perfect! Excellent work!";

        } else if (percentage >= 80) {

            message =
                "🔥 Great job!";

        } else if (percentage >= 60) {

            message =
                "👍 Good effort!";

        } else {

            message =
                "💪 Keep practicing!";

        }

        scoreBox.innerHTML = `

            <div style="
                font-size:22px;
                font-weight:800;
                margin-bottom:8px;
            ">
                Your Score: ${score}/${total}
            </div>

            <div style="
                font-size:18px;
                margin-bottom:8px;
            ">
                ${percentage}%
            </div>

            <div style="
                font-size:13px;
                color:#aeb6c8;
            ">
                ${message}
            </div>

        `;

        scoreBox.style.display =
            "block";

    }

    // =========================================
    // DISABLE SUBMIT
    // =========================================

    const submitQuiz =
        document.getElementById("submitQuiz");

    if (submitQuiz) {

        submitQuiz.disabled = true;

        submitQuiz.textContent =
            "Quiz Submitted ✓";

        submitQuiz.style.opacity =
            "0.7";

        submitQuiz.style.cursor =
            "default";

    }

}

// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

// =========================================
// INITIAL WORD COUNT
// =========================================

updateWordCount();
