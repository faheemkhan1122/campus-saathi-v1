// =========================================
// CAMPUS SAATHI - NOTES TO QUIZ
// =========================================

const userId = localStorage.getItem("userId");

const quizStorageKey = userId
    ? `userQuizzes_${userId}`
    : "userQuizzes_guest";

const quizStatsKey = userId
    ? `quizLabStats_${userId}`
    : "quizLabStats_guest";

// =========================================
// ELEMENTS
// =========================================

const notesInput = document.getElementById("notesInput");
const wordCount = document.getElementById("wordCount");
const clearNotes = document.getElementById("clearNotes");
const generateQuiz = document.getElementById("generateQuiz");
const quizResult = document.getElementById("quizResult");
const difficultyButtons = document.querySelectorAll(".difficulty");

const questionCountElement =
    document.getElementById("questionCount");

const quizTypeElement =
    document.getElementById("quizType");

// =========================================
// QUIZ LAB STATS
// =========================================

let quizStats = {
    notes: 0,
    settings: 0,
    quizzes: 0,
    lastNotesSignature: "",
    lastSettingsSignature: ""
};

function loadQuizStats() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(quizStatsKey)
            );

        if (saved) {

            quizStats = {
                ...quizStats,
                ...saved
            };

        }

    } catch (error) {

        console.error(
            "Quiz stats load error:",
            error
        );

    }

}

function saveQuizStats() {

    try {

        localStorage.setItem(
            quizStatsKey,
            JSON.stringify(quizStats)
        );

    } catch (error) {

        console.error(
            "Quiz stats save error:",
            error
        );

    }

}

function formatCounter(number) {

    return String(number).padStart(2, "0");

}

// =========================================
// QUIZ LAB COUNTERS
// =========================================

function updateQuizLabCounters() {

    const infoSteps =
        document.querySelectorAll(".info-step");

    if (!infoSteps || infoSteps.length < 3) {
        return;
    }

    const counters = [
        quizStats.notes,
        quizStats.settings,
        quizStats.quizzes
    ];

    infoSteps.forEach((step, index) => {

        const counter =
            step.querySelector("span");

        if (!counter) return;

        counter.textContent =
            formatCounter(counters[index]);

    });

}

function animateCounter(index) {

    const infoSteps =
        document.querySelectorAll(".info-step");

    if (!infoSteps[index]) return;

    const counter =
        infoSteps[index].querySelector("span");

    if (!counter) return;

    counter.style.transform =
        "scale(1.35)";

    counter.style.transition =
        "transform 0.25s ease";

    setTimeout(() => {

        counter.style.transform =
            "scale(1)";

    }, 250);

}

// =========================================
// INITIAL STATS
// =========================================

loadQuizStats();
updateQuizLabCounters();

// =========================================
// WORD COUNT
// =========================================

function updateWordCount() {

    if (!notesInput || !wordCount) return;

    const text =
        notesInput.value.trim();

    if (!text) {

        wordCount.textContent =
            "0 words";

        return;
    }

    const words =
        text
            .split(/\s+/)
            .filter(Boolean);

    wordCount.textContent =
        `${words.length} words`;

}

if (notesInput) {

    notesInput.addEventListener(
        "input",
        updateWordCount
    );

}

// =========================================
// COUNT NOTES ACTIVITY
// =========================================

function countNotesActivity() {

    if (!notesInput) return;

    const notes =
        notesInput.value.trim();

    if (!notes) return;

    const signature =
        notes
            .replace(/\s+/g, " ")
            .trim();

    if (
        signature ===
        quizStats.lastNotesSignature
    ) {
        return;
    }

    quizStats.notes++;

    quizStats.lastNotesSignature =
        signature;

    saveQuizStats();

    updateQuizLabCounters();

    animateCounter(0);

}

// =========================================
// PASTE NOTES
// =========================================

if (notesInput) {

    notesInput.addEventListener(
        "paste",
        function () {

            setTimeout(() => {

                updateWordCount();

                countNotesActivity();

            }, 50);

        }
    );

}

// =========================================
// CLEAR NOTES
// =========================================

if (clearNotes) {

    clearNotes.addEventListener(
        "click",
        function () {

            notesInput.value = "";

            quizStats.lastNotesSignature =
                "";

            saveQuizStats();

            updateWordCount();

            notesInput.focus();

        }
    );

}

// =========================================
// DIFFICULTY
// =========================================

difficultyButtons.forEach((button) => {

    button.addEventListener(
        "click",
        function () {

            difficultyButtons.forEach((btn) => {

                btn.classList.remove(
                    "active"
                );

            });

            this.classList.add("active");

            countSettingsActivity();

        }
    );

});

// =========================================
// SETTINGS SIGNATURE
// =========================================

function getSettingsSignature() {

    const questionCount =
        questionCountElement
            ? questionCountElement.value
            : "5";

    const activeDifficulty =
        document.querySelector(
            ".difficulty.active"
        );

    const difficulty =
        activeDifficulty
            ? activeDifficulty.dataset.level
            : "Easy";

    const quizType =
        quizTypeElement
            ? quizTypeElement.value
            : "multiple";

    return `${questionCount}|${difficulty}|${quizType}`;

}

// =========================================
// COUNT SETTINGS ACTIVITY
// =========================================

function countSettingsActivity() {

    const signature =
        getSettingsSignature();

    if (
        signature ===
        quizStats.lastSettingsSignature
    ) {
        return;
    }

    quizStats.settings++;

    quizStats.lastSettingsSignature =
        signature;

    saveQuizStats();

    updateQuizLabCounters();

    animateCounter(1);

}

// =========================================
// SETTINGS CHANGE EVENTS
// =========================================

if (questionCountElement) {

    questionCountElement.addEventListener(
        "change",
        countSettingsActivity
    );

}

if (quizTypeElement) {

    quizTypeElement.addEventListener(
        "change",
        countSettingsActivity
    );

}

// =========================================
// SAVE QUIZ
// =========================================

function saveQuiz(quiz) {

    try {

        const oldQuizzes =
            JSON.parse(
                localStorage.getItem(
                    quizStorageKey
                )
            ) || [];

        oldQuizzes.push({

            ...quiz,

            savedAt:
                new Date().toISOString()

        });

        localStorage.setItem(
            quizStorageKey,
            JSON.stringify(oldQuizzes)
        );

    } catch (error) {

        console.error(
            "Quiz save error:",
            error
        );

    }

}

// =========================================
// AI LOADING EXPERIENCE
// =========================================

let loadingInterval = null;

const loadingStages = [

    {
        icon: "🧠",
        title: "AI is thinking...",
        text: "Understanding what you studied"
    },

    {
        icon: "🔍",
        title: "Scanning your notes...",
        text: "Finding the key concepts"
    },

    {
        icon: "🔥",
        title: "Building your challenge...",
        text: "Turning concepts into smart questions"
    }

];

function showQuizLoading() {

    if (!quizResult) return;

    let currentStage = 0;

    quizResult.innerHTML = `

        <div
            id="quizLoading"
            style="
                min-height:330px;
                display:flex;
                align-items:center;
                justify-content:center;
                text-align:center;
                padding:35px 20px;
            "
        >

            <div
                style="
                    width:100%;
                    max-width:440px;
                "
            >

                <div
                    id="loadingIcon"
                    style="
                        width:82px;
                        height:82px;
                        margin:0 auto 22px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        border-radius:50%;
                        font-size:36px;
                        background:
                            radial-gradient(
                                circle,
                                rgba(128,92,255,0.30),
                                rgba(66,157,255,0.08)
                            );
                        border:
                            1px solid
                            rgba(128,92,255,0.35);
                        box-shadow:
                            0 0 35px
                            rgba(128,92,255,0.25);
                        animation:
                            quizBrainPulse 1.4s
                            ease-in-out infinite;
                    "
                >
                    🧠
                </div>

                <h2
                    id="loadingTitle"
                    style="
                        margin:0;
                        color:#ffffff;
                        font-size:21px;
                        font-weight:800;
                    "
                >
                    AI is thinking...
                </h2>

                <p
                    id="loadingText"
                    style="
                        margin:10px 0 22px;
                        color:#8f99ad;
                        font-size:12px;
                    "
                >
                    Understanding what you studied
                </p>

                <div
                    style="
                        width:100%;
                        height:7px;
                        overflow:hidden;
                        border-radius:20px;
                        background:
                            rgba(255,255,255,0.06);
                    "
                >

                    <div
                        id="loadingProgress"
                        style="
                            width:5%;
                            height:100%;
                            border-radius:20px;
                            background:
                                linear-gradient(
                                    90deg,
                                    #795cff,
                                    #419cff
                                );
                            transition:
                                width 1s ease;
                            box-shadow:
                                0 0 15px
                                rgba(121,92,255,0.55);
                        "
                    ></div>

                </div>

                <div
                    id="loadingStep"
                    style="
                        margin-top:13px;
                        color:#667187;
                        font-size:10px;
                        letter-spacing:1px;
                        text-transform:uppercase;
                    "
                >
                    Step 1 of 3
                </div>

            </div>

        </div>

        <style>
            @keyframes quizBrainPulse {

                0%, 100% {
                    transform:scale(1);
                    box-shadow:
                        0 0 25px
                        rgba(128,92,255,0.20);
                }

                50% {
                    transform:scale(1.08);
                    box-shadow:
                        0 0 45px
                        rgba(66,157,255,0.38);
                }

            }
        </style>

    `;

    function renderStage(stageIndex) {

        const stage =
            loadingStages[stageIndex];

        const icon =
            document.getElementById(
                "loadingIcon"
            );

        const title =
            document.getElementById(
                "loadingTitle"
            );

        const text =
            document.getElementById(
                "loadingText"
            );

        const progress =
            document.getElementById(
                "loadingProgress"
            );

        const step =
            document.getElementById(
                "loadingStep"
            );

        if (!icon || !title || !text) {
            return;
        }

        icon.textContent =
            stage.icon;

        title.textContent =
            stage.title;

        text.textContent =
            stage.text;

        if (progress) {

            progress.style.width =
                `${[25, 60, 90][stageIndex]}%`;

        }

        if (step) {

            step.textContent =
                `Step ${stageIndex + 1} of 3`;

        }

    }

    renderStage(0);

    // -----------------------------------------
    // Every stage MUST appear
    // -----------------------------------------

    loadingInterval =
        setInterval(() => {

            if (currentStage < 2) {

                currentStage++;

                renderStage(
                    currentStage
                );

            }

        }, 2000);

}

function finishQuizLoading() {

    if (loadingInterval) {

        clearInterval(
            loadingInterval
        );

        loadingInterval = null;

    }

}

// =========================================
// GENERATE QUIZ
// =========================================

if (generateQuiz) {

    generateQuiz.addEventListener(
        "click",
        async function () {

            const notes =
                notesInput.value.trim();

            if (!notes) {

                alert(
                    "Please enter your notes first."
                );

                notesInput.focus();

                return;

            }

            // Count typed notes too
            countNotesActivity();

            // Count current settings
            countSettingsActivity();

            const questionCount =
                questionCountElement
                    ? questionCountElement.value
                    : "5";

            const activeDifficulty =
                document.querySelector(
                    ".difficulty.active"
                );

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

            generateQuiz.disabled =
                true;

            generateQuiz.textContent =
                "Creating your challenge...";

            // -----------------------------------------
            // Start AI animation
            // -----------------------------------------

            showQuizLoading();

            // -----------------------------------------
            // Minimum complete animation
            // -----------------------------------------

            const animationStart =
                Date.now();

            const minimumAnimationTime =
                6000;

            try {

                const response =
                    await fetch(
                        "/api/generate-quiz",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                notes: notes,

                                questionCount:
                                    Number(
                                        questionCount
                                    ),

                                difficulty:
                                    difficulty,

                                quizType:
                                    quizType

                            })

                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Quiz generation failed."
                    );

                }

                if (
                    !data.questions ||
                    !Array.isArray(
                        data.questions
                    ) ||
                    data.questions.length === 0
                ) {

                    throw new Error(
                        "AI did not return valid questions."
                    );

                }

                // -----------------------------------------
                // Make sure all 3 animation stages finish
                // -----------------------------------------

                const elapsed =
                    Date.now() -
                    animationStart;

                const remaining =
                    Math.max(
                        0,
                        minimumAnimationTime -
                        elapsed
                    );

                if (remaining > 0) {

                    await new Promise(
                        (resolve) =>
                            setTimeout(
                                resolve,
                                remaining
                            )
                    );

                }

                finishQuizLoading();

                // -----------------------------------------
                // Count generated quiz
                // -----------------------------------------

                quizStats.quizzes++;

                saveQuizStats();

                updateQuizLabCounters();

                animateCounter(2);

                // -----------------------------------------
                // Save quiz
                // -----------------------------------------

                saveQuiz({

                    questions:
                        data.questions,

                    difficulty:
                        difficulty,

                    quizType:
                        quizType,

                    notes:
                        notes

                });

                // -----------------------------------------
                // Show quiz
                // -----------------------------------------

                createQuiz(
                    data.questions,
                    difficulty,
                    quizType
                );

            } catch (error) {

                finishQuizLoading();

                console.error(
                    "Quiz generation error:",
                    error
                );

                quizResult.innerHTML = `

                    <div
                        style="
                            padding:30px;
                            text-align:center;
                            color:#ef4444;
                        "
                    >

                        ❌ AI quiz generate nahi ho saka.

                        <br>

                        <small>
                            Please try again.
                        </small>

                    </div>

                `;

            } finally {

                generateQuiz.disabled =
                    false;

                generateQuiz.textContent =
                    oldButtonText;

            }

        }
    );

}

// =========================================
// CREATE QUIZ
// =========================================

function createQuiz(
    questions,
    difficulty,
    quizType
) {

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

    questions.forEach(
        (question, questionIndex) => {

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
                        background:
                            rgba(255,255,255,0.022);
                        border:
                            1px solid
                            rgba(255,255,255,0.05);
                    "
                >

                    <h3>

                        ${questionIndex + 1}.
                        ${escapeHTML(
                            question.question
                        )}

                    </h3>

            `;

            if (
                question.answers &&
                Array.isArray(
                    question.answers
                )
            ) {

                question.answers.forEach(
                    (
                        answer,
                        answerIndex
                    ) => {

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
                                    background:
                                        rgba(
                                            255,255,255,0.025
                                        );
                                    border:
                                        1px solid
                                        rgba(
                                            255,255,255,0.045
                                        );
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

        }
    );

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
                    background:
                        linear-gradient(
                            135deg,
                            #795cff,
                            #419cff
                        );
                    font-size:12px;
                    font-weight:700;
                    box-shadow:
                        0 12px 30px
                        rgba(95,75,255,0.25);
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
                background:
                    rgba(128,92,255,0.12);
                border:
                    1px solid
                    rgba(128,92,255,0.25);
                font-size:18px;
                line-height:1.8;
            "
        ></div>

        </div>

    `;

    quizResult.innerHTML =
        html;

    // =========================================
    // SUBMIT BUTTON
    // =========================================

    const submitQuiz =
        document.getElementById(
            "submitQuiz"
        );

    if (submitQuiz) {

        submitQuiz.addEventListener(
            "click",
            function () {

                checkQuiz(
                    questions
                );

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

            behavior:
                "smooth",

            block:
                "start"

        });

    }, 100);

}

// =========================================
// CHECK QUIZ
// =========================================

function checkQuiz(questions) {

    let score = 0;

    questions.forEach(
        (
            question,
            questionIndex
        ) => {

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

            answerLabels.forEach(
                (label) => {

                    label.style.background =
                        "rgba(255,255,255,0.025)";

                    label.style.border =
                        "1px solid rgba(255,255,255,0.045)";

                }
            );

            // Show correct answer

            answerLabels.forEach(
                (label) => {

                    const answer =
                        label.dataset.answer ||
                        "";

                    const correctAnswer =
                        String(
                            question.correctAnswer ||
                            ""
                        );

                    if (
                        answer
                            .trim()
                            .toLowerCase() ===
                        correctAnswer
                            .trim()
                            .toLowerCase()
                    ) {

                        label.style.background =
                            "rgba(34,197,94,0.15)";

                        label.style.border =
                            "2px solid #22c55e";

                        label.style.color =
                            "#ffffff";

                    }

                }
            );

            // Check selected answer

            if (selected) {

                const selectedLabel =
                    selected.closest(
                        ".answer-option"
                    );

                if (selectedLabel) {

                    const selectedAnswer =
                        selectedLabel.dataset.answer ||
                        "";

                    const correctAnswer =
                        String(
                            question.correctAnswer ||
                            ""
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

    const total =
        questions.length;

    const percentage =
        total > 0
            ? Math.round(
                (score / total) * 100
            )
            : 0;

    const scoreBox =
        document.getElementById(
            "quizScore"
        );

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

            <div
                style="
                    font-size:22px;
                    font-weight:800;
                    margin-bottom:8px;
                "
            >

                Your Score:
                ${score}/${total}

            </div>

            <div
                style="
                    font-size:18px;
                    margin-bottom:8px;
                "
            >

                ${percentage}%

            </div>

            <div
                style="
                    font-size:13px;
                    color:#aeb6c8;
                "
            >

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
        document.getElementById(
            "submitQuiz"
        );

    if (submitQuiz) {

        submitQuiz.disabled =
            true;

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

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}

// =========================================
// INITIAL WORD COUNT
// =========================================

updateWordCount();
