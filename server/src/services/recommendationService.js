
import { Event } from "../models/Event.js";
import { StudentProfile } from "../models/StudentProfile.js";
import { RecommendationCache } from "../models/RecommendationCache.js";
import { rankEventsWithGroq } from "./groqService.js";



const normalize = (text) => String(text).toLowerCase().trim();

const scoreEvent = (event, interests) => {
  const eventTags = new Set((event.tags || []).map(normalize));
  const studentInterests = interests.map(normalize);

  return studentInterests.reduce(
    (score, interest) => score + (eventTags.has(interest) ? 3 : 0),
    0
  );
};

const fallbackRecommendations = (events, interests) =>
  events
    .map((event) => ({
      event,
      score: scoreEvent(event, interests)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ event }) => ({
      event,
      reason: "Matches your interests"
    }));

export const getRecommendationsForStudent = async (studentId) => {

  const cached = await RecommendationCache.findOne({ student: studentId, expiresAt: { $gt: new Date() } }).populate("eventIds");
  console.log("Recommendation service called");
  if (cached?.eventIds?.length) {
     console.log("USING CACHE");
  const activeEvents = cached.eventIds.filter(
  (event) =>
    event &&
    event.status === "active" &&
    new Date(event.deadline) > new Date() &&
    new Date(event.eventDate) > new Date()
  );
  return activeEvents.map((event) => ({
  event,
  score:
    cached.scoreMap?.get(
      String(event._id)
    ) || 0,
  reason:
    cached.reasonMap?.get(
      String(event._id)
    ) || "Recommended for you"
}));
}
  console.log("CALLING GROQ");
  const profile = await StudentProfile.findOne({ user: studentId });
  const interests = profile?.interests || [];
  const events = await Event.find({ status: "active", deadline: { $gt: new Date() } }).sort({ eventDate: 1 }).limit(50);
  let recommendations = fallbackRecommendations(events, interests);
  

  if (events.length && interests.length) {
  try {
    const topEvents =
      recommendations.length
        ? recommendations.map((r) => r.event)
        : events.slice(0, 8);

        const groqResult =
      await rankEventsWithGroq(
        interests,
        topEvents
      );

    const byId = new Map(
      events.map((event) => [
        String(event._id),
        event
      ])
    );

    const aiItems =
      (groqResult.recommendations || [])
        .map((item) => ({
          event: byId.get(item.id),
          score: item.score || 0,
          reason:
            item.reason ||
            "Recommended for you"
        }))
        .filter((item) => item.event);

        if (aiItems.length) {
      recommendations = aiItems.sort(
        (a, b) => b.score - a.score
      );
    }
  } catch (error) {
  console.warn(
  "Groq unavailable, using fallback recommendations"
  );
  }
}


  // const client = openai();
  // if (client && events.length && interests.length) {
  //   try {
  //     const prompt = {
  //       interests,
  //       events: events.map((event) => ({
  //         id: String(event._id),
  //         title: event.title,
  //         category: event.category,
  //         tags: event.tags,
  //         description: event.description.slice(0, 500)
  //       }))
  //     };
  //     const completion = await client.chat.completions.create({
  //       model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  //       temperature: 0.2,
  //       response_format: { type: "json_object" },
  //       messages: [
  //         { role: "system", content: "Return JSON with key recommendations: array of {id, reason}. Pick at most 8 college events that best match the student's interests." },
  //         { role: "user", content: JSON.stringify(prompt) }
  //       ]
  //     });
  //     const parsed = JSON.parse(completion.choices[0].message.content);
  //     const byId = new Map(events.map((event) => [String(event._id), event]));
  //     const aiItems = (parsed.recommendations || [])
  //       .map((item) => ({ event: byId.get(item.id), reason: item.reason || "AI matched this event to your interests" }))
  //       .filter((item) => item.event);
  //     if (aiItems.length) recommendations = aiItems;
  //   } catch {
  //     recommendations = fallbackRecommendations(events, interests);
  //   }
  // }

  await RecommendationCache.findOneAndUpdate(
    { student: studentId },
    {
      student: studentId,
      eventIds: recommendations.map((item) => item.event._id),
      reasonMap: Object.fromEntries(
      recommendations.map((item) => [
      String(item.event._id),
      item.reason
      ])
      ),

      scoreMap: Object.fromEntries(
      recommendations.map((item) => [
      String(item.event._id),
      item.score || 0
      ])
      ),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    },
    { upsert: true, new: true }
  );
  return recommendations;
};
