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

    generateQuiz.addEventListener("click", () => {

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


        generateQuiz.textContent =
            "Generating...";


        setTimeout(() => {

            generateQuiz.textContent =
                "✦ Generate Quiz";


            createQuiz(
                questionCount,
                difficulty,
                quizType,
                notes
            );

        }, 700);

    });


    /* =========================
       CREATE QUIZ
    ========================== */

    function createQuiz(
        questionCount,
        difficulty,
        quizType,
        notes
    ) {

        const sampleQuestions = [

            {
                question:
                    "What is the main topic of the notes you are studying?",

                answers: [
                    "The concept explained in the notes",
                    "A completely unrelated topic",
                    "None of the above",
                    "All of the above"
                ]

            },


            {
                question:
                    "Which statement best describes the key idea?",

                answers: [
                    "It explains the main concept",
                    "It is unrelated",
                    "It only gives an example",
                    "It is a question"
                ]

            },


            {
                question:
                    "Why is this topic important?",

                answers: [
                    "It helps understand the subject",
                    "It has no purpose",
                    "It replaces every other topic",
                    "It is only for memorization"
                ]

            },


            {
                question:
                    "Which option is most likely connected to your notes?",

                answers: [
                    "A key concept",
                    "Random information",
                    "An unrelated event",
                    "None"
                ]

            },


            {
                question:
                    "What should you do after reviewing these notes?",

                answers: [
                    "Practice and test your understanding",
                    "Ignore the material",
                    "Delete the notes",
                    "Stop studying completely"
                ]

            }

        ];


        /* =========================
           QUIZ DATA
        ========================== */

        const quizData = {

            id: Date.now(),

            notes: notes,

            questionCount: questionCount,

            difficulty: difficulty,

            quizType: quizType,

            createdAt:
                new Date().toISOString()

        };


        /* =========================
           SAVE FOR CURRENT USER
        ========================== */

        saveQuiz(quizData);


        /* =========================
           QUIZ HTML
        ========================== */

        let html = `

            <div class="quiz-header">

                <div>

                    <h2>
                        Practice Quiz
                    </h2>

                    <span class="quiz-meta">
                        ${difficulty} • ${quizType}
                    </span>

                </div>


                <span class="quiz-meta">
                    ${questionCount} questions
                </span>

            </div>

        `;


        for (
            let i = 0;
            i < questionCount;
            i++
        ) {

            const current =
                sampleQuestions[
                    i % sampleQuestions.length
                ];


            html += `

                <div class="question-card">

                    <small>
                        QUESTION ${i + 1}
                    </small>

                    <h3>
                        ${current.question}
                    </h3>

            `;


            current.answers.forEach(answer => {

                html += `

                    <label class="answer-option">

                        <input
                            type="radio"
                            name="question-${i}"
                            hidden
                        >

                        ${answer}

                    </label>

                `;

            });


            html += `</div>`;

        }


        quizResult.innerHTML =
            html;


        quizResult.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    /* =========================
       INITIAL WORD COUNT
    ========================== */

    updateWordCount();

});
