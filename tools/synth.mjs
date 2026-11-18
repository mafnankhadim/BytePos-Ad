// Synthesises the music bed and sound effects (no samples, no licences). Run: node tools/synth.mjs
import { writeFileSync } from "node:fs";
const SR = 44100;
const wav = (name, L, R) => {
  const n = L.length, buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 4, 40);
  const c = (x) => Math.max(-1, Math.min(1, x)) * 32767;
  for (let i = 0; i < n; i++) { buf.writeInt16LE(c(L[i]), 44 + i * 4); buf.writeInt16LE(c(R[i]), 46 + i * 4); }
  writeFileSync(name, buf);
};
const mk = (sec) => [new Float32Array(Math.floor(sec * SR)), new Float32Array(Math.floor(sec * SR))];
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

// ---- SFX ----
{ // whoosh: filtered noise swell
  const [L, R] = mk(0.9); let lp = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR, env = Math.sin(Math.PI * Math.min(1, t / 0.9)) ** 2;
    const a = 0.03 + 0.5 * env; lp += a * (rnd() - lp);
    L[i] = R[i] = lp * env * 1.6;
  }
  wav("public/sfx/whoosh.wav", L, R);
}
{ // hit: sub drop + noise thump
  const [L, R] = mk(1.6);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR, f = 48 + 110 * Math.exp(-t * 22);
    L[i] = R[i] = (Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 3.2) * 0.9) + rnd() * Math.exp(-t * 60) * 0.35;
  }
  wav("public/sfx/hit.wav", L, R);
}
{ // click: UI tap
  const [L, R] = mk(0.12);
  for (let i = 0; i < L.length; i++) { const t = i / SR; L[i] = R[i] = Math.sin(2 * Math.PI * 1900 * t) * Math.exp(-t * 70) * 0.6 + rnd() * Math.exp(-t * 200) * 0.2; }
  wav("public/sfx/click.wav", L, R);
}
{ // scanner beep
  const [L, R] = mk(0.18);
  for (let i = 0; i < L.length; i++) { const t = i / SR, g = t < 0.01 ? t / 0.01 : t > 0.14 ? Math.max(0, (0.18 - t) / 0.04) : 1; L[i] = R[i] = Math.sin(2 * Math.PI * 2350 * t) * 0.35 * g; }
  wav("public/sfx/beep.wav", L, R);
}
{ // ding: success chime
  const [L, R] = mk(1.8);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR; let s = 0;
    for (const [f, a, d] of [[1318.5, 1, 3], [2637, 0.35, 5], [3951, 0.15, 7]]) s += Math.sin(2 * Math.PI * f * t) * a * Math.exp(-t * d);
    L[i] = R[i] = s * 0.4;
  }
  wav("public/sfx/ding.wav", L, R);
}
{ // riser: rising noise + tone into the logo
  const [L, R] = mk(2.2); let lp = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR, p = t / 2.2, env = p ** 2.2;
    lp += (0.02 + 0.6 * p) * (rnd() - lp);
    L[i] = R[i] = (lp * 1.4 + Math.sin(2 * Math.PI * (200 + 1400 * p * p) * t) * 0.12) * env * (t > 2.1 ? (2.2 - t) / 0.1 : 1);
  }
  wav("public/sfx/riser.wav", L, R);
}

// ---- Music bed: 100 BPM, 45 s, C maj7 – Am7 – Fmaj7 – G, soft pad + pluck arp + gentle pulse ----
{
  const DUR = 45, BPM = 100, beat = 60 / BPM, bar = beat * 4;
  const [L, R] = mk(DUR);
  const chords = [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 55, 59]];
  const add = (i, v, pan = 0) => { L[i] += v * (1 - pan); R[i] += v * (1 + pan); };
  for (let i = 0; i < L.length; i++) {
    const t = i / SR, ci = Math.floor(t / (bar * 2)) % 4, within = (t % (bar * 2)) / (bar * 2);
    const swell = Math.min(1, within * 6) * Math.min(1, (1 - within) * 6 + 0.35);
    let pad = 0;
    for (const m of chords[ci]) for (const d of [-0.003, 0.003]) {
      const f = hz(m) * (1 + d); pad += Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t);
    }
    add(i, pad * 0.028 * swell * (0.75 + 0.25 * Math.sin(t * 0.7)), 0.15 * Math.sin(t * 0.4));
  }
  // plucks (8ths) from 4 s, soft
  for (let n = 0; n * beat / 2 < DUR; n++) {
    const t0 = n * beat / 2; if (t0 < 4) continue;
    const ch = chords[Math.floor(t0 / (bar * 2)) % 4], m = ch[[0, 2, 1, 3, 2, 1, 3, 2][n % 8]] + 24;
    const amp = t0 > 40.5 ? 0.05 : 0.07, f = hz(m), s0 = Math.floor(t0 * SR);
    for (let k = 0; k < SR * 0.5 && s0 + k < L.length; k++) {
      const t = k / SR, v = (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(4 * Math.PI * f * t)) * Math.exp(-t * 9) * amp;
      add(s0 + k, v, (n % 2 ? 0.4 : -0.4));
    }
  }
  // pulse (kick on every beat from 8.6 s)
  for (let n = 0; n * beat < DUR; n++) {
    const t0 = n * beat; if (t0 < 8.6) continue;
    const s0 = Math.floor(t0 * SR);
    for (let k = 0; k < SR * 0.35 && s0 + k < L.length; k++) {
      const t = k / SR, v = Math.sin(2 * Math.PI * (45 + 80 * Math.exp(-t * 30)) * t) * Math.exp(-t * 9) * 0.28;
      add(s0 + k, v);
    }
  }
  for (let i = 0; i < L.length; i++) { // fades
    const t = i / SR, g = Math.min(1, t / 1.5) * Math.min(1, (DUR - t) / 2.5);
    L[i] *= g; R[i] *= g;
  }
  wav("public/music/bed.wav", L, R);
}
console.log("done");
