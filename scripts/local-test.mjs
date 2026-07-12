import { writeFile } from "node:fs/promises";
import handler from "../api/tts.js";

const req = {
  method: "POST",
  body: { text: "Hello from Kokoro running as a pure Node.js function." },
};

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
    console.log(`[${this.statusCode}]`, body);
  },
  async send(buffer) {
    if (this.statusCode !== 200) {
      console.log(`[${this.statusCode}]`, buffer.toString());
      return;
    }
    await writeFile(new URL("../output.wav", import.meta.url), buffer);
    console.log(`[${this.statusCode}] wrote output.wav (${buffer.length} bytes)`);
  },
};

console.log("Calling handler (first call loads the model, may take a while)...");
await handler(req, res);
