import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Background, Card, CropId, Laptop, LightBackground, LogoBadge, Phone, PlayBadge, QrCard, ScreenWall, Shot, THEME, ThemeCtx, Vignette, Wordmark, fontFamily } from "./Ad";

export type AdTheme = "dark" | "light";
export type AdLang = "en" | "ur";
const COPY = {
  en: { head: ["Your whole shop", "in your pocket."], sub: "Billing, udhaar ledger and profit reports. Works offline.", p1: "Scan & sell", p2: "Udhaar ledger", p3: "Free to start", scan: "Scan to download" },
  ur: { head: ["آپ کی پوری دکان", "آپ کی جیب میں۔"], sub: "بلنگ، ادھار لیجر اور منافع کی رپورٹس۔ انٹرنیٹ کے بغیر بھی۔", p1: "اسکین اور فروخت", p2: "ادھار لیجر", p3: "مفت شروع کریں", scan: "اسکین کر کے ڈاؤن لوڈ کریں" },
};

type Th = (typeof THEME)["dark"];

const Pill: React.FC<{ text: string; u: number; th: Th; green?: boolean }> = ({ text, u, th, green }) => (
  <div
    style={{
      fontFamily, fontWeight: 700, fontSize: 28 * u, padding: `${13 * u}px ${26 * u}px`, borderRadius: 999, whiteSpace: "nowrap",
      color: green ? th.onGreen : th.chipText, background: green ? th.greenBg : th.chipBg, border: green ? "none" : th.chipBorder,
      boxShadow: green ? `0 0 ${40 * u}px ${th.greenGlow}` : "none",
    }}
  >
    {text}
  </div>
);

/** An element at (left, top) in px at u = 1, turned in 3D. Mirrored in Urdu. */
const Put: React.FC<{ x: number; y: number; w: number; ry?: number; rx?: number; rz?: number; z?: number; children: React.ReactNode }> = ({ x, y, w, ry = 0, rx = 0, rz = 0, z = 0, children }) => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const rtl = React.useContext(Rtl);
  return (
    <div style={{ position: "absolute", left: rtl ? width - (x + w) * u : x * u, top: y * u, zIndex: z, perspective: 2400 * u }}>
      <div style={{ transform: `rotateX(${rx}deg) rotateY(${rtl ? -ry : ry}deg) rotateZ(${rtl ? -rz : rz}deg)` }}>{children}</div>
    </div>
  );
};
const Rtl = React.createContext(false);

/** One static ad in square, wide and story sizes, dark or light. Render at frame 60. */
export const AdImage: React.FC<{ theme: AdTheme; lang?: AdLang }> = ({ theme, lang = "en" }) => {
  const { width, height } = useVideoConfig();
  const th = THEME[theme];
  const light = theme === "light";
  const rtl = lang === "ur";
  const t = COPY[lang];
  const vertical = height > width * 1.2;
  const wide = width > height * 1.2;
  const square = !wide && !vertical;
  const u = Math.min(width, height) / 1080;
  const headSize = (wide ? 100 : vertical ? 104 : 74) * u * (rtl ? 0.86 : 1);
  const center = vertical;

  const text = (
    <div style={{ direction: rtl ? "rtl" : "ltr", display: "flex", flexDirection: "column", gap: (square ? 22 : 28) * u, alignItems: center ? "center" : "flex-start", textAlign: center ? "center" : "start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 * u, direction: "ltr" }}>
        <LogoBadge size={(square ? 84 : 100) * u} />
        <Wordmark size={(square ? 60 : 72) * u} ink={th.head} accent={th.accent} />
      </div>
      <div style={{ fontFamily, fontWeight: 800, fontSize: headSize, lineHeight: rtl ? 1.4 : 1.02, letterSpacing: rtl ? 0 : -headSize * 0.028, color: th.head, whiteSpace: "nowrap" }}>
        {t.head[0]}
        <br />
        <span style={{ backgroundImage: th.grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{t.head[1]}</span>
      </div>
      <div style={{ fontFamily, fontWeight: 500, fontSize: (vertical ? 36 : square ? 28 : 32) * u, lineHeight: rtl ? 1.7 : 1.3, color: th.sub, maxWidth: (wide ? 800 : vertical ? 900 : 600) * u }}>
        {t.sub}
      </div>
      {!square && (
        <div style={{ display: "flex", gap: 14 * u, flexWrap: "wrap", justifyContent: center ? "center" : "flex-start" }}>
          <Pill text={t.p1} u={u} th={th} />
          <Pill text={t.p2} u={u} th={th} />
          <Pill text={t.p3} u={u} th={th} green />
        </div>
      )}
    </div>
  );

  const qr = (size: number) => (
    <div style={{ fontFamily, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 * u }}>
      <QrCard size={size} animate={false} />
      <div style={{ fontSize: 24 * u, fontWeight: 800, color: th.head, whiteSpace: "nowrap" }}>{t.scan}</div>
    </div>
  );
  const store = (badge: number, qrSize: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 36 * u, direction: rtl ? "rtl" : "ltr" }}>
      <PlayBadge u={u * badge} />
      {qr(qrSize)}
    </div>
  );
  const phone = (w: number, src: string) => (
    <Phone w={w * u}>
      <Shot src={src} />
    </Phone>
  );
  const card = (id: CropId, w: number) => <Card id={id} w={w * u} />;

  return (
    <ThemeCtx.Provider value={th}>
      <Rtl.Provider value={rtl}>
        <AbsoluteFill style={{ background: th.bg }}>
          {light ? <LightBackground /> : <Background />}
          <ScreenWall veil={light ? 0.8 : 0.78} speed={0} />
          {/* keep the text side calm */}
          <AbsoluteFill
            style={{
              background: wide
                ? `linear-gradient(${rtl ? 270 : 90}deg, rgba(${th.veil},0.92) 0%, rgba(${th.veil},0.75) 42%, transparent 62%)`
                : `linear-gradient(180deg, rgba(${th.veil},0.92) 0%, rgba(${th.veil},0.7) ${square ? 40 : 30}%, transparent ${square ? 55 : 42}%)`,
            }}
          />
          {wide && (
            <>
              <Put x={1000} y={110} w={1000} ry={-16} rx={6}>
                <Laptop w={1000 * u} src="w-sell.png" />
              </Put>
              <Put x={880} y={330} w={380} ry={-10} rx={4} z={2}>
                {phone(380, "p-home.png")}
              </Put>
              <Put x={1520} y={700} w={380} rz={-3} z={3}>
                {card("net", 380)}
              </Put>
              <Put x={1330} y={40} w={300} rz={3} z={3}>
                {card("get", 300)}
              </Put>
              <div style={{ position: "absolute", top: 0, bottom: 0, left: rtl ? undefined : 110 * u, right: rtl ? 110 * u : undefined, width: 790 * u, display: "flex", flexDirection: "column", justifyContent: "center", gap: 46 * u, zIndex: 4 }}>
                {text}
                {store(0.85, 140 * u)}
              </div>
            </>
          )}
          {square && (
            <>
              <Put x={-70} y={540} w={820} ry={14} rx={6}>
                <Laptop w={820 * u} src="w-sell.png" />
              </Put>
              <Put x={690} y={430} w={340} ry={-10} rx={4} z={2}>
                {phone(340, "p-ledger.png")}
              </Put>
              <Put x={380} y={850} w={360} rz={-3} z={3}>
                {card("net", 360)}
              </Put>
              <div style={{ position: "absolute", top: 56 * u, left: rtl ? undefined : 60 * u, right: rtl ? 60 * u : undefined, width: 650 * u, zIndex: 4 }}>{text}</div>
              <div style={{ position: "absolute", top: 60 * u, left: rtl ? 50 * u : undefined, right: rtl ? undefined : 50 * u, width: 280 * u, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 * u, zIndex: 4 }}>
                {qr(150 * u)}
                <PlayBadge u={u * 0.6} />
              </div>
            </>
          )}
          {vertical && (
            <>
              <Put x={170} y={790} w={980} ry={-16} rx={6}>
                <Laptop w={980 * u} src="w-sell.png" />
              </Put>
              <Put x={50} y={800} w={420} ry={10} rx={4} z={2}>
                {phone(420, "p-home.png")}
              </Put>
              <Put x={560} y={1240} w={440} rz={-3} z={3}>
                {card("net", 440)}
              </Put>
              <Put x={620} y={690} w={340} rz={3} z={3}>
                {card("get", 340)}
              </Put>
              <div style={{ position: "absolute", left: 0, right: 0, top: 90 * u, display: "flex", justifyContent: "center", padding: `0 ${60 * u}px`, zIndex: 4 }}>{text}</div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 380 * u, background: `linear-gradient(0deg, rgba(${th.veil},0.95) 30%, transparent)`, zIndex: 4 }} />
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 70 * u, display: "flex", justifyContent: "center", zIndex: 5 }}>{store(1, 150 * u)}</div>
            </>
          )}
          {!light && <Vignette />}
        </AbsoluteFill>
      </Rtl.Provider>
    </ThemeCtx.Provider>
  );
};
