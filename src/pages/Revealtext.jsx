import { useEffect, useRef, useState, Children } from "react";

/**
 * RevealText
 * Splits its text content into lines (or accepts pre-split children) and
 * animates each line up from below with a fade + slight blur-clear as it
 * scrolls into view — staggered so lines cascade in one after another
 * instead of the whole block popping/fading in at once.
 *
 * Usage:
 *   <RevealText as="h2" className="section-title">Recycling With Purpose</RevealText>
 *
 * For multi-line paragraphs, pass an array of strings as `lines` to control
 * exactly where breaks happen, or just pass a long string and it will wrap
 * naturally — the mask + transform still apply per rendered line via the
 * inner span, giving a single clean reveal for shorter copy.
 *
 * as: which HTML tag to render (h1, h2, p, etc) — default "div"
 * delay: base stagger delay in ms between lines — default 90
 * once: if true (default), only animates the first time it enters view
 */
export default function RevealText({
  as: Tag = "div",
  children,
  className = "",
  delay = 90,
  once = false,
  split = "auto", // "auto" | "lines" | "words" | "none"
}) {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!once || !hasAnimatedRef.current) {
              setVisible(true);
              hasAnimatedRef.current = true;
            }
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  // Determine how to split content into animated chunks
  let chunks;
  if (split === "none") {
    chunks = [children];
  } else if (typeof children === "string") {
    if (split === "words") {
      chunks = children.split(" ");
    } else if (split === "lines" || split === "auto") {
      // split on explicit \n breaks; if none present, the whole string is
      // treated as a single line unit
      chunks = children.split("\n");
    } else {
      chunks = [children];
    }
  } else if (Array.isArray(children)) {
    chunks = children;
  } else {
    chunks = [children];
  }

  return (
    <Tag
      ref={containerRef}
      className={`reveal-text ${className}`}
      data-split={split}
    >
      {chunks.map((chunk, i) => (
        <span className="reveal-text-line-mask" key={i}>
          <span
            className={`reveal-text-line ${visible ? "is-visible" : ""}`}
            style={{ transitionDelay: `${i * delay}ms` }}
          >
            {chunk}
            {split === "words" && i < chunks.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}