import { getTTS, isWarm } from "../lib/tts-model.js";

const DEFAULT_VOICE = "af_heart";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed, use POST" });
    return;
  }

  const { text, voice, speed } = req.body ?? {};
  if (!text || typeof text !== "string") {
    res.status(400).json({ error: "Missing required field: text" });
    return;
  }

  const wasWarm = isWarm();

  try {
    const tts = await getTTS();
    const audio = await tts.generate(text, {
      voice: voice || DEFAULT_VOICE,
      speed: typeof speed === "number" ? speed : 1,
    });
    const wav = await audio.toWav();
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("X-Model-Was-Warm", String(wasWarm));
    res.status(200).send(Buffer.from(wav));
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Voice "')) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("TTS generation failed:", err);
    res.status(500).json({ error: "TTS generation failed" });
  }
}
