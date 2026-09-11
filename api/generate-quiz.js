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

            console.error(
                "GEMINI_API_KEY is missing."
            );

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
        // AI PROMPT
        // =========================================

        const prompt = `
You are an AI study assistant for Campus Saathi.

Create a practice quiz from the student's notes.

STUDENT NOTES:
${notes}

QUIZ REQUIREMENTS:

- Number of questions: ${questionCount || 5}
- Difficulty: ${difficulty || "Easy"}
- Quiz type: ${quizType || "Multiple Choice"}

IMPORTANT RULES:

1. Questions must be based ONLY on the provided notes.
2. Do not invent information.
3. Make the questions useful for a college student.
4. Create exactly ${questionCount || 5} questions.
5. Every question must have exactly 4 answer options.
6. There must be exactly ONE correct answer.
7. Keep questions clear and understandable.
8. Wrong answers should be plausible but incorrect.
9. Return ONLY valid JSON.
10. Do not use Markdown.
11. Do not use code fences.

Return this exact JSON structure:

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

                            mime_type:
                                "application/json",

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
