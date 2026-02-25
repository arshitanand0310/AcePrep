import aiClient from "./aiClient.js";

export const generateFinalReport = async(interview) => {
    try {

        const transcript = interview.answers.map((a, i) => `
Q${i + 1}: ${a.question}
Answer: ${a.userAnswer}
Score: ${a.score}/10
Feedback: ${a.feedback}
`).join("\n");

        const completion = await aiClient.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
            messages: [{
                    role: "system",
                    content: `
You are a senior technical interviewer writing the final hiring report.

Return ONLY VALID JSON.

Format:
{
 "verdict": "Hire | Lean Hire | No Hire",
 "confidence": "Low | Medium | High",
 "summary": "2-3 sentence evaluation",
 "strengths": ["point", "point"],
 "weaknesses": ["point", "point"],
 "suggested_topics": ["topic", "topic"]
}`
                },
                {
                    role: "user",
                    content: `Interview Transcript:\n${transcript}`
                }
            ]
        });


        let parsed;
        try {
            parsed = JSON.parse(completion.choices[0].message.content);
        } catch {
            throw new Error("AI returned invalid JSON");
        }

        return {
            ...parsed,
            questionBreakdown: interview.answers.map(a => ({
                question: a.question,
                score: a.score,
                feedback: a.feedback
            })),
            totalScore: interview.answers.reduce((sum, a) => sum + a.score, 0)
        };

    } catch (err) {
        console.error("Final report generation failed:", err.message);


        const total = interview.answers.reduce((sum, a) => sum + a.score, 0);
        const avg = total / interview.answers.length;

        return {
            verdict: avg >= 7 ? "Lean Hire" : "No Hire",
            confidence: "Low",
            summary: "AI report generation failed. Showing system evaluation.",
            strengths: ["Some correct technical understanding"],
            weaknesses: ["Needs more conceptual clarity"],
            suggested_topics: ["Core fundamentals", "Problem solving"],
            questionBreakdown: interview.answers.map(a => ({
                question: a.question,
                score: a.score,
                feedback: a.feedback
            })),
            totalScore: total
        };
    }
};