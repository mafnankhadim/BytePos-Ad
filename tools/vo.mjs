// Generates one WAV per narration line with the local Kokoro model (no paid service).
import { KokoroTTS } from "kokoro-js";
import { writeFileSync } from "node:fs";
const LINES = {
  "01": "Running a shop never stops.",
  "02": "Meet BytePOS. Sell smart. Grow fast.",
  "03": "Scan, add, and check out in seconds. Even without internet.",
  "04": "Track every udhaar. Never forget who owes what.",
  "05": "See your real profit, every single day.",
  "06": "On your phone, on the web, on your computer. One shop, always in sync.",
  "07": "BytePOS. Available now on Google Play. Download it free today.",
};
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });
for (const [id, text] of Object.entries(LINES)) {
  const audio = await tts.generate(text, { voice: "af_heart", speed: 0.95 });
  writeFileSync(`public/vo/${id}.wav`, Buffer.from(audio.toWav()));
  console.log(id, "ok");
}
