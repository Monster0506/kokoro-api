import { getTTS, isWarm, getLastLoadMs } from "../lib/tts-model.js";

export default async function handler(req, res) {
  const wasWarm = isWarm();
  const start = performance.now();

  try {
    await getTTS();
  } catch (err) {
    console.error("Warmup failed:", err);
    res.status(500).json({ error: "Warmup failed" });
    return;
  }

  res.status(200).json({
    wasAlreadyWarm: wasWarm,
    modelLoadMs: getLastLoadMs(),
    requestMs: Math.round(performance.now() - start),
  });
}
