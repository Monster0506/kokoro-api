import { KokoroTTS } from "kokoro-js";
import { env as transformersEnv } from "@huggingface/transformers";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const DTYPE = "q8";

transformersEnv.useFSCache = false;

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
