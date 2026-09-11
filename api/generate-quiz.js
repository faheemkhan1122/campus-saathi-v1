// =========================================
// CAMPUS SAATHI - AI QUIZ GENERATOR
// Gemini 3.6 Flash + Interactions API
// =========================================

module.exports = async function handler(req, res) {

    // =========================================
    // ONLY POST REQUEST
    // =========================================

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        // =========================================
        // CHECK API KEY
        // =========================================

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {

            console.error("GEMINI_API_KEY is missing.");

            return res.status(500).json({
                error: "Gemini API key is not configured."
            });
        }


        // =========================================
        // GET FRONTEND DATA
        // =========================================

        const {
            notes,
            questionCount,
            difficulty,
            quizType
        } = req.body || {};


        // =========================================
        // VALIDATE NOTES
        // =========================================

        if (!notes || !notes.trim()) {

            return res.status(400).json({
                error: "Notes are required."
            });
        }


        // =========================================
        // NORMALIZE QUIZ TYPE
        // =========================================

        const selectedQuizType =
            String(quizType || "multiple").toLowerCase().trim();


        // =========================================
        // QUIZ TYPE INSTRUCTIONS
        // =========================================

        let quizTypeInstructions = "";

        if (selectedQuizType === "multiple") {

            quizTypeInstructions = `
QUIZ TYPE: MULTIPLE CHOICE

Every question MUST be a Multiple Choice Question.

Rules:
- Each question MUST have exactly 4 answer options.
- There MUST be exactly 1 correct answer.
- All 4 options must be different.
- correctAnswer must exactly match one of the 4 answers.
`;

        } else if (selectedQuizType === "truefalse") {

            quizTypeInstructions = `
QUIZ TYPE: TRUE / FALSE

Every question MUST be a True/False question.

Rules:
- Each question MUST have exactly 2 answer options.
- The ONLY allowed answer options are:
  "True"
  "False"
- There MUST be exactly 1 correct answer.
- correctAnswer MUST be exactly either "True" or "False".
- Do NOT create A/B/C/D options.
- Do NOT create multiple-choice questions.
`;

        } else if (selectedQuizType === "mixed") {

            quizTypeInstructions = `
QUIZ TYPE: MIXED

Create a mixture of Multiple Choice and True/False questions.

Rules:
- Some questions MUST be Multiple Choice.
- Some questions MUST be True/False.
- For Multiple Choice questions:
  - exactly 4 answer options
  - exactly 1 correct answer
- For True/False questions:
  - exactly 2 answer options
  - the options MUST be exactly "True" and "False"
  - exactly 1 correct answer
- Do NOT make all questions the same type.
- The mixed quiz MUST contain at least one Multiple Choice question
  AND at least one True/False question.
`;

        } else {

            quizTypeInstructions = `
QUIZ TYPE: MULTIPLE CHOICE

Create Multiple Choice questions with exactly 4 options
and exactly 1 correct answer.
`;

        }


        // =========================================
        // AI PROMPT
        // =========================================

        const prompt = `
You are an AI study assistant for Campus Saathi.

Create a practice quiz ONLY from the student's notes.

STUDENT NOTES:
${notes}

QUIZ REQUIREMENTS:

- Number of questions: ${questionCount || 5}
- Difficulty: ${difficulty || "Easy"}

${quizTypeInstructions}

IMPORTANT GENERAL RULES:

1. Questions MUST be based ONLY on the provided notes.
2. Do NOT invent information that is not present in the notes.
3. Create exactly ${questionCount || 5} questions.
4. Keep questions clear and understandable.
5. Make questions useful for a college student.
6. Wrong answers must be plausible but incorrect.
7. Each question must have exactly ONE correct answer.
8. correctAnswer must exactly match one of the values inside answers.
9. Return ONLY valid JSON.
10. Do NOT use Markdown.
11. Do NOT use code fences.
12. Do NOT add explanations outside the JSON.

IMPORTANT:
Follow the selected QUIZ TYPE exactly.
Do NOT convert True/False questions into Multiple Choice questions.

Return this JSON structure:

{
  "questions": [
    {
      "question": "Question here",
      "answers": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": "Option A"
    }
  ]
}

For a True/False question, the structure MUST instead be:

{
  "questions": [
    {
      "question": "The statement here",
      "answers": [
        "True",
        "False"
      ],
      "correctAnswer": "True"
    }
  ]
}

For MIXED quizzes, each question may use either the 4-option format
or the True/False 2-option format.
`;


        // =========================================
        // GEMINI INTERACTIONS API
        // =========================================

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/interactions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey
                },

                body: JSON.stringify({

                    model: "gemini-3.6-flash",

                    input: prompt,

                    response_format: [
                        {
                            type: "text",

                            mime_type: "application/json",

                            schema: {

                                type: "object",

                                properties: {

                                    questions: {

                                        type: "array",

                                        items: {

                                            type: "object",

                                            properties: {

                                                question: {
                                                    type: "string"
                                                },

                                                answers: {

                                                    type: "array",

                                                    items: {
                                                        type: "string"
                                                    }
                                                },

                                                correctAnswer: {
                                                    type: "string"
                                                }

                                            },

                                            required: [
                                                "question",
                                                "answers",
                                                "correctAnswer"
                                            ]
                                        }
                                    }

                                },

                                required: [
                                    "questions"
                                ]
                            }
                        }
                    ]
                })
            }
        );


        // =========================================
        // READ GEMINI RESPONSE
        // =========================================

        const data = await response.json();


        // =========================================
        // GEMINI ERROR
        // =========================================

        if (!response.ok) {

            console.error(
                "Gemini API error:",
                data
            );

            return res.status(500).json({
                error: "Gemini API request failed.",
                details: data
            });
        }


        // =========================================
        // FIND MODEL OUTPUT
        // =========================================

        let text = "";

        if (Array.isArray(data.steps)) {

            for (const step of data.steps) {

                if (
                    step.type === "model_output" &&
                    Array.isArray(step.content)
                ) {

                    for (const content of step.content) {

                        if (
                            content.type === "text" &&
                            content.text
                        ) {

                            text += content.text;
                        }
                    }
                }
            }
        }


        // =========================================
        // FALLBACK OUTPUT
        // =========================================

        if (!text && data.output_text) {
            text = data.output_text;
        }

        text = String(text).trim();


        // =========================================
        // EMPTY RESPONSE CHECK
        // =========================================

        if (!text) {

            console.error(
                "Gemini returned empty response:",
                data
            );

            return res.status(500).json({
                error: "Gemini returned an empty response."
            });
        }


        // =========================================
        // PARSE JSON
        // =========================================

        let quiz;

        try {

            quiz = JSON.parse(text);

        } catch (parseError) {

            console.error(
                "Quiz JSON parsing failed:",
                text
            );

            return res.status(500).json({
                error: "Gemini returned invalid quiz data."
            });
        }


        // =========================================
        // VALIDATE QUESTIONS
        // =========================================

        if (
            !quiz ||
            !Array.isArray(quiz.questions) ||
            quiz.questions.length === 0
        ) {

            console.error(
                "Invalid quiz structure:",
                quiz
            );

            return res.status(500).json({
                error: "Gemini did not return valid questions."
            });
        }


        // =========================================
        // VALIDATE QUIZ TYPE
        // =========================================

        for (const question of quiz.questions) {

            if (
                !question.question ||
                !Array.isArray(question.answers) ||
                !question.correctAnswer
            ) {

                console.error(
                    "Invalid question:",
                    question
                );

                return res.status(500).json({
                    error: "Gemini returned an invalid question."
                });
            }


            // -----------------------------------------
            // MULTIPLE CHOICE VALIDATION
            // -----------------------------------------

            if (selectedQuizType === "multiple") {

                if (question.answers.length !== 4) {

                    console.error(
                        "Invalid Multiple Choice question:",
                        question
                    );

                    return res.status(500).json({
                        error:
                            "AI returned an invalid Multiple Choice question. Please try again."
                    });
                }
            }


            // -----------------------------------------
            // TRUE / FALSE VALIDATION
            // -----------------------------------------

            if (selectedQuizType === "truefalse") {

                const validTrueFalse =
                    question.answers.length === 2 &&
                    question.answers.includes("True") &&
                    question.answers.includes("False") &&
                    (
                        question.correctAnswer === "True" ||
                        question.correctAnswer === "False"
                    );

                if (!validTrueFalse) {

                    console.error(
                        "Invalid True/False question:",
                        question
                    );

                    return res.status(500).json({
                        error:
                            "AI returned an invalid True/False question. Please try again."
                    });
                }
            }


            // -----------------------------------------
            // CHECK CORRECT ANSWER
            // -----------------------------------------

            if (
                !question.answers.includes(
                    question.correctAnswer
                )
            ) {

                console.error(
                    "Correct answer not found in answers:",
                    question
                );

                return res.status(500).json({
                    error:
                        "AI returned an invalid correct answer. Please try again."
                });
            }
        }


        // =========================================
        // MIXED QUIZ VALIDATION
        // =========================================

        if (selectedQuizType === "mixed") {

            let hasMultipleChoice = false;
            let hasTrueFalse = false;

            for (const question of quiz.questions) {

                if (question.answers.length === 4) {
                    hasMultipleChoice = true;
                }

                if (
                    question.answers.length === 2 &&
                    question.answers.includes("True") &&
                    question.answers.includes("False")
                ) {
                    hasTrueFalse = true;
                }
            }

            if (
                !hasMultipleChoice ||
                !hasTrueFalse
            ) {

                console.error(
                    "Mixed quiz did not contain both question types:",
                    quiz
                );

                return res.status(500).json({
                    error:
                        "AI did not create a proper mixed quiz. Please try again."
                });
            }
        }


        // =========================================
        // SEND QUIZ TO FRONTEND
        // =========================================

        return res.status(200).json({

            questions:
                quiz.questions

        });


    } catch (error) {

        console.error(
            "Generate quiz error:",
            error
        );

        return res.status(500).json({
            error: "Could not generate quiz."
        });
    }

};
