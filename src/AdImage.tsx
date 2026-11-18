import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { Background, GREEN_LIGHT, Laptop, LightBackground, LogoBadge, Phone, Shot, Wordmark, fontFamily } from "./Ad";

export type AdTheme = "dark" | "light";
export type AdLang = "en" | "ur";
const COPY = {
  en: { head: ["Your whole shop", "in your pocket."], sub: "Billing, udhaar ledger and profit reports. Works offline.", p1: "Scan & sell", p2: "Udhaar ledger", p3: "Free to start", scan: "Scan to download" },
  ur: { head: ["آپ کی پوری دکان", "آپ کی جیب میں۔"], sub: "بلنگ، ادھار لیجر اور منافع کی رپورٹس۔ انٹرنیٹ کے بغیر بھی۔", p1: "اسکین اور فروخت", p2: "ادھار لیجر", p3: "مفت شروع کریں", scan: "اسکین کر کے ڈاؤن لوڈ کریں" },
};

const tokens = (light: boolean) =>
  light
    ? { head: "#0B1A10", accent: "#15803D", sub: "#4B5B50", pillBg: "#EEF4F0", pillBorder: "#D5E2D9", pillText: "#0B1A10", green: "#16A34A", onGreen: "#fff", qrBorder: "1.5px solid #DCE7E0", label: "#0B1A10" }
    : { head: "#fff", accent: GREEN_LIGHT, sub: "rgba(255,255,255,0.75)", pillBg: "rgba(255,255,255,0.09)", pillBorder: "rgba(255,255,255,0.2)", pillText: "#fff", green: GREEN_LIGHT, onGreen: "#04210f", qrBorder: "none", label: "#fff" };
type Tokens = ReturnType<typeof tokens>;

const Pill: React.FC<{ text: string; u: number; c: Tokens; green?: boolean }> = ({ text, u, c, green }) => (
  <div
    style={{
      fontFamily, fontWeight: 700, fontSize: 28 * u, padding: `${13 * u}px ${26 * u}px`, borderRadius: 999, whiteSpace: "nowrap",
      color: green ? c.onGreen : c.pillText, background: green ? c.green : c.pillBg, border: green ? "none" : `1.5px solid ${c.pillBorder}`,
    }}
  >
    {text}
  </div>
);

/** Drawn badge (not Google's official artwork). */
const PlayBadge: React.FC<{ u: number }> = ({ u }) => (
  <div
    style={{
      fontFamily, display: "flex", alignItems: "center", gap: 18 * u, color: "#fff", background: "#000",
      border: "2px solid rgba(255,255,255,0.55)", padding: `${14 * u}px ${34 * u}px ${14 * u}px ${24 * u}px`, borderRadius: 20 * u,
    }}
  >
    <svg width={52 * u} height={52 * u} viewBox="0 0 24 24">
      <path d="M3.6 2.2c-.3.2-.5.6-.5 1.1v17.4c0 .5.2.9.5 1.1l9.8-9.8z" fill="#00D7FE" />
      <path d="M17 15.4l-3.6-3.6 3.6-3.6 4.2 2.4c1.2.7 1.2 1.8 0 2.5z" fill="#FFCE00" />
      <path d="M13.4 11.8L3.6 21.8c.4.3 1 .3 1.6 0L17 15.4z" fill="#FF3A44" />
      <path d="M13.4 11.8L3.6 2.2c.4-.3 1-.3 1.6 0L17 8.2z" fill="#00F076" />
    </svg>
    <div style={{ lineHeight: 1.05 }}>
      <div style={{ fontSize: 19 * u, fontWeight: 600, letterSpacing: 3 * u }}>GET IT ON</div>
      <div style={{ fontSize: 44 * u, fontWeight: 800, letterSpacing: -1 * u }}>Google Play</div>
    </div>
  </div>
);

const Qr: React.FC<{ u: number; size: number; c: Tokens; light: boolean; label: string }> = ({ u, size, c, light, label }) => (
  <div style={{ fontFamily, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * u }}>
    <div style={{ background: "#fff", padding: 12 * u, borderRadius: 20 * u, border: c.qrBorder, boxShadow: light ? "0 14px 36px rgba(15,40,25,0.16)" : `0 0 ${50 * u}px rgba(74,222,128,0.35)` }}>
      <Img src={staticFile("img/play-qr.png")} style={{ width: size, height: size, display: "block" }} />
    </div>
    <div style={{ fontSize: 22 * u, fontWeight: 700, color: c.label, lineHeight: 1.4 }}>{label}</div>
  </div>
);

/** One static ad in square, wide and story sizes, dark or light. Render at frame 60 so the background is settled. */
export const AdImage: React.FC<{ theme: AdTheme; lang?: AdLang }> = ({ theme, lang = "en" }) => {
  const { width, height } = useVideoConfig();
  const light = theme === "light";
  const rtl = lang === "ur";
  const t = COPY[lang];
  const c = tokens(light);
  const vertical = height > width * 1.2;
  const wide = width > height * 1.2;
  const square = !wide && !vertical;
  const u = Math.min(width, height) / 1080;
  const headSize = (wide ? 92 : vertical ? 96 : 68) * u * (rtl ? 0.86 : 1);
  const X = (L: number, W: number): React.CSSProperties => ({ left: (rtl ? width / u - L - W : L) * u });
  const pu = square ? u * 0.8 : u;
  const phoneShadow: React.CSSProperties | undefined = light ? { boxShadow: "0 40px 90px rgba(15,40,25,0.32), 0 8px 24px rgba(15,40,25,0.2)" } : undefined;

  const text = (
    <div style={{ direction: rtl ? "rtl" : "ltr", display: "flex", flexDirection: "column", gap: (vertical ? 28 : 26) * u, alignItems: vertical ? "center" : "flex-start", textAlign: vertical ? "center" : rtl ? "right" : "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 * u }}>
        <LogoBadge size={(vertical ? 104 : 92) * u} />
        <Wordmark size={(vertical ? 74 : 66) * u} ink={c.head} accent={c.accent} />
      </div>
      <div style={{ fontFamily, fontWeight: 800, fontSize: headSize, lineHeight: rtl ? 1.4 : 1.03, letterSpacing: rtl ? 0 : -headSize * 0.025, color: c.head }}>
        {t.head[0]}
        <br />
        <span style={{ color: c.accent }}>{t.head[1]}</span>
      </div>
      <div style={{ fontFamily, fontWeight: 500, fontSize: (vertical ? 34 : 30) * u, lineHeight: rtl ? 1.7 : 1.3, color: c.sub, maxWidth: (wide ? 840 : vertical ? 940 : 600) * u }}>
        {t.sub}
      </div>
      {!square && (
        <div style={{ display: "flex", gap: 14 * u, flexWrap: "wrap", justifyContent: vertical ? "center" : "flex-start" }}>
          <Pill text={t.p1} u={pu} c={c} />
          <Pill text={t.p2} u={pu} c={c} />
          <Pill text={t.p3} u={pu} c={c} green />
        </div>
      )}
    </div>
  );

  const store = (
    <div style={{ display: "flex", alignItems: "center", gap: 30 * u }}>
      <PlayBadge u={u} />
      <Qr u={u} size={(wide ? 150 : 130) * u} c={c} light={light} label={t.scan} />
    </div>
  );

  const laptop = (w: number) => <Laptop w={w} src="w-sell.png" soft={light} />;
  const phone = (w: number) => (
    <Phone w={w} style={phoneShadow}>
      <Shot src="p-ledger.png" />
    </Phone>
  );

  return (
    <AbsoluteFill>
      {light ? <LightBackground /> : <Background />}
      {wide && (
        <>
          <div style={{ position: "absolute", ...X(120, 800), top: 0, bottom: 0, width: 800 * u, display: "flex", flexDirection: "column", justifyContent: "center", gap: 46 * u }}>
            {text}
            {store}
          </div>
          <div style={{ position: "absolute", ...X(1040, 820), top: 210 * u }}>{laptop(820 * u)}</div>
          <div style={{ position: "absolute", ...X(940, 320), top: 410 * u }}>{phone(320 * u)}</div>
        </>
      )}
      {square && (
        <>
          <div style={{ position: "absolute", ...X(60, 620), top: 60 * u, width: 620 * u }}>{text}</div>
          <div style={{ position: "absolute", ...X(730, 250), width: 250 * u, top: 62 * u, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 * u }}>
            <Qr u={u} size={120 * u} c={c} light={light} label={t.scan} />
            <PlayBadge u={u * 0.62} />
          </div>
          <div style={{ position: "absolute", ...X(60, 740), top: 520 * u }}>{laptop(740 * u)}</div>
          <div style={{ position: "absolute", ...X(700, 300), top: 480 * u }}>{phone(300 * u)}</div>
        </>
      )}
      {vertical && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 80 * u, display: "flex", justifyContent: "center", padding: `0 ${60 * u}px` }}>{text}</div>
          <div style={{ position: "absolute", left: 90 * u, top: 660 * u }}>{laptop(900 * u)}</div>
          <div style={{ position: "absolute", ...X(590, 370), top: 890 * u }}>{phone(370 * u)}</div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 60 * u, display: "flex", justifyContent: "center" }}>{store}</div>
        </>
      )}
    </AbsoluteFill>
  );
};
