import ai from "./aiClient.js";

/* ---------------- SAFE JSON EXTRACTOR ---------------- */
function extractJSON(text) {
    if (!text) return null;

    // remove markdown code blocks
    text = text.replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    // find first { ... }
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) return null;

    try {
        return JSON.parse(text.slice(start, end + 1));
    } catch {
        return null;
    }
}


function normalizeProjects(projects) {
    if (!Array.isArray(projects)) return [];

    return projects.map(p => ({
        name: String(p?.name || "Project"),
        description: String(p?.description || ""),
        tech_stack: Array.isArray(p?.tech_stack) ?
            p.tech_stack.map(t => String(t)) : []
    }));
}


function fallbackProfile() {
    return {
        role: "Software Developer",
        experience_level: "fresher",
        skills: [],
        technologies: [],
        projects: []
    };
}


export const analyzeResume = async(resumeText) => {

    const prompt = `
Extract candidate profile from resume.

Return ONLY valid JSON.

{
  "role": "frontend | backend | fullstack | data | devops | mobile | other",
  "experience_level": "fresher | junior | mid | senior",
  "skills": ["skills"],
  "technologies": ["tech"],
  "projects": [
    {
      "name": "project name",
      "description": "short",
      "tech_stack": ["tech"]
    }
  ]
}

Resume:
${resumeText.slice(0, 12000)}
`;

    try {
        const res = await ai.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0.1,
            messages: [{ role: "user", content: prompt }]
        });

        const raw = res.choices?.[0]?.message?.content;

        const parsed = extractJSON(raw);
        if (!parsed) {
            console.log("AI returned invalid JSON");
            return fallbackProfile();
        }

        return {
            role: parsed.role || "Software Developer",
            experience_level: parsed.experience_level || "fresher",
            skills: Array.isArray(parsed.skills) ? parsed.skills : [],
            technologies: Array.isArray(parsed.technologies) ? parsed.technologies : [],
            projects: normalizeProjects(parsed.projects)
        };

    } catch (err) {
        console.log("AI ANALYSIS FAILED:", err.message);
        return fallbackProfile();
    }
};