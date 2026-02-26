"use client";

import { useState, useEffect, useRef, type CSSProperties, type ReactNode, type KeyboardEvent as ReactKeyboardEvent } from "react";

// ─── THEME TOKENS ──────────────────────────────────────────────
const LIGHT = {
  bg:         "#FAF8F3",
  bgAlt:      "#F2EEE5",
  bgCard:     "#FFFFFF",
  border:     "#E0D9CC",
  borderHov:  "#C8BFB0",
  ink:        "#1C1812",
  ink2:       "#3C342C",
  muted:      "#8A7E70",
  fire:       "#D94B0A",
  amber:      "#E8920A",
  teal:       "#0B8A7A",
  sky:        "#1E72B8",
  leaf:       "#2A8040",
  rule:       "#D4CCC0",
  hotBg:      "linear-gradient(160deg,#7C1D0F,#C0321A)",
  coldBg:     "linear-gradient(160deg,#0F3356,#1A5B99)",
  filterL1:   "#E8EEF7",
  filterL2:   "#F5ECD8",
  filterL3:   "#E0F0E8",
  navBg:      "rgba(250,248,243,0.92)",
};

const DARK = {
  bg:         "#0E0C09",
  bgAlt:      "#161310",
  bgCard:     "#1A1612",
  border:     "#2C2620",
  borderHov:  "#44392E",
  ink:        "#F0EBE2",
  ink2:       "#C8BFB0",
  muted:      "#7A7062",
  fire:       "#F0601A",
  amber:      "#F5A020",
  teal:       "#10A896",
  sky:        "#3A94DC",
  leaf:       "#3AAD58",
  rule:       "#2A2420",
  hotBg:      "linear-gradient(160deg,#5A1208,#9A2410)",
  coldBg:     "linear-gradient(160deg,#0A2440,#103D6E)",
  filterL1:   "#141E2C",
  filterL2:   "#1E180A",
  filterL3:   "#0A1C10",
  navBg:      "rgba(14,12,9,0.92)",
};

type Theme = typeof LIGHT;
type RevealDir = "up" | "left" | "right" | "none";
type Connector = { label: string; color: string } | null;
type FlowNode = { icon: string; label: string; connector: Connector };
type AdvantageItem = { icon: string; title: string; body: string; color: string; cls: string };

// ─── HOOK: Scroll-based reveal ──────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

// ─── REVEAL WRAPPER ────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  dir = "up",
  style = {},
}: {
  children: ReactNode;
  delay?: number;
  dir?: RevealDir;
  style?: CSSProperties;
}) {
  const [ref, vis] = useReveal();
  const transforms: Record<RevealDir, string> = {
    up: "translateY(32px)",
    left: "translateX(-28px)",
    right: "translateX(28px)",
    none: "none",
  };
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : transforms[dir],
      transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      willChange: "transform, opacity",
      ...style
    }}>
      {children}
    </div>
  );
}

// ─── THEME TOGGLE BUTTON ───────────────────────────────────────
function ThemeToggle({ dark, toggle, t }: { dark: boolean; toggle: () => void; t: Theme }) {
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 14px", borderRadius: 100,
        border: `1.5px solid ${t.border}`,
        background: t.bgCard,
        color: t.ink, cursor: "pointer",
        fontFamily: "'Space Mono', monospace",
        fontSize: "0.7rem", letterSpacing: "0.08em",
        transition: "all 0.25s ease",
        boxShadow: dark ? `0 0 16px rgba(240,96,26,0.15)` : "none",
      }}
    >
      <span style={{ fontSize: "1rem", transition: "transform 0.4s", transform: dark ? "rotate(180deg)" : "rotate(0)" }}>
        {dark ? "☀️" : "🌙"}
      </span>
      {dark ? "LIGHT" : "DARK"}
    </button>
  );
}

// ─── NAV ───────────────────────────────────────────────────────
function Nav({ dark, toggle, t, progress }: { dark: boolean; toggle: () => void; t: Theme; progress: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { href: "#intro", label: "Introduction" },
    { href: "#thermo", label: "Seebeck Effect" },
    { href: "#filter", label: "Air Filtration" },
    { href: "#system", label: "System" },
    { href: "#conclusion", label: "Conclusion" },
  ];
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      background: t.navBg, backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${t.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 2rem", height: 56,
      transition: "background 0.4s, border-color 0.4s",
    }}>
      {/* Progress bar */}
      <div style={{
        position: "absolute", bottom: -1, left: 0,
        height: 2, width: `${progress}%`,
        background: `linear-gradient(90deg, ${t.fire}, ${t.amber}, ${t.teal})`,
        transition: "width 0.08s linear",
      }} />

      <div style={{
        fontFamily: "'Space Mono', monospace", fontWeight: 700,
        fontSize: "0.8rem", letterSpacing: "0.12em", color: t.ink,
        display: "flex", alignItems: "center", gap: 10,
        transition: "color 0.4s",
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: t.fire, display: "inline-block",
          animation: "blink 2s ease-in-out infinite",
        }} />
        ECO POWER PROJECT
      </div>

      <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div className="nav-links-group" style={{ display: "flex", alignItems: "center", gap: "1.8rem" }}>
          {links.map(l => (
            <a key={l.href} href={l.href} style={{
              fontFamily: "'Space Mono', monospace", fontSize: "0.68rem",
              letterSpacing: "0.07em", textTransform: "uppercase",
              color: t.muted, textDecoration: "none",
              transition: "color 0.25s, transform 0.25s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = t.ink; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = t.muted; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {l.label}
            </a>
          ))}
        </div>
        <ThemeToggle dark={dark} toggle={toggle} t={t} />
        <button
          className="mobile-menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 8,
            border: `1px solid ${t.border}`,
            background: t.bgCard,
            color: t.ink,
            fontSize: "1rem",
            cursor: "pointer",
            transition: "all 0.25s ease",
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="nav-mobile-panel" style={{
          position: "absolute",
          top: 56,
          left: 0,
          right: 0,
          background: t.navBg,
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${t.border}`,
          padding: "0.7rem 1rem 1rem",
          display: "none",
          flexDirection: "column",
          gap: "0.45rem",
        }}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.68rem",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: t.ink,
                textDecoration: "none",
                border: `1px solid ${t.border}`,
                background: t.bgCard,
                borderRadius: 8,
                padding: "0.65rem 0.8rem",
                transition: "all 0.25s ease",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── HERO ──────────────────────────────────────────────────────
function Hero({ t }: { t: Theme }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const stats = [
    { num: "ΔT", label: "Temperature Diff\nDrives Voltage" },
    { num: "3×", label: "Carbon Filter\nLayers" },
    { num: "0", label: "Moving Parts\nin Generator" },
    { num: "2-in-1", label: "Energy + Air\nPurification" },
  ];

  const tags = [
    { label: "Seebeck Effect", color: t.fire, bg: `${t.fire}18` },
    { label: "p-type & n-type Semiconductors", color: t.sky, bg: `${t.sky}18` },
    { label: "Activated Carbon Adsorption", color: t.teal, bg: `${t.teal}18` },
  ];

  return (
    <section id="intro" style={{
      minHeight: "100vh", paddingTop: 56,
      background: t.bg, transition: "background 0.4s",
      display: "flex", flexDirection: "column",
      borderBottom: `1px solid ${t.border}`,
      position: "relative", overflow: "hidden",
    }}>
      {/* Decorative mesh background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 60% 50% at 80% 30%, ${t.fire}14 0%, transparent 60%),
          radial-gradient(ellipse 50% 60% at 10% 70%, ${t.teal}10 0%, transparent 60%)
        `,
        transition: "background 0.4s",
      }} />

      {/* Top meta bar */}
      <div className="hero-meta" style={{
        display: "flex", justifyContent: "space-between",
        padding: "1.2rem 3rem", borderBottom: `1px solid ${t.border}`,
        transition: "border-color 0.4s",
      }}>
        <span style={{
          fontFamily: "'Space Mono', monospace", fontSize: "0.7rem",
          letterSpacing: "0.14em", textTransform: "uppercase", color: t.muted,
        }}>
          Science Project · 2026 Edition
        </span>
        <span className="meta-secondary" style={{
          fontFamily: "'Space Mono', monospace", fontSize: "0.7rem",
          letterSpacing: "0.14em", textTransform: "uppercase", color: t.muted,
        }}>
          Thermoelectric Generation + Carbon Filtration
        </span>
      </div>

      {/* Main hero content */}
      <div className="hero-main" style={{
        flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "4rem", padding: "4rem 3rem", alignItems: "center",
        maxWidth: 1300, margin: "0 auto", width: "100%",
      }}>
        {/* Left: Text */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{
            opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(20px)",
            transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: "0.72rem",
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: t.fire, marginBottom: "1.2rem",
              display: "flex", alignItems: "center", gap: 12,
              transition: "color 0.4s",
            }}>
              <span style={{ width: 28, height: 2, background: t.fire, display: "inline-block" }} />
              Energy & Environment
            </div>
          </div>

          <div style={{
            opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(24px)",
            transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
          }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(3rem,5.5vw,5rem)",
              fontWeight: 900, lineHeight: 1.05,
              letterSpacing: "-0.02em", color: t.ink,
              transition: "color 0.4s",
            }}>
              Heat Into{" "}
              <em style={{ color: t.fire, fontStyle: "italic" }}>Electricity,</em>
              <br />Air Into{" "}
              <em style={{ color: t.teal, fontStyle: "italic" }}>Clean</em>
            </h1>
          </div>

          <div style={{
            opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(24px)",
            transition: "opacity 0.7s ease 0.35s, transform 0.7s ease 0.35s",
          }}>
            <p style={{
              marginTop: "1.5rem", fontSize: "1.05rem", lineHeight: 1.8,
              color: t.ink2, fontWeight: 300, maxWidth: 480,
              transition: "color 0.4s",
            }}>
              A dual-purpose system combining thermoelectric power generation via
              the <strong style={{ fontWeight: 600, color: t.ink }}>Seebeck Effect</strong> with
              a three-stage activated carbon air filtration unit —
              tackling fossil-fuel dependency and air pollution simultaneously.
            </p>
          </div>

          <div style={{
            opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(20px)",
            transition: "opacity 0.7s ease 0.5s, transform 0.7s ease 0.5s",
            display: "flex", gap: 8, flexWrap: "wrap", marginTop: "2rem",
          }}>
            {tags.map((tag) => (
              <span key={tag.label} style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.65rem", letterSpacing: "0.07em", textTransform: "uppercase",
                padding: "5px 12px", borderRadius: 4,
                border: `1.5px solid ${tag.color}`,
                color: tag.color, background: tag.bg,
                transition: "all 0.3s",
              }}>
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Animated diagram */}
        <div style={{
          opacity: mounted ? 1 : 0, transform: mounted ? "scale(1)" : "scale(0.92)",
          transition: "opacity 0.9s ease 0.4s, transform 0.9s ease 0.4s",
          display: "flex", justifyContent: "center",
        }}>
          <SeebeckHeroDiagram t={t} />
        </div>
      </div>

      {/* Stats bar */}
      <div className="hero-stats" style={{
        display: "flex", padding: "1.2rem 3rem",
        borderTop: `1px solid ${t.border}`,
        gap: "2.5rem", alignItems: "center",
        flexWrap: "wrap", transition: "border-color 0.4s",
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {i > 0 && <div style={{ width: 1, height: 36, background: t.rule }} />}
            <div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.7rem", fontWeight: 700,
                color: [t.fire, t.amber, t.teal, t.sky][i],
                lineHeight: 1, transition: "color 0.4s",
              }}>{s.num}</div>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: "0.6rem",
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: t.muted, marginTop: 4, lineHeight: 1.4,
                whiteSpace: "pre-line",
              }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── SEEBECK HERO DIAGRAM ──────────────────────────────────────
function SeebeckHeroDiagram({ t }: { t: Theme }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(p => p + 1), 60);
    return () => clearInterval(id);
  }, []);

  const electrons = [0, 1, 2, 3, 4].map(i => ({
    x: ((tick * 1.2 + i * 50) % 200),
    opacity: Math.sin(((tick * 1.2 + i * 50) % 200) / 200 * Math.PI),
  }));

  return (
    <div className="diagram-root" style={{ position: "relative", width: 380, height: 380 }}>
      {/* Spinning rings */}
      {[340, 270, 200].map((size, i) => (
        <div key={i} style={{
          position: "absolute",
          width: size, height: size,
          borderRadius: "50%",
          border: `1.5px ${i === 1 ? "dashed" : "solid"} ${t.rule}`,
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          animation: `spin${i % 2 === 0 ? "Cw" : "Ccw"} ${20 + i * 10}s linear infinite`,
          transition: "border-color 0.4s",
        }} />
      ))}

      {/* Center module */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 150, height: 150, borderRadius: "50%",
        background: t.bgCard,
        border: `2px solid ${t.border}`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 4,
        boxShadow: `0 16px 48px ${t.fire}20`,
        zIndex: 10, transition: "background 0.4s, border-color 0.4s, box-shadow 0.4s",
      }}>
        <span style={{ fontSize: "2.4rem", animation: "tempPulse 3s ease-in-out infinite" }}>⚡</span>
        <span style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 700,
          fontSize: "1.1rem", color: t.fire, transition: "color 0.4s",
        }}>V = S · ΔT</span>
        <span style={{
          fontFamily: "'Space Mono', monospace", fontSize: "0.55rem",
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: t.muted, textAlign: "center",
        }}>Seebeck Effect</span>
      </div>

      {/* Orbit nodes */}
      {[
        { icon: "🔥", label: "Heat Source", top: "4%", left: "50%", tx: "-50%", ty: "0" },
        { icon: "❄️", label: "Heat Sink", top: "50%", left: "96%", tx: "0", ty: "-50%" },
        { icon: "💡", label: "LED / Motor", top: "96%", left: "50%", tx: "-50%", ty: "-100%" },
        { icon: "🔲", label: "TE Module", top: "50%", left: "4%", tx: "-100%", ty: "-50%" },
      ].map((node) => (
        <div key={node.label} style={{
          position: "absolute", top: node.top, left: node.left,
          transform: `translate(${node.tx},${node.ty})`,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4, zIndex: 11,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: t.bgCard, border: `1.5px solid ${t.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.4rem",
            boxShadow: `0 4px 16px ${t.ink}10`,
            transition: "all 0.3s, background 0.4s, border-color 0.4s",
            cursor: "default",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.15)"; e.currentTarget.style.boxShadow = `0 8px 24px ${t.fire}30`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = `0 4px 16px ${t.ink}10`; }}
          >
            {node.icon}
          </div>
          <span style={{
            fontFamily: "'Space Mono', monospace", fontSize: "0.55rem",
            letterSpacing: "0.07em", textTransform: "uppercase",
            color: t.muted, textAlign: "center", lineHeight: 1.3,
          }}>{node.label}</span>
        </div>
      ))}

      {/* Animated electron path (SVG overlay) */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 9, overflow: "visible" }}>
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill={t.teal} opacity="0.6" />
          </marker>
        </defs>
        {/* Clockwise arc suggestion lines */}
        {electrons.map((e, i) => (
          <circle key={i} cx={`${20 + e.x}%`} cy="50%" r="3.5"
            fill={t.teal} opacity={e.opacity * 0.8}
            style={{ filter: `drop-shadow(0 0 4px ${t.teal})` }}
          />
        ))}
      </svg>
    </div>
  );
}

// ─── SECTION HEADER ────────────────────────────────────────────
function SectionHeader({ num, kicker, title, t }: { num: string; kicker: string; title: string; t: Theme }) {
  return (
    <Reveal>
      <div style={{
        display: "flex", alignItems: "baseline", gap: "1.5rem",
        marginBottom: "3rem", paddingBottom: "1rem",
        borderBottom: `2px solid ${t.ink}`, transition: "border-color 0.4s",
      }}>
        <span style={{
          fontFamily: "'Playfair Display', serif", fontSize: "4rem",
          fontWeight: 900, color: t.rule, lineHeight: 1,
          transition: "color 0.4s",
        }}>{num}</span>
        <div>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: "0.68rem",
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: t.muted, marginBottom: 6, transition: "color 0.4s",
          }}>{kicker}</div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem,3vw,2.4rem)",
            fontWeight: 700, color: t.ink, lineHeight: 1.2,
            transition: "color 0.4s",
          }}>{title}</h2>
        </div>
      </div>
    </Reveal>
  );
}

// ─── SECTION 01: THERMOELECTRIC ────────────────────────────────
function ThermoSection({ t }: { t: Theme }) {
  return (
    <section className="section-shell" id="thermo" style={{
      padding: "6rem 3rem",
      background: t.bg, transition: "background 0.4s",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader num="01" kicker="The Seebeck Effect" title="Thermoelectric Power Generation" t={t} />

        <div className="seebeck-layout" style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "4rem", alignItems: "start" }}>
          {/* Left: Content */}
          <div>
            <Reveal delay={0.05}>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.85, color: t.ink2, fontWeight: 300, transition: "color 0.4s" }}>
                Our thermoelectric generator converts heat energy into electrical energy using the{" "}
                <strong style={{ fontWeight: 600, color: t.ink }}>Seebeck Effect</strong> — discovered
                by Thomas Johann Seebeck in 1821. The device contains a thermoelectric module made up of
                many small <strong style={{ fontWeight: 600, color: t.ink }}>p-type and n-type semiconductor</strong> pairs
                connected electrically in series and thermally in parallel.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <blockquote style={{
                fontFamily: "'Playfair Display', serif", fontSize: "1.3rem",
                fontStyle: "italic", lineHeight: 1.6, color: t.ink,
                borderLeft: `3px solid ${t.fire}`, paddingLeft: "1.5rem",
                margin: "2rem 0", transition: "color 0.4s, border-color 0.4s",
              }}>
                "Heat alone cannot generate electricity. It is the <em>difference</em> between
                hot and cold that sets charge carriers in motion."
              </blockquote>
            </Reveal>

            <Reveal delay={0.15}>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.85, color: t.ink2, fontWeight: 300, transition: "color 0.4s" }}>
                When heat is applied to one side — using a candle or sunlight — the
                temperature rises on that face. Electrons in the <strong style={{ color: t.sky }}>n-type material</strong> gain
                kinetic energy and migrate toward the cooler side. Simultaneously, positive holes
                in the <strong style={{ color: t.fire }}>p-type material</strong> move in the
                opposite direction. This charge separation creates a voltage across the module:
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div style={{
                margin: "1.5rem 0", padding: "1.2rem 1.5rem",
                background: t.bgAlt, borderRadius: 12,
                border: `1px solid ${t.border}`,
                fontFamily: "'Space Mono', monospace", fontSize: "1rem",
                textAlign: "center", color: t.ink,
                transition: "background 0.4s, border-color 0.4s, color 0.4s",
              }}>
                <span style={{ color: t.amber }}>V</span> = <span style={{ color: t.teal }}>S</span> × <span style={{ color: t.fire }}>ΔT</span>
                <div style={{ fontSize: "0.65rem", color: t.muted, marginTop: 6, letterSpacing: "0.08em" }}>
                  V = voltage · S = Seebeck coefficient (material property) · ΔT = temperature difference (K)
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.85, color: t.ink2, fontWeight: 300, transition: "color 0.4s" }}>
                The heat sink on the cold side is critical — without active cooling, the temperature
                difference collapses and voltage drops to zero. In our model, the generated current
                powers a small motor or LED. Critically, if both sides reach the same temperature
                (no matter how hot), <em>no electricity is produced</em> — it is the gradient, not
                the absolute temperature, that matters.
              </p>
            </Reveal>

            {/* Facts grid */}
            <div className="thermo-facts-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, marginTop: "2.5rem", background: t.border, borderRadius: 12, overflow: "hidden" }}>
              {[
                { icon: "🔕", title: "Silent Operation", desc: "No moving parts means zero mechanical noise and near-zero maintenance over its lifetime." },
                { icon: "🛰️", title: "Space-Proven", desc: "NASA RTGs (Radioisotope Thermoelectric Generators) have powered Voyager 1 & 2 since 1977." },
                { icon: "🌡️", title: "Versatile Heat Sources", desc: "Candles, sunlight, engine exhaust, industrial waste heat — any thermal gradient works." },
              ].map((f, i) => (
                <Reveal key={i} delay={0.1 * i}>
                  <div
                    style={{
                      background: t.bgCard, padding: "1.6rem",
                      cursor: "default", transition: "background 0.25s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = t.bgAlt}
                    onMouseLeave={e => e.currentTarget.style.background = t.bgCard}
                  >
                    <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>{f.icon}</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "0.95rem", color: t.ink, marginBottom: 4, transition: "color 0.4s" }}>{f.title}</div>
                    <p style={{ fontSize: "0.8rem", color: t.muted, lineHeight: 1.6, transition: "color 0.4s" }}>{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right: Interactive module */}
          <Reveal dir="right">
            <ModuleCard t={t} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── MODULE CARD (sticky) ──────────────────────────────────────
function ModuleCard({ t }: { t: Theme }) {
  const [hovHot, setHovHot] = useState(false);
  const [hovCold, setHovCold] = useState(false);

  return (
    <div className="module-card" style={{
      position: "sticky", top: 80,
      borderRadius: 20, overflow: "hidden",
      border: `1px solid ${t.border}`,
      boxShadow: `0 24px 64px ${t.ink}18`,
      transition: "border-color 0.4s, box-shadow 0.4s",
    }}>
      {/* Header */}
      <div style={{
        padding: "1rem 1.5rem",
        background: t.bgCard,
        borderBottom: `1px solid ${t.border}`,
        fontFamily: "'Space Mono', monospace", fontSize: "0.65rem",
        letterSpacing: "0.12em", textTransform: "uppercase", color: t.muted,
        transition: "background 0.4s, border-color 0.4s, color 0.4s",
      }}>
        Thermoelectric Module — Interactive
      </div>

      {/* Hot / Cold sides */}
      <div style={{ display: "flex" }}>
        <div
          style={{
            flex: 1, background: t.hotBg,
            padding: "2rem 1.2rem",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            cursor: "default", filter: hovHot ? "brightness(1.15)" : "brightness(1)",
            transition: "filter 0.25s",
          }}
          onMouseEnter={() => setHovHot(true)}
          onMouseLeave={() => setHovHot(false)}
        >
          <span style={{ fontSize: "2.2rem", animation: "flameDance 1.8s ease-in-out infinite" }}>🔥</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, color: "white" }}>HOT</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em" }}>~150°C</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em", textAlign: "center" }}>electrons gain kinetic energy</span>
          {hovHot && (
            <div style={{ marginTop: 4, padding: "4px 10px", background: "rgba(255,255,255,0.15)", borderRadius: 100, fontSize: "0.7rem", color: "white" }}>
              n→ electrons flow
            </div>
          )}
        </div>
        <div
          style={{
            flex: 1, background: t.coldBg,
            padding: "2rem 1.2rem",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            cursor: "default", filter: hovCold ? "brightness(1.15)" : "brightness(1)",
            transition: "filter 0.25s",
          }}
          onMouseEnter={() => setHovCold(true)}
          onMouseLeave={() => setHovCold(false)}
        >
          <span style={{ fontSize: "2.2rem" }}>❄️</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, color: "white" }}>COLD</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em" }}>~30°C</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em", textAlign: "center" }}>heat sink maintains gradient</span>
          {hovCold && (
            <div style={{ marginTop: 4, padding: "4px 10px", background: "rgba(255,255,255,0.15)", borderRadius: 100, fontSize: "0.7rem", color: "white" }}>
              ←p holes flow
            </div>
          )}
        </div>
      </div>

      {/* Electron flow animation */}
      <div style={{
        background: t.bgCard, padding: "1.2rem 1.5rem",
        borderTop: `1px solid ${t.border}`,
        display: "flex", flexDirection: "column", gap: 10, alignItems: "center",
        transition: "background 0.4s, border-color 0.4s",
      }}>
        <ElectronFlow t={t} />
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: "0.68rem",
          color: t.sky, letterSpacing: "0.06em",
        }}>
          V = S × ΔT &nbsp;→&nbsp; Electric Current
        </div>
      </div>

      {/* p-type / n-type explainer */}
      <div className="module-semiconductor-grid" style={{
        background: t.bgAlt, padding: "1rem 1.5rem",
        borderTop: `1px solid ${t.border}`,
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
        transition: "background 0.4s, border-color 0.4s",
      }}>
        {[
          { label: "p-type", desc: "Holes (+ charge carriers) move toward cold side", color: t.fire },
          { label: "n-type", desc: "Electrons (− charge carriers) move toward cold side", color: t.sky },
        ].map(item => (
          <div key={item.label} style={{
            padding: "0.8rem", borderRadius: 8,
            background: t.bgCard, border: `1px solid ${t.border}`,
            transition: "background 0.4s, border-color 0.4s",
          }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", fontWeight: 700, color: item.color, marginBottom: 4 }}>{item.label}</div>
            <p style={{ fontSize: "0.72rem", color: t.muted, lineHeight: 1.5, transition: "color 0.4s" }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ELECTRON FLOW ANIMATION ───────────────────────────────────
function ElectronFlow({ t }: { t: Theme }) {
  const [pos, setPos] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPos(p => (p + 2) % 100), 30);
    return () => clearInterval(id);
  }, []);

  const electrons = [0, 33, 66].map(offset => ({
    x: (pos + offset) % 100,
    op: Math.sin(((pos + offset) % 100) / 100 * Math.PI),
  }));

  return (
    <div style={{ position: "relative", width: "100%", height: 24, overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: "50%", left: 0, right: 0,
        height: 1, background: t.border, transform: "translateY(-50%)",
      }} />
      {electrons.map((e, i) => (
        <div key={i} style={{
          position: "absolute", top: "50%",
          left: `${e.x}%`,
          width: 9, height: 9, borderRadius: "50%",
          background: t.sky, opacity: e.op,
          transform: "translate(-50%,-50%)",
          boxShadow: `0 0 6px ${t.sky}`,
          transition: "background 0.4s",
        }} />
      ))}
    </div>
  );
}

// ─── SECTION 02: AIR FILTRATION ────────────────────────────────
function FilterSection({ t }: { t: Theme }) {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  const handleLayerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>, value: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveLayer(activeLayer === value ? null : value);
    }
  };

  const layers = [
    {
      num: "1", name: "Filter Foam",
      role: "Primary Mechanical Barrier",
      desc: "Captures large particles — dust, dirt, pollen, and smoke — before they can reach deeper layers. This crucial pre-filter step prevents premature saturation of the activated charcoal and dramatically extends the overall filter lifespan.",
      icon: "🧽", color: t.sky,
      bg: t.filterL1, badge: "Mechanical",
    },
    {
      num: "2", name: "Activated Charcoal",
      role: "Chemical Adsorption Core",
      desc: "The porous structure of activated carbon (up to 1,500 m² per gram of material) provides enormous surface area for adsorption. Harmful gases like carbon monoxide, volatile organic compounds (VOCs), nitrogen dioxide, and odour molecules bind to this surface and are permanently trapped.",
      icon: "⬛", color: t.amber,
      bg: t.filterL2, badge: "Chemical",
    },
    {
      num: "3", name: "Activated Charcoal Foam",
      role: "Hybrid Advanced Stage",
      desc: "A composite material combining the structural airflow properties of foam with the chemical adsorption capacity of activated carbon. It captures ultra-fine particles missed by previous layers while maintaining good airflow resistance — the final polishing stage.",
      icon: "🌿", color: t.leaf,
      bg: t.filterL3, badge: "Hybrid",
    },
  ];

  return (
    <section className="section-shell" id="filter" style={{
      background: t.bgAlt, borderTop: `1px solid ${t.border}`,
      borderBottom: `1px solid ${t.border}`,
      padding: "6rem 3rem", transition: "background 0.4s, border-color 0.4s",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader num="02" kicker="Air Purification" title="Multi-Layer Carbon Filtration System" t={t} />

        <div className="filter-layout" style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: "4rem", alignItems: "start" }}>
          {/* Left: Layer stack */}
          <div>
            <Reveal dir="left">
              <div style={{
                borderRadius: 16, overflow: "hidden",
                border: `1px solid ${t.border}`,
                boxShadow: `0 16px 48px ${t.ink}10`,
                transition: "border-color 0.4s",
              }}>
                {/* Airflow indicator */}
                <div style={{
                  padding: "0.8rem 1.2rem",
                  background: t.bgCard,
                  borderBottom: `1px solid ${t.border}`,
                  display: "flex", alignItems: "center", gap: 8,
                  fontFamily: "'Space Mono', monospace", fontSize: "0.62rem",
                  letterSpacing: "0.08em", textTransform: "uppercase", color: t.muted,
                  transition: "background 0.4s, border-color 0.4s, color 0.4s",
                }}>
                  <AirflowArrows t={t} />
                  Polluted air enters → filtered air exits
                </div>

                {layers.map((layer) => (
                  <div
                    key={layer.num}
                    role="button"
                    tabIndex={0}
                    aria-expanded={activeLayer === layer.num}
                    aria-label={`Toggle details for ${layer.name}`}
                    onClick={() => setActiveLayer(activeLayer === layer.num ? null : layer.num)}
                    onKeyDown={(event) => handleLayerKeyDown(event, layer.num)}
                    style={{
                      padding: "1.4rem 1.6rem",
                      background: layer.bg,
                      borderBottom: `1px solid ${t.border}`,
                      display: "grid", gridTemplateColumns: "36px 1fr auto",
                      alignItems: "center", gap: "1rem",
                      cursor: "pointer",
                      borderLeft: `4px solid ${layer.color}`,
                      transform: activeLayer === layer.num ? "translateX(6px)" : "translateX(0)",
                      transition: "transform 0.3s ease, background 0.4s, border-color 0.4s",
                    }}
                  >
                    <span style={{
                      fontFamily: "'Playfair Display', serif", fontSize: "1.6rem",
                      fontWeight: 900, color: `${layer.color}40`, lineHeight: 1,
                    }}>{layer.num}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: t.ink, marginBottom: 2, transition: "color 0.4s" }}>{layer.name}</div>
                      <div style={{ fontSize: "0.75rem", color: t.muted, transition: "color 0.4s" }}>{layer.role}</div>
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace", fontSize: "0.58rem",
                      letterSpacing: "0.06em", textTransform: "uppercase",
                      padding: "3px 8px", borderRadius: 4,
                      border: `1px solid ${layer.color}`,
                      color: layer.color,
                    }}>{layer.badge}</div>
                  </div>
                ))}

                {/* Expanded detail panel */}
                {activeLayer && (() => {
                  const l = layers.find(x => x.num === activeLayer);
                  if (!l) return null;
                  return (
                    <div style={{
                      padding: "1.4rem 1.6rem",
                      background: t.bgCard,
                      borderTop: `1px solid ${t.border}`,
                      animation: "slideDown 0.3s ease",
                      transition: "background 0.4s, border-color 0.4s",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: "1.2rem" }}>{l.icon}</span>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: l.color, fontSize: "0.95rem" }}>{l.name}</span>
                      </div>
                      <p style={{ fontSize: "0.82rem", color: t.ink2, lineHeight: 1.65, transition: "color 0.4s" }}>{l.desc}</p>
                    </div>
                  );
                })()}

                {/* Output */}
                <div style={{
                  padding: "1rem 1.6rem", background: t.bgCard,
                  display: "flex", alignItems: "center", gap: 10,
                  transition: "background 0.4s",
                }}>
                  <span style={{ fontSize: "1.2rem" }}>✨</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", color: t.leaf }}>
                    Clean, Purified Air Output
                  </span>
                </div>
              </div>

              <p style={{
                marginTop: "0.8rem", textAlign: "center",
                fontFamily: "'Space Mono', monospace", fontSize: "0.62rem",
                letterSpacing: "0.08em", color: t.muted,
                transition: "color 0.4s",
              }}>
                ↑ Tap each layer to expand details
              </p>
            </Reveal>
          </div>

          {/* Right: Explanatory text */}
          <div>
            <Reveal delay={0.05}>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.85, color: t.ink2, fontWeight: 300, marginBottom: "1.2rem", transition: "color 0.4s" }}>
                Rather than a single-material filter, we engineered a <strong style={{ color: t.ink }}>three-stage cascading system</strong> where each layer targets a different class of pollutant by size and chemical type. This approach is more effective than any single material and extends the overall service life of the filter.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.85, color: t.ink2, fontWeight: 300, marginBottom: "1.5rem", transition: "color 0.4s" }}>
                The core mechanism is <strong style={{ color: t.ink }}>adsorption</strong> — distinct from absorption. In absorption, a substance dissolves <em>into</em> a material (like water into a sponge). In adsorption, molecules <strong style={{ color: t.teal }}>adhere to the surface</strong> of the material through Van der Waals forces without penetrating it. Activated carbon's vast porous surface area (up to 1,500 m² per gram) gives it extraordinary capacity to trap gas-phase pollutants.
              </p>
            </Reveal>

            {/* Adsorption vs absorption visual */}
            <Reveal delay={0.15}>
              <div className="adsorption-grid" style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
                marginBottom: "1.5rem",
              }}>
                {[
                  { title: "Adsorption ✓", subtitle: "What activated carbon does", desc: "Gas molecules bond to the enormous external and internal pore surfaces. They remain trapped on the surface without entering the bulk material.", color: t.teal },
                  { title: "Absorption ✗", subtitle: "What activated carbon does NOT do", desc: "Substance dissolves into the bulk of the material (like a sponge soaking water). This is NOT how activated carbon removes gases.", color: t.muted },
                ].map((item) => (
                  <div key={item.title} style={{
                    padding: "1.2rem", borderRadius: 10,
                    border: `1px solid ${item.title.includes("✓") ? item.color : t.border}`,
                    background: item.title.includes("✓") ? `${item.color}08` : t.bgCard,
                    transition: "all 0.4s",
                  }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "0.95rem", color: item.color, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: t.muted, marginBottom: 6, letterSpacing: "0.04em" }}>{item.subtitle}</div>
                    <p style={{ fontSize: "0.78rem", color: t.ink2, lineHeight: 1.55, transition: "color 0.4s" }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.85, color: t.ink2, fontWeight: 300, transition: "color 0.4s" }}>
                The filter foam pre-stage is strategically critical: without it, coarse particles would rapidly clog the costly activated charcoal layer, demanding frequent replacement. By sequencing the layers — mechanical foam first, dense carbon second, hybrid charcoal-foam third — we built a system that is efficient, economical, and self-protecting.
              </p>
            </Reveal>

            <Reveal delay={0.25}>
              <div style={{
                marginTop: "1.5rem", padding: "1.2rem 1.5rem",
                borderRadius: 10, background: t.bgCard,
                border: `1px solid ${t.border}`,
                transition: "background 0.4s, border-color 0.4s",
              }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: t.amber, marginBottom: 8 }}>
                  Pollutants Removed
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["Carbon Monoxide (CO)", "Volatile Organic Compounds", "Nitrogen Dioxide", "Fine Particulate Matter", "Dust & Pollen", "Smoke Particles", "Odour Molecules"].map(p => (
                    <span key={p} style={{
                      fontSize: "0.75rem", padding: "3px 10px",
                      background: t.bgAlt, borderRadius: 100,
                      border: `1px solid ${t.border}`,
                      color: t.ink2, transition: "all 0.4s",
                    }}>{p}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── AIRFLOW ARROWS ANIMATION ──────────────────────────────────
function AirflowArrows({ t }: { t: Theme }) {
  const [pos, setPos] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPos(p => (p + 1) % 30), 80);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          color: t.teal, fontSize: "0.7rem",
          opacity: ((pos + i * 10) % 30) / 30,
          transition: "opacity 0.1s, color 0.4s",
        }}>▶</span>
      ))}
    </div>
  );
}

// ─── SECTION 03: COMBINED SYSTEM ───────────────────────────────
function SystemSection({ t }: { t: Theme }) {
  const nodes: FlowNode[] = [
    { icon: "🕯️", label: "Heat Source\n(Candle / Sun)", connector: null },
    { icon: "🔲", label: "Thermoelectric\nModule", connector: { label: "heat ΔT", color: t.fire } },
    { icon: "💡", label: "Motor / LED\n(Electricity!)", connector: { label: "voltage", color: t.amber } },
  ];

  const airNodes: FlowNode[] = [
    { icon: "💨", label: "Polluted\nAir", connector: null },
    { icon: "🧽", label: "Filter\nFoam", connector: { label: "large particles", color: t.sky } },
    { icon: "⬛", label: "Activated\nCharcoal", connector: { label: "gases & odours", color: t.amber } },
    { icon: "🌿", label: "Charcoal\nFoam", connector: { label: "fine particles", color: t.leaf } },
    { icon: "✨", label: "Clean\nAir", connector: { label: "purified", color: t.teal } },
  ];

  return (
    <section className="section-shell" id="system" style={{
      padding: "6rem 3rem", background: t.bg, transition: "background 0.4s",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader num="03" kicker="Integration" title="How Both Systems Work Together" t={t} />

        <Reveal delay={0.05}>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.85, color: t.ink2, fontWeight: 300, maxWidth: 700, marginBottom: "3rem", transition: "color 0.4s" }}>
            The elegance of the design is that one heat source performs two jobs simultaneously.
            It drives the thermoelectric module to generate electricity, while any combustion
            by-products are immediately captured by the filtration system running in parallel.
            One energy input — two environmental benefits.
          </p>
        </Reveal>

        {/* Power pathway */}
        <Reveal delay={0.1}>
          <div style={{
            marginBottom: "1rem", padding: "0.6rem 1.2rem",
            background: `${t.fire}12`, border: `1px solid ${t.fire}30`,
            borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: t.fire, fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              ⚡ Power Pathway
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <FlowRow nodes={nodes} t={t} color={t.fire} />
        </Reveal>

        <Reveal delay={0.2}>
          <div style={{
            margin: "2rem 0 1rem",
            display: "flex", alignItems: "center", gap: "1rem",
          }}>
            <div style={{ flex: 1, height: 1, background: t.rule }} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", color: t.muted, fontStyle: "italic" }}>also</span>
            <div style={{ flex: 1, height: 1, background: t.rule }} />
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div style={{
            marginBottom: "1rem", padding: "0.6rem 1.2rem",
            background: `${t.teal}12`, border: `1px solid ${t.teal}30`,
            borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: t.teal, fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              🍃 Air Purification Pathway
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <FlowRow nodes={airNodes} t={t} color={t.teal} />
        </Reveal>

        {/* Synergy box */}
        <Reveal delay={0.35}>
          <div className="system-synergy-grid" style={{
            marginTop: "3rem", padding: "2rem 2.5rem",
            borderRadius: 16, background: t.bgCard,
            border: `1px solid ${t.border}`,
            display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2rem",
            transition: "background 0.4s, border-color 0.4s",
          }}>
            {[
              { icon: "🔥", label: "One Heat Source", desc: "A single thermal input drives both electricity generation and draws air through the filtration stack." },
              { icon: "⚡", label: "Dual Output", desc: "Simultaneously generates usable electrical power AND delivers clean, purified air." },
              { icon: "♻️", label: "Waste Capture", desc: "Combustion by-products from the heat source are captured by the filter — the system cleans up after itself." },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1rem", color: t.ink, marginBottom: 6, transition: "color 0.4s" }}>{item.label}</div>
                <p style={{ fontSize: "0.83rem", color: t.muted, lineHeight: 1.6, transition: "color 0.4s" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── FLOW ROW ──────────────────────────────────────────────────
function FlowRow({ nodes, t, color }: { nodes: FlowNode[]; t: Theme; color: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      gap: 0, overflowX: "auto", paddingBottom: 8,
    }}>
      {nodes.map((node, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {/* Connector before node */}
          {node.connector && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 6px" }}>
              <div style={{
                height: 2, width: 44,
                background: `linear-gradient(90deg, ${t.border}, ${color})`,
                animation: "flowPulse 1.8s ease-in-out infinite",
              }} />
              <span style={{
                fontFamily: "'Space Mono', monospace", fontSize: "0.55rem",
                letterSpacing: "0.06em", textTransform: "uppercase", color: t.muted,
                transition: "color 0.4s",
              }}>{node.connector.label}</span>
            </div>
          )}
          {/* Node */}
          <div
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 6, minWidth: 84,
            }}
            onMouseEnter={e => {
              const ic = e.currentTarget.querySelector<HTMLElement>(".flow-icon");
              if (ic) { ic.style.transform = "scale(1.14)"; ic.style.boxShadow = `0 8px 24px ${color}40`; }
            }}
            onMouseLeave={e => {
              const ic = e.currentTarget.querySelector<HTMLElement>(".flow-icon");
              if (ic) { ic.style.transform = "scale(1)"; ic.style.boxShadow = `0 4px 14px ${t.ink}12`; }
            }}
          >
            <div className="flow-icon" style={{
              width: 68, height: 68, borderRadius: "50%",
              background: t.bgCard, border: `1.5px solid ${t.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.6rem", boxShadow: `0 4px 14px ${t.ink}12`,
              transition: "all 0.3s ease, background 0.4s, border-color 0.4s",
              cursor: "default",
            }}>
              {node.icon}
            </div>
            <span style={{
              fontFamily: "'Space Mono', monospace", fontSize: "0.58rem",
              letterSpacing: "0.06em", textTransform: "uppercase",
              color: t.muted, textAlign: "center", lineHeight: 1.4,
              whiteSpace: "pre-line", transition: "color 0.4s",
            }}>{node.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SECTION 04: ADVANTAGES & LIMITATIONS ──────────────────────
function AdvSection({ t }: { t: Theme }) {
  const advantages = [
    { icon: "♻️", title: "Zero-Emission Power", body: "No combustion, no chemical reactions. Electricity is generated purely from temperature differential with zero harmful by-products.", color: t.fire, cls: "c1" },
    { icon: "🔧", title: "No Moving Parts", body: "Silent, near-zero maintenance operation. Unlike turbines or generators, there is nothing to mechanically wear out.", color: t.sky, cls: "c2" },
    { icon: "🌬️", title: "Three-Stage Air Cleaning", body: "Cascading filtration removes particles of all sizes — from coarse dust to fine VOCs and odour molecules — in a single pass.", color: t.teal, cls: "c3" },
    { icon: "🔄", title: "Waste Heat Utilisation", body: "Converts thermal energy that would otherwise be dissipated uselessly into the environment into useful electrical work.", color: t.amber, cls: "c4" },
    { icon: "🌍", title: "Multi-Source Compatible", body: "Works with candles, sunlight, engine exhaust, or industrial waste heat — any source that creates a sustained thermal gradient.", color: t.leaf, cls: "c5" },
    { icon: "📡", title: "Proven at Industrial Scale", body: "RTGs power NASA deep-space probes. Activated carbon cleans air in hospitals, vehicles, and gas masks worldwide.", color: t.fire, cls: "c6" },
  ];

  const limitations = [
    "Low thermoelectric conversion efficiency (typically 5–8%)",
    "Requires a strong ΔT for meaningful power output",
    "Carbon filter pores saturate — periodic replacement needed",
    "Less effective against microorganisms without additional HEPA stage",
  ];

  return (
    <section className="section-shell" style={{
      padding: "6rem 3rem", background: t.bgAlt,
      borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}`,
      transition: "background 0.4s, border-color 0.4s",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader num="04" kicker="Evaluation" title="Advantages & Limitations" t={t} />

        <div className="adv-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(3,1fr)",
          gap: 1, background: t.border, borderRadius: 12, overflow: "hidden",
          marginBottom: "3rem",
        }}>
          {advantages.map((a, i) => (
            <Reveal key={i} delay={0.07 * (i % 3)}>
              <AdvCard item={a} t={t} />
            </Reveal>
          ))}
        </div>

        {/* Limitations */}
        <Reveal>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2rem", flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "'Space Mono', monospace", fontSize: "0.68rem",
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: t.muted, whiteSpace: "nowrap", paddingTop: 6,
              transition: "color 0.4s",
            }}>
              Known Limitations
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {limitations.map(l => (
                <span key={l} style={{
                  fontSize: "0.8rem", color: t.ink2,
                  padding: "6px 14px",
                  background: t.bgCard,
                  border: `1px solid ${t.border}`,
                  borderRadius: 4,
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.4s",
                }}>
                  <span style={{ color: t.amber, fontSize: "0.6rem" }}>▲</span>
                  {l}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function AdvCard({ item, t }: { item: AdvantageItem; t: Theme }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{
        background: hov ? t.bgAlt : t.bgCard,
        padding: "2rem",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
        transition: "background 0.25s",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: item.color,
        transform: hov ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left",
        transition: "transform 0.35s ease",
      }} />
      <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{item.icon}</div>
      <div style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 700,
        fontSize: "1rem", color: t.ink, marginBottom: "0.5rem",
        transition: "color 0.4s",
      }}>{item.title}</div>
      <p style={{ fontSize: "0.82rem", color: t.muted, lineHeight: 1.65, transition: "color 0.4s" }}>{item.body}</p>
    </div>
  );
}

// ─── SECTION 05: CONCLUSION ────────────────────────────────────
function ConclusionSection({ t }: { t: Theme }) {
  return (
    <section className="section-shell" id="conclusion" style={{
      padding: "7rem 3rem", background: t.bg,
      textAlign: "center", transition: "background 0.4s",
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Reveal>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: "0.68rem",
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: t.muted, marginBottom: "1.5rem",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            transition: "color 0.4s",
          }}>
            <span style={{ width: 32, height: 1, background: t.rule, display: "inline-block" }} />
            Final Thoughts
            <span style={{ width: 32, height: 1, background: t.rule, display: "inline-block" }} />
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.2rem,5vw,3.5rem)",
            fontWeight: 900, lineHeight: 1.15, color: t.ink,
            marginBottom: "2rem", transition: "color 0.4s",
          }}>
            A Small Experiment.<br />
            A <em style={{ color: t.teal }}>Real Direction</em><br />
            for Our Future.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.85, color: t.ink2, fontWeight: 300, marginBottom: "1.2rem", transition: "color 0.4s" }}>
            By combining the Seebeck Effect with multi-layer carbon filtration, this project
            demonstrates that a single system can simultaneously address energy generation
            and air quality — two of the defining environmental challenges of our time.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.85, color: t.ink2, fontWeight: 300, marginBottom: "2rem", transition: "color 0.4s" }}>
            The technologies are not theoretical. Thermoelectric generators power NASA deep-space
            probes and vehicle exhaust recovery systems. Activated carbon filters clean air in
            hospitals, gas masks, and industrial facilities. What this project shows is that even
            at a student science scale, these principles are accessible, demonstrable, and
            genuinely meaningful toward a sustainable future.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <blockquote style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.2rem", fontStyle: "italic", lineHeight: 1.7,
            color: t.muted, maxWidth: 580, margin: "0 auto 2rem",
            padding: "1.5rem 2rem",
            borderTop: `1px solid ${t.rule}`, borderBottom: `1px solid ${t.rule}`,
            transition: "color 0.4s, border-color 0.4s",
          }}>
            "Simple scientific principles, applied responsibly and creatively, can become
            the building blocks of a cleaner, more energy-efficient world."
          </blockquote>
        </Reveal>

        <Reveal delay={0.25}>
          <a href="#intro" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 28px", borderRadius: 100,
            background: t.fire, color: "white",
            fontFamily: "'Space Mono', monospace", fontSize: "0.75rem",
            letterSpacing: "0.08em", textTransform: "uppercase",
            textDecoration: "none", fontWeight: 700,
            transition: "opacity 0.2s, transform 0.2s, background 0.4s",
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            ↑ Back to Top
          </a>
        </Reveal>
      </div>
    </section>
  );
}

// ─── FOOTER ────────────────────────────────────────────────────
function Footer({ t }: { t: Theme }) {
  return (
    <footer style={{
      background: t.ink, color: "rgba(255,255,255,0.4)",
      padding: "2.5rem 3rem",
      display: "flex", justifyContent: "space-between",
      alignItems: "center", flexWrap: "wrap", gap: "1rem",
      transition: "background 0.4s",
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "1.1rem", fontWeight: 700,
        color: "rgba(255,255,255,0.9)",
      }}>
        Eco Power Project
      </div>
      <span style={{
        fontFamily: "'Space Mono', monospace", fontSize: "0.65rem",
        letterSpacing: "0.08em",
      }}>
        © 2026 Student Science Project · Thermoelectric Generation + Carbon Air Filtration
      </span>
    </footer>
  );
}

// ─── ROOT PAGE ─────────────────────────────────────────────────
export default function EcoPowerPage() {
  const [dark, setDark] = useState(false);
  const [progress, setProgress] = useState(0);
  const t = dark ? DARK : LIGHT;

  useEffect(() => {
    const onScroll = () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
      setProgress(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }

        @keyframes blink {
          0%,100%{opacity:1;} 50%{opacity:0.25;}
        }
        @keyframes spinCw {
          from{transform:translate(-50%,-50%) rotate(0deg);}
          to{transform:translate(-50%,-50%) rotate(360deg);}
        }
        @keyframes spinCcw {
          from{transform:translate(-50%,-50%) rotate(0deg);}
          to{transform:translate(-50%,-50%) rotate(-360deg);}
        }
        @keyframes tempPulse {
          0%,100%{transform:scale(1);} 50%{transform:scale(1.08);}
        }
        @keyframes flameDance {
          0%,100%{transform:scale(1) rotate(-3deg);} 50%{transform:scale(1.1) rotate(3deg);}
        }
        @keyframes flowPulse {
          0%,100%{opacity:0.4;} 50%{opacity:1;}
        }
        @keyframes slideDown {
          from{opacity:0;transform:translateY(-8px);}
          to{opacity:1;transform:translateY(0);}
        }

        /* Mobile */
        @media(max-width:900px){
          .hero-main{grid-template-columns:1fr!important;}
          .seebeck-layout{grid-template-columns:1fr!important;}
          .filter-layout{grid-template-columns:1fr!important;}
          .adv-grid{grid-template-columns:1fr!important;}
          .nav-links-group{display:none!important;}
        }
      `}</style>

      <div style={{
        fontFamily: "'Outfit', sans-serif",
        background: t.bg,
        color: t.ink,
        minHeight: "100vh",
        transition: "background 0.4s, color 0.4s",
      }}>
        <Nav dark={dark} toggle={() => setDark(d => !d)} t={t} progress={progress} />

        <Hero t={t} />
        <ThermoSection t={t} />
        <FilterSection t={t} />
        <SystemSection t={t} />
        <AdvSection t={t} />
        <ConclusionSection t={t} />
        <Footer t={t} />
      </div>
    </>
  );
}