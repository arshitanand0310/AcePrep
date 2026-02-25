import aiClient from "./aiClient.js";



export const evaluateAnswer = async(question, userAnswer) => {
    try {
        const completion = await aiClient.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0.2,

            messages: [{
                    role: "system",
                    content: `
You are a strict technical interviewer.

Evaluate the candidate's answer.

Return ONLY valid JSON.
No explanation.
No markdown.
No extra text.

Format:
{
  "score": number (0-10),
  "feedback": "short feedback",
  "missing": ["concept", "concept"]
}
`
                },
                {
                    role: "user",
                    content: `
Question:
${question}

Candidate Answer:
${userAnswer}
`
                }
            ]
        });

        let raw = completion.choices[0].message.content;


        raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

        const parsed = JSON.parse(raw);

        return {
            score: Number(parsed.score) || 0,
            feedback: parsed.feedback || "No feedback",
            missing: parsed.missing || []
        };

    } catch (err) {
        console.error("Answer evaluation failed:", err.message);


        return {
            score: 0,
            feedback: "Evaluation failed",
            missing: []
        };
    }
};