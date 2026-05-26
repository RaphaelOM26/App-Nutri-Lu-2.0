// Ícones — porte 1:1 de `Design 2.0/icons.jsx` para react-native-svg.
// Cada ícone é um React component que aceita { size, color, stroke }.
// Default: size 24, stroke 1.75.

import React from 'react';
import Svg, { Path, Circle, Rect, type SvgProps } from 'react-native-svg';

export type IconProps = {
  size?: number;
  color?: string;
  stroke?: number;
};

type I = React.FC<IconProps>;

// ─── Wrapper de SVG com defaults ─────────────────────────────────
type WrapperProps = IconProps & {
  children: React.ReactNode;
  fill?: SvgProps['fill'];
};

const Wrap: React.FC<WrapperProps> = ({ children, size = 24, color = '#1B1B1B', stroke = 1.75, fill = 'none' }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </Svg>
);

// ─── Ícones ──────────────────────────────────────────────────────
const home: I = (p) => (
  <Wrap {...p}>
    <Path d="M3 11l9-8 9 8v9a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2v-9z" />
  </Wrap>
);

const diary: I = (p) => (
  <Wrap {...p}>
    <Path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3V4z" />
    <Path d="M9 9h7M9 13h7M9 17h4" />
  </Wrap>
);

const chart: I = (p) => (
  <Wrap {...p}>
    <Path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Wrap>
);

const recipe: I = (p) => (
  <Wrap {...p}>
    <Path d="M6 4h12v6a6 6 0 01-12 0V4zM4 4h16M9 14v6h6v-6" />
  </Wrap>
);

const user: I = (p) => (
  <Wrap {...p}>
    <Circle cx="12" cy="8" r="4" />
    <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </Wrap>
);

const plus: I = (p) => (
  <Wrap {...p}>
    <Path d="M12 5v14M5 12h14" />
  </Wrap>
);

const minus: I = (p) => (
  <Wrap {...p}>
    <Path d="M5 12h14" />
  </Wrap>
);

const lock: I = (p) => (
  <Wrap {...p}>
    <Path d="M5 11h14v10H5zM8 11V7a4 4 0 018 0v4" />
  </Wrap>
);

const close: I = (p) => (
  <Wrap {...p}>
    <Path d="M6 6l12 12M18 6L6 18" />
  </Wrap>
);

const back: I = (p) => (
  <Wrap {...p}>
    <Path d="M15 6l-6 6 6 6" />
  </Wrap>
);

const forward: I = (p) => (
  <Wrap {...p}>
    <Path d="M9 6l6 6-6 6" />
  </Wrap>
);

const more: I = ({ size = 24, color = '#1B1B1B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="5" r="1.2" fill={color} />
    <Circle cx="12" cy="12" r="1.2" fill={color} />
    <Circle cx="12" cy="19" r="1.2" fill={color} />
  </Svg>
);

const search: I = (p) => (
  <Wrap {...p}>
    <Circle cx="11" cy="11" r="7" />
    <Path d="M20 20l-4-4" />
  </Wrap>
);

const camera: I = (p) => (
  <Wrap {...p}>
    <Path d="M4 7h3l2-3h6l2 3h3a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" />
    <Circle cx="12" cy="13" r="4" />
  </Wrap>
);

const barcode: I = (p) => (
  <Wrap {...p}>
    <Path d="M3 5v14M6 5v14M9 5v14M13 5v14M16 5v14M19 5v14M21 5v14" />
  </Wrap>
);

const mic: I = (p) => (
  <Wrap {...p}>
    <Rect x="9" y="3" width="6" height="12" rx="3" />
    <Path d="M5 11a7 7 0 0014 0M12 18v3" />
  </Wrap>
);

const flame: I = (p) => (
  <Wrap {...p}>
    <Path d="M12 3c2 4 6 5 6 11a6 6 0 01-12 0c0-3 2-4 2-7 2 1 3 2 4 4 0-3-1-5 0-8z" />
  </Wrap>
);

const bell: I = (p) => (
  <Wrap {...p}>
    <Path d="M6 9a6 6 0 0112 0c0 5 2 7 2 7H4s2-2 2-7zM10 20a2 2 0 004 0" />
  </Wrap>
);

const water: I = (p) => (
  <Wrap {...p}>
    <Path d="M12 3c-4 6-7 9-7 12a7 7 0 0014 0c0-3-3-6-7-12z" />
  </Wrap>
);

const flag: I = (p) => (
  <Wrap {...p}>
    <Path d="M5 21V4M5 4h12l-2 4 2 4H5" />
  </Wrap>
);

const calendar: I = (p) => (
  <Wrap {...p}>
    <Rect x="3" y="5" width="18" height="16" rx="2" />
    <Path d="M3 9h18M8 3v4M16 3v4" />
  </Wrap>
);

const edit: I = (p) => (
  <Wrap {...p}>
    <Path d="M4 20h4l11-11-4-4L4 16v4z" />
  </Wrap>
);

const trash: I = (p) => (
  <Wrap {...p}>
    <Path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </Wrap>
);

const star: I = (p) => (
  <Wrap {...p}>
    <Path d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
  </Wrap>
);

const starFill: I = ({ size = 24, color = '#1B1B1B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
  </Svg>
);

const bookmark: I = (p) => (
  <Wrap {...p}>
    <Path d="M6 4h12v17l-6-4-6 4V4z" />
  </Wrap>
);

const bookmarkFill: I = ({ size = 24, color = '#1B1B1B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M6 4h12v17l-6-4-6 4V4z" strokeLinejoin="round" />
  </Svg>
);

const heart: I = (p) => (
  <Wrap {...p}>
    <Path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z" />
  </Wrap>
);

const heartFill: I = ({ size = 24, color = '#1B1B1B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z" />
  </Svg>
);

const clock: I = (p) => (
  <Wrap {...p}>
    <Circle cx="12" cy="12" r="9" />
    <Path d="M12 7v5l3 2" />
  </Wrap>
);

const check: I = (p) => (
  <Wrap {...p}>
    <Path d="M4 12l5 5 11-12" />
  </Wrap>
);

const checkCircle: I = (p) => (
  <Wrap {...p}>
    <Circle cx="12" cy="12" r="9" />
    <Path d="M8 12l3 3 5-6" />
  </Wrap>
);

const settings: I = (p) => (
  <Wrap {...p}>
    <Circle cx="12" cy="12" r="3" />
    <Path d="M20 12a8 8 0 00-.4-2.5l2-1.5-2-3.5-2.4 1A8 8 0 0014 4l-.4-2.5h-3.2L10 4a8 8 0 00-3.2 1.5l-2.4-1-2 3.5 2 1.5A8 8 0 004 12c0 .9.1 1.7.4 2.5l-2 1.5 2 3.5 2.4-1A8 8 0 0010 20l.4 2.5h3.2L14 20a8 8 0 003.2-1.5l2.4 1 2-3.5-2-1.5c.3-.8.4-1.6.4-2.5z" />
  </Wrap>
);

const drumstick: I = (p) => (
  <Wrap {...p}>
    <Path d="M6 18l4-4M8 14a4 4 0 116-5 4 4 0 01-5 6L6 18l-3 1 1-3z" />
  </Wrap>
);

const wheat: I = (p) => (
  <Wrap {...p}>
    <Path d="M12 22V8M12 8c-2-2-5-2-5-2s0 3 2 5M12 8c2-2 5-2 5-2s0 3-2 5M12 13c-2-2-5-2-5-2s0 3 2 5M12 13c2-2 5-2 5-2s0 3-2 5M12 18c-2-2-5-2-5-2s0 3 2 5M12 18c2-2 5-2 5-2s0 3-2 5" />
  </Wrap>
);

const droplet: I = (p) => (
  <Wrap {...p}>
    <Path d="M12 3c4 6 7 9 7 12a7 7 0 01-14 0c0-3 3-6 7-12z" />
  </Wrap>
);

const scale: I = (p) => (
  <Wrap {...p}>
    <Rect x="3" y="5" width="18" height="14" rx="3" />
    <Path d="M8 12l4-4 4 4M12 8v6" />
  </Wrap>
);

const list: I = (p) => (
  <Wrap {...p}>
    <Path d="M3 6h18M3 12h18M3 18h18" />
  </Wrap>
);

const filter: I = (p) => (
  <Wrap {...p}>
    <Path d="M3 5h18l-7 9v6l-4-2v-4L3 5z" />
  </Wrap>
);

const voice: I = (p) => (
  <Wrap {...p}>
    <Path d="M2 12c2 0 2-5 4-5s2 10 4 10 2-8 4-8 2 6 4 6 2-3 4-3" />
  </Wrap>
);

const sparkle: I = (p) => (
  <Wrap {...p}>
    <Path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4" />
  </Wrap>
);

const link: I = (p) => (
  <Wrap {...p}>
    <Path d="M9 14l6-6M8 8H6a4 4 0 000 8h3M16 16h2a4 4 0 000-8h-3" />
  </Wrap>
);

const image: I = (p) => (
  <Wrap {...p}>
    <Rect x="3" y="3" width="18" height="18" rx="2" />
    <Circle cx="9" cy="9" r="2" />
    <Path d="M21 17l-5-5-9 9" />
  </Wrap>
);

const video: I = (p) => (
  <Wrap {...p}>
    <Rect x="3" y="6" width="13" height="12" rx="2" />
    <Path d="M16 10l5-3v10l-5-3z" />
  </Wrap>
);

const pen: I = (p) => (
  <Wrap {...p}>
    <Path d="M4 20h4l11-11-4-4L4 16v4z" />
  </Wrap>
);

const send: I = (p) => (
  <Wrap {...p}>
    <Path d="M3 12L21 4l-3 17-7-7-8-2z" />
  </Wrap>
);

const paperclip: I = (p) => (
  <Wrap {...p}>
    <Path d="M21 11l-9 9a5 5 0 01-7-7l9-9a3 3 0 014 4l-8 8a1 1 0 01-2-2l7-7" />
  </Wrap>
);

const trend: I = (p) => (
  <Wrap {...p}>
    <Path d="M3 17l6-6 4 4 8-8M14 7h7v7" />
  </Wrap>
);

const trendDown: I = (p) => (
  <Wrap {...p}>
    <Path d="M3 7l6 6 4-4 8 8M14 17h7v-7" />
  </Wrap>
);

const pantry: I = (p) => (
  <Wrap {...p}>
    <Path d="M5 3h14v18H5zM5 9h14M5 15h14M9 6h2M9 12h2M9 18h2" />
  </Wrap>
);

const cart: I = (p) => (
  <Wrap {...p}>
    <Path d="M3 4h2l3 13h11l2-9H6" />
    <Circle cx="9" cy="20" r="1.5" />
    <Circle cx="17" cy="20" r="1.5" />
  </Wrap>
);

const globe: I = (p) => (
  <Wrap {...p}>
    <Circle cx="12" cy="12" r="9" />
    <Path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
  </Wrap>
);

const apple: I = (p) => (
  <Wrap {...p}>
    <Path d="M12 7c0-2 1-4 4-4-1 2-1 4-4 4zM6 11a5 5 0 0110-2 5 5 0 014 9c-1 3-3 5-5 5s-3-1-4-1-2 1-4 1-4-2-5-5a5 5 0 014-7z" />
  </Wrap>
);

const flash: I = ({ size = 24, color = '#1B1B1B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M13 2L4 14h7l-1 8 10-12h-7l1-8z" />
  </Svg>
);

const flashOff: I = (p) => (
  <Wrap {...p}>
    <Path d="M13 2L4 14h7l-1 8 10-12h-7l1-8zM3 3l18 18" />
  </Wrap>
);

const gallery: I = (p) => (
  <Wrap {...p}>
    <Rect x="3" y="5" width="14" height="14" rx="2" />
    <Path d="M7 9h6M7 13h4M21 9v10a2 2 0 01-2 2H9" />
  </Wrap>
);

const award: I = (p) => (
  <Wrap {...p}>
    <Circle cx="12" cy="9" r="6" />
    <Path d="M9 14l-2 7 5-3 5 3-2-7" />
  </Wrap>
);

const ring: I = (p) => (
  <Wrap {...p}>
    <Circle cx="12" cy="12" r="9" />
    <Circle cx="12" cy="12" r="5" />
  </Wrap>
);

const bbox: I = (p) => (
  <Wrap {...p}>
    <Path d="M4 8V4h4M16 4h4v4M4 16v4h4M16 20h4v-4" />
  </Wrap>
);

// ─── Export ──────────────────────────────────────────────────────
export const Icon = {
  home,
  diary,
  chart,
  recipe,
  user,
  plus,
  minus,
  lock,
  close,
  back,
  forward,
  more,
  search,
  camera,
  barcode,
  mic,
  flame,
  bell,
  water,
  flag,
  calendar,
  edit,
  trash,
  star,
  starFill,
  bookmark,
  bookmarkFill,
  heart,
  heartFill,
  clock,
  check,
  checkCircle,
  settings,
  drumstick,
  wheat,
  droplet,
  scale,
  list,
  filter,
  voice,
  sparkle,
  link,
  image,
  video,
  pen,
  send,
  paperclip,
  trend,
  trendDown,
  pantry,
  cart,
  globe,
  apple,
  flash,
  flashOff,
  gallery,
  award,
  ring,
  bbox,
};

export type IconName = keyof typeof Icon;
