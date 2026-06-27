import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const rankEventsWithGroq = async (
  interests,
  events
) => {
  const prompt = `
Student interests:
${interests.join(", ")}

Events:
${JSON.stringify(
  events.map((e) => ({
    id: String(e._id),
    title: e.title,
    category: e.category,
    tags: e.tags,
    description: e.description
  }))
)}

Return ONLY valid JSON:

{
  "recommendations": [
    {
      "id": "...",
      "score": 95,
      "reason": "Matches AI and coding interests"
    }
  ]
}
`;

  const completion =
    await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are an event recommendation engine. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

  const text =
    completion.choices[0].message.content;

  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
    console.log("========== GROQ RAW ==========");
    console.log(text);
    console.log("================================");
  return JSON.parse(cleaned);
};