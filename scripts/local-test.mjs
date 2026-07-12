import { writeFile } from "node:fs/promises";
import ttsHandler from "../api/tts.js";
import warmupHandler from "../api/warmup.js";

function makeRes() {
  const res = {
    statusCode: 200,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, value) {
      this.headers[key] = value;
      return this;
    },
    json(body) {
      console.log(`[${this.statusCode}]`, body, this.headers);
    },
    async send(buffer) {
      if (this.statusCode !== 200) {
        console.log(`[${this.statusCode}]`, buffer.toString());
        return;
      }
      console.log(`[${this.statusCode}] audio/wav, ${buffer.length} bytes`, this.headers);
      res.lastBuffer = buffer;
    },
  };
  return res;
}

console.log("--- 1. Cold warmup (triggers model load) ---");
const warm1 = makeRes();
await warmupHandler({ method: "GET" }, warm1);

console.log("\n--- 2. Warm warmup (should be instant, no reload) ---");
const warm2 = makeRes();
await warmupHandler({ method: "GET" }, warm2);

console.log("\n--- 3. Generate speech (should reuse the warm model) ---");
const ttsRes = makeRes();
await ttsHandler(
  { method: "POST", body: { text: "Hello from Kokoro running as a pure Node.js function." } },
  ttsRes,
);
if (ttsRes.lastBuffer) {
  await writeFile(new URL("../output.wav", import.meta.url), ttsRes.lastBuffer);
  console.log("wrote output.wav");
}

console.log("\n--- 4. Invalid voice should return 400, not 500 ---");
const badVoiceRes = makeRes();
await ttsHandler(
  { method: "POST", body: { text: "test", voice: "not_a_real_voice" } },
  badVoiceRes,
);
