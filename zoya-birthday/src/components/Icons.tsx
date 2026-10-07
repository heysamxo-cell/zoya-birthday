import React from "react";

type P = { className?: string; style?: React.CSSProperties };

export const HEART_PATH =
  "M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.1 5.3 3.1 1.7-2 3.2-3.1 5.3-3.1 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21z";
export const SPARKLE_PATH = "M12 1.5c.7 5 2.6 8.8 10.5 10.5-7.9 1.7-9.8 5.5-10.5 10.5-.7-5-2.6-8.8-10.5-10.5C9.4 10.3 11.3 6.5 12 1.5z";

const svg = (children: React.ReactNode, p: P, vb = "0 0 24 24") => (
  <svg viewBox={vb} className={p.className} style={p.style} aria-hidden="true" fill="currentColor">
    {children}
  </svg>
);

export const IconHeart = (p: P) => svg(<path d={HEART_PATH} />, p);
export const IconSparkle = (p: P) => svg(<path d={SPARKLE_PATH} />, p);
export const IconBow = (p: P) =>
  svg(
    <>
      <path d="M12 12C9 7.5 3.5 6.5 2.5 9.5s2.5 6 9.5 2.5z" />
      <path d="M12 12c3-4.5 8.5-5.5 9.5-2.5s-2.5 6-9.5 2.5z" />
      <path d="M11 13l-3 7 2.5-1.2L12 21l1-6zM13 13l3 7-2.5-1.2L12 21z" opacity=".75" />
      <circle cx="12" cy="12" r="2.4" />
    </>,
    p,
  );
export const IconGift = (p: P) =>
  svg(
    <>
      <rect x="3" y="9" width="18" height="12" rx="2.5" />
      <rect x="2" y="6" width="20" height="4.5" rx="2" opacity=".85" />
      <rect x="10.8" y="6" width="2.4" height="15" fill="#fff" opacity=".7" />
      <path d="M12 6C9 1.5 5.5 3.5 7.5 5.5c1 1 3 .5 4.5.5zM12 6c3-4.5 6.5-2.5 4.5-.5-1 1-3 .5-4.5.5z" />
    </>,
    p,
  );
export const IconEnvelope = (p: P) =>
  svg(
    <>
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M3 7.5l9 6.5 9-6.5" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity=".85" />
    </>,
    p,
  );
export const IconBlossom = (p: P) =>
  svg(
    <>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="12" cy="6.2" rx="3.4" ry="4.6" transform={`rotate(${a} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="2.4" fill="#fff" opacity=".85" />
    </>,
    p,
  );
export const IconStar = (p: P) =>
  svg(<path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.1 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />, p);
export const IconNote = (p: P) =>
  svg(<path d="M9 17.5V5.5l11-2v12M9 17.5a3 3 0 11-2.4-2.9M20 15.5a3 3 0 11-2.4-2.9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />, p);

export const IconCamera = (p: P) =>
  svg(
    <>
      <path d="M8.500 4.500l-1.300 2H4a2 2 0 00-2 2V18a2 2 0 002 2h16a2 2 0 002-2V8.500a2 2 0 00-2-2h-3.200l-1.300-2z" />
      <circle cx="12" cy="13" r="3.800" fill="#fff" opacity=".9" />
      <circle cx="12" cy="13" r="2" />
    </>,
    p,
  );

const EMOJI_MAP: Record<string, (p: P) => React.ReactElement> = {
  "💗": IconHeart,
  "💕": IconHeart,
  "🤗": IconHeart,
  "✨": IconSparkle,
  "🎀": IconBow,
  "🎁": IconGift,
  "💌": IconEnvelope,
  "🌸": IconBlossom,
  "🎉": IconStar,
  "🎵": IconNote,
  "📸": IconCamera,
};
const EMOJI_RE = new RegExp(`(${Object.keys(EMOJI_MAP).join("|")})`, "g");

/** Renders text, swapping common emoji for crisp inline SVG icons (consistent on every device). */
export function Rich({ children, iconClass = "text-hot" }: { children: string; iconClass?: string }) {
  const parts = children.split(EMOJI_RE);
  return (
    <>
      {parts.map((part, i) => {
        const Icon = EMOJI_MAP[part];
        if (!Icon) return <React.Fragment key={i}>{part}</React.Fragment>;
        return (
          <Icon
            key={i}
            className={`inline-block h-[0.85em] w-[0.85em] -translate-y-[0.04em] align-middle mx-[0.12em] ${iconClass}`}
          />
        );
      })}
    </>
  );
}

/* Line icons for the "little things" cards */
const line = (children: React.ReactNode, p: P) => (
  <svg viewBox="0 0 48 48" className={p.className} style={p.style} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
export const CardIcons = {
  smile: (p: P) =>
    line(
      <>
        <circle cx="24" cy="24" r="17" />
        <path d="M15.5 27c2 5 5.2 7 8.5 7s6.5-2 8.5-7" />
        <path d="M17 19.5c1-1.6 2.6-1.6 3.6 0M27.4 19.5c1-1.6 2.6-1.6 3.6 0" />
        <path d="M38 8l1.2 2.8L42 12l-2.8 1.2L38 16l-1.2-2.8L34 12l2.8-1.2z" fill="currentColor" stroke="none" />
      </>,
      p,
    ),
  eye: (p: P) =>
    line(
      <>
        <path d="M4 24c5-9 12-13 20-13s15 4 20 13c-5 9-12 13-20 13S9 33 4 24z" />
        <circle cx="24" cy="24" r="7.5" />
        <circle cx="26.5" cy="21.5" r="2" fill="currentColor" stroke="none" />
        <path d="M10 10l-2-3M24 7V3M38 10l2-3" />
      </>,
      p,
    ),
  heart: (p: P) =>
    line(
      <>
        <path d="M24 41S7 31 7 19.5C7 13.5 11.4 9.5 16.5 9.5c3 0 5.7 1.6 7.5 4.2 1.8-2.6 4.5-4.2 7.5-4.2C36.600 9.500 41 13.500 41 19.500 41 31 24 41 24 41z" />
        <path d="M33 5l1 2.3L36.300 8.300 34 9.300 33 11.600 32 9.300 29.700 8.300 32 7.300z" fill="currentColor" stroke="none" />
      </>,
      p,
    ),
  habits: (p: P) =>
    line(
      <>
        <path d="M24 6c1.200 7 3.500 9.500 11 11-7.500 1.500-9.800 4-11 11-1.200-7-3.500-9.500-11-11 7.500-1.500 9.800-4 11-11z" />
        <path d="M37 30c.6 3.500 1.800 4.800 5.500 5.500-3.700.7-4.900 2-5.500 5.500-.6-3.500-1.800-4.800-5.500-5.500 3.700-.7 4.900-2 5.500-5.500z" />
        <path d="M9 31c.5 2.800 1.400 3.800 4.200 4.300-2.800.6-3.700 1.600-4.200 4.300-.5-2.700-1.400-3.700-4.200-4.300C7.600 34.800 8.500 33.800 9 31z" />
      </>,
      p,
    ),
  pout: (p: P) =>
    line(
      <>
        <circle cx="24" cy="24" r="17" />
        <path d="M15 17.500l6 2.200M33 17.500l-6 2.200" />
        <circle cx="18" cy="23.500" r="1.200" fill="currentColor" />
        <circle cx="30" cy="23.500" r="1.200" fill="currentColor" />
        <path d="M19.500 32.500c3-2.500 6-2.500 9 0" />
        <path d="M11 29.500c-1.500 1-2 2.200-1.600 3.500M37 29.500c1.500 1 2 2.200 1.600 3.500" opacity=".6" />
      </>,
      p,
    ),
  chat: (p: P) =>
    line(
      <>
        <path d="M8 10h17a4 4 0 014 4v8a4 4 0 01-4 4H17l-6 5v-5H8a4 4 0 01-4-4v-8a4 4 0 014-4z" />
        <path d="M33 18h3a4 4 0 014 4v8a4 4 0 01-4 4h-2v4.500l-5.500-4.500H25" opacity=".7" />
        <path d="M11.500 18h8M11.500 22h5" />
      </>,
      p,
    ),
  plane: (p: P) =>
    line(
      <>
        <path d="M42 6L6 20.500l12 5L42 6z" />
        <path d="M18 25.500V38l6-6.500" />
        <path d="M42 6L24 31.500 18 25.500" />
      </>,
      p,
    ),
  quote: (p: P) =>
    line(
      <>
        <path d="M8 28V21c0-6 3-10 9-11M8 28h8v9H8z" />
        <path d="M27 28V21c0-6 3-10 9-11M27 28h8v9h-8z" />
      </>,
      p,
    ),
  reel: (p: P) =>
    line(
      <>
        <rect x="6" y="6" width="36" height="36" rx="10" />
        <path d="M6 17h36M16 6l5 11M28 6l5 11" />
        <path d="M20 26.500v9l8-4.500z" fill="currentColor" />
      </>,
      p,
    ),
  mic: (p: P) =>
    line(
      <>
        <rect x="17" y="5" width="14" height="25" rx="7" />
        <path d="M10 22c0 8 6 13 14 13s14-5 14-13M24 35v8M17 43h14" />
      </>,
      p,
    ),
  soul: (p: P) =>
    line(
      <>
        <path d="M31 8.500A16 16 0 1020 41c6.500 0 12-3.800 14.500-9.200C25.500 33 18 26.500 18 18c0-4 1.800-7.800 5-10 2.800-.3 5.500 0 8 .5z" />
        <path d="M34 8l1.400 3.300L38.700 12.700 35.400 14 34 17.300 32.600 14 29.300 12.700 32.600 11.300z" fill="currentColor" stroke="none" />
        <circle cx="40" cy="22" r="1.400" fill="currentColor" stroke="none" />
      </>,
      p,
    ),
};
