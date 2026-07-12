import os from "node:os";
import path from "node:path";
import { KokoroTTS, env as kokoroEnv } from "kokoro-js";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const DTYPE = "q8";

// node_modules is read-only on Vercel's deployed runtime; only /tmp is writable.
kokoroEnv.cacheDir = path.join(os.tmpdir(), "kokoro-model-cache");

let ttsPromise;
let lastLoadMs = null;

export function getTTS() {
  if (!ttsPromise) {
    const start = performance.now();
    ttsPromise = KokoroTTS.from_pretrained(MODEL_ID, {
      dtype: DTYPE,
      device: "cpu",
    })
      .then((tts) => {
        lastLoadMs = performance.now() - start;
        return tts;
      })
      .catch((err) => {
        // Don't cache a rejected promise forever - let the next request retry.
        ttsPromise = undefined;
        throw err;
      });
  }
  return ttsPromise;
}

export function isWarm() {
  return ttsPromise !== undefined && lastLoadMs !== null;
}

export function getLastLoadMs() {
  return lastLoadMs;
}
