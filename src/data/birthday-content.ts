/**
 * PERSONALIZE YOUR SURPRISE HERE
 * Replace the name, messages, captions, and photo paths below.
 * Add your photos to /public/photos and update each `src` value.
 * Replace /public/audio/birthday-dream.mp3 with your favorite song.
 */
export const birthdayContent = {
  name: "Your Special Person",
  intro: {
    title: "Someone special has a birthday today...",
    subtitle: "And I made something just for you.",
  },
  hero: {
    title: "Happy Birthday",
    subtitle: "Today is all about you.",
  },
  letter:
    "[WRITE YOUR PERSONAL BIRTHDAY MESSAGE HERE]\n\nMay your day feel as warm, bright, and beautiful as the joy you bring into the world. You deserve to feel celebrated today and always.",
  memories: [
    { caption: "One of my favorite memories", note: "A little moment, kept forever.", src: "" },
    { caption: "This moment deserves its own place here.", note: "The kind of happy you can feel.", src: "" },
    { caption: "The day everything felt magical", note: "I still smile thinking about it.", src: "" },
    { caption: "A memory I never want to lose", note: "Just us, just happy.", src: "" },
  ],
  loveNotes: [
    ["♥", "Your smile", "The one that makes every room feel warmer."],
    ["✿", "Your personality", "Beautifully, unmistakably you."],
    ["✦", "Your energy", "A little bit of magic everywhere you go."],
    ["❦", "The joy you give", "You make people feel lighter."],
    ["୨୧", "Your kindness", "Soft, generous, and so deeply felt."],
    ["☾", "The little things", "All the quiet ways you make life special."],
  ],
  final: {
    middle: "Thank you for being you.",
    closing: "Here’s to another year of beautiful memories.",
  },
  musicSrc: "/audio/birthday-dream.mp3",
};
