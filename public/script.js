const textEl = document.getElementById("text");
const voiceEl = document.getElementById("voice");
const generateBtn = document.getElementById("generate");
const statusEl = document.getElementById("status");
const outputEl = document.getElementById("output");
const audioEl = document.getElementById("audio");
const downloadBtn = document.getElementById("download");

let objectUrl = null;

function setStatus(message, isError) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#800000" : "#000000";
}

async function generate() {
  const text = textEl.value.trim();
  if (!text) {
    setStatus("Please enter some text.", true);
    return;
  }

  generateBtn.disabled = true;
  outputEl.style.display = "none";
  setStatus("Generating...");

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: voiceEl.value }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed (${res.status})`);
    }

    const blob = await res.blob();
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
    objectUrl = URL.createObjectURL(blob);
    audioEl.src = objectUrl;
    outputEl.style.display = "block";
    setStatus("Done.");
  } catch (err) {
    setStatus(err.message || "Something went wrong.", true);
  } finally {
    generateBtn.disabled = false;
  }
}

function download() {
  if (!objectUrl) {
    return;
  }
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = `kokoro-${voiceEl.value}-${Date.now()}.wav`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

generateBtn.addEventListener("click", generate);
downloadBtn.addEventListener("click", download);
