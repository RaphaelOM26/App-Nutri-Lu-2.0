// icons.jsx — Stroke-line icons for Nutri Lu (clinical/professional)
// Default 24px, stroke 1.75. Pass size and color props.

const I = ({ children, size = 24, color = 'currentColor', stroke = 1.75, fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const Icon = {
  home: (p) => <I {...p}><path d="M3 11l9-8 9 8v9a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2v-9z"/></I>,
  diary: (p) => <I {...p}><path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3V4z"/><path d="M9 9h7M9 13h7M9 17h4"/></I>,
  chart: (p) => <I {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></I>,
  recipe: (p) => <I {...p}><path d="M6 4h12v6a6 6 0 01-12 0V4zM4 4h16M9 14v6h6v-6"/></I>,
  user: (p) => <I {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></I>,
  plus: (p) => <I {...p}><path d="M12 5v14M5 12h14"/></I>,
  close: (p) => <I {...p}><path d="M6 6l12 12M18 6L6 18"/></I>,
  back: (p) => <I {...p}><path d="M15 6l-6 6 6 6"/></I>,
  forward: (p) => <I {...p}><path d="M9 6l6 6-6 6"/></I>,
  more: (p) => <I {...p}><circle cx="12" cy="5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="19" r="1.2" fill="currentColor"/></I>,
  search: (p) => <I {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></I>,
  camera: (p) => <I {...p}><path d="M4 7h3l2-3h6l2 3h3a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z"/><circle cx="12" cy="13" r="4"/></I>,
  barcode: (p) => <I {...p}><path d="M3 5v14M6 5v14M9 5v14M13 5v14M16 5v14M19 5v14M21 5v14"/></I>,
  mic: (p) => <I {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></I>,
  flame: (p) => <I {...p}><path d="M12 3c2 4 6 5 6 11a6 6 0 01-12 0c0-3 2-4 2-7 2 1 3 2 4 4 0-3-1-5 0-8z"/></I>,
  bell: (p) => <I {...p}><path d="M6 9a6 6 0 0112 0c0 5 2 7 2 7H4s2-2 2-7zM10 20a2 2 0 004 0"/></I>,
  water: (p) => <I {...p}><path d="M12 3c-4 6-7 9-7 12a7 7 0 0014 0c0-3-3-6-7-12z"/></I>,
  flag: (p) => <I {...p}><path d="M5 21V4M5 4h12l-2 4 2 4H5"/></I>,
  calendar: (p) => <I {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></I>,
  edit: (p) => <I {...p}><path d="M4 20h4l11-11-4-4L4 16v4z"/></I>,
  trash: (p) => <I {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></I>,
  star: (p) => <I {...p}><path d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></I>,
  starFill: (p) => <I {...p} fill="currentColor" stroke="none"><path d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></I>,
  bookmark: (p) => <I {...p}><path d="M6 4h12v17l-6-4-6 4V4z"/></I>,
  bookmarkFill: (p) => <I {...p} fill="currentColor"><path d="M6 4h12v17l-6-4-6 4V4z" strokeLinejoin="round"/></I>,
  heart: (p) => <I {...p}><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z"/></I>,
  heartFill: (p) => <I {...p} fill="currentColor" stroke="none"><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z"/></I>,
  clock: (p) => <I {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></I>,
  check: (p) => <I {...p}><path d="M4 12l5 5 11-12"/></I>,
  checkCircle: (p) => <I {...p}><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></I>,
  settings: (p) => <I {...p}><circle cx="12" cy="12" r="3"/><path d="M20 12a8 8 0 00-.4-2.5l2-1.5-2-3.5-2.4 1A8 8 0 0014 4l-.4-2.5h-3.2L10 4a8 8 0 00-3.2 1.5l-2.4-1-2 3.5 2 1.5A8 8 0 004 12c0 .9.1 1.7.4 2.5l-2 1.5 2 3.5 2.4-1A8 8 0 0010 20l.4 2.5h3.2L14 20a8 8 0 003.2-1.5l2.4 1 2-3.5-2-1.5c.3-.8.4-1.6.4-2.5z"/></I>,
  drumstick: (p) => <I {...p}><path d="M6 18l4-4M8 14a4 4 0 116-5 4 4 0 01-5 6L6 18l-3 1 1-3z"/></I>,
  wheat: (p) => <I {...p}><path d="M12 22V8M12 8c-2-2-5-2-5-2s0 3 2 5M12 8c2-2 5-2 5-2s0 3-2 5M12 13c-2-2-5-2-5-2s0 3 2 5M12 13c2-2 5-2 5-2s0 3-2 5M12 18c-2-2-5-2-5-2s0 3 2 5M12 18c2-2 5-2 5-2s0 3-2 5"/></I>,
  droplet: (p) => <I {...p}><path d="M12 3c4 6 7 9 7 12a7 7 0 01-14 0c0-3 3-6 7-12z"/></I>,
  scale: (p) => <I {...p}><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M8 12l4-4 4 4M12 8v6"/></I>,
  list: (p) => <I {...p}><path d="M3 6h18M3 12h18M3 18h18"/></I>,
  filter: (p) => <I {...p}><path d="M3 5h18l-7 9v6l-4-2v-4L3 5z"/></I>,
  voice: (p) => <I {...p}><path d="M2 12c2 0 2-5 4-5s2 10 4 10 2-8 4-8 2 6 4 6 2-3 4-3"/></I>,
  sparkle: (p) => <I {...p}><path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4"/></I>,
  link: (p) => <I {...p}><path d="M9 14l6-6M8 8H6a4 4 0 000 8h3M16 16h2a4 4 0 000-8h-3"/></I>,
  image: (p) => <I {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 17l-5-5-9 9"/></I>,
  video: (p) => <I {...p}><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/></I>,
  pen: (p) => <I {...p}><path d="M4 20h4l11-11-4-4L4 16v4z"/></I>,
  send: (p) => <I {...p}><path d="M3 12L21 4l-3 17-7-7-8-2z"/></I>,
  paperclip: (p) => <I {...p}><path d="M21 11l-9 9a5 5 0 01-7-7l9-9a3 3 0 014 4l-8 8a1 1 0 01-2-2l7-7"/></I>,
  trend: (p) => <I {...p}><path d="M3 17l6-6 4 4 8-8M14 7h7v7"/></I>,
  trendDown: (p) => <I {...p}><path d="M3 7l6 6 4-4 8 8M14 17h7v-7"/></I>,
  pantry: (p) => <I {...p}><path d="M5 3h14v18H5zM5 9h14M5 15h14M9 6h2M9 12h2M9 18h2"/></I>,
  cart: (p) => <I {...p}><path d="M3 4h2l3 13h11l2-9H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/></I>,
  globe: (p) => <I {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></I>,
  apple: (p) => <I {...p}><path d="M12 7c0-2 1-4 4-4-1 2-1 4-4 4zM6 11a5 5 0 0110-2 5 5 0 014 9c-1 3-3 5-5 5s-3-1-4-1-2 1-4 1-4-2-5-5a5 5 0 014-7z"/></I>,
  flash: (p) => <I {...p}><path d="M13 2L4 14h7l-1 8 10-12h-7l1-8z" fill="currentColor" stroke="none"/></I>,
  flashOff: (p) => <I {...p}><path d="M13 2L4 14h7l-1 8 10-12h-7l1-8zM3 3l18 18"/></I>,
  gallery: (p) => <I {...p}><rect x="3" y="5" width="14" height="14" rx="2"/><path d="M7 9h6M7 13h4M21 9v10a2 2 0 01-2 2H9"/></I>,
  award: (p) => <I {...p}><circle cx="12" cy="9" r="6"/><path d="M9 14l-2 7 5-3 5 3-2-7"/></I>,
  ring: (p) => <I {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/></I>,
  bbox: (p) => <I {...p}><path d="M4 8V4h4M16 4h4v4M4 16v4h4M16 20h4v-4"/></I>,
};

window.Icon = Icon;
