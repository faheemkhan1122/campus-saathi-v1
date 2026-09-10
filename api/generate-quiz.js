export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { notes, questionCount, difficulty, quizType } = req.body;

        if (!notes || !notes.trim()) {
            return res.status(400).json({
                error: "Notes are required."
            });
        }

        const prompt = `
You are an AI study assistant for Campus Saathi.

Create a practice quiz from the student's notes.

Notes:
${notes}

Requirements:
- Number of questions: ${questionCount || 5}
- Difficulty: ${difficulty || "Easy"}
- Quiz type: ${quizType || "Multiple Choice"}
- Questions must be based ONLY on the provided notes.
- Make the questions useful for a college student.
- Do not invent information.

Return ONLY valid JSON in this exact format:

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

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
            process.env.GEMINI_API_KEY,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
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
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API error:", data);

            return res.status(500).json({
                error: "Gemini API request failed.",
                details: data
            });
        }

        const text =
            data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        const cleanText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const quiz = JSON.parse(cleanText);

        return res.status(200).json(quiz);

    } catch (error) {

        console.error("Generate quiz error:", error);

        return res.status(500).json({
            error: "Could not generate quiz."
        });
    }
}