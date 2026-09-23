export type SectionId = "welcome" | "gallery" | "letters" | "cake" | "gift" | "love" | "wall" | "finale";
export type DecorationKey = "hearts" | "sparkles" | "stars" | "flowers" | "butterflies" | "bows" | "confetti" | "particles";
export type CoverStyle = "circle" | "rounded" | "polaroid" | "heart" | "glow";
export type PhotoStyle = "polaroid" | "rounded" | "soft";

export type BirthdayPhoto = { id: string; src: string; caption: string; note: string; date: string; style: PhotoStyle };
export type BirthdayLetter = { id: string; title: string; subtitle: string; text: string; signature: string; photoId: string; decoration: string };
export type LoveNote = { id: string; icon: string; title: string; description: string };
export type BirthdaySection = { id: SectionId; label: string; enabled: boolean };

export type BirthdayPersonalization = {
  name: string;
  nickname: string;
  introTitle: string;
  introSubtitle: string;
  birthdayMessage: string;
  giftMessage: string;
  finalMiddle: string;
  finalClosing: string;
  photos: BirthdayPhoto[];
  coverPhotoId: string;
  coverStyle: CoverStyle;
  letters: BirthdayLetter[];
  loveNotes: LoveNote[];
  sections: BirthdaySection[];
  theme: string;
  primaryColor: string;
  softColor: string;
  decorations: Record<DecorationKey, boolean>;
  musicSrc: string;
  musicName: string;
  musicVolume: number;
};

export const themePresets = [
  { id: "soft", label: "Soft Pink", primary: "#c9387c", soft: "#f9dce9" },
  { id: "baby", label: "Baby Pink", primary: "#df6ca3", soft: "#ffe3ef" },
  { id: "romantic", label: "Romantic Pink", primary: "#b82769", soft: "#f4c2d8" },
  { id: "rose", label: "Rose Pink", primary: "#a53b62", soft: "#efd0da" },
  { id: "blush", label: "Blush", primary: "#c05d78", soft: "#f5d8dd" },
  { id: "lavender", label: "Pink + Lavender", primary: "#ba4f92", soft: "#e9dcfa" },
  { id: "midnight", label: "Midnight Pink", primary: "#d64b92", soft: "#3d1834" },
];

const makeId = (prefix: string, index: number) => `${prefix}-${index + 1}`;

export const defaultPersonalization: BirthdayPersonalization = {
  name: "Your Special Person",
  nickname: "",
  introTitle: "Someone special has a birthday today...",
  introSubtitle: "And I made something just for you.",
  birthdayMessage: "Today is all about you.",
  giftMessage: "You deserve all the happiness in the world.",
  finalMiddle: "Thank you for being you.",
  finalClosing: "Here’s to another year of beautiful memories.",
  photos: [
    ["One of my favorite memories", "A little moment, kept forever."],
    ["This moment deserves its own place here.", "The kind of happy you can feel."],
    ["The day everything felt magical", "I still smile thinking about it."],
    ["A memory I never want to lose", "Just us, just happy."],
  ].map(([caption, note], index) => ({ id: makeId("photo", index), src: "", caption, note, date: "", style: "polaroid" as const })),
  coverPhotoId: "",
  coverStyle: "glow",
  letters: [
    { id: "letter-1", title: "For you 💗", subtitle: "A little note from my heart", text: "Write your personal birthday message here.\n\nMay your day feel as warm, bright, and beautiful as the joy you bring into the world.", signature: "with all my love, always", photoId: "", decoration: "hearts" },
  ],
  loveNotes: [
    ["♥", "Your smile", "The one that makes every room feel warmer."],
    ["✿", "Your personality", "Beautifully, unmistakably you."],
    ["✦", "Your energy", "A little bit of magic everywhere you go."],
    ["❦", "The joy you give", "You make people feel lighter."],
    ["୨୧", "Your kindness", "Soft, generous, and so deeply felt."],
    ["☾", "The little things", "All the quiet ways you make life special."],
  ].map(([icon, title, description], index) => ({ id: makeId("love", index), icon, title, description })),
  sections: [
    ["welcome", "Birthday message"], ["gallery", "Photo gallery"], ["letters", "Letters"], ["cake", "Birthday cake"],
    ["gift", "Gift"], ["love", "Things I love"], ["wall", "Memory wall"], ["finale", "Final message"],
  ].map(([id, label]) => ({ id: id as SectionId, label, enabled: true })),
  theme: "soft",
  primaryColor: "#c9387c",
  softColor: "#f9dce9",
  decorations: { hearts: true, sparkles: true, stars: true, flowers: true, butterflies: false, bows: true, confetti: true, particles: true },
  musicSrc: "/audio/birthday-dream.mp3",
  musicName: "Birthday dream",
  musicVolume: 0.45,
};

const DB_NAME = "birthday-studio";
const STORE = "projects";
const KEY = "saved-birthday";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadPersonalization(): Promise<BirthdayPersonalization> {
  const db = await openDb();
  return new Promise((resolve) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).get(KEY);
    request.onsuccess = () => resolve(request.result ? { ...defaultPersonalization, ...request.result } : structuredClone(defaultPersonalization));
    request.onerror = () => resolve(structuredClone(defaultPersonalization));
  });
}

export async function savePersonalization(value: BirthdayPersonalization) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, "readwrite").objectStore(STORE).put(value, KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function resetPersonalization() {
  const db = await openDb();
  return new Promise<void>((resolve) => {
    const request = db.transaction(STORE, "readwrite").objectStore(STORE).delete(KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
