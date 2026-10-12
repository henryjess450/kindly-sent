// Card designs. The art lives in src/components/CardArt.tsx; this file is
// plain data so the server (emails, validation) can use it too.

export type Effect = "confetti" | "hearts" | "snow" | "sparkle" | "petals" | "none";

export type Design = {
  id: string;
  name: string;
  occasion: string;
  paper: string; // card stock colour
  ink: string; // text colour on the paper
  accent: string; // seal, buttons, highlights
  envelope: string; // envelope paper
  effect: Effect;
};

export const DESIGNS: Design[] = [
  { id: "balloons", name: "Balloons", occasion: "Birthday", paper: "#FFF3E6", ink: "#2B1D14", accent: "#FF5A4E", envelope: "#F4E4D0", effect: "confetti" },
  { id: "cake", name: "One Candle", occasion: "Birthday", paper: "#FDEEEF", ink: "#3A1F27", accent: "#E8577E", envelope: "#F6DCE0", effect: "confetti" },
  { id: "thanks", name: "Sprig", occasion: "Thank you", paper: "#EEF2E8", ink: "#24402C", accent: "#3F7A4F", envelope: "#E1E8D8", effect: "petals" },
  { id: "heart", name: "Big Heart", occasion: "Love", paper: "#FFE9E6", ink: "#4A1414", accent: "#E5383B", envelope: "#F7D7D2", effect: "hearts" },
  { id: "sun", name: "Sunrise", occasion: "Just because", paper: "#FFF7DC", ink: "#3B2A06", accent: "#F59E0B", envelope: "#F5E9BE", effect: "sparkle" },
  { id: "snow", name: "First Snow", occasion: "Holidays", paper: "#1C2A4A", ink: "#F4F6FB", accent: "#C8102E", envelope: "#E7EBF3", effect: "snow" },
  { id: "stars", name: "Gold Stars", occasion: "Congratulations", paper: "#ECEBFF", ink: "#1E1A4D", accent: "#5B4BDB", envelope: "#DEDCF7", effect: "sparkle" },
  { id: "tulip", name: "Tulip", occasion: "Thinking of you", paper: "#F3F1EC", ink: "#2F3B36", accent: "#7A8F84", envelope: "#E6E2D9", effect: "none" },
];

export const getDesign = (id: string) => DESIGNS.find((d) => d.id === id);

export const FONTS = [
  { id: "hand", name: "Handwritten" },
  { id: "serif", name: "Classic" },
  { id: "sans", name: "Modern" },
] as const;

export type FontId = (typeof FONTS)[number]["id"];
export const isFontId = (v: string): v is FontId => FONTS.some((f) => f.id === v);
