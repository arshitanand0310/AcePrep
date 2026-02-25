import aiClient from "./aiClient.js";


const recentQuestionsMemory = new Map();

function isSimilar(q1, q2) {
    const a = q1.toLowerCase().replace(/[^\w\s]/g, "");
    const b = q2.toLowerCase().replace(/[^\w\s]/g, "");
    return a.includes(b.slice(0, 25)) || b.includes(a.slice(0, 25));
}

function filterDuplicates(topic, questions) {
    const old = recentQuestionsMemory.get(topic) || [];
    const unique = questions.filter(q =>
        !old.some(prev => isSimilar(prev, q))
    );

    recentQuestionsMemory.set(topic, [...old, ...unique].slice(-40));
    return unique;
}


export const generateInterviewQuestions = async(input, difficulty = "medium") => {
    try {

        const interviewerRules = `
You are a professional SOFTWARE ENGINEERING INTERVIEWER conducting a LIVE spoken interview.

You are speaking to a human candidate — NOT giving an exam.

---------------- INTERVIEW STYLE ----------------
- Ask short spoken questions
- Candidate answers verbally (1–3 minutes)
- Focus on understanding, reasoning and decisions
- Ask conceptual & real-world thinking questions

---------------- STRICTLY FORBIDDEN ----------------
DO NOT ASK:
- coding problems
- algorithms to implement
- write code / pseudo code
- build projects / apps / APIs
- UI design
- database schema design
- architecture diagrams
- step-by-step procedures

Instead → ask them to EXPLAIN & THINK.

---------------- DIFFICULTY RULES ----------------

EASY:
- definitions
- purpose of concept
- simple comparisons
- no edge cases

MEDIUM:
- tradeoffs
- real world usage
- choosing between approaches
- practical reasoning

HARD:
- failure scenarios
- edge cases
- performance problems
- debugging situations
- system behavior under stress

YOU MUST STRICTLY FOLLOW THE SELECTED DIFFICULTY.

---------------- ANTI-REPETITION ----------------
Each interview must feel DIFFERENT from previous ones.
Avoid famous textbook questions.
Rephrase concepts creatively.

Generate EXACTLY 5 questions.

Return ONLY JSON:
[
 {"question":"..."},
 {"question":"..."},
 {"question":"..."},
 {"question":"..."},
 {"question":"..."}
]
`;

        let messages;


        if (typeof input === "string") {
            messages = [
                { role: "system", content: interviewerRules },
                { role: "user", content: `Topic: ${input}\nDifficulty: ${difficulty}\nMake the questions unique and new.` }
            ];
        } else {
            messages = [
                { role: "system", content: interviewerRules },
                {
                    role: "user",
                    content: `
Candidate Profile:
Role: ${input.role}
Experience: ${input.experience_level}
Skills: ${input.skills?.join(", ")}
Technologies: ${input.technologies?.join(", ")}
Projects: ${input.projects?.join(", ")}

Difficulty: ${difficulty}

Ask questions relevant to THIS PERSON specifically.
Make every interview different.
`
                }
            ];
        }

        const completion = await aiClient.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0.9,
            top_p: 0.9,
            frequency_penalty: 0.7,
            presence_penalty: 0.8,
            messages
        });

        const raw = completion.choices[0].message.content;
        const jsonMatch = raw.match(/\[[\s\S]*\]/);

        if (!jsonMatch) throw new Error("AI returned non JSON");

        let parsed = JSON.parse(jsonMatch[0]).map(q => q.question);


        parsed = filterDuplicates(typeof input === "string" ? input : input.role, parsed);

        // guarantee 5
        if (parsed.length < 5) {
            parsed = [...parsed,
                `Explain a real-world situation where ${typeof input === "string" ? input : input.role} could fail and how you would detect it.`,
                `What tradeoffs appear when scaling ${typeof input === "string" ? input : input.role}?`
            ].slice(0, 5);
        }

        return parsed.slice(0, 5);

    } catch (err) {
        console.error("Question generation failed:", err.message);
        throw new Error("AI question generation failed");
    }
};



export const evaluateAnswer = async(question, answer) => {
    try {

        const completion = await aiClient.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0.2,
            messages: [{
                    role: "system",
                    content: `
You are a real human interviewer evaluating a spoken explanation.

Scoring Guide:
0-2  incorrect
3-5  partial understanding
6-7  correct but shallow
8-9  strong reasoning
10   excellent clarity

Rules:
- Ignore grammar mistakes
- Ignore syntax
- Focus only on understanding
- Give short helpful feedback

Return JSON:
{
 "score": number,
 "feedback": "one improvement tip",
 "idealAnswer": "key concept they missed"
}
`
                },
                {
                    role: "user",
                    content: `
Question: ${question}
Candidate Answer: ${answer}
`
                }
            ]
        });

        const raw = completion.choices[0].message.content;
        const jsonMatch = raw.match(/\{[\s\S]*\}/);

        return JSON.parse(jsonMatch[0]);

    } catch (err) {
        console.error("Evaluation failed:", err.message);
        throw new Error("AI evaluation failed");
    }
};