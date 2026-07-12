import { KokoroTTS } from "kokoro-js";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const DEFAULT_VOICE = "af_heart";

let ttsPromise;
function getTTS() {
  if (!ttsPromise) {
    ttsPromise = KokoroTTS.from_pretrained(MODEL_ID, {
      dtype: "q8",
      device: "cpu",
    });
  }
  return ttsPromise;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed, use POST" });
    return;
  }

  const { text, voice } = req.body ?? {};
  if (!text || typeof text !== "string") {
    res.status(400).json({ error: "Missing required field: text" });
    return;
  }

  try {
    const tts = await getTTS();
    const audio = await tts.generate(text, { voice: voice || DEFAULT_VOICE });
    const wav = await audio.toWav();
    res.setHeader("Content-Type", "audio/wav");
    res.status(200).send(Buffer.from(wav));
  } catch (err) {
    console.error("TTS generation failed:", err);
    res.status(500).json({ error: "TTS generation failed" });
  }
}
