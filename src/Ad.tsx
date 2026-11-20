import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadArabic } from "@remotion/google-fonts/NotoSansArabic";

const latin = loadFont("normal", { weights: ["500", "700", "800"], subsets: ["latin"] }).fontFamily;
const arabic = loadArabic("normal", { weights: ["500", "700", "800"], subsets: ["arabic"] }).fontFamily;
export const fontFamily = `${latin}, ${arabic}`;

export const GREEN = "#16A34A";
export const GREEN_LIGHT = "#4ADE80";
export const INK = "#050B07";

export type Lang = "en" | "ur";
const STR = {
  en: {
    hook: ["Running a shop", "never stops."],
    tagline: "SELL SMART. GROW FAST.",
    sell: { head: ["Checkout", "in seconds."], s1: "Scan", s2: "Add", s3: "Pay", offline: "Works fully offline", done: "Sale complete", change: "Change Rs 330" },
    ledger: { head: ["Every udhaar,", "tracked."], sub: "Know exactly who owes what." },
    profit: { head: ["Real profit.", "Every day."], label: "NET PROFIT TODAY", margin: "13% gross margin" },
    devices: { words: ["Phone.", "Web.", "Computer."], sub: "One shop, always in sync.", c1: "Staff roles", c2: "6 languages", c3: "Offline-first" },
    cta: { head: ["Start free", "today."], avail: "Available now on Google Play", web: "Web app: bytepos.vercel.app", scan: "Scan to download" },
  },
  ur: {
    hook: ["دکان چلانا", "کبھی نہیں رکتا۔"],
    tagline: "SELL SMART. GROW FAST.",
    sell: { head: ["سیکنڈوں میں", "بل بنائیں۔"], s1: "اسکین", s2: "شامل کریں", s3: "ادائیگی", offline: "انٹرنیٹ کے بغیر بھی چلتا ہے", done: "سیل مکمل", change: "باقی رقم Rs 330" },
    ledger: { head: ["ہر ادھار کا", "حساب۔"], sub: "جانیں کس سے کیا لینا ہے۔" },
    profit: { head: ["اصل منافع۔", "ہر روز۔"], label: "آج کا خالص منافع", margin: "13% مجموعی مارجن" },
    devices: { words: ["فون۔", "ویب۔", "کمپیوٹر۔"], sub: "ایک دکان، ہمیشہ ہم آہنگ۔", c1: "اسٹاف رولز", c2: "6 زبانیں", c3: "آف لائن فرسٹ" },
    cta: { head: ["آج ہی مفت", "شروع کریں۔"], avail: "گوگل پلے پر دستیاب ہے", web: "ویب ایپ: bytepos.vercel.app", scan: "اسکین کر کے ڈاؤن لوڈ کریں" },
  },
};
const LangCtx = React.createContext<{ lang: Lang; rtl: boolean; t: typeof STR.en }>({ lang: "en", rtl: false, t: STR.en });
const useL = () => React.useContext(LangCtx);

export type VideoTheme = "dark" | "light";
export const THEME = {
  dark: {
    light: false, bg: INK, head: "#fff", accent: GREEN_LIGHT, sub: "rgba(255,255,255,0.74)", faint: "rgba(255,255,255,0.5)",
    grad: "linear-gradient(90deg, #4ADE80, #2DD4BF 45%, #A3E635 70%, #4ADE80)",
    chipBg: "rgba(255,255,255,0.08)", chipBorder: "1.5px solid rgba(255,255,255,0.18)", chipText: "#fff", chipShadow: "0 12px 40px rgba(0,0,0,0.35)",
    greenBg: GREEN_LIGHT, onGreen: "#04210f", greenGlow: "rgba(74,222,128,0.45)", track: "rgba(255,255,255,0.14)",
    ring: "74,222,128", shadow: "rgba(0,0,0,0.6)", veil: "5,11,7",
  },
  light: {
    light: true, bg: "#FFFFFF", head: "#0B1A10", accent: "#15803D", sub: "rgba(11,26,16,0.72)", faint: "rgba(11,26,16,0.5)",
    grad: "linear-gradient(90deg, #16A34A, #0D9488 45%, #65A30D 70%, #16A34A)",
    chipBg: "#EEF4F0", chipBorder: "1.5px solid #D5E2D9", chipText: "#0B1A10", chipShadow: "0 10px 30px rgba(15,40,25,0.12)",
    greenBg: "#16A34A", onGreen: "#fff", greenGlow: "rgba(22,163,74,0.3)", track: "rgba(11,26,16,0.12)",
    ring: "22,163,74", shadow: "rgba(15,40,25,0.3)", veil: "255,255,255",
  },
};
export const ThemeCtx = React.createContext(THEME.dark);
const useTheme = () => React.useContext(ThemeCtx);

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Scene boundaries in frames (30 fps, 1350 total = 45 s). Voice lines start at VO_AT below. */
const S = {
  hook: [0, 140],
  logo: [130, 280],
  sell: [270, 580],
  ledger: [570, 790],
  profit: [780, 1000],
  devices: [990, 1215],
  cta: [1205, 1350],
} as const;

const useLayout = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  return { width, height, vertical, u: Math.min(width, height) / 1080 };
};

const enter = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 28 });

/* ------------------------------------------------------------------ screenshots */

export type Box = [number, number, number, number];
const srcSize = (src: string): [number, number] => (src.startsWith("w-") ? [1440, 900] : [1080, 2208]);

/** UI cards inside the screenshots, as pixel boxes [x0, y0, x1, y1]. */
export const CROPS = {
  rev: { src: "p-home.png", box: [49, 249, 1031, 835] },
  cart: { src: "p-home.png", box: [45, 1726, 1031, 1937] },
  pay: { src: "p-checkout.png", box: [52, 453, 1032, 716] },
  cash: { src: "p-checkout.png", box: [52, 751, 1032, 1347] },
  get: { src: "p-ledger.png", box: [49, 194, 529, 453] },
  give: { src: "p-ledger.png", box: [555, 194, 1031, 453] },
  row: { src: "p-ledger.png", box: [49, 1269, 1031, 1457] },
  net: { src: "p-profit.png", box: [49, 379, 1031, 751] },
  wrev: { src: "w-reports.png", box: [32, 221, 482, 453] },
} satisfies Record<string, { src: string; box: Box }>;
export type CropId = keyof typeof CROPS;

/** A region of a screenshot shown `w` px wide. */
export const Crop: React.FC<{ src: string; box: Box; w: number; radius?: number; style?: React.CSSProperties }> = ({ src, box, w, radius = 0, style }) => {
  const [iw, ih] = srcSize(src);
  const [x0, y0, x1, y1] = box;
  const s = w / (x1 - x0);
  return (
    <div style={{ width: w, height: (y1 - y0) * s, overflow: "hidden", position: "relative", borderRadius: radius, background: "#fff", ...style }}>
      <Img src={staticFile(`img/${src}`)} style={{ position: "absolute", left: -x0 * s, top: -y0 * s, width: iw * s, height: ih * s, maxWidth: "none" }} />
    </div>
  );
};

/** A UI card lifted out of the app, with a soft shadow and a thin brand ring. */
export const Card: React.FC<{ id: CropId; w: number; style?: React.CSSProperties }> = ({ id, w, style }) => {
  const th = useTheme();
  const c = CROPS[id];
  return (
    <Crop
      src={c.src}
      box={c.box}
      w={w}
      radius={w * 0.045}
      style={{ boxShadow: `0 ${w * 0.07}px ${w * 0.18}px ${th.shadow}, 0 0 0 ${Math.max(1.5, w * 0.004)}px rgba(${th.ring},0.45)`, ...style }}
    />
  );
};

export const Shot: React.FC<{ src: string; opacity?: number }> = ({ src, opacity = 1 }) => (
  <Img
    src={staticFile(`img/${src}`)}
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", opacity }}
  />
);

/** Glass reflection on a screen, plus an optional light sweep at frame `sweep`. */
const Glass: React.FC<{ sweep?: number }> = ({ sweep }) => {
  const frame = useCurrentFrame();
  const p = sweep === undefined ? -1 : interpolate(frame, [sweep, sweep + 22], [-0.6, 1.6], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "linear-gradient(118deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 28%, transparent 42%)" }} />
      {p > -0.6 && p < 1.6 && (
        <AbsoluteFill style={{ background: `linear-gradient(105deg, transparent ${p * 100 - 18}%, rgba(255,255,255,0.55) ${p * 100}%, transparent ${p * 100 + 18}%)` }} />
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ devices */

export const Phone: React.FC<{ w: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ w, children, style }) => {
  const th = useTheme();
  const bez = w * 0.028;
  return (
    <div
      style={{
        width: w,
        height: w * 1.985,
        borderRadius: w * 0.15,
        background: "linear-gradient(145deg, #3a423d, #0a0d0b 40%, #232925)",
        padding: bez,
        boxShadow: th.light
          ? `0 ${w * 0.12}px ${w * 0.28}px rgba(15,40,25,0.32), 0 8px 24px rgba(15,40,25,0.18), inset 0 0 0 ${w * 0.004}px rgba(255,255,255,0.25)`
          : `0 ${w * 0.14}px ${w * 0.38}px rgba(0,0,0,0.7), 0 0 ${w * 0.5}px rgba(22,163,74,0.22), inset 0 0 0 ${w * 0.004}px rgba(255,255,255,0.18)`,
        position: "relative",
        ...style,
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: w * 0.125, overflow: "hidden", position: "relative", background: "#fafaf9" }}>
        {children}
      </div>
    </div>
  );
};

export const Laptop: React.FC<{ w: number; src: string; soft?: boolean; sweep?: number; children?: React.ReactNode }> = ({ w, src, soft, sweep, children }) => {
  const th = useTheme();
  const isSoft = soft ?? th.light;
  const bez = w * 0.012;
  return (
    <div style={{ width: w, position: "relative" }}>
      <div
        style={{
          width: "100%",
          aspectRatio: "1440 / 900",
          borderRadius: w * 0.02,
          background: "#0c0f0d",
          padding: bez,
          boxShadow: isSoft ? `0 ${w * 0.05}px ${w * 0.12}px rgba(15,40,25,0.3)` : `0 ${w * 0.06}px ${w * 0.16}px rgba(0,0,0,0.65), 0 0 ${w * 0.2}px rgba(22,163,74,0.2)`,
          border: "1px solid rgba(255,255,255,0.14)",
        }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: w * 0.01, overflow: "hidden", position: "relative" }}>
          <Shot src={src} />
          {children}
          <Glass sweep={sweep} />
        </div>
      </div>
      <div style={{ width: "112%", marginLeft: "-6%", height: w * 0.024, borderRadius: `0 0 ${w * 0.03}px ${w * 0.03}px`, background: "linear-gradient(#e2e7e4, #8c938e)", marginTop: -1 }} />
    </div>
  );
};

export const Browser: React.FC<{ w: number; src: string; sweep?: number }> = ({ w, src, sweep }) => {
  const th = useTheme();
  return (
    <div
      style={{
        width: w, borderRadius: w * 0.016, overflow: "hidden", background: "#fff",
        boxShadow: th.light ? `0 ${w * 0.05}px ${w * 0.12}px rgba(15,40,25,0.28)` : `0 ${w * 0.06}px ${w * 0.16}px rgba(0,0,0,0.65)`,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ height: w * 0.045, background: "#EDEFEE", display: "flex", alignItems: "center", gap: w * 0.008, padding: `0 ${w * 0.018}px` }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: w * 0.013, height: w * 0.013, borderRadius: "50%", background: c }} />
        ))}
        <div style={{ marginLeft: w * 0.02, width: "46%", height: w * 0.027, borderRadius: 99, background: "#fff", fontFamily, fontWeight: 600, fontSize: w * 0.015, color: "#4B5B50", display: "flex", alignItems: "center", paddingLeft: w * 0.016 }}>
          bytepos.vercel.app
        </div>
      </div>
      <div style={{ width: "100%", aspectRatio: "1440 / 900", position: "relative" }}>
        <Shot src={src} />
        <Glass sweep={sweep} />
      </div>
    </div>
  );
};

/** A phone whose UI cards can pop out of the screen. dx / dy are in phone widths, k is the pop scale. */
type Pop = { id: CropId; at: number; out: number; dx: number; dy: number; k: number };
const PhoneRig: React.FC<{ w: number; children: React.ReactNode; pops?: Pop[]; flip?: boolean; sweep?: number }> = ({ w, children, pops = [], flip, sweep }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = useTheme();
  const bez = w * 0.028;
  const s = (w - 2 * bez) / 1080;
  const prog = (p: Pop) =>
    Math.max(0, spring({ frame: frame - p.at, fps, config: { damping: 15, stiffness: 120, mass: 0.9 } }) - spring({ frame: frame - p.out, fps, config: { damping: 200 }, durationInFrames: 16 }));
  const dim = Math.min(1, Math.max(0, ...pops.map(prog)));
  return (
    <div style={{ position: "relative", width: w, height: w * 1.985, transformStyle: "preserve-3d" }}>
      <Phone w={w}>
        {children}
        <AbsoluteFill style={{ background: `rgba(4,12,8,${dim * 0.5})` }} />
        <Glass sweep={sweep} />
      </Phone>
      {pops.map((p) => {
        const v = prog(p);
        if (v < 0.002) return null;
        const c = CROPS[p.id];
        const [x0, y0, x1] = c.box;
        const cw = (x1 - x0) * s;
        // mirrored layout: land where the English card lands, reflected across the phone (the screenshot itself isn't mirrored)
        const dx = flip ? 1 - (2 * (bez + x0 * s) + cw) / w - p.dx : p.dx;
        return (
          <div
            key={p.id + p.at}
            style={{
              position: "absolute", left: bez + x0 * s, top: bez + y0 * s,
              transform: `translate3d(${v * dx * w}px, ${v * p.dy * w}px, ${v * w * 0.18}px) scale(${1 + (p.k - 1) * v})`,
            }}
          >
            <Crop
              src={c.src}
              box={c.box}
              w={cw}
              radius={cw * 0.045}
              style={{
                boxShadow: `0 ${w * 0.09 * v}px ${w * 0.2 * v}px rgba(0,0,0,${0.45 * v}), 0 0 0 ${w * 0.006 * v}px rgba(${th.ring},${v}), 0 0 ${w * 0.12 * v}px rgba(${th.ring},${0.45 * v})`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

/** Places a device: a springy 3D fly-in, then a slow idle drift. Angles in degrees, offsets in px at u = 1. */
const Fly: React.FC<{
  children: React.ReactNode;
  delay?: number; rx?: number; ry?: number; rz?: number; fromX?: number; fromY?: number; fromRy?: number;
  left: number; top: number; z?: number;
}> = ({ children, delay = 0, rx = 0, ry = 0, rz = 0, fromX = 0, fromY = 300, fromRy = 0, left, top, z = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useLayout();
  const p = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 70 }, durationInFrames: 50 });
  const q = 1 - p;
  return (
    <div style={{ position: "absolute", left, top, perspective: 2400 * u, opacity: Math.min(1, p * 2.5), zIndex: z }}>
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: `translate3d(${q * fromX * u}px, ${q * fromY * u + Math.sin(frame / 32) * 7 * u}px, 0) rotateX(${rx + q * 14}deg) rotateY(${ry + q * fromRy + Math.sin(frame / 50) * 1.6}deg) rotateZ(${rz}deg)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ atmosphere */

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const orb = (x: number, y: number, size: number, speed: number, color: string, phase: number) => (
    <div
      style={{
        position: "absolute",
        left: x * width + Math.sin(frame / speed + phase) * width * 0.06 - size / 2,
        top: y * height + Math.cos(frame / (speed * 1.3) + phase) * height * 0.06 - size / 2,
        width: size, height: size, borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
        filter: "blur(30px)",
      }}
    />
  );
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 0%, #0d2416 0%, ${INK} 62%)` }}>
      {orb(0.15, 0.2, width * 0.75, 55, "rgba(22,163,74,0.3)", 0)}
      {orb(0.85, 0.8, width * 0.65, 70, "rgba(20,184,166,0.16)", 2)}
      {orb(0.6, 0.1, width * 0.4, 90, "rgba(163,230,53,0.1)", 4)}
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          backgroundPosition: `0 ${frame * 0.6}px`,
          maskImage: "radial-gradient(70% 60% at 50% 45%, black, transparent)",
        }}
      />
    </AbsoluteFill>
  );
};

export const LightBackground: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#FFFFFF" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 50% at ${12 + Math.sin(frame / 60) * 6}% 8%, rgba(22,163,74,0.16), transparent 70%), radial-gradient(55% 45% at 95% ${92 + Math.cos(frame / 70) * 6}%, rgba(20,184,166,0.16), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(10,40,20,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(10,40,20,0.045) 1px, transparent 1px)",
          backgroundSize: "90px 90px", backgroundPosition: `0 ${frame * 0.6}px`, maskImage: "radial-gradient(75% 65% at 50% 45%, black, transparent)",
        }}
      />
    </AbsoluteFill>
  );
};

const WALL = ["p-home.png", "p-ledger.png", "p-checkout.png", "p-profit.png", "p-sales.png", "p-products.png"];

/** A tilted wall of app screens drifting in columns, fading into the background colour. */
export const ScreenWall: React.FC<{ opacity?: number; veil?: number; speed?: number }> = ({ opacity = 1, veil = 0.72, speed = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const th = useTheme();
  const u = Math.min(width, height) / 1080;
  const colW = 300 * u;
  const gap = 36 * u;
  const cols = Math.ceil((Math.max(width, height) * 1.9) / (colW + gap));
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity }}>
      <div
        style={{
          position: "absolute", left: "50%", top: "50%", display: "flex", gap,
          transform: `translate(-50%, -50%) perspective(${2600 * u}px) rotateX(32deg) rotateZ(-16deg)`,
        }}
      >
        {Array.from({ length: cols }, (_, c) => (
          <div key={c} style={{ display: "flex", flexDirection: "column", gap, translate: `0 ${(c % 2 ? -1 : 1) * frame * speed * 1.1 * u - ((c * 173) % 420) * u}px` }}>
            {Array.from({ length: 5 }, (_, r) => (
              <Img
                key={r}
                src={staticFile(`img/${WALL[(c * 2 + r) % WALL.length]}`)}
                style={{ width: colW, height: colW * 2.044, borderRadius: 26 * u, objectFit: "cover", boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}
              />
            ))}
          </div>
        ))}
      </div>
      <AbsoluteFill style={{ background: `radial-gradient(75% 70% at 50% 50%, rgba(${th.veil},${veil}) 0%, rgba(${th.veil},${Math.min(1, veil + 0.18)}) 100%)` }} />
    </AbsoluteFill>
  );
};

/** Film grain, animated every frame. */
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const th = useTheme();
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: th.light ? 0.05 : 0.09, pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 12} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }} />
);

/* ------------------------------------------------------------------ editing */

/** A scene with a zoom-through cut: it flies in from slightly far and leaves past the camera, with a light streak at the cut. */
const Scene: React.FC<{ range: readonly [number, number]; hold?: boolean; children: React.ReactNode }> = ({ range, hold, children }) => {
  const [start, end] = range;
  return (
    <Sequence from={start} durationInFrames={end - start} layout="none">
      <SceneInner dur={end - start} hold={hold}>{children}</SceneInner>
    </Sequence>
  );
};
const SceneInner: React.FC<{ dur: number; hold?: boolean; children: React.ReactNode }> = ({ dur, hold, children }) => {
  const frame = useCurrentFrame();
  const th = useTheme();
  const { u } = useLayout();
  const inP = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: EASE });
  const outP = hold ? 0 : interpolate(frame, [dur - 12, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const streak = interpolate(frame, [0, 5, 18], [0, 1, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: Math.min(inP, 1 - outP),
          scale: interpolate(inP, [0, 1], [0.86, 1]) * interpolate(frame, [0, dur], [1, 1.035]) * (1 + outP * 0.32),
          filter: `blur(${(1 - inP) * 14 + outP * 18}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
      {/* anamorphic light streak + flash at the cut */}
      <AbsoluteFill style={{ pointerEvents: "none", opacity: streak }}>
        <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 50% 50%, rgba(${th.ring},${th.light ? 0.18 : 0.35}), transparent 70%)` }} />
        <div
          style={{
            position: "absolute", left: 0, right: 0, top: "50%", height: 4 * u, translate: "0 -50%",
            scale: `${interpolate(frame, [0, 18], [0.2, 1.6], clamp)} 1`,
            background: `linear-gradient(90deg, transparent, rgba(${th.ring},0.9) 30%, #fff 50%, rgba(${th.ring},0.9) 70%, transparent)`,
            boxShadow: `0 0 ${40 * u}px ${10 * u}px rgba(${th.ring},0.5)`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ type */

/** Lines that rise out of a mask; the accent line gets a moving gradient fill. */
const Headline: React.FC<{ lines: string[]; sub?: string; delay?: number; align?: "start" | "center"; accentLine?: number; size?: number }> = ({
  lines, sub, delay = 0, align = "start", accentLine, size,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useLayout();
  const { rtl } = useL();
  const th = useTheme();
  const fs = (size ?? (vertical ? 112 : 100)) * u * (rtl ? 0.86 : 1);
  return (
    <div style={{ fontFamily, direction: rtl ? "rtl" : "ltr", textAlign: align, display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "flex-start" }}>
      {lines.map((line, i) => {
        const p = interpolate(frame, [delay + i * 6, delay + i * 6 + 20], [0, 1], { ...clamp, easing: EASE });
        const accent = i === accentLine;
        return (
          <div key={line} style={{ overflow: "hidden", padding: `${fs * 0.04}px ${fs * 0.06}px ${fs * 0.12}px`, margin: `0 ${-fs * 0.06}px ${-fs * 0.1}px` }}>
            <div
              style={{
                fontSize: fs, lineHeight: rtl ? 1.45 : 1.02, fontWeight: 800, letterSpacing: rtl ? 0 : -fs * 0.028, whiteSpace: "nowrap",
                translate: `0 ${(1 - p) * 115}%`,
                rotate: `${(1 - p) * (rtl ? -5 : 5)}deg`,
                transformOrigin: rtl ? "right bottom" : "left bottom",
                ...(accent
                  ? { backgroundImage: th.grad, backgroundSize: "250% 100%", backgroundPosition: `${(frame * 0.8) % 250}% 0`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
                  : { color: th.head }),
              }}
            >
              {line}
            </div>
          </div>
        );
      })}
      {sub && (
        <div
          style={{
            marginTop: 26 * u, fontSize: (vertical ? 44 : 38) * u, fontWeight: 500, color: th.sub,
            opacity: enter(frame, fps, delay + lines.length * 6 + 8),
            translate: `0 ${interpolate(enter(frame, fps, delay + lines.length * 6 + 8), [0, 1], [24 * u, 0])}px`,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

const Chip: React.FC<{ text: string; delay: number; icon?: React.ReactNode; tone?: "green" | "glass"; scale?: number }> = ({ text, delay, icon, tone = "glass", scale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u: u0 } = useLayout();
  const u = u0 * scale;
  const th = useTheme();
  const p = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 140 } });
  return (
    <div
      style={{
        fontFamily, display: "inline-flex", alignItems: "center", gap: 12 * u, padding: `${16 * u}px ${28 * u}px`, borderRadius: 999,
        fontSize: 34 * u, fontWeight: 700, whiteSpace: "nowrap",
        color: tone === "green" ? th.onGreen : th.chipText,
        background: tone === "green" ? th.greenBg : th.chipBg,
        border: tone === "green" ? "none" : th.chipBorder,
        boxShadow: tone === "green" ? `0 0 ${50 * u}px ${th.greenGlow}` : th.chipShadow,
        backdropFilter: "blur(14px)",
        opacity: Math.min(1, p * 1.4),
        scale: interpolate(p, [0, 1], [0.6, 1]),
        translate: `0 ${interpolate(p, [0, 1], [30 * u, 0])}px`,
      }}
    >
      {icon}
      {text}
    </div>
  );
};

/** 1 Scan — 2 Add — 3 Pay, each lighting up at its frame with a filling connector. */
const Steps: React.FC<{ items: { label: string; at: number }[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useLayout();
  const { rtl } = useL();
  const th = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", direction: rtl ? "rtl" : "ltr", fontFamily }}>
      {items.map((it, i) => {
        const on = interpolate(frame, [it.at, it.at + 8], [0, 1], clamp);
        const fill = interpolate(frame, [items[i - 1]?.at ?? 0, it.at], [0, 1], clamp);
        const appear = enter(frame, fps, 10 + i * 5);
        const bump = interpolate(frame, [it.at, it.at + 5, it.at + 14], [1, 1.22, 1], clamp);
        return (
          <React.Fragment key={it.label}>
            {i > 0 && (
              <div style={{ width: 64 * u, height: 5 * u, borderRadius: 99, background: th.track, margin: `0 ${16 * u}px`, overflow: "hidden", opacity: appear }}>
                <div style={{ width: `${fill * 100}%`, height: "100%", background: th.accent, marginInlineStart: 0 }} />
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 14 * u, opacity: appear, translate: `0 ${(1 - appear) * 20 * u}px` }}>
              <div style={{ position: "relative", width: 62 * u, height: 62 * u, scale: bump }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: th.chipBg, border: th.chipBorder }} />
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: th.greenBg, opacity: on, boxShadow: `0 0 ${40 * u}px ${th.greenGlow}` }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 * u, fontWeight: 800, color: on > 0.5 ? th.onGreen : th.sub }}>{i + 1}</div>
              </div>
              <div style={{ fontSize: 36 * u, fontWeight: 800, color: on > 0.5 ? th.head : th.faint }}>{it.label}</div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const WifiOff: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 8.8a15 15 0 0 1 6-3.2M22 8.8a15 15 0 0 0-5-3" />
    <path d="M5 12.5a10 10 0 0 1 3.5-2M19 12.5a10 10 0 0 0-3-2M8.5 16a5 5 0 0 1 2-1M15.5 16a5 5 0 0 0-1.5-1" />
    <circle cx="12" cy="19.5" r="1" fill="currentColor" />
    <path d="M3 3l18 18" />
  </svg>
);
const Check: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
const SyncIcon: React.FC<{ size: number; spin: number }> = ({ size, spin }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ rotate: `${spin}deg` }}>
    <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4" />
  </svg>
);

export const LogoBadge: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.24, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${size * 0.8}px rgba(22,163,74,0.5), 0 ${size * 0.1}px ${size * 0.3}px rgba(0,0,0,0.45)` }}>
    <Img src={staticFile("img/logo-mark.png")} style={{ width: "86%", height: "86%", objectFit: "contain" }} />
  </div>
);

export const Wordmark: React.FC<{ size: number; ink?: string; accent?: string }> = ({ size, ink = "#fff", accent = GREEN_LIGHT }) => (
  <div style={{ fontFamily, fontSize: size, fontWeight: 800, letterSpacing: -size * 0.03, color: ink, lineHeight: 1, direction: "ltr" }}>
    Byte<span style={{ color: accent }}>POS</span>
  </div>
);

/** Google Play badge (drawn here, not the official artwork). */
export const PlayBadge: React.FC<{ u: number; style?: React.CSSProperties }> = ({ u, style }) => (
  <div
    style={{
      fontFamily, direction: "ltr", display: "inline-flex", alignItems: "center", gap: 22 * u, color: "#fff", background: "#000",
      border: "2px solid rgba(255,255,255,0.55)", padding: `${16 * u}px ${40 * u}px ${16 * u}px ${28 * u}px`, borderRadius: 22 * u, ...style,
    }}
  >
    <svg width={58 * u} height={58 * u} viewBox="0 0 24 24">
      <path d="M3.6 2.2c-.3.2-.5.6-.5 1.1v17.4c0 .5.2.9.5 1.1l9.8-9.8z" fill="#00D7FE" />
      <path d="M17 15.4l-3.6-3.6 3.6-3.6 4.2 2.4c1.2.7 1.2 1.8 0 2.5z" fill="#FFCE00" />
      <path d="M13.4 11.8L3.6 21.8c.4.3 1 .3 1.6 0L17 15.4z" fill="#FF3A44" />
      <path d="M13.4 11.8L3.6 2.2c.4-.3 1-.3 1.6 0L17 8.2z" fill="#00F076" />
    </svg>
    <div style={{ lineHeight: 1.05 }}>
      <div style={{ fontSize: 22 * u, fontWeight: 600, letterSpacing: 3 * u }}>GET IT ON</div>
      <div style={{ fontSize: 50 * u, fontWeight: 800, letterSpacing: -1 * u }}>Google Play</div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ scenes */

const HOOK_CARDS: { id: CropId; x: number; y: number; at: number }[] = [
  { id: "rev", x: -0.62, y: -0.5, at: -20 },
  { id: "get", x: 0.62, y: -0.48, at: -8 },
  { id: "cart", x: -0.66, y: 0.5, at: 4 },
  { id: "net", x: 0.64, y: 0.46, at: 16 },
  { id: "give", x: -0.8, y: 0.0, at: 30 },
  { id: "cash", x: 0.8, y: 0.02, at: 42 },
  { id: "row", x: 0.05, y: -0.72, at: 54 },
  { id: "wrev", x: -0.1, y: 0.74, at: 64 },
  { id: "pay", x: -0.55, y: -0.6, at: 76 },
];

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, u, vertical } = useLayout();
  const { t } = useL();
  const th = useTheme();
  const life = 110;
  return (
    <AbsoluteFill>
      <ScreenWall veil={th.light ? 0.8 : 0.8} speed={1.6} />
      <AbsoluteFill style={{ perspective: 1100 * u }}>
        {HOOK_CARDS.map((c) => {
          const f = frame - c.at;
          if (f < 0 || f > life) return null;
          const z = interpolate(f, [0, life], [-2200, 700]);
          const o = interpolate(f, [0, 30, life - 30, life - 8], [0, 1, 1, 0], clamp);
          const sx = vertical ? 0.9 : 1.1;
          return (
            <div
              key={c.id}
              style={{
                position: "absolute", left: width / 2 + c.x * sx * width * 0.5, top: height / 2 + c.y * height * 0.5,
                transform: `translate(-50%, -50%) translateZ(${z * u}px) rotateY(${-c.x * 22}deg) rotateX(${c.y * 16}deg)`,
                opacity: o, filter: `blur(${interpolate(z, [-2200, -900, 200, 700], [6, 0, 0, 8], clamp)}px)`,
              }}
            >
              <Card id={c.id} w={(c.id === "row" || c.id === "cart" ? 520 : 440) * u} />
            </div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(${vertical ? "70% 30%" : "45% 40%"} at 50% 50%, rgba(${th.veil},0.85), transparent 100%)` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 60 * u }}>
        <Headline lines={t.hook} delay={10} align="center" accentLine={1} size={vertical ? 124 : 140} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const LogoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useLayout();
  const { t } = useL();
  const th = useTheme();
  const p = spring({ frame: frame - 14, fps, config: { damping: 11, stiffness: 100 } });
  const ring = interpolate(frame, [14, 60], [0, 1], { ...clamp, easing: EASE });
  const shine = interpolate(frame, [34, 58], [-60, 160], clamp);
  const badge = 300 * u;
  const word = "BytePOS";
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 40 * u }}>
      {/* light rays */}
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${frame * 0.4}deg at 50% 42%, rgba(${th.ring},${th.light ? 0.08 : 0.12}) 0deg 6deg, transparent 6deg 18deg)`,
          maskImage: "radial-gradient(45% 45% at 50% 42%, black, transparent)",
          opacity: interpolate(frame, [10, 40], [0, 1], clamp),
        }}
      />
      {/* sparks */}
      {Array.from({ length: 28 }, (_, i) => {
        const a = (i / 28) * Math.PI * 2 + i;
        const d = interpolate(frame, [14, 80], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) * (280 + (i % 5) * 90) * u;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: "50%", top: "42%", width: (4 + (i % 3) * 3) * u, height: (4 + (i % 3) * 3) * u, borderRadius: "50%",
              background: th.accent, boxShadow: `0 0 ${12 * u}px rgba(${th.ring},0.9)`,
              translate: `${Math.cos(a) * d}px ${Math.sin(a) * d}px`, opacity: interpolate(frame, [14, 20, 70, 100], [0, 1, 0.6, 0], clamp),
            }}
          />
        );
      })}
      <div style={{ position: "relative", scale: interpolate(p, [0, 1], [0.2, 1]), opacity: Math.min(1, p * 2), rotate: `${(1 - p) * -25}deg` }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", inset: -260 * u * ring * (1 + i * 0.45), borderRadius: "50%", border: `${3 * u}px solid rgba(${th.ring},${0.55 * (1 - ring)})` }} />
        ))}
        <LogoBadge size={badge} />
        <div style={{ position: "absolute", inset: 0, borderRadius: badge * 0.24, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, width: "40%", left: `${shine}%`, background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.85), transparent)", rotate: "15deg", scale: "1 1.6" }} />
        </div>
      </div>
      <div style={{ display: "flex", fontFamily, fontSize: 160 * u, fontWeight: 800, letterSpacing: -5 * u, lineHeight: 1, direction: "ltr" }}>
        {word.split("").map((ch, i) => {
          const q = interpolate(frame, [28 + i * 3, 44 + i * 3], [0, 1], { ...clamp, easing: EASE });
          return (
            <span key={i} style={{ color: i >= 4 ? th.accent : th.head, opacity: q, translate: `0 ${(1 - q) * 60 * u}px`, filter: `blur(${(1 - q) * 10}px)`, display: "inline-block" }}>
              {ch}
            </span>
          );
        })}
      </div>
      <div
        style={{
          fontFamily, fontWeight: 700, fontSize: 34 * u, color: th.sub, whiteSpace: "nowrap",
          letterSpacing: interpolate(frame, [52, 100], [40, 14], { ...clamp, easing: EASE }) * u,
          opacity: interpolate(frame, [52, 70], [0, 1], clamp),
        }}
      >
        {t.tagline}
      </div>
    </AbsoluteFill>
  );
};

/** Text column for landscape (left, or right in Urdu) / top block for vertical. */
const TextBlock: React.FC<{ children: React.ReactNode; side?: "left" | "right"; widthPx?: number }> = ({ children, side = "left", widthPx = 860 }) => {
  const { vertical, u, width } = useLayout();
  const { rtl } = useL();
  if (vertical)
    return (
      <div style={{ position: "absolute", left: 80 * u, right: 80 * u, top: 150 * u, display: "flex", flexDirection: "column", gap: 40 * u, alignItems: rtl ? "flex-end" : "flex-start" }}>
        {children}
      </div>
    );
  const onLeft = (side === "left") !== rtl;
  return (
    <div
      style={{
        position: "absolute", top: 0, bottom: 0, width: widthPx * u, left: onLeft ? 130 * u : width - (130 + widthPx) * u,
        display: "flex", flexDirection: "column", justifyContent: "center", gap: 44 * u, alignItems: rtl ? "flex-end" : "flex-start",
      }}
    >
      {children}
    </div>
  );
};

/** x position for landscape devices, mirrored in Urdu. */
const useX = () => {
  const { width, u } = useLayout();
  const { rtl } = useL();
  return (x: number, w: number) => (rtl ? width - (x + w) * u : x * u);
};

const SellScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useLayout();
  const { t, rtl } = useL();
  const th = useTheme();
  const X = useX();
  const phoneW = (vertical ? 580 : 480) * u;
  const toCheckout = interpolate(frame, [98, 112], [0, 1], clamp);
  const tap = interpolate(frame, [190, 198, 214], [0, 1, 0], clamp);
  const done = enter(frame, fps, 200);
  const scanY = interpolate(frame, [16, 50], [49, 67], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const scanOn = interpolate(frame, [14, 18, 50, 56], [0, 1, 1, 0], clamp);
  const scanHit = interpolate(frame, [50, 53, 64], [0, 1, 0], clamp);
  const pk = vertical ? 1.12 : 1.3;
  const pdx = vertical ? 0 : -0.42;
  const pops: Pop[] = [
    { id: "cart", at: 56, out: 96, dx: pdx, dy: vertical ? -0.12 : -0.06, k: pk },
    { id: "pay", at: 114, out: 152, dx: pdx, dy: vertical ? -0.04 : 0, k: pk },
    { id: "cash", at: 152, out: 190, dx: pdx, dy: vertical ? -0.04 : -0.02, k: pk * 0.96 },
  ];
  // the camera drifts in and swings slightly as the sale moves on
  const ry = (vertical ? 0 : rtl ? 14 : -14) + interpolate(frame, [0, 300], [0, vertical ? 0 : rtl ? -8 : 8]);
  return (
    <AbsoluteFill>
      <TextBlock>
        <Headline lines={t.sell.head} delay={4} accentLine={1} />
        <Steps items={[{ label: t.sell.s1, at: 18 }, { label: t.sell.s2, at: 56 }, { label: t.sell.s3, at: 114 }]} />
        <Chip text={t.sell.offline} delay={124} icon={<WifiOff size={38 * u} />} tone="green" />
      </TextBlock>
      <Fly left={vertical ? 250 * u : X(1250, 480)} top={vertical ? 700 * u : 63 * u} delay={4} ry={ry} rx={vertical ? 8 : 4} fromRy={rtl ? -30 : 30} fromY={400}>
        <PhoneRig w={phoneW} pops={pops} flip={rtl}>
          <Shot src="p-home.png" opacity={1 - toCheckout} />
          <Shot src="p-checkout.png" opacity={toCheckout} />
          {/* scanner laser + hit flash */}
          <div style={{ position: "absolute", left: "7%", width: "86%", top: `${scanY}%`, height: 5 * u, background: GREEN_LIGHT, boxShadow: `0 0 ${30 * u}px ${8 * u}px rgba(74,222,128,0.85)`, opacity: scanOn, borderRadius: 4 }} />
          <div style={{ position: "absolute", left: "4.5%", width: "91%", top: "45.9%", height: "24.5%", borderRadius: "6%/12%", border: `${5 * u}px solid ${GREEN_LIGHT}`, boxShadow: `0 0 ${50 * u}px rgba(74,222,128,0.9)`, opacity: scanHit }} />
          {/* finish tap + success */}
          <div style={{ position: "absolute", left: "72%", top: "95%", width: phoneW * 0.24, height: phoneW * 0.24, translate: "-50% -50%", borderRadius: "50%", background: "rgba(255,255,255,0.7)", border: `${3 * u}px solid ${GREEN_LIGHT}`, scale: interpolate(tap, [0, 1], [0.2, 1.4]), opacity: tap * 0.9 }} />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `radial-gradient(circle at 50% 45%, rgba(10,60,28,${0.92 * done}), rgba(4,20,10,${0.95 * done}))`, opacity: done }}>
            {Array.from({ length: 18 }, (_, i) => {
              const a = (i / 18) * Math.PI * 2;
              const d = interpolate(frame, [204, 236], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) * phoneW * (0.32 + (i % 3) * 0.06);
              return <div key={i} style={{ position: "absolute", left: "50%", top: "43%", width: phoneW * 0.022, height: phoneW * 0.022, borderRadius: i % 2 ? "50%" : 2, background: i % 3 ? GREEN_LIGHT : "#fff", translate: `${Math.cos(a) * d}px ${Math.sin(a) * d}px`, opacity: interpolate(frame, [204, 210, 236, 250], [0, 1, 1, 0], clamp) }} />;
            })}
            <div style={{ width: phoneW * 0.34, height: phoneW * 0.34, borderRadius: "50%", background: GREEN, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", scale: interpolate(spring({ frame: frame - 200, fps, config: { damping: 9, stiffness: 120 } }), [0, 1], [0.3, 1]), boxShadow: "0 0 90px rgba(74,222,128,0.75)" }}>
              <Check size={phoneW * 0.2} />
            </div>
            <div style={{ fontFamily, color: "#fff", fontWeight: 800, fontSize: phoneW * 0.085, marginTop: phoneW * 0.06 }}>{t.sell.done}</div>
            <div style={{ fontFamily, color: GREEN_LIGHT, fontWeight: 700, fontSize: phoneW * 0.06, marginTop: phoneW * 0.015 }}>{t.sell.change}</div>
          </AbsoluteFill>
        </PhoneRig>
      </Fly>
      {/* the done state also lights up the room */}
      <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(40% 50% at ${vertical ? "50% 65%" : rtl ? "25% 50%" : "75% 50%"}, rgba(${th.ring},${0.22 * done * interpolate(frame, [200, 260], [1, 0.4], clamp)}), transparent 70%)` }} />
    </AbsoluteFill>
  );
};

const LedgerScene: React.FC = () => {
  const { u, vertical } = useLayout();
  const { t, rtl } = useL();
  const X = useX();
  const phoneW = (vertical ? 560 : 470) * u;
  const pops: Pop[] = vertical
    ? [
        { id: "get", at: 24, out: 205, dx: -0.24, dy: -0.14, k: 1.14 },
        { id: "give", at: 50, out: 205, dx: 0.24, dy: -0.14, k: 1.14 },
        { id: "row", at: 110, out: 205, dx: 0, dy: 0.04, k: 1.16 },
      ]
    : [
        { id: "get", at: 24, out: 205, dx: -0.36, dy: 0.12, k: 1.32 },
        { id: "give", at: 50, out: 205, dx: -0.8, dy: 0.62, k: 1.32 },
        { id: "row", at: 110, out: 205, dx: 0.44, dy: -0.12, k: 1.24 },
      ];
  return (
    <AbsoluteFill>
      <TextBlock side="right" widthPx={760}>
        <Headline lines={t.ledger.head} sub={t.ledger.sub} delay={4} accentLine={1} />
      </TextBlock>
      <Fly left={vertical ? 260 * u : X(250, 470)} top={vertical ? 640 * u : 74 * u} delay={4} ry={vertical ? 0 : rtl ? -14 : 14} rx={vertical ? 8 : 4} fromRy={rtl ? 30 : -30} fromY={400}>
        <PhoneRig w={phoneW} pops={pops} flip={rtl}>
          <Shot src="p-ledger.png" />
        </PhoneRig>
      </Fly>
    </AbsoluteFill>
  );
};

const CountUp: React.FC<{ to: number; from: number; until: number }> = ({ to, from, until }) => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [from, until], [0, to], { ...clamp, easing: Easing.out(Easing.cubic) }));
  return <>{`Rs ${v.toLocaleString("en-US")}`}</>;
};

/** A rising line that draws itself. */
const Spark: React.FC<{ w: number; h: number; from: number }> = ({ w, h, from }) => {
  const frame = useCurrentFrame();
  const th = useTheme();
  const p = interpolate(frame, [from, from + 50], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const d = "M0 88 C 60 80, 90 92, 140 70 S 230 74, 280 52 S 360 58, 410 30 S 470 22, 500 8";
  return (
    <svg width={w} height={h} viewBox="0 0 500 100" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="sparkfill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={th.accent} stopOpacity={0.35} />
          <stop offset="1" stopColor={th.accent} stopOpacity={0} />
        </linearGradient>
        <clipPath id="sparkclip">
          <rect x={0} y={-20} width={500 * p} height={140} />
        </clipPath>
      </defs>
      <path d={`${d} L 500 100 L 0 100 Z`} fill="url(#sparkfill)" clipPath="url(#sparkclip)" />
      <path d={d} fill="none" stroke={th.accent} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <circle cx={500} cy={8} r={9} fill={th.accent} opacity={p > 0.98 ? 1 : 0} />
    </svg>
  );
};

const ProfitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useLayout();
  const { t, rtl } = useL();
  const th = useTheme();
  const X = useX();
  const p = enter(frame, fps, 30);
  const phoneW = (vertical ? 440 : 430) * u;
  const pops: Pop[] = [{ id: "net", at: 34, out: 210, dx: vertical ? -0.45 : -0.42, dy: vertical ? 0 : 0.14, k: vertical ? 1.2 : 1.36 }];
  return (
    <AbsoluteFill>
      <TextBlock widthPx={800}>
        <Headline lines={t.profit.head} delay={4} accentLine={0} />
        <div style={{ fontFamily, opacity: p, translate: `0 ${interpolate(p, [0, 1], [30 * u, 0])}px`, direction: rtl ? "rtl" : "ltr" }}>
          <div style={{ fontSize: 28 * u, fontWeight: 700, letterSpacing: rtl ? 0 : 4 * u, color: th.faint }}>{t.profit.label}</div>
          <div style={{ fontSize: (vertical ? 150 : 140) * u, fontWeight: 800, color: th.accent, letterSpacing: -4 * u, lineHeight: 1.1, direction: "ltr", textShadow: th.light ? "none" : "0 0 60px rgba(74,222,128,0.45)" }}>
            <CountUp to={1527} from={30} until={95} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 * u, flexDirection: rtl ? "row-reverse" : "row" }}>
          <Spark w={(vertical ? 420 : 380) * u} h={90 * u} from={40} />
          <Chip text={t.profit.margin} delay={96} tone="green" scale={0.9} />
        </div>
      </TextBlock>
      <Fly left={vertical ? 60 * u : X(1160, 860)} top={vertical ? 760 * u : 240 * u} delay={10} ry={vertical ? 0 : rtl ? 20 : -20} rx={6} fromRy={rtl ? -20 : 20} fromY={300}>
        <div style={{ opacity: 0.95 }}>
          <Laptop w={(vertical ? 900 : 860) * u} src="w-reports.png" />
        </div>
      </Fly>
      <Fly left={vertical ? 560 * u : X(1000, 430)} top={vertical ? 860 * u : 100 * u} delay={4} ry={vertical ? -8 : rtl ? 12 : -12} rx={4} fromRy={rtl ? -30 : 30} fromY={420} z={2}>
        <PhoneRig w={phoneW} pops={pops} flip={rtl}>
          <Shot src="p-profit.png" />
        </PhoneRig>
      </Fly>
    </AbsoluteFill>
  );
};

const DevicesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical, width } = useLayout();
  const { t, rtl } = useL();
  const th = useTheme();
  const words = t.devices.words;
  const at = [8, 40, 70];
  const syncP = spring({ frame: frame - 104, fps, config: { damping: 14, stiffness: 120 } });
  const ww = (vertical ? 108 : 104) * u * (rtl ? 0.86 : 1);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: (vertical ? 150 : 70) * u, left: 0, right: 0, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: `0 ${ww * 0.28}px`, direction: rtl ? "rtl" : "ltr", padding: `0 ${60 * u}px` }}>
        {words.map((w, i) => {
          const p = interpolate(frame, [at[i], at[i] + 18], [0, 1], { ...clamp, easing: EASE });
          const hot = interpolate(frame, [at[i], at[i] + 6, at[i] + 30], [0, 1, 0], clamp);
          return (
            <div key={w} style={{ overflow: "hidden", padding: `0 ${ww * 0.05}px ${ww * 0.12}px` }}>
              <div style={{ fontFamily, fontSize: ww, fontWeight: 800, letterSpacing: rtl ? 0 : -ww * 0.028, lineHeight: rtl ? 1.45 : 1.05, color: hot > 0.05 ? th.accent : th.head, translate: `0 ${(1 - p) * 110}%`, textShadow: th.light ? "none" : `0 0 ${60 * hot}px rgba(${th.ring},0.6)` }}>
                {w}
              </div>
            </div>
          );
        })}
      </div>
      {vertical ? (
        <>
          <Fly left={30 * u} top={560 * u} delay={at[1]} ry={16} rx={6} fromRy={-30} fromY={300}>
            <Browser w={720 * u} src="w-reports.png" sweep={104} />
          </Fly>
          <Fly left={90 * u} top={900 * u} delay={at[2]} rx={8} fromY={400} z={1}>
            <Laptop w={880 * u} src="w-sell.png" sweep={106} />
          </Fly>
          <Fly left={700 * u} top={1050 * u} delay={at[0]} ry={-14} rx={4} fromRy={30} fromY={500} z={2}>
            <PhoneRig w={320 * u} sweep={108}>
              <Shot src="p-home.png" />
            </PhoneRig>
          </Fly>
        </>
      ) : (
        <>
          <Fly left={width / 2 - 870 * u} top={300 * u} delay={at[1]} ry={24} rx={6} fromRy={-30} fromY={300}>
            <Browser w={720 * u} src="w-reports.png" sweep={104} />
          </Fly>
          <Fly left={width / 2 - 440 * u} top={330 * u} delay={at[2]} ry={-2} rx={8} fromY={400} z={1}>
            <Laptop w={880 * u} src="w-sell.png" sweep={106} />
          </Fly>
          <Fly left={width / 2 + 470 * u} top={250 * u} delay={at[0]} ry={-22} rx={4} fromRy={30} fromY={500} z={2}>
            <PhoneRig w={300 * u} sweep={108}>
              <Shot src="p-home.png" />
            </PhoneRig>
          </Fly>
        </>
      )}
      {/* sync badge */}
      <div style={{ position: "absolute", left: 0, right: 0, top: (vertical ? 1530 : 820) * u, display: "flex", justifyContent: "center", zIndex: 3 }}>
        <div
          style={{
            fontFamily, display: "flex", alignItems: "center", gap: 18 * u, padding: `${18 * u}px ${34 * u}px`, borderRadius: 999, direction: rtl ? "rtl" : "ltr",
            background: th.greenBg, color: th.onGreen, fontSize: 38 * u, fontWeight: 800, boxShadow: `0 0 ${70 * u}px ${th.greenGlow}, 0 20px 50px ${th.shadow}`,
            opacity: Math.min(1, syncP * 1.5), scale: interpolate(syncP, [0, 1], [0.5, 1]),
          }}
        >
          <SyncIcon size={44 * u} spin={frame * 4} />
          {t.devices.sub}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: (vertical ? 1700 : 960) * u, display: "flex", gap: 16 * u, justifyContent: "center", flexWrap: "wrap", direction: rtl ? "rtl" : "ltr" }}>
        <Chip text={t.devices.c1} delay={140} scale={0.9} />
        <Chip text={t.devices.c2} delay={148} scale={0.9} />
        <Chip text={t.devices.c3} delay={156} scale={0.9} tone="green" />
      </div>
    </AbsoluteFill>
  );
};

/** QR on a white card, with animated scan corners and a sweeping line. */
export const QrCard: React.FC<{ size: number; animate?: boolean }> = ({ size, animate = true }) => {
  const frame = useCurrentFrame();
  const th = useTheme();
  const pad = size * 0.07;
  const pulse = animate ? Math.sin(frame / 7) * size * 0.012 : 0;
  const line = animate ? (Math.sin(frame / 14) * 0.5 + 0.5) * 100 : -10;
  const corner = (pos: React.CSSProperties, r: string) => (
    <div style={{ position: "absolute", width: size * 0.16, height: size * 0.16, border: `${size * 0.018}px solid ${th.accent}`, borderRadius: size * 0.04, ...pos, clipPath: r }} />
  );
  const o = -pad * 0.9 - pulse;
  return (
    <div style={{ position: "relative", padding: pad, background: "#fff", borderRadius: size * 0.09, boxShadow: th.light ? `0 ${size * 0.06}px ${size * 0.16}px rgba(15,40,25,0.22)` : `0 0 ${size * 0.25}px rgba(74,222,128,0.4)` }}>
      <Img src={staticFile("img/play-qr.png")} style={{ width: size, height: size, display: "block" }} />
      {animate && <div style={{ position: "absolute", left: pad, right: pad, top: pad + (size * line) / 100, height: size * 0.008, background: GREEN_LIGHT, boxShadow: `0 0 ${size * 0.05}px ${GREEN_LIGHT}`, opacity: 0.85 }} />}
      {corner({ left: o, top: o }, "polygon(0 0, 100% 0, 100% 30%, 30% 30%, 30% 100%, 0 100%)")}
      {corner({ right: o, top: o }, "polygon(0 0, 100% 0, 100% 100%, 70% 100%, 70% 30%, 0 30%)")}
      {corner({ left: o, bottom: o }, "polygon(0 0, 30% 0, 30% 70%, 100% 70%, 100% 100%, 0 100%)")}
      {corner({ right: o, bottom: o }, "polygon(70% 0, 100% 0, 100% 100%, 0 100%, 0 70%, 70% 70%)")}
    </div>
  );
};

const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useLayout();
  const { t, rtl } = useL();
  const th = useTheme();
  const p = spring({ frame: frame - 26, fps, config: { damping: 13, stiffness: 120 } });
  const q = enter(frame, fps, 16);
  const glow = 0.5 + 0.5 * Math.sin(frame / 8);
  const logo = spring({ frame: frame - 2, fps, config: { damping: 12, stiffness: 120 } });
  return (
    <AbsoluteFill>
      <ScreenWall veil={0.86} speed={0.8} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", direction: rtl ? "rtl" : "ltr", flexDirection: vertical ? "column" : "row", gap: (vertical ? 70 : 150) * u }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: vertical ? "center" : "flex-start", gap: (vertical ? 44 : 38) * u }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 * u, direction: "ltr", scale: interpolate(logo, [0, 1], [0.6, 1]), opacity: Math.min(1, logo * 2) }}>
            <LogoBadge size={(vertical ? 150 : 130) * u} />
            <Wordmark size={(vertical ? 104 : 92) * u} ink={th.head} accent={th.accent} />
          </div>
          <Headline lines={t.cta.head} align={vertical ? "center" : "start"} delay={10} accentLine={1} size={vertical ? 124 : 128} />
          <div style={{ opacity: Math.min(1, p * 1.5), scale: interpolate(p, [0, 1], [0.7, 1]), borderRadius: 22 * u, boxShadow: `0 0 ${(30 + glow * 40) * u}px rgba(74,222,128,${0.25 + glow * 0.3})` }}>
            <PlayBadge u={u * 1.1} />
          </div>
          <div style={{ fontFamily, fontWeight: 600, fontSize: 32 * u, color: th.sub, opacity: enter(frame, fps, 52) }}>{t.cta.web}</div>
        </div>
        <div style={{ fontFamily, display: "flex", flexDirection: "column", alignItems: "center", gap: 34 * u, opacity: q, scale: interpolate(q, [0, 1], [0.85, 1]), translate: `0 ${interpolate(q, [0, 1], [40 * u, 0])}px` }}>
          <QrCard size={(vertical ? 380 : 420) * u} />
          <div style={{ fontSize: 34 * u, fontWeight: 800, color: th.head }}>{t.cta.scan}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ audio */

const vo = (id: string, at: number, dir: string) => (
  <Sequence from={at} layout="none">
    <Audio src={staticFile(`${dir}/${id}.wav`)} volume={1} />
  </Sequence>
);
const sfx = (name: string, at: number, volume = 0.1) => (
  <Sequence from={at} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

/** Voice start frames and the windows (frame, frame) where the music ducks, per language. */
const VO_AT: Record<Lang, number[]> = { en: [12, 147, 285, 582, 792, 1002, 1200], ur: [12, 147, 285, 582, 792, 1002, 1198] };
const VOICE: Record<Lang, [number, number][]> = {
  en: [[12, 82], [147, 258], [285, 414], [582, 688], [792, 884], [1002, 1143], [1200, 1343]],
  ur: [[12, 62], [147, 260], [285, 418], [582, 694], [792, 840], [1002, 1115], [1198, 1348]],
};
const musicVolume = (f: number, voice: [number, number][]) => {
  const inVoice = voice.some(([a, b]) => f >= a && f <= b);
  const near = Math.min(...voice.map(([a, b]) => (f < a ? a - f : f > b ? f - b : 0)));
  const duck = inVoice ? 0.55 : interpolate(near, [0, 18], [0.55, 1], clamp);
  return 0.2 * duck;
};

const AudioTrack: React.FC = () => {
  const { lang } = useL();
  const dir = lang === "ur" ? "vo-ur" : "vo";
  const at = VO_AT[lang];
  const sell = S.sell[0];
  return (
    <>
      <Audio src={staticFile("music/bed.wav")} volume={(f) => musicVolume(f, VOICE[lang])} />
      {at.map((a, i) => (
        <React.Fragment key={i}>{vo(`0${i + 1}`, a, dir)}</React.Fragment>
      ))}
      {sfx("whoosh", 4)}
      {sfx("riser", 96, 0.08)}
      {sfx("hit", S.logo[0] + 14, 0.14)}
      {sfx("whoosh", sell - 4)}
      {sfx("beep", sell + 50)}
      {sfx("click", sell + 56)}
      {sfx("whoosh", sell + 98, 0.08)}
      {sfx("click", sell + 114)}
      {sfx("click", sell + 152)}
      {sfx("click", sell + 192)}
      {sfx("ding", sell + 200, 0.12)}
      {sfx("whoosh", S.ledger[0] - 4)}
      {sfx("click", S.ledger[0] + 24)}
      {sfx("click", S.ledger[0] + 50)}
      {sfx("click", S.ledger[0] + 110)}
      {sfx("whoosh", S.profit[0] - 4)}
      {sfx("click", S.profit[0] + 34)}
      {sfx("ding", S.profit[0] + 95, 0.12)}
      {sfx("whoosh", S.devices[0] - 4)}
      {sfx("click", S.devices[0] + 8)}
      {sfx("click", S.devices[0] + 40)}
      {sfx("click", S.devices[0] + 70)}
      {sfx("ding", S.devices[0] + 104, 0.1)}
      {sfx("whoosh", S.cta[0] - 4)}
      {sfx("hit", S.cta[0] + 2, 0.1)}
      {sfx("ding", S.cta[0] + 26, 0.12)}
    </>
  );
};

/* ------------------------------------------------------------------ root */

export const Ad: React.FC<{ lang?: Lang; theme?: VideoTheme }> = ({ lang = "en", theme = "dark" }) => (
  <LangCtx.Provider value={{ lang, rtl: lang === "ur", t: STR[lang] }}>
    <ThemeCtx.Provider value={THEME[theme]}>
      <AbsoluteFill style={{ background: THEME[theme].bg }}>
        {theme === "light" ? <LightBackground /> : <Background />}
        <Scene range={S.hook}><HookScene /></Scene>
        <Scene range={S.logo}><LogoScene /></Scene>
        <Scene range={S.sell}><SellScene /></Scene>
        <Scene range={S.ledger}><LedgerScene /></Scene>
        <Scene range={S.profit}><ProfitScene /></Scene>
        <Scene range={S.devices}><DevicesScene /></Scene>
        <Scene range={S.cta} hold><CtaScene /></Scene>
        {theme === "dark" && <Vignette />}
        <Grain />
        <AudioTrack />
      </AbsoluteFill>
    </ThemeCtx.Provider>
  </LangCtx.Provider>
);
