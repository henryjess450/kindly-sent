// Card designs and style options. The art lives in src/components/CardArt.tsx;
// this file is plain data so the server (emails, validation) can use it too.

export type Effect = "confetti" | "hearts" | "snow" | "sparkle" | "petals" | "leaves" | "none";

export type Design = {
  id: string;
  name: string;
  occasion: string;
  paper: string; // card stock colour
  ink: string; // text colour on the paper
  accent: string; // seal, buttons, highlights
  envelope: string; // default envelope paper
  effect: Effect;
};

export const OCCASIONS = [
  "Birthday", "Love", "Thank you", "Congratulations", "Holidays", "Just because",
  "New baby", "Wedding", "Get well", "Thinking of you",
] as const;

export const DESIGNS: Design[] = [
  { id: "balloons", name: "Balloons", occasion: "Birthday", paper: "#FFF3E6", ink: "#2B1D14", accent: "#FF5A4E", envelope: "#F4E4D0", effect: "confetti" },
  { id: "cake", name: "One Candle", occasion: "Birthday", paper: "#FDEEEF", ink: "#3A1F27", accent: "#E8577E", envelope: "#F6DCE0", effect: "confetti" },
  { id: "party", name: "Party Hat", occasion: "Birthday", paper: "#E9F4FF", ink: "#14284B", accent: "#2F6FEB", envelope: "#DCE9F7", effect: "confetti" },
  { id: "heart", name: "Big Heart", occasion: "Love", paper: "#FFE9E6", ink: "#4A1414", accent: "#E5383B", envelope: "#F7D7D2", effect: "hearts" },
  { id: "aloft", name: "Hearts Aloft", occasion: "Love", paper: "#7A1F33", ink: "#FFF1F2", accent: "#FF8FA3", envelope: "#F3D9DE", effect: "hearts" },
  { id: "thanks", name: "Sprig", occasion: "Thank you", paper: "#EEF2E8", ink: "#24402C", accent: "#3F7A4F", envelope: "#E1E8D8", effect: "petals" },
  { id: "bouquet", name: "Bouquet", occasion: "Thank you", paper: "#FFF8F0", ink: "#3D2418", accent: "#E07A5F", envelope: "#F3E6D8", effect: "petals" },
  { id: "stars", name: "Gold Stars", occasion: "Congratulations", paper: "#ECEBFF", ink: "#1E1A4D", accent: "#5B4BDB", envelope: "#DEDCF7", effect: "sparkle" },
  { id: "grad", name: "Cap Toss", occasion: "Congratulations", paper: "#14213D", ink: "#F8F4E3", accent: "#FCA311", envelope: "#E5E1D3", effect: "confetti" },
  { id: "snow", name: "First Snow", occasion: "Holidays", paper: "#1C2A4A", ink: "#F4F6FB", accent: "#C8102E", envelope: "#E7EBF3", effect: "snow" },
  { id: "ornament", name: "Ornament", occasion: "Holidays", paper: "#0F3D2E", ink: "#F6EFD9", accent: "#D4A017", envelope: "#E4E9DF", effect: "snow" },
  { id: "lights", name: "Twinkle Lights", occasion: "Holidays", paper: "#16161D", ink: "#FFF8E7", accent: "#FFB703", envelope: "#E8E6E1", effect: "sparkle" },
  { id: "leaves", name: "Falling Leaves", occasion: "Holidays", paper: "#FBEFDF", ink: "#4A2A12", accent: "#C8553D", envelope: "#F0DFC8", effect: "leaves" },
  { id: "pumpkin", name: "Pumpkin", occasion: "Holidays", paper: "#231B2E", ink: "#FFE8CC", accent: "#F77F00", envelope: "#EBE3D7", effect: "sparkle" },
  { id: "sun", name: "Sunrise", occasion: "Just because", paper: "#FFF7DC", ink: "#3B2A06", accent: "#F59E0B", envelope: "#F5E9BE", effect: "sparkle" },
  { id: "rainbow", name: "Rainbow", occasion: "Just because", paper: "#EAF6FB", ink: "#173042", accent: "#3A86FF", envelope: "#DCEDF5", effect: "sparkle" },
  { id: "mobile", name: "Little Mobile", occasion: "New baby", paper: "#F1F6F2", ink: "#26413C", accent: "#7FB7A4", envelope: "#E3EDE6", effect: "sparkle" },
  { id: "rings", name: "Two Rings", occasion: "Wedding", paper: "#FBF8F3", ink: "#2E2A24", accent: "#C9A227", envelope: "#EFE9DD", effect: "sparkle" },
  { id: "tea", name: "Cup of Tea", occasion: "Get well", paper: "#F4EFE8", ink: "#3A2E26", accent: "#5E8C61", envelope: "#E8E0D4", effect: "petals" },
  { id: "tulip", name: "Tulip", occasion: "Thinking of you", paper: "#F3F1EC", ink: "#2F3B36", accent: "#7A8F84", envelope: "#E6E2D9", effect: "none" },
  { id: "moon", name: "Quiet Moon", occasion: "Thinking of you", paper: "#202A44", ink: "#EEF1F8", accent: "#B8C4E0", envelope: "#E2E5EE", effect: "none" },
];

export const getDesign = (id: string) => DESIGNS.find((d) => d.id === id);

export const FONTS = [
  { id: "hand", name: "Handwritten", css: "var(--font-hand)", scale: 1.22 },
  { id: "marker", name: "Marker", css: "var(--font-marker)", scale: 1.05 },
  { id: "serif", name: "Classic", css: "var(--font-serif)", scale: 1 },
  { id: "sans", name: "Modern", css: "var(--font-text)", scale: 1 },
  { id: "type", name: "Typewriter", css: "var(--font-type)", scale: 0.92 },
] as const;
export type FontId = (typeof FONTS)[number]["id"];
export const isFontId = (v: string): v is FontId => FONTS.some((f) => f.id === v);
export const getFont = (id: string) => FONTS.find((f) => f.id === id) ?? FONTS[0];

export const INKS = [
  { id: "black", name: "Black", color: "#24211D" },
  { id: "navy", name: "Navy", color: "#1F3A68" },
  { id: "forest", name: "Forest", color: "#2D5A3D" },
  { id: "berry", name: "Berry", color: "#8E1F44" },
  { id: "violet", name: "Violet", color: "#5B3FA0" },
] as const;
export const getInk = (id: string) => INKS.find((i) => i.id === id) ?? INKS[0];

/** "match" uses the design's own envelope colour. */
export const ENVELOPES = [
  { id: "match", name: "Matches the card", color: "" },
  { id: "white", name: "Bright white", color: "#FBFBF8" },
  { id: "kraft", name: "Kraft", color: "#D9B98C" },
  { id: "blush", name: "Blush", color: "#F6D6D6" },
  { id: "sage", name: "Sage", color: "#C9D8C5" },
  { id: "sky", name: "Sky", color: "#CFE3F2" },
  { id: "butter", name: "Butter", color: "#F7E7A9" },
  { id: "navy", name: "Midnight", color: "#24324F" },
] as const;
export function envelopeColor(design: Design, id: string) {
  const e = ENVELOPES.find((x) => x.id === id);
  return e && e.color ? e.color : design.envelope;
}

export const LINERS = [
  { id: "plain", name: "Plain" },
  { id: "dots", name: "Dots" },
  { id: "stripes", name: "Stripes" },
  { id: "confetti", name: "Confetti" },
  { id: "hearts", name: "Hearts" },
] as const;

export const isOption = (list: readonly { id: string }[], v: unknown): v is string => typeof v === "string" && list.some((x) => x.id === v);
