import { useEffect, useRef, useState } from "react";

/**
 * ScrollBattery
 * A fixed, full-viewport background element: a realistic, photoreal-shaded
 * battery illustration that grows in scale as the user scrolls down the
 * page, then — once scroll progress crosses a threshold — develops a quiet
 * hairline fracture and dissolves into fine grain via an SVG displacement
 * filter, fading to nothing. No debris, no flying particles, no replay.
 *
 * Driven by scroll position for the growth phase, and a short fixed-duration
 * sequence (~1100ms total) for the dissolve.
 */

// Stage timings (ms) — sequential.
const CRACK_DURATION = 220;    // hairline fracture appears, holds briefly
const DISSOLVE_DURATION = 900; // shape breaks into grain and fades out
// 220 + 900 = 1120ms

export default function ScrollBattery() {
  const batteryRef = useRef(null);
  const rafRef = useRef(null);
  const burstTriggeredRef = useRef(false);

  // Track the last computed scale/opacity every frame so the crack/dissolve
  // stages can pick up exactly where growth stopped. (Previously this used
  // CSS custom properties set on the growth-phase <div>, but that div
  // unmounts the instant `stage` changes — custom properties don't survive
  // on an unmounted node, so the next stage's `var(...)` reference resolved
  // to nothing and silently fell back to `transform: none; opacity: 1`,
  // i.e. the battery snapping to full size/full opacity instead of fading.
  // Refs avoid that because they're plain JS values read directly at
  // render time, not CSS state tied to a specific DOM node.)
  const scaleRef = useRef(1);
  const opacityRef = useRef(0.16);

  // stage: null -> "crack" -> "dissolve" -> null (hidden)
  const [stage, setStage] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [dissolveOpacity, setDissolveOpacity] = useState(null);

  // Growth range and burst threshold are now computed fresh every frame
  // inside `update` (from window.innerHeight), not declared as fixed
  // pixel constants here — see the comments inside `update` below.

 useEffect(() => {
  const update = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const vh = window.innerHeight;

    // Target the "What We Do" section specifically — the battery should
    // finish growing and dissolving before that section is reached.
    const servicesEl = document.getElementById("services");
    const servicesTop = servicesEl
      ? servicesEl.getBoundingClientRect().top + scrollY
      : vh + 1500; // fallback if the section isn't found

    const GROW_END = servicesTop * 0.7;
    const BURST_AT = servicesTop * 0.8;

    if (!burstTriggeredRef.current && scrollY >= BURST_AT) {
      burstTriggeredRef.current = true;
      triggerDissolveSequence();
    }

    // Only animate growth once scroll has cleared the hero (scrollY > vh).
    // Before that, leave the battery at its initial scale/opacity (set
    // via .scroll-battery-wrap's default CSS) so it doesn't show through
    // behind the hero at all.
    if (!burstTriggeredRef.current && batteryRef.current && scrollY > vh) {
      const progress = Math.min((scrollY - vh) / (GROW_END - vh), 1);
      const eased = 1 - Math.pow(1 - progress, 2); // ease-out
      const scale = 1 + eased * 1.3; // 1x -> 2.3x
      const opacity = 0.16 + eased * 0.18; // 0.16 -> 0.34
      scaleRef.current = scale;
      opacityRef.current = opacity;
      batteryRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
      batteryRef.current.style.opacity = opacity.toFixed(3);
    } else if (!burstTriggeredRef.current && batteryRef.current) {
      // Still inside the hero — keep it fully hidden rather than at
      // its base (visible) opacity.
      batteryRef.current.style.opacity = "0";
    }

    rafRef.current = requestAnimationFrame(update);
  };

  rafRef.current = requestAnimationFrame(update);
  return () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
  const triggerDissolveSequence = () => {
    setStage("crack");

    const t1 = setTimeout(() => {
      setStage("dissolve");
      // Start the dissolve opacity at whatever it actually was when growth
      // stopped, then drop it to 0 on the next frame so the CSS transition
      // animates from the real value — not a hardcoded keyframe start point
      // that would otherwise snap the battery to full opacity for a frame.
      setDissolveOpacity(opacityRef.current);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setDissolveOpacity(0));
      });
    }, CRACK_DURATION);

    const t2 = setTimeout(
      () => setHidden(true),
      CRACK_DURATION + DISSOLVE_DURATION
    );

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  };

  if (hidden) return null;

  // Computed directly from the refs (last values written during growth) —
  // no CSS variable indirection, so this can't silently fail the way the
  // var()-based approach did.
  const frozenTransform = `translate(-50%, -50%) scale(${scaleRef.current})`;
  const frozenStyle = {
    transform: frozenTransform,
    opacity: opacityRef.current,
  };
  const dissolveStyle = {
    transform: frozenTransform,
    opacity: dissolveOpacity ?? opacityRef.current,
    transition: `opacity ${DISSOLVE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  return (
    <div className="scroll-battery-layer" aria-hidden="true">
      <DissolveFilterDefs />

      {!stage && (
        <div ref={batteryRef} className="scroll-battery-wrap">
          <DetailedBatterySVG />
        </div>
      )}

      {stage === "crack" && (
        <div className="scroll-battery-wrap scroll-battery-crack" style={frozenStyle}>
          <DetailedBatterySVG />
          <HairlineCrackSVG />
        </div>
      )}

      {stage === "dissolve" && (
        <div
          className="scroll-battery-wrap scroll-battery-dissolve"
          style={dissolveStyle}
        >
          <DetailedBatterySVG />
          <HairlineCrackSVG faded />
        </div>
      )}
    </div>
  );
}

/**
 * Hidden, persistent SVG filter used for the dissolve effect. Rendered once
 * at the layer root (not inside the scaled battery SVG) because filters need
 * a stable reference, not one living inside a transformed/scaled element.
 * Combines fractal-noise turbulence with a displacement map so the shape
 * breaks into fine, irregular grain rather than melting or pixelating
 * uniformly — paired with a CSS opacity ramp for the fade-out.
 */
function DissolveFilterDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <filter
          id="sb-dissolve-filter"
          x="-20%"
          y="-15%"
          width="140%"
          height="130%"
          colorInterpolationFilters="sRGB"
        >
          {/* Fine static grain used as an erosion mask — this is what makes
              the shape break into "sandy" texture rather than smear. */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9 0.9"
            numOctaves="2"
            seed="11"
            result="sb-grain"
          />
          <feColorMatrix
            in="sb-grain"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.9 0.9 0.9 0 -0.15"
            result="sb-grain-alpha"
          />
          <feComposite
            in="SourceGraphic"
            in2="sb-grain-alpha"
            operator="in"
            result="sb-textured"
          />

          {/* Raising the alpha gamma exponent over time erodes the
              already-faint grain pixels first, then the more solid ones —
              a progressive "eaten away by grain" dissolve rather than a
              flat crossfade. */}
          <feComponentTransfer in="sb-textured" result="sb-eroded">
            <feFuncA type="gamma" amplitude="1" exponent="1" offset="0">
              <animate
                attributeName="exponent"
                values="1;6;26"
                dur="900ms"
                begin="0s"
                fill="freeze"
              />
            </feFuncA>
          </feComponentTransfer>

          <feGaussianBlur in="sb-eroded" stdDeviation="0.3" result="sb-soft" />

          {/* A second, coarser noise field drives a small amount of edge
              jitter — kept low so it reads as crumbling, not as the
              full-frame static a large displacement scale produces. */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.08"
            numOctaves="2"
            seed="7"
            result="sb-warp"
          >
            <animate
              attributeName="baseFrequency"
              values="0.02 0.08;0.05 0.16;0.1 0.3"
              dur="900ms"
              begin="0s"
              fill="freeze"
            />
          </feTurbulence>
          <feDisplacementMap
            in="sb-soft"
            in2="sb-warp"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          >
            <animate
              attributeName="scale"
              values="0;5;9"
              dur="900ms"
              begin="0s"
              fill="freeze"
            />
          </feDisplacementMap>
        </filter>
      </defs>
    </svg>
  );
}

/**
 * A restrained hairline fracture — one fine crack line with a couple of
 * short branches, not a cartoon zigzag burst pattern. Reads as a quiet
 * material failure, not an impact-frame illustration.
 */
function HairlineCrackSVG({ faded = false }) {
  return (
    <svg
      className={`scroll-battery-cracklines ${faded ? "is-faded" : ""}`}
      viewBox="0 0 200 380"
      width="200"
      height="380"
    >
      <g
        fill="none"
        stroke="#04231C"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M70 96 L92 132 L84 158 L104 198 L96 240 L112 286" opacity="0.85" />
        <path d="M92 132 L118 142 L132 128" opacity="0.55" />
        <path d="M104 198 L128 206" opacity="0.5" />
        <path d="M96 240 L74 252" opacity="0.45" />
      </g>
    </svg>
  );
}

function DetailedBatterySVG() {
  return (
    <svg
      className="scroll-battery-svg"
      viewBox="0 0 200 380"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Cylindrical body shading: highlight, mid, core shadow, mid, edge —
            multi-stop so the form reads as rounded rather than a flat tint. */}
        <linearGradient id="sb-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2BC79A" />
          <stop offset="18%" stopColor="#1E9E78" />
          <stop offset="46%" stopColor="#11785A" />
          <stop offset="72%" stopColor="#0C5A45" />
          <stop offset="100%" stopColor="#0A4536" />
        </linearGradient>

        {/* Soft vertical falloff so the body isn't a uniform tube */}
        <linearGradient id="sb-body-vertical" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.18" />
          <stop offset="10%" stopColor="#000000" stopOpacity="0" />
          <stop offset="88%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
        </linearGradient>

        <linearGradient id="sb-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C7C6C0" />
          <stop offset="45%" stopColor="#9A998F" />
          <stop offset="100%" stopColor="#65645C" />
        </linearGradient>

        {/* Narrow specular highlight, not a broad diagonal sheen rectangle */}
        <linearGradient id="sb-highlight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="46%" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="58%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="sb-vignette" cx="50%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="75%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </radialGradient>

        <filter id="sb-drop-shadow" x="-30%" y="-10%" width="160%" height="130%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#02110D" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter="url(#sb-drop-shadow)">
        {/* terminal cap */}
        <rect x="80" y="2" width="40" height="22" rx="6" fill="url(#sb-cap)" />
        <rect x="93" y="-6" width="14" height="12" rx="2.5" fill="#76756C" />

        {/* main body */}
        <rect x="10" y="24" width="180" height="352" rx="22" fill="url(#sb-body)" />
        <rect x="10" y="24" width="180" height="352" rx="22" fill="url(#sb-body-vertical)" />
        <rect x="10" y="24" width="180" height="352" rx="22" fill="url(#sb-highlight)" />
        <rect x="10" y="24" width="180" height="352" rx="22" fill="url(#sb-vignette)" />

        {/* label plate — a muted spec card rather than a literal "Li-ION" stamp */}
        <rect x="30" y="66" width="140" height="74" rx="8" fill="#E9F6EF" opacity="0.9" />
        <rect x="44" y="84" width="96" height="6" rx="3" fill="#0B4A37" opacity="0.45" />
        <rect x="44" y="98" width="112" height="5" rx="2.5" fill="#0B4A37" opacity="0.28" />
        <rect x="44" y="110" width="74" height="5" rx="2.5" fill="#0B4A37" opacity="0.28" />
        <rect x="44" y="122" width="92" height="5" rx="2.5" fill="#0B4A37" opacity="0.22" />

        {/* charge indicator segments */}
        <rect x="36" y="158" width="128" height="11" rx="3" fill="#04231C" opacity="0.4" />
        <rect x="36" y="178" width="128" height="11" rx="3" fill="#04231C" opacity="0.4" />
        <rect x="36" y="198" width="128" height="11" rx="3" fill="#04231C" opacity="0.4" />
        <rect x="36" y="218" width="84" height="11" rx="3" fill="#04231C" opacity="0.26" />

        {/* terminal markers — thin crossed lines, not bold glyphs */}
        <g stroke="#E9F6EF" strokeWidth="2" strokeLinecap="round" opacity="0.55">
          <line x1="40" y1="252" x2="56" y2="252" />
          <line x1="48" y1="244" x2="48" y2="260" />
        </g>
        <g stroke="#E9F6EF" strokeWidth="2" strokeLinecap="round" opacity="0.4">
          <line x1="144" y1="252" x2="160" y2="252" />
        </g>

        {/* lower body — quiet horizontal ribs instead of clipart chevrons */}
        <g stroke="#04231C" strokeWidth="1" opacity="0.18">
          <line x1="28" y1="296" x2="172" y2="296" />
          <line x1="28" y1="308" x2="172" y2="308" />
          <line x1="28" y1="320" x2="172" y2="320" />
        </g>
      </g>
    </svg>
  );
}