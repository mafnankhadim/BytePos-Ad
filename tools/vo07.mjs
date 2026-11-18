import { KokoroTTS } from "kokoro-js";
import { writeFileSync } from "node:fs";
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });
const a = await tts.generate("BytePOS. Available now on Google Play. Download it free today.", { voice: "af_heart", speed: 0.95 });
writeFileSync("public/vo/07.wav", Buffer.from(a.toWav()));
