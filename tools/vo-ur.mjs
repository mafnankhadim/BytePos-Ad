// Urdu voiceover via Microsoft's Edge read-aloud voice (ur-PK-UzmaNeural). Only the ad lines below are sent.
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { writeFileSync } from "node:fs";
const LINES = {
  "01": "دکان چلانا کبھی نہیں رکتا۔",
  "02": "ملیے بائٹ پی او ایس سے۔ سمجھداری سے بیچیں، تیزی سے بڑھیں۔",
  "03": "اسکین کریں، شامل کریں، اور سیکنڈوں میں بل بنائیں۔ انٹرنیٹ کے بغیر بھی۔",
  "04": "ہر ادھار کا حساب رکھیں۔ کبھی نہ بھولیں کہ کس سے کیا لینا ہے۔",
  "05": "ہر روز اپنا اصل منافع دیکھیں۔",
  "06": "فون پر، ویب پر، کمپیوٹر پر۔ ایک دکان، ہمیشہ ہم آہنگ۔",
  "07": "بائٹ پی او ایس۔ اب گوگل پلے پر دستیاب ہے۔ آج ہی مفت ڈاؤن لوڈ کریں۔",
};
for (const [id, text] of Object.entries(LINES)) {
  let ok = false;
  for (let attempt = 1; attempt <= 8 && !ok; attempt++) {
    try {
      const tts = new MsEdgeTTS({ synthesisTimeoutMs: 40000 });
      await tts.setMetadata("ur-PK-UzmaNeural", OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(text);
      const chunks = [];
      await new Promise((res, rej) => { audioStream.on("data", (d) => chunks.push(d)); audioStream.on("close", res); audioStream.on("error", rej); });
      writeFileSync(`public/vo-ur/${id}.mp3`, Buffer.concat(chunks));
      console.log(id, "ok after", attempt, "try");
      ok = true;
    } catch (e) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  if (!ok) console.log(id, "FAILED");
}
