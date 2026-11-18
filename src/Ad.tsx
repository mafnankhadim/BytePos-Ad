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
    hookChips: ["Rs 2,050", "Udhaar", "Low stock", "INV-0042", "Rs 12,271", "Out of stock", "Rs 6,754", "Cash", "Restock", "Rs 1,380"],
    sell: { head: ["Checkout", "in seconds."], s1: "Scan", s2: "Add", s3: "Pay", offline: "Works fully offline", done: "Sale complete", change: "Change Rs 416" },
    ledger: { head: ["Every udhaar,", "tracked."], sub: "Know exactly who owes what." },
    profit: { head: ["Real profit.", "Every day."], label: "NET PROFIT TODAY" },
    devices: { head: ["Phone. Web. Computer."], headV: ["Phone. Web.", "Computer."], sub: "One shop, always in sync.", c1: "Staff roles", c2: "6 languages", c3: "Offline-first" },
    cta: { head: ["Start free today."], avail: "Available now on Google Play", web: "Web app: bytepos.vercel.app", scan: "Scan to download" },
  },
  ur: {
    hook: ["دکان چلانا", "کبھی نہیں رکتا۔"],
    hookChips: ["Rs 2,050", "ادھار", "اسٹاک کم ہے", "INV-0042", "Rs 12,271", "اسٹاک ختم", "Rs 6,754", "نقد", "ری اسٹاک", "Rs 1,380"],
    sell: { head: ["سیکنڈوں میں", "بل بنائیں۔"], s1: "اسکین", s2: "شامل کریں", s3: "ادائیگی", offline: "انٹرنیٹ کے بغیر بھی چلتا ہے", done: "سیل مکمل", change: "باقی رقم Rs 416" },
    ledger: { head: ["ہر ادھار کا", "حساب۔"], sub: "جانیں کس سے کیا لینا ہے۔" },
    profit: { head: ["اصل منافع۔", "ہر روز۔"], label: "آج کا خالص منافع" },
    devices: { head: ["فون۔ ویب۔ کمپیوٹر۔"], headV: ["فون۔ ویب۔", "کمپیوٹر۔"], sub: "ایک دکان، ہمیشہ ہم آہنگ۔", c1: "اسٹاف رولز", c2: "6 زبانیں", c3: "آف لائن فرسٹ" },
    cta: { head: ["آج ہی مفت شروع کریں۔"], avail: "گوگل پلے پر دستیاب ہے", web: "ویب ایپ: bytepos.vercel.app", scan: "اسکین کر کے ڈاؤن لوڈ کریں" },
  },
};
const LangCtx = React.createContext<{ lang: Lang; rtl: boolean; t: typeof STR.en }>({ lang: "en", rtl: false, t: STR.en });
const useL = () => React.useContext(LangCtx);

export type VideoTheme = "dark" | "light";
const THEME = {
  dark: { light: false, head: "#fff", accent: GREEN_LIGHT, sub: "rgba(255,255,255,0.72)", faint: "rgba(255,255,255,0.55)", chipBg: "rgba(255,255,255,0.09)", chipBorder: "1.5px solid rgba(255,255,255,0.18)", chipText: "#fff", chipShadow: "0 12px 40px rgba(0,0,0,0.35)", greenBg: GREEN_LIGHT, onGreen: "#04210f", greenGlow: "rgba(74,222,128,0.45)", hookText: "rgba(255,255,255,0.4)", hookBorder: "rgba(255,255,255,0.14)", hookBg: "rgba(255,255,255,0.04)", ring: "74,222,128", bg: INK },
  light: { light: true, head: "#0B1A10", accent: "#15803D", sub: "rgba(11,26,16,0.72)", faint: "rgba(11,26,16,0.55)", chipBg: "#EEF4F0", chipBorder: "1.5px solid #D5E2D9", chipText: "#0B1A10", chipShadow: "0 10px 30px rgba(15,40,25,0.12)", greenBg: "#16A34A", onGreen: "#fff", greenGlow: "rgba(22,163,74,0.3)", hookText: "rgba(11,26,16,0.45)", hookBorder: "rgba(11,26,16,0.14)", hookBg: "rgba(11,26,16,0.04)", ring: "22,163,74", bg: "#FFFFFF" },
};
const ThemeCtx = React.createContext(THEME.dark);
const useTheme = () => React.useContext(ThemeCtx);

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Scene boundaries in frames (30 fps, 1350 total = 45 s). */
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

/* ------------------------------------------------------------------ pieces */

const enter = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 28 });

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const orb = (x: number, y: number, size: number, speed: number, color: string, phase: number) => (
    <div
      style={{
        position: "absolute",
        left: x * width + Math.sin(frame / speed + phase) * width * 0.05 - size / 2,
        top: y * height + Math.cos(frame / (speed * 1.3) + phase) * height * 0.05 - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
        filter: "blur(30px)",
      }}
    />
  );
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 0%, #0c1f14 0%, ${INK} 60%)` }}>
      {orb(0.15, 0.2, width * 0.7, 55, "rgba(22,163,74,0.28)", 0)}
      {orb(0.85, 0.8, width * 0.6, 70, "rgba(34,197,94,0.18)", 2)}
      {orb(0.6, 0.1, width * 0.35, 90, "rgba(74,222,128,0.12)", 4)}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          maskImage: "radial-gradient(70% 60% at 50% 45%, black, transparent)",
        }}
      />
    </AbsoluteFill>
  );
};

export const LightBackground: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFFFFF" }}>
    <AbsoluteFill style={{ background: "radial-gradient(60% 50% at 12% 8%, rgba(22,163,74,0.14), transparent 70%), radial-gradient(55% 45% at 95% 95%, rgba(74,222,128,0.18), transparent 70%)" }} />
    <AbsoluteFill
      style={{
        backgroundImage: "linear-gradient(rgba(10,40,20,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(10,40,20,0.045) 1px, transparent 1px)",
        backgroundSize: "90px 90px", maskImage: "radial-gradient(75% 65% at 50% 45%, black, transparent)",
      }}
    />
  </AbsoluteFill>
);

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }}
  />
);

/** A scene that fades/pushes in over `overlap` frames and out at its end, with a green light flash at the cut. */
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
  const inP = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: EASE });
  const outP = hold ? 1 : interpolate(frame, [dur - 12, dur], [1, 0], clamp);
  const flash = interpolate(frame, [0, 4, 16], [0, 0.35, 0], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(inP, outP),
        scale: interpolate(frame, [0, dur], [1.0, 1.045]) * interpolate(inP, [0, 1], [1.06, 1]),
        filter: `blur(${interpolate(inP, [0, 1], [10, 0])}px)`,
      }}
    >
      {children}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(${th.ring},${flash * (th.light ? 0.4 : 1)}), transparent 70%)` }} />
    </AbsoluteFill>
  );
};

const Headline: React.FC<{
  lines: string[];
  sub?: string;
  delay?: number;
  align?: "left" | "center";
  accentLine?: number;
}> = ({ lines, sub, delay = 0, align = "left", accentLine }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useLayout();
  const { rtl } = useL();
  const th = useTheme();
  return (
    <div style={{ fontFamily, direction: rtl ? "rtl" : "ltr", textAlign: align === "left" && rtl ? "right" : align, display: "flex", flexDirection: "column", gap: 10 * u }}>
      {lines.map((line, i) => {
        const p = enter(frame, fps, delay + i * 7);
        return (
          <div
            key={line}
            style={{
              fontSize: (vertical ? 104 : 92) * u * (rtl ? 0.86 : 1),
              lineHeight: rtl ? 1.4 : 1.04,
              fontWeight: 800,
              letterSpacing: rtl ? 0 : -2 * u,
              color: i === accentLine ? th.accent : th.head,
              opacity: p,
              translate: `0 ${interpolate(p, [0, 1], [50 * u, 0])}px`,
              filter: `blur(${interpolate(p, [0, 1], [14, 0])}px)`,
            }}
          >
            {line}
          </div>
        );
      })}
      {sub && (
        <div
          style={{
            marginTop: 14 * u,
            fontSize: (vertical ? 44 : 38) * u,
            fontWeight: 500,
            color: th.sub,
            opacity: enter(frame, fps, delay + lines.length * 7 + 6),
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

const Chip: React.FC<{ text: string; delay: number; icon?: React.ReactNode; tone?: "green" | "glass" }> = ({
  text,
  delay,
  icon,
  tone = "glass",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useLayout();
  const th = useTheme();
  const p = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 140 } });
  return (
    <div
      style={{
        fontFamily,
        display: "inline-flex",
        alignItems: "center",
        gap: 12 * u,
        padding: `${16 * u}px ${28 * u}px`,
        borderRadius: 999,
        fontSize: 34 * u,
        fontWeight: 700,
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

export const Phone: React.FC<{ w: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ w, children, style }) => {
  const th = useTheme();
  const bez = w * 0.028;
  return (
    <div
      style={{
        width: w,
        height: w * 1.985,
        borderRadius: w * 0.15,
        background: "linear-gradient(145deg, #2a312d, #0a0d0b 40%, #1c211e)",
        padding: bez,
        boxShadow: th.light ? `0 ${w * 0.1}px ${w * 0.25}px rgba(15,40,25,0.3), 0 8px 24px rgba(15,40,25,0.18)` : `0 ${w * 0.12}px ${w * 0.35}px rgba(0,0,0,0.65), 0 0 ${w * 0.5}px rgba(22,163,74,0.28)`,
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

export const Shot: React.FC<{ src: string; opacity?: number; scale?: number; originY?: number }> = ({ src, opacity = 1, scale = 1, originY = 50 }) => (
  <Img
    src={staticFile(`img/${src}`)}
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "top",
      opacity,
      scale,
      transformOrigin: `50% ${originY}%`,
    }}
  />
);

/** Highlight box, positioned in % of the screenshot. */
const Hilite: React.FC<{ x: number; y: number; w: number; h: number; from: number; to: number; radius?: number }> = ({
  x, y, w, h, from, to, radius = 4,
}) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [from, from + 10, to - 10, to], [0, 1, 1, 0], clamp);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 4);
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`,
        borderRadius: `${radius}%/${radius * 0.45}%`,
        border: `4px solid ${GREEN_LIGHT}`,
        boxShadow: `0 0 ${24 + pulse * 26}px rgba(74,222,128,0.8), inset 0 0 30px rgba(74,222,128,0.25)`,
        opacity: a,
      }}
    />
  );
};

export const Laptop: React.FC<{ w: number; src: string; style?: React.CSSProperties; soft?: boolean }> = ({ w, src, style, soft }) => {
  const th = useTheme();
  const isSoft = soft ?? th.light;
  const bez = w * 0.012;
  return (
    <div style={{ width: w, position: "relative", ...style }}>
      <div
        style={{
          width: "100%",
          aspectRatio: "1440 / 900",
          borderRadius: w * 0.02,
          background: "#0c0f0d",
          padding: bez,
          boxShadow: isSoft ? `0 ${w * 0.04}px ${w * 0.1}px rgba(15,40,25,0.3)` : `0 ${w * 0.05}px ${w * 0.15}px rgba(0,0,0,0.6), 0 0 ${w * 0.2}px rgba(22,163,74,0.25)`,
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: w * 0.012, overflow: "hidden", position: "relative" }}>
          <Shot src={src} />
        </div>
      </div>
      <div style={{ width: "112%", marginLeft: "-6%", height: w * 0.022, borderRadius: `0 0 ${w * 0.03}px ${w * 0.03}px`, background: "linear-gradient(#cfd5d1, #8c938e)", marginTop: -1 }} />
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

export const LogoBadge: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.24, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${size * 0.8}px rgba(22,163,74,0.55), 0 ${size * 0.1}px ${size * 0.3}px rgba(0,0,0,0.5)` }}>
    <Img src={staticFile("img/logo-mark.png")} style={{ width: "86%", height: "86%", objectFit: "contain" }} />
  </div>
);

export const Wordmark: React.FC<{ size: number; ink?: string; accent?: string }> = ({ size, ink = "#fff", accent = GREEN_LIGHT }) => (
  <div style={{ fontFamily, fontSize: size, fontWeight: 800, letterSpacing: -size * 0.03, color: ink, lineHeight: 1 }}>
    Byte<span style={{ color: accent }}>POS</span>
  </div>
);

/** Device wrapper: smooth rise + 3D tilt that settles, then a slow float. */
const Float: React.FC<{ children: React.ReactNode; delay?: number; tilt?: number; style?: React.CSSProperties }> = ({
  children, delay = 0, tilt = -14, style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useLayout();
  const p = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 70 }, durationInFrames: 50 });
  return (
    <div
      style={{
        opacity: Math.min(1, p * 2),
        translate: `0 ${interpolate(p, [0, 1], [260 * u, 0]) + Math.sin(frame / 22) * 8 * u}px`,
        rotate: `${interpolate(p, [0, 1], [tilt * 1.8, 0]) + Math.sin(frame / 40) * 0.8}deg`,
        perspective: 1800,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ scenes */

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, u, vertical } = useLayout();
  const { t } = useL();
  const th = useTheme();
  const chips = t.hookChips;
  return (
    <AbsoluteFill>
      {chips.map((c, i) => {
        const x = ((i * 0.37 + 0.08) % 1) * width * 0.9;
        const speed = 3 + (i % 4);
        const y = height + 100 - ((frame * speed * u + i * 190) % (height + 300));
        return (
          <div
            key={c}
            style={{
              position: "absolute", left: x, top: y, fontFamily, fontWeight: 700, fontSize: (28 + (i % 3) * 8) * u,
              color: th.hookText, padding: `${10 * u}px ${22 * u}px`, borderRadius: 999,
              border: `1.5px solid ${th.hookBorder}`, background: th.hookBg,
              filter: `blur(${(i % 3) * 1.5}px)`, opacity: interpolate(y, [0, height * 0.2, height * 0.8, height], [0, 1, 1, 0], clamp),
            }}
          >
            {c}
          </div>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 * u }}>
        <Headline lines={t.hook} delay={10} align="center" accentLine={1} />
        <div
          style={{
            marginTop: 40 * u, height: 6 * u, width: interpolate(enter(frame, fps, 40), [0, 1], [0, (vertical ? 520 : 420) * u]),
            borderRadius: 99, background: `linear-gradient(90deg, transparent, ${th.accent}, transparent)`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const LogoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useLayout();
  const p = spring({ frame: frame - 14, fps, config: { damping: 12, stiffness: 90 } });
  const th = useTheme();
  const ring = interpolate(frame, [14, 70], [0, 1], { ...clamp, easing: EASE });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 36 * u }}>
      <div style={{ position: "relative", scale: interpolate(p, [0, 1], [0.3, 1]), opacity: Math.min(1, p * 2) }}>
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute", inset: -240 * u * ring * (1 + i * 0.5), borderRadius: "50%",
              border: `${3 * u}px solid rgba(${th.ring},${0.5 * (1 - ring)})`,
            }}
          />
        ))}
        <LogoBadge size={300 * u} />
      </div>
      <div style={{ opacity: enter(frame, fps, 30), translate: `0 ${interpolate(enter(frame, fps, 30), [0, 1], [40 * u, 0])}px`, filter: `blur(${interpolate(enter(frame, fps, 30), [0, 1], [12, 0])}px)` }}>
        <Wordmark size={150 * u} ink={th.head} accent={th.accent} />
      </div>
      <div
        style={{
          fontFamily, fontWeight: 700, fontSize: 36 * u, letterSpacing: 14 * u, color: th.sub,
          opacity: enter(frame, fps, 48), translate: `0 ${interpolate(enter(frame, fps, 48), [0, 1], [30 * u, 0])}px`,
        }}
      >
        SELL SMART. GROW FAST.
      </div>
    </AbsoluteFill>
  );
};

/** Text block + device, side by side (landscape) or stacked (vertical). */
const Split: React.FC<{ text: React.ReactNode; device: React.ReactNode; flip?: boolean }> = ({ text, device, flip }) => {
  const { vertical, u } = useLayout();
  const { rtl } = useL();
  const rev = rtl ? !flip : flip;
  return (
    <AbsoluteFill
      style={{
        flexDirection: vertical ? "column" : rev ? "row-reverse" : "row",
        alignItems: "center",
        justifyContent: vertical ? "flex-start" : "space-between",
        padding: vertical ? `${170 * u}px ${70 * u}px 0` : `0 ${130 * u}px`,
        gap: vertical ? 60 * u : 40 * u,
      }}
    >
      <div style={{ flex: vertical ? "none" : 1, display: "flex", flexDirection: "column", gap: 40 * u, direction: rtl ? "rtl" : "ltr" }}>{text}</div>
      <div style={{ flex: vertical ? "none" : 1, display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>{device}</div>
    </AbsoluteFill>
  );
};

const SellScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useLayout();
  const { t } = useL();
  const phoneW = (vertical ? 560 : 470) * u;
  const toCheckout = interpolate(frame, [100, 122], [0, 1], clamp);
  const tap = interpolate(frame, [186, 196, 214], [0, 1, 0], clamp);
  const done = enter(frame, fps, 200);
  const scanY = interpolate(frame, [18, 50], [44, 66], clamp);
  const scanOn = interpolate(frame, [16, 20, 48, 54], [0, 1, 1, 0], clamp);
  const step = (n: number, label: string, at: number) => <Chip key={label} text={`${n}  ${label}`} delay={at} tone={frame >= at && frame < at + 36 ? "green" : "glass"} />;
  return (
    <Split
      text={
        <>
          <Headline lines={t.sell.head} delay={4} accentLine={1} />
          <div style={{ display: "flex", gap: 18 * u, flexWrap: "wrap" }}>
            {step(1, t.sell.s1, 18)}
            {step(2, t.sell.s2, 54)}
            {step(3, t.sell.s3, 92)}
          </div>
          <div style={{ alignSelf: "flex-start" }}>
            <Chip text={t.sell.offline} delay={118} icon={<WifiOff size={38 * u} />} tone="green" />
          </div>
        </>
      }
      device={
        <Float delay={4} tilt={-10}>
          <Phone w={phoneW}>
            <Shot src="p-home.png" opacity={1 - toCheckout} />
            <Shot src="p-checkout.png" opacity={toCheckout} />
            {/* scanner sweep */}
            <div style={{ position: "absolute", left: "9%", width: "82%", top: `${scanY}%`, height: 4, background: GREEN_LIGHT, boxShadow: `0 0 28px 6px rgba(74,222,128,0.9)`, opacity: scanOn, borderRadius: 4 }} />
            <Hilite x={4} y={9} w={92} h={27} from={4} to={34} radius={7} />
            <Hilite x={3} y={73} w={94} h={26} from={64} to={96} radius={4} />
            <Hilite x={9} y={65} w={82} h={7} from={134} to={178} radius={10} />
            {/* finish tap + success */}
            <div style={{ position: "absolute", left: "70%", top: "93%", width: phoneW * 0.22, height: phoneW * 0.22, translate: "-50% -50%", borderRadius: "50%", background: "rgba(255,255,255,0.65)", scale: interpolate(tap, [0, 1], [0.2, 1.4]), opacity: tap * 0.9 }} />
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(5,30,14,${0.88 * done})`, opacity: done }}>
              <div style={{ width: phoneW * 0.34, height: phoneW * 0.34, borderRadius: "50%", background: GREEN, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", scale: interpolate(done, [0, 1], [0.4, 1]), boxShadow: "0 0 80px rgba(74,222,128,0.7)" }}>
                <Check size={phoneW * 0.2} />
              </div>
              <div style={{ fontFamily, color: "#fff", fontWeight: 800, fontSize: phoneW * 0.085, marginTop: phoneW * 0.06 }}>{t.sell.done}</div>
              <div style={{ fontFamily, color: GREEN_LIGHT, fontWeight: 700, fontSize: phoneW * 0.06, marginTop: phoneW * 0.015 }}>{t.sell.change}</div>
            </AbsoluteFill>
          </Phone>
        </Float>
      }
    />
  );
};

const LedgerScene: React.FC = () => {
  const { u, vertical } = useLayout();
  const { t } = useL();
  const phoneW = (vertical ? 540 : 470) * u;
  return (
    <Split
      flip
      text={<Headline lines={t.ledger.head} sub={t.ledger.sub} delay={4} accentLine={1} />}
      device={
        <div style={{ position: "relative" }}>
          <Float delay={4} tilt={10}>
            <Phone w={phoneW}>
              <Shot src="p-ledger.png" />
              <Hilite x={3} y={8} w={46} h={13} from={36} to={90} radius={9} />
              <Hilite x={51} y={8} w={46} h={13} from={70} to={130} radius={9} />
            </Phone>
          </Float>
        </div>
      }
    />
  );
};

const CountUp: React.FC<{ to: number; from: number; to_: number }> = ({ to, from, to_ }) => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [from, to_], [0, to], { ...clamp, easing: Easing.out(Easing.cubic) }));
  return <>{`Rs ${v.toLocaleString("en-US")}`}</>;
};

const ProfitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useLayout();
  const { t, rtl } = useL();
  const th = useTheme();
  const phoneW = (vertical ? 520 : 440) * u;
  const p = enter(frame, fps, 40);
  return (
    <Split
      text={
        <>
          <Headline lines={t.profit.head} delay={4} accentLine={0} />
          <div style={{ fontFamily, opacity: p, translate: `0 ${interpolate(p, [0, 1], [30 * u, 0])}px` }}>
            <div style={{ fontSize: 28 * u, fontWeight: 700, letterSpacing: rtl ? 0 : 4 * u, color: th.faint }}>{t.profit.label}</div>
            <div style={{ fontSize: (vertical ? 150 : 128) * u, fontWeight: 800, color: th.accent, letterSpacing: -4 * u, textShadow: th.light ? "none" : "0 0 60px rgba(74,222,128,0.5)" }}>
              <CountUp to={1988} from={0} to_={80} />
            </div>
          </div>
        </>
      }
      device={
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Float delay={4} tilt={8} style={{ position: "relative" }}>
            <Phone w={phoneW}>
              <Shot src="p-profit.png" />
              <Hilite x={4} y={17} w={92} h={17} from={20} to={80} radius={8} />
            </Phone>
          </Float>
        </div>
      }
    />
  );
};

const DevicesScene: React.FC = () => {
  const { u, vertical } = useLayout();
  const { t, rtl } = useL();
  const lap = (vertical ? 940 : rtl ? 830 : 1020) * u;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: vertical ? `0 ${60 * u}px` : 0 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: (vertical ? 70 : 36) * u }}>
        <Headline lines={vertical ? t.devices.headV : t.devices.head} sub={t.devices.sub} align="center" delay={4} accentLine={vertical ? 1 : 0} />
        <div style={{ position: "relative", display: "flex", justifyContent: "center", marginTop: (vertical ? 20 : 0) * u }}>
          <Float delay={8} tilt={-5}>
            <Laptop w={lap} src="w-sell.png" />
          </Float>
          <Float delay={22} tilt={9} style={{ position: "absolute", right: (vertical ? -10 : -110) * u, bottom: -70 * u }}>
            <Phone w={(vertical ? 270 : 250) * u}>
              <Shot src="p-home.png" />
            </Phone>
          </Float>
        </div>
        <div style={{ display: "flex", gap: 16 * u, flexWrap: "wrap", justifyContent: "center", marginTop: (vertical ? 60 : 30) * u }}>
          <Chip text={t.devices.c1} delay={70} />
          <Chip text={t.devices.c2} delay={80} />
          <Chip text={t.devices.c3} delay={90} tone="green" />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useLayout();
  const p = enter(frame, fps, 24);
  const glow = 0.5 + 0.5 * Math.sin(frame / 8);
  const { t, rtl } = useL();
  const th = useTheme();
  const q = enter(frame, fps, 16);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", direction: rtl ? "rtl" : "ltr", flexDirection: vertical ? "column" : "row", gap: (vertical ? 50 : 130) * u }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: vertical ? "center" : "flex-start", gap: (vertical ? 44 : 34) * u }}>
        <div style={{ scale: interpolate(enter(frame, fps, 2), [0, 1], [0.6, 1]), opacity: enter(frame, fps, 2), transformOrigin: "left center" }}>
          <LogoBadge size={(vertical ? 220 : 190) * u} />
        </div>
        <Headline lines={t.cta.head} align={vertical ? "center" : "left"} delay={10} accentLine={0} />
        {/* Google Play badge (drawn here, not the official artwork) */}
        <div
          style={{
            fontFamily, direction: "ltr", display: "flex", alignItems: "center", gap: 24 * u, color: "#fff", background: "#000", border: "2px solid rgba(255,255,255,0.55)",
            padding: `${18 * u}px ${44 * u}px ${18 * u}px ${32 * u}px`, borderRadius: 24 * u, opacity: p, scale: interpolate(p, [0, 1], [0.8, 1]),
            boxShadow: `0 0 ${(30 + glow * 40) * u}px rgba(74,222,128,${0.25 + glow * 0.3})`,
          }}
        >
          <svg width={64 * u} height={64 * u} viewBox="0 0 24 24">
            <path d="M3.6 2.2c-.3.2-.5.6-.5 1.1v17.4c0 .5.2.9.5 1.1l9.8-9.8z" fill="#00D7FE" />
            <path d="M17 15.4l-3.6-3.6 3.6-3.6 4.2 2.4c1.2.7 1.2 1.8 0 2.5z" fill="#FFCE00" />
            <path d="M13.4 11.8L3.6 21.8c.4.3 1 .3 1.6 0L17 15.4z" fill="#FF3A44" />
            <path d="M13.4 11.8L3.6 2.2c.4-.3 1-.3 1.6 0L17 8.2z" fill="#00F076" />
          </svg>
          <div style={{ lineHeight: 1.05 }}>
            <div style={{ fontSize: 24 * u, fontWeight: 600, letterSpacing: 3 * u }}>GET IT ON</div>
            <div style={{ fontSize: 56 * u, fontWeight: 800, letterSpacing: -1 * u }}>Google Play</div>
          </div>
        </div>
        <div style={{ fontFamily, fontWeight: 700, fontSize: 36 * u, color: th.accent, opacity: enter(frame, fps, 52) }}>{t.cta.avail}</div>
        <div style={{ fontFamily, fontWeight: 600, fontSize: 30 * u, color: th.sub, opacity: enter(frame, fps, 60) }}>{t.cta.web}</div>
      </div>
      <div style={{ fontFamily, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 * u, opacity: q, scale: interpolate(q, [0, 1], [0.85, 1]), translate: `0 ${interpolate(q, [0, 1], [40 * u, 0])}px` }}>
        <div style={{ background: "#fff", padding: 26 * u, borderRadius: 36 * u, border: th.light ? "1.5px solid #DCE7E0" : "none", boxShadow: th.light ? "0 18px 50px rgba(15,40,25,0.18)" : `0 0 ${80 * u}px rgba(74,222,128,0.4)` }}>
          <Img src={staticFile("img/play-qr.png")} style={{ width: (vertical ? 340 : 400) * u, height: (vertical ? 340 : 400) * u, display: "block" }} />
        </div>
        <div style={{ fontSize: 32 * u, fontWeight: 700, color: th.head }}>{t.cta.scan}</div>
        <div style={{ fontSize: 22 * u, fontWeight: 500, color: th.faint }}>play.google.com · com.mafnankhadim.bytepos</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ audio */

const vo = (id: string, at: number, dir: string) => (
  <Sequence from={at} layout="none">
    <Audio src={staticFile(`${dir}/${id}.wav`)} volume={1} />
  </Sequence>
);
const sfx = (name: string, at: number, volume = 0.7) => (
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
  return (
  <>
    <Audio src={staticFile("music/bed.wav")} volume={(f) => musicVolume(f, VOICE[lang])} />
    {vo("01", at[0], dir)}
    {vo("02", at[1], dir)}
    {vo("03", at[2], dir)}
    {vo("04", at[3], dir)}
    {vo("05", at[4], dir)}
    {vo("06", at[5], dir)}
    {vo("07", at[6], dir)}
    {sfx("whoosh", 4, 0.1)}
    {sfx("whoosh", 266, 0.1)}
    {sfx("beep", 285 + 48, 0.1)}
    {sfx("click", 285 + 84, 0.1)}
    {sfx("whoosh", 285 + 100, 0.1)}
    {sfx("click", 285 + 190, 0.1)}
    {sfx("ding", 285 + 200, 0.12)}
    {sfx("whoosh", 566, 0.1)}
    {sfx("click", 570 + 40, 0.1)}
    {sfx("click", 570 + 72, 0.1)}
    {sfx("whoosh", 776, 0.1)}
    {sfx("ding", 780 + 80, 0.12)}
    {sfx("whoosh", 986, 0.1)}
    {sfx("click", 990 + 70, 0.1)}
    {sfx("click", 990 + 80, 0.1)}
    {sfx("click", 990 + 90, 0.1)}
    {sfx("whoosh", 1201, 0.1)}
    {sfx("ding", 1205 + 24, 0.12)}
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
    <AudioTrack />
  </AbsoluteFill>
  </ThemeCtx.Provider>
  </LangCtx.Provider>
);
