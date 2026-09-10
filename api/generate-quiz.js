// =========================================
// CAMPUS SAATHI - AI QUIZ GENERATOR
// Gemini 2.5 Flash + Vercel
// =========================================

module.exports = async function handler(req, res) {

    // Only POST requests are allowed
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }


    try {

        // =========================================
        // CHECK API KEY
        // =========================================

        if (!process.env.GEMINI_API_KEY) {

            console.error(
                "GEMINI_API_KEY is missing from Vercel Environment Variables."
            );

            return res.status(500).json({
                error: "Gemini API key is not configured."
            });

        }


        // =========================================
        // GET DATA FROM FRONTEND
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
3. Make questions useful for a college student.
4. Every question must have exactly 4 answer options.
5. There must be exactly ONE correct answer.
6. Keep questions clear and understandable.
7. Make wrong answers plausible but incorrect.
8. Return ONLY valid JSON.
9. Do NOT use Markdown.
10. Do NOT put the JSON inside code fences.

Return JSON in exactly this format:

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
        // GEMINI API REQUEST
        // =========================================

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key":
                        process.env.GEMINI_API_KEY
                },

                body: JSON.stringify({

                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],

                    generationConfig: {
                        temperature: 0.7,
                        responseMimeType: "application/json"
                    }

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
        // GET GENERATED TEXT
        // =========================================

        const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text || "";


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
        // CLEAN RESPONSE
        // =========================================

        const cleanText = text
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();


        // =========================================
        // CONVERT JSON TEXT
        // =========================================

        let quiz;

        try {

            quiz = JSON.parse(cleanText);

        } catch (parseError) {

            console.error(
                "Could not parse Gemini JSON:",
                cleanText
            );

            return res.status(500).json({
                error: "Gemini returned invalid quiz data."
            });

        }


        // =========================================
        // VALIDATE QUIZ
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

        // =========================================
        // SERVER ERROR
        // =========================================

        console.error(
            "Generate quiz error:",
            error
        );

        return res.status(500).json({
            error: "Could not generate quiz."
        });

    }

};
