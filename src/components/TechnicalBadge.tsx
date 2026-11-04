import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { BadgeVariant, SceneBadge } from "../data/scenes";
import { FONT, PALETTE, SAFE } from "../theme";
import { clamp } from "../utils/animation";

// Insignia técnica reutilizable (16:9): entrada con spring, ícono vectorial y subtítulo opcional.

const VARIANT: Record<BadgeVariant, { bg: string; fg: string; edge: string }> = {
  positive: { bg: PALETTE.positive, fg: "#ffffff", edge: "#138a41" },
  negative: { bg: PALETTE.negative, fg: "#ffffff", edge: "#a91f22" },
  info: { bg: PALETTE.info, fg: "#ffffff", edge: "#1b54a4" },
  warning: { bg: PALETTE.warning, fg: "#181509", edge: "#c48f00" },
};

const Glyph: React.FC<{ variant: BadgeVariant; icon?: "?"; color: string; size: number }> = ({ variant, icon, color, size }) => {
  const common = { fill: "none", stroke: color, strokeWidth: 9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  let path: React.ReactNode;
  if (icon === "?") {
    path = (
      <>
        <path d="M35 36c0-9 7-15 15-15s15 6 15 14c0 10-15 11-15 22" {...common} />
        <circle cx="50" cy="75" r="5.5" fill={color} />
      </>
    );
  } else if (variant === "positive") {
    path = <path d="M28 52 L44 67 L73 35" {...common} />;
  } else if (variant === "negative") {
    path = <path d="M33 33 L67 67 M67 33 L33 67" {...common} />;
  } else if (variant === "info") {
    path = (
      <>
        <circle cx="50" cy="30" r="6" fill={color} />
        <path d="M50 46 L50 72" {...common} />
      </>
    );
  } else {
    path = (
      <>
        <path d="M50 26 L50 58" {...common} />
        <circle cx="50" cy="73" r="6" fill={color} />
      </>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {path}
    </svg>
  );
};

export type TechnicalBadgeProps = {
  text: string;
  variant: BadgeVariant;
  subtitle?: string;
  icon?: "?";
  size?: "normal" | "large";
  enter: number;
  exit: number;
};

export const TechnicalBadge: React.FC<TechnicalBadgeProps> = ({ text, variant, subtitle, icon, size = "normal", enter, exit }) => {
  const v = VARIANT[variant];
  const large = size === "large";
  const h = large ? 96 : subtitle ? 86 : 70;
  const iconSize = large ? 68 : 50;
  const scale = interpolate(enter, [0, 1], [0.45, 1]) * interpolate(exit, [0, 1], [1, 0.86]);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: large ? 18 : 14,
        height: h,
        padding: large ? "0 32px 0 14px" : "0 24px 0 10px",
        borderRadius: h / 2,
        background: `linear-gradient(180deg, ${v.bg} 0%, ${v.bg} 62%, ${v.edge} 100%)`,
        border: "3px solid rgba(255,255,255,0.75)",
        boxShadow: "0 14px 30px rgba(4, 10, 22, 0.45), 0 3px 0 rgba(0,0,0,0.16)",
        opacity: clamp(enter * 2.2, 0, 1) * (1 - exit),
        scale: String(scale),
        translate: `0px ${interpolate(enter, [0, 1], [22, 0]) - exit * 8}px`,
        whiteSpace: "nowrap",
      }}
    >
      <div
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: iconSize / 2,
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.12)",
        }}
      >
        <Glyph variant={variant} icon={icon} color={v.edge} size={iconSize * 0.84} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: 1.05 }}>
        <span
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: large ? 38 : 30,
            color: v.fg,
            letterSpacing: 0.5,
            textShadow: v.fg === "#ffffff" ? "0 2px 0 rgba(0,0,0,0.22)" : "none",
          }}
        >
          {text}
        </span>
        {subtitle ? (
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: large ? 22 : 19, color: v.fg, opacity: 0.94, marginTop: 2 }}>
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
};

const badgeHeight = (b: SceneBadge) => (b.size === "large" ? 96 : b.subtitle ? 86 : 70);
const GAP = 12;
const EXIT = 8;

export const BadgeLayer: React.FC<{ badges: SceneBadge[] }> = ({ badges }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const presence = (b: SceneBadge) => {
    const enter = spring({ frame: frame - b.appearAt, fps, config: { damping: 11, stiffness: 150, mass: 0.75 } });
    const exit = b.disappearAt === undefined ? 0 : clamp((frame - b.disappearAt) / EXIT, 0, 1);
    return { enter: frame < b.appearAt ? 0 : enter, exit };
  };
  let stackY = SAFE.badgeTop;
  const out: React.ReactNode[] = [];
  badges.forEach((b, i) => {
    const { enter, exit } = presence(b);
    const slot = b.slot ?? "center";
    const live = enter > 0.001 && exit < 0.999;
    const weight = clamp(enter, 0, 1) * (1 - exit);
    let top = stackY;
    let cx = width / 2;
    if (slot === "center") {
      stackY += (badgeHeight(b) + GAP) * weight;
    } else {
      top = SAFE.badgeTop + 72;
      cx = slot === "left" ? width * 0.26 : width * 0.74;
    }
    if (!live) return;
    out.push(
      <div key={i} style={{ position: "absolute", top, left: cx, translate: "-50% 0px", display: "flex", justifyContent: "center" }}>
        <TechnicalBadge text={b.text} variant={b.variant} subtitle={b.subtitle} icon={b.icon} size={b.size} enter={enter} exit={exit} />
      </div>,
    );
  });
  return <>{out}</>;
};
