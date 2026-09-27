// QVAC Networking Follow-Up Email Writer — core logic.
// Given who the user met and what they talked about, writes a follow-up
// email draft that references the actual conversation.

import { completion } from "@qvac/sdk";

function looksUnusable(text) {
  if (!text || text.trim().length === 0) return true;
  if (text.length > 900) return true;
  const bad = ["i cannot", "i can't", "as an ai", "i'm not able", "i am not able"];
  const lower = text.toLowerCase();
  return bad.some((phrase) => lower.includes(phrase));
}

function cleanText(text) {
  return text
    .trim()
    .replace(/^here'?s[^:\n]*:\s*/i, "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
}

// Grounding check: the email should reference at least one substantial word
// from what was actually discussed, so it doesn't read as a generic template
// disconnected from the real conversation.
function isGrounded(text, topic) {
  const topicWords = topic
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 4);
  if (topicWords.length === 0) return true;
  const lower = text.toLowerCase();
  return topicWords.some((w) => lower.includes(w));
}

function fallbackEmail(person, topic) {
  return `Subject: Great meeting you, ${person}!\n\nHi ${person},\n\nIt was great meeting you and talking about ${topic}. I really enjoyed our conversation and would love to stay in touch.\n\nLet me know if you'd be open to connecting again sometime — happy to work around your schedule.\n\nBest,\n[Your name]`;
}

export async function writeFollowUp(modelId, body) {
  const person = (body.person || "").trim();
  const topic = (body.topic || "").trim();
  if (!person || !topic) {
    const err = new Error("Please fill in who you met and what you talked about.");
    err.statusCode = 400;
    throw err;
  }

  const run = completion({
    modelId,
    history: [
      {
        role: "system",
        content:
          "You write short networking follow-up emails. Given who the user " +
          "met and what they talked about, write a complete short email " +
          "(subject line + body) that specifically references the actual " +
          "conversation topic given — never invent new topics or details not " +
          "mentioned. Keep it warm, professional, and brief (under 120 words " +
          "in the body). Reply with ONLY the email, starting with 'Subject:'.",
      },
      {
        role: "user",
        content: "Met: Priya, at a design conference. Talked about: her team's shift to design systems and the challenges of getting engineering buy-in.",
      },
      {
        role: "assistant",
        content:
          "Subject: Great connecting at the design conference!\n\n" +
          "Hi Priya,\n\n" +
          "It was great meeting you at the design conference and hearing about your team's shift " +
          "to design systems, especially the challenges you've had getting engineering buy-in. " +
          "I'd love to hear how that progresses.\n\n" +
          "Would you be open to grabbing coffee or a quick call sometime? Happy to work around your schedule.\n\n" +
          "Best,\n[Your name]",
      },
      { role: "user", content: `Met: ${person}. Talked about: ${topic}` },
    ],
    stream: true,
    completionOpts: { temperature: 0.7, maxTokens: 280 },
  });

  let text = "";
  for await (const token of run.tokenStream) text += token;
  text = cleanText(text);

  const usable = !looksUnusable(text) && isGrounded(text, topic);
  const email = usable ? text : fallbackEmail(person, topic);

  return { person, topic, email };
}
