# Kokoro TTS on Vercel

Text-to-speech on demand, running entirely in a Vercel Node.js serverless function. Uses [kokoro-js](https://www.npmjs.com/package/kokoro-js) (Kokoro-82M via Transformers.js/ONNX).

## Endpoints

- `POST /api/tts`: `{ text, voice? }` -> `audio/wav`. Returns 400 for missing
  text or an invalid voice name.
- `GET /api/warmup`: loads the model without generating audio. Useful as a
  keep-warm ping to avoid cold-start latency on real requests.

## UI

`public/index.html` is a plain static page (`styles.css` + `script.js`, no build step) for typing text, picking a voice, and playing/downloading the generated WAV. It calls `/api/tts` on the same origin.
