import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

/*
 * A host profile answers a message with a short, friendly line — a greeting, a
 * small question back, or a light deflection. It never answers specifics about
 * itself, so it stays a pleasant hello rather than a fake source of facts.
 */

const GREETINGS = ["Hey! 👋", "Hi there!", "Hey you!", "Well hello 👋"];

const GREETING_QUESTIONS = [
  "Where are you from?",
  "How's your day going?",
  "What are you up to today?",
  "You from around here?",
];

const SMALL_TALK = [
  "Nice! Where are you from?",
  "That's cool. How do you usually spend your free time?",
  "Love that. What's your week looking like?",
  "Good to know 😊 You from around here?",
];

const DEFLECTIONS = [
  "Haha, that's a long story for another day. What about you?",
  "Honestly, I'll keep that one to myself 😄 Where are you from?",
  "Can't give away all my secrets. What do you do for fun?",
  "Ha — ask me that one in person sometime. You local?",
];

const pick = (list, seed) => list[Math.abs(seed) % list.length];

function composeReply(persona, text) {
  const t = (text || "").toLowerCase().trim();
  const seed = (text || "").length + (persona.persona_key || "").length + persona.name.length;
  const interest = (persona.interests && persona.interests[0]) || "just being outside";
  const second = (persona.interests && persona.interests[1]) || "live music";

  if (!t) return pick(SMALL_TALK, seed);

  if (/(^|\s)(hi|hey|hello|heyy|yo|sup|howdy|good morning|good evening)(\s|$|[!.,?])/.test(t)) {
    return `${pick(GREETINGS, seed)} ${pick(GREETING_QUESTIONS, seed + 1)}`;
  }
  if (/(how are you|how's it going|hows it going|how are things|you good)/.test(t)) {
    return "Doing pretty good over here, thanks for asking! How about you — busy day?";
  }
  if (/(where (are|r) (you|u) (from|at|based)|what city|where do you live|what state)/.test(t)) {
    return `I'm out in ${persona.city}, ${persona.state}. Have you ever been through this way?`;
  }
  if (/(how old|your age|old are you|birthday)/.test(t)) {
    return "Old enough to know better 😄 What about you?";
  }
  if (/(free time|hobbies|for fun|weekend|do you do|into)/.test(t)) {
    return `Mostly ${interest} and ${second} lately. What do you do for fun?`;
  }
  if (/(job|work|career|what do you do for a living)/.test(t)) {
    return `I do ${persona.job || "a bit of everything"} work over here. What keeps you busy?`;
  }
  if (/(single|married|relationship|dating|girlfriend|boyfriend)/.test(t)) {
    return "Ha, that's a whole story. Are you from around here?";
  }
  if (/(meet|hang out|grab a drink|coffee|come out|this weekend)/.test(t)) {
    return `I host a few things around ${persona.city} — keep an eye on the map and come through sometime. What are you into?`;
  }
  if (/(thank|thanks|appreciate)/.test(t)) {
    return "Anytime! 😊";
  }
  if (/\?$/.test(t) || /^(what|who|where|when|why|how|do|did|are|is|can|would|will|have|has)\b/.test(t)) {
    return pick(DEFLECTIONS, seed);
  }
  return pick(SMALL_TALK, seed);
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { conversation_id, persona_id, text } = body;
    if (!conversation_id || !persona_id) {
      return Response.json({ error: "conversation_id and persona_id are required" }, { status: 400 });
    }

    // The caller must be in the conversation, and the persona must be the other member.
    const conversation = await base44.entities.Conversation
      .get(conversation_id)
      .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!conversation) return Response.json({ error: "Not found" }, { status: 404 });
    const members = conversation.member_ids || [];
    if (!members.includes(user.id) || !members.includes(persona_id)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const persona = await base44.asServiceRole.entities.Persona
      .get(persona_id)
      .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!persona) return Response.json({ error: "Not found" }, { status: 404 });

    const reply = composeReply(persona, text);

    await base44.asServiceRole.entities.Message.create({
      conversation_id,
      sender_id: persona.id,
      sender_name: persona.name,
      sender_avatar: persona.avatar_url || "",
      content: reply,
      member_ids: members,
    });
    await base44.asServiceRole.entities.Conversation.update(conversation_id, {
      last_message: reply,
      last_message_at: new Date().toISOString(),
      last_sender_id: persona.id,
    }).catch(() => {});

    return Response.json({ reply });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}