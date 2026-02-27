"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── TYPE (inline for portability) ────────────────────────────
// Expects a `t` prop with theme tokens matching the parent page.
// If used standalone, defaults are provided via DEMO_THEME.
const DEMO_THEME = {
  bg: "#FAF8F3",
  bgCard: "#FFFFFF",
  border: "#E0D9CC",
  ink: "#1C1812",
  ink2: "#3C342C",
  muted: "#8A7E70",
  fire: "#D94B0A",
  amber: "#E8920A",
  teal: "#0B8A7A",
  sky: "#1E72B8",
  rule: "#D4CCC0",
};

// ─── CONSTANTS ────────────────────────────────────────────────
const TAU = Math.PI * 2;
const CX = 200; // canvas logical center x
const CY = 200; // canvas logical center y
const ORBIT_R = 148; // main electron orbit radius

// Each orbit node: angle in radians (0 = right, going clockwise)
const ORBIT_NODES: Array<{ icon: string; label: string; angle: number; accent: "fire" | "sky" | "amber" | "teal" }> = [
  { icon: "🔥", label: "Heat\nSource",  angle: -Math.PI / 2,  accent: "fire"  }, // top
  { icon: "❄️", label: "Heat\nSink",    angle: 0,              accent: "sky"   }, // right
  { icon: "💡", label: "LED /\nMotor",  angle: Math.PI / 2,   accent: "amber" }, // bottom
  { icon: "🔲", label: "TE\nModule",    angle: Math.PI,        accent: "teal"  }, // left
];

// Electron configs: 3 electrons spaced 120° apart on the orbit circle
const NUM_ELECTRONS = 4;
const ELECTRON_SPACING = TAU / NUM_ELECTRONS;
const ELECTRON_SPEED = 0.008; // radians per frame

// ─── HELPER: polar → cartesian ────────────────────────────────
function polar(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

// ─── HELPER: hex → rgba ───────────────────────────────────────
function hexAlpha(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── TYPES ────────────────────────────────────────────────────────
type Theme = typeof DEMO_THEME;

// ─── CANVAS DIAGRAM ───────────────────────────────────────────
function SeebeckCanvas({ t, hovered }: { t: Theme; hovered: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const angleRef = useRef(-Math.PI / 2); // start at top
  const frameRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, W, H);

    const cx = W / 2 / dpr;
    const cy = H / 2 / dpr;
    const orbitR = ORBIT_R;
    const frame = frameRef.current;

    // ── 1. Background glow rings (outer atmosphere) ──
    for (let ri = 0; ri < 3; ri++) {
      const rSize = orbitR + 28 + ri * 18;
      const grad = ctx.createRadialGradient(cx, cy, rSize - 6, cx, cy, rSize + 6);
      const baseOpacity = 0.04 - ri * 0.01;
      grad.addColorStop(0, hexAlpha(t.teal, 0));
      grad.addColorStop(0.5, hexAlpha(t.teal, baseOpacity));
      grad.addColorStop(1, hexAlpha(t.teal, 0));
      ctx.beginPath();
      ctx.arc(cx, cy, rSize, 0, TAU);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 12;
      ctx.stroke();
    }

    // ── 2. Dashed outer orbit ring ──
    ctx.save();
    ctx.setLineDash([4, 8]);
    ctx.lineDashOffset = -(frame * 0.4) % 12;
    ctx.beginPath();
    ctx.arc(cx, cy, orbitR, 0, TAU);
    ctx.strokeStyle = hexAlpha(t.rule, 0.7);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // ── 3. Inner decorative rings (static) ──
    [72, 52].forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.strokeStyle = hexAlpha(t.border, i === 0 ? 0.8 : 0.4);
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // ── 4. Hot/Cold hemisphere glow ──
    // Hot side: left arc glow (π/2 to 3π/2)
    const hotGrad = ctx.createRadialGradient(cx - 40, cy, 10, cx, cy, orbitR + 20);
    hotGrad.addColorStop(0, hexAlpha(t.fire, 0.12));
    hotGrad.addColorStop(1, hexAlpha(t.fire, 0));
    ctx.beginPath();
    ctx.arc(cx, cy, orbitR + 20, Math.PI / 2, 3 * Math.PI / 2);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = hotGrad;
    ctx.fill();

    // Cold side: right arc glow
    const coldGrad = ctx.createRadialGradient(cx + 40, cy, 10, cx, cy, orbitR + 20);
    coldGrad.addColorStop(0, hexAlpha(t.sky, 0.1));
    coldGrad.addColorStop(1, hexAlpha(t.sky, 0));
    ctx.beginPath();
    ctx.arc(cx, cy, orbitR + 20, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = coldGrad;
    ctx.fill();

    // ── 5. Electron trails + electrons ──
    const baseAngle = angleRef.current;

    for (let ei = 0; ei < NUM_ELECTRONS; ei++) {
      const eAngle = baseAngle + ei * ELECTRON_SPACING;
      const ep = polar(cx, cy, orbitR, eAngle);

      // Trail: draw fading arc behind each electron
      const trailLength = Math.PI * 0.45;
      const trailSteps = 32;
      for (let ts = 0; ts < trailSteps; ts++) {
        const frac = ts / trailSteps;
        const trailAngle = eAngle - trailLength * frac;
        const tp = polar(cx, cy, orbitR, trailAngle);
        const opacity = (1 - frac) * 0.55;
        const radius = 3.5 * (1 - frac * 0.6);
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, radius, 0, TAU);
        ctx.fillStyle = hexAlpha(t.teal, opacity);
        ctx.fill();
      }

      // Electron glow (outer halo)
      const glowGrad = ctx.createRadialGradient(ep.x, ep.y, 0, ep.x, ep.y, 14);
      glowGrad.addColorStop(0, hexAlpha(t.teal, 0.6));
      glowGrad.addColorStop(0.4, hexAlpha(t.teal, 0.2));
      glowGrad.addColorStop(1, hexAlpha(t.teal, 0));
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, 14, 0, TAU);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Electron core
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, 4.5, 0, TAU);
      ctx.fillStyle = t.teal;
      ctx.fill();

      // Bright centre specular
      ctx.beginPath();
      ctx.arc(ep.x - 1.2, ep.y - 1.2, 1.8, 0, TAU);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fill();
    }

    // ── 6. Energy spark particles (small floaty dots) ──
    for (let sp = 0; sp < 8; sp++) {
      const spAngle = (frame * 0.003 + sp * (TAU / 8)) % TAU;
      const spR = 58 + Math.sin(frame * 0.04 + sp * 1.3) * 12;
      const sp2 = polar(cx, cy, spR, spAngle);
      const sparkOpacity = 0.15 + 0.1 * Math.sin(frame * 0.06 + sp);
      ctx.beginPath();
      ctx.arc(sp2.x, sp2.y, 1.5, 0, TAU);
      ctx.fillStyle = hexAlpha(t.amber, sparkOpacity);
      ctx.fill();
    }

    // ── 7. Connecting spoke lines (node → center) ──
    ORBIT_NODES.forEach((node) => {
      const np = polar(cx, cy, orbitR - 28, node.angle);
      const accentColors = { fire: t.fire, sky: t.sky, amber: t.amber, teal: t.teal };
      const c = accentColors[node.accent];
      const spokeGrad = ctx.createLinearGradient(cx, cy, np.x, np.y);
      spokeGrad.addColorStop(0, hexAlpha(c, 0.02));
      spokeGrad.addColorStop(1, hexAlpha(c, 0.18));
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(np.x, np.y);
      ctx.strokeStyle = spokeGrad;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // ── 8. Direction arrow hint on orbit ──
    const arrowAngle = baseAngle - 0.22;
    const ap = polar(cx, cy, orbitR + 1, arrowAngle);
    const tangentAngle = arrowAngle + Math.PI / 2; // clockwise tangent
    ctx.save();
    ctx.translate(ap.x, ap.y);
    ctx.rotate(tangentAngle);
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(5, 0);
    ctx.lineTo(2, -3);
    ctx.moveTo(5, 0);
    ctx.lineTo(2, 3);
    ctx.strokeStyle = hexAlpha(t.teal, 0.45);
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    // Advance
    angleRef.current += ELECTRON_SPEED * (hovered ? 1.6 : 1);
    frameRef.current += 1;

    animRef.current = requestAnimationFrame(draw);
  }, [t, hovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 400 * dpr;
    canvas.height = 400 * dpr;
    canvas.style.width = "400px";
    canvas.style.height = "400px";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current !== null) cancelAnimationFrame(animRef.current); };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
      }}
    />
  );
}

// ─── ORBIT NODE BUTTON ────────────────────────────────────────
function OrbitNodeButton({ node, t, size, accentColor }: { node: typeof ORBIT_NODES[0]; t: Theme; size?: number; accentColor: string }) {
  const [hov, setHov] = useState(false);

  const pos = polar(50, 50, 37, node.angle); // % coordinates

  return (
    <div
      style={{
        position: "absolute",
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: "translate(-50%,-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        zIndex: 20,
        cursor: "default",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Node circle */}
      <div style={{
        width: hov ? 58 : 52,
        height: hov ? 58 : 52,
        borderRadius: "50%",
        background: hov
          ? `linear-gradient(135deg, ${hexAlpha(accentColor, 0.15)}, ${t.bgCard})`
          : t.bgCard,
        border: `${hov ? 2 : 1.5}px solid ${hov ? accentColor : t.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: hov ? "1.5rem" : "1.3rem",
        boxShadow: hov
          ? `0 0 0 4px ${hexAlpha(accentColor, 0.12)}, 0 12px 32px ${hexAlpha(accentColor, 0.25)}`
          : `0 4px 16px ${hexAlpha(t.ink, 0.08)}`,
        transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {node.icon}
      </div>

      {/* Label */}
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: "0.54rem",
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: hov ? accentColor : t.muted,
        textAlign: "center",
        lineHeight: 1.4,
        whiteSpace: "pre-line",
        transition: "color 0.2s",
        fontWeight: hov ? 700 : 400,
      }}>
        {node.label}
      </div>
    </div>
  );
}

// ─── CENTER BADGE ─────────────────────────────────────────────
function CenterBadge({ t, pulse }: { t: Theme; pulse: boolean }) {
  return (
    <div style={{
      position: "absolute",
      top: "50%", left: "50%",
      transform: "translate(-50%,-50%)",
      zIndex: 15,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      width: 140,
      height: 140,
      borderRadius: "50%",
      background: t.bgCard,
      border: `2px solid ${t.border}`,
      boxShadow: `
        0 0 0 ${pulse ? "8px" : "0px"} ${hexAlpha(t.fire, 0.08)},
        0 16px 48px ${hexAlpha(t.fire, 0.18)},
        inset 0 1px 0 rgba(255,255,255,0.6)
      `,
      transition: "box-shadow 0.6s ease, background 0.4s, border-color 0.4s",
    }}>
      {/* Lightning icon with glow */}
      <div style={{
        fontSize: "2rem",
        animation: "centerPulse 2.8s ease-in-out infinite",
        filter: `drop-shadow(0 0 8px ${hexAlpha(t.amber, 0.7)})`,
      }}>
        ⚡
      </div>

      {/* Formula */}
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 700,
        fontSize: "1.05rem",
        letterSpacing: "0.01em",
        color: t.fire,
        transition: "color 0.4s",
        lineHeight: 1,
      }}>
        V = S · ΔT
      </div>

      {/* Subtitle */}
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: "0.5rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: t.muted,
        textAlign: "center",
        lineHeight: 1.5,
        transition: "color 0.4s",
      }}>
        Seebeck Effect
      </div>

      {/* Decorative tick marks around edge */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
        <div key={deg} style={{
          position: "absolute",
          width: 2,
          height: deg % 90 === 0 ? 7 : 4,
          background: deg % 90 === 0 ? hexAlpha(t.fire, 0.4) : hexAlpha(t.rule, 0.6),
          borderRadius: 1,
          top: "50%",
          left: "50%",
          transformOrigin: `1px ${71}px`,
          transform: `translateX(-1px) rotate(${deg}deg)`,
          transition: "background 0.4s",
        }} />
      ))}
    </div>
  );
}

// ─── LEGEND BAR ───────────────────────────────────────────────
function LegendBar({ t }: { t: Theme }) {
  const items = [
    { color: t.teal, label: "Electron flow" },
    { color: t.fire, label: "Hot side" },
    { color: t.sky,  label: "Cold side" },
  ];
  return (
    <div style={{
      display: "flex",
      gap: "1.2rem",
      alignItems: "center",
      justifyContent: "center",
      marginTop: "1.2rem",
    }}>
      {items.map(item => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: item.color,
            boxShadow: `0 0 6px ${hexAlpha(item.color, 0.6)}`,
          }} />
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.58rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: t.muted,
          }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── HOT/COLD LABELS ──────────────────────────────────────────
function HemisphereLabels({ t }: { t: Theme }) {
  return (
    <>
      {/* Hot hemisphere label */}
      <div style={{
        position: "absolute",
        left: "0%", top: "50%",
        transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        zIndex: 5,
        opacity: 0.75,
        pointerEvents: "none",
      }}>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: "0.52rem",
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: t.fire, fontWeight: 700,
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          transform: "rotate(180deg)",
          lineHeight: 1.4,
          transition: "color 0.4s",
        }}>
          HOT · ~150°C
        </div>
      </div>

      {/* Cold hemisphere label */}
      <div style={{
        position: "absolute",
        right: "0%", top: "50%",
        transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        zIndex: 5,
        opacity: 0.75,
        pointerEvents: "none",
      }}>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: "0.52rem",
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: t.sky, fontWeight: 700,
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          lineHeight: 1.6,
          transition: "color 0.4s",
        }}>
          COLD · ~30°C
        </div>
      </div>
    </>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function SeebeckHeroDiagram({ t: tProp }: { t?: Theme }) {
  const t = tProp || DEMO_THEME;
  const [hovered, setHovered] = useState(false);
  const [pulse, setPulse] = useState(false);

  // Pulse badge every 3s
  useEffect(() => {
    const id = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const accentColors = {
    fire: t.fire,
    sky: t.sky,
    amber: t.amber,
    teal: t.teal,
  };

  return (
    <>
      {/* Keyframe injector */}
      <style>{`
        @keyframes centerPulse {
          0%,100% { transform: scale(1); filter: drop-shadow(0 0 6px rgba(232,146,10,0.5)); }
          50%      { transform: scale(1.12); filter: drop-shadow(0 0 14px rgba(232,146,10,0.9)); }
        }
        @keyframes orbitSpin {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes orbitSpinRev {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(-360deg); }
        }
        @keyframes shimmerRing {
          0%   { opacity: 0.3; }
          50%  { opacity: 0.9; }
          100% { opacity: 0.3; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Diagram container */}
        <div
          style={{
            position: "relative",
            width: 400,
            height: 400,
            cursor: "default",
            // Outer glow when hovered
            filter: hovered
              ? `drop-shadow(0 0 32px ${hexAlpha(t.teal, 0.25)})`
              : "none",
            transition: "filter 0.5s ease",
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* ── Canvas layer: electrons + orbit + arcs ── */}
          <SeebeckCanvas t={t} hovered={hovered} />

          {/* ── Hemisphere labels ── */}
          <HemisphereLabels t={t} />

          {/* ── Center badge ── */}
          <CenterBadge t={t} pulse={pulse} />

          {/* ── Orbit nodes ── */}
          {ORBIT_NODES.map(node => (
            <OrbitNodeButton
              key={node.label}
              node={node}
              t={t}
              accentColor={accentColors[node.accent]}
            />
          ))}

          {/* ── Hover hint ── */}
          <div style={{
            position: "absolute",
            bottom: -10, left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.52rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: hovered ? t.teal : t.muted,
            opacity: hovered ? 0 : 0.8,
            transition: "opacity 0.3s, color 0.3s",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}>
            hover to accelerate ↑
          </div>
        </div>

        {/* ── Legend ── */}
        <LegendBar t={t} />
      </div>
    </>
  );
}