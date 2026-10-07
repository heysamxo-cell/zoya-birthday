/**
 * All the words in Zoya's world. Edit freely — make them yours. 💗
 * (Placeholders are written to feel warm and personal; swap in real
 * memories, inside jokes and nicknames to make it even more "her".)
 */

export type IconKey = "smile" | "eye" | "heart" | "habits" | "pout" | "soul";

export const MEMORY_CARDS: { icon: IconKey; title: string; teaser: string; message: string[] }[] = [
  {
    icon: "smile",
    title: "Your Smile",
    teaser: "The one that fixes everything",
    message: [
      "There's a moment right before you smile — and I've learned to watch for it.",
      "Your smile doesn't just show up on your face. It walks into the room, and suddenly everything feels lighter.",
      "Zoya, never let anyone make you smile less.",
    ],
  },
  {
    icon: "eye",
    title: "Your Eyes",
    teaser: "Little universes",
    message: [
      "Your eyes say things your words are too shy to say.",
      "They sparkle when you're happy, soften when you care, and somehow always make people feel seen.",
      "I could get lost in them — and honestly, I wouldn't mind.",
    ],
  },
  {
    icon: "heart",
    title: "Your Kind Heart",
    teaser: "Soft, warm, rare",
    message: [
      "You care so quietly and so completely that people don't even realize how lucky they are.",
      "The world has too many loud hearts and not enough gentle ones like yours.",
      "Please remember: kindness like yours deserves to be returned in full.",
    ],
  },
  {
    icon: "habits",
    title: "Your Little Habits",
    teaser: "The tiny things I notice",
    message: [
      "The little things you do without even thinking — that's what I notice the most.",
      "The way you tuck your hair back. The way you get excited about small things. The way you're just… you.",
      "They're tiny, but they're my favourite parts of your day.",
    ],
  },
  {
    icon: "pout",
    title: "Your Cute Anger",
    teaser: "Dangerously adorable",
    message: [
      "Even when you're upset, you're somehow the cutest person alive.",
      "The little pout. The 'I'm not talking to you' face. The way it melts in two minutes flat.",
      "Fine, I'll say it: I secretly don't mind making you a tiny bit angry. 💗",
    ],
  },
  {
    icon: "soul",
    title: "Your Beautiful Soul",
    teaser: "The prettiest part",
    message: [
      "You're beautiful on the outside — but that's honestly the least interesting thing about you.",
      "It's your soul that makes people feel safe, happy and a little more hopeful.",
      "Zoya, you are a rare kind of beautiful. Never forget that.",
    ],
  },
];

export type BoxFx = "hearts" | "petals" | "confetti" | "stars";
export type BoxMood = "excited" | "shy" | "surprised" | "love" | "celebrate";

export const SURPRISE_BOXES: {
  id: string;
  emoji: string;
  label: string;
  tone: "rose" | "blush" | "hot" | "lav" | "gold";
  title: string;
  body: string;
  mood: BoxMood;
  say: string;
  fx: BoxFx;
}[] = [
  {
    id: "open",
    emoji: "🎁",
    label: "Open Me",
    tone: "rose",
    title: "A tiny reminder",
    body: "You are the kind of person people feel lucky to know. Not because you try — but because you simply are.",
    mood: "excited",
    say: "Ooh, what's inside?!",
    fx: "hearts",
  },
  {
    id: "secret",
    emoji: "💌",
    label: "A Secret Message",
    tone: "blush",
    title: "Psst… a secret",
    body: "Here's something I don't say enough: you make my days softer, happier and a lot more fun. Thank you for being you.",
    mood: "shy",
    say: "Eep… for me?",
    fx: "hearts",
  },
  {
    id: "little",
    emoji: "🌸",
    label: "A Little Surprise",
    tone: "hot",
    title: "Flowers, just for you",
    body: "I wanted to give you the prettiest flowers in the world, but you're already prettier than all of them. So here are petals instead.",
    mood: "surprised",
    say: "Wait — petals?!",
    fx: "petals",
  },
  {
    id: "special",
    emoji: "💗",
    label: "Something Special",
    tone: "lav",
    title: "One Forever-Hug Coupon",
    body: "Valid for one (1) very long, very warm hug. Redeemable anytime, anywhere, no expiry date. Terms: you must smile afterwards.",
    mood: "love",
    say: "Hug accepted 💗",
    fx: "stars",
  },
  {
    id: "last",
    emoji: "✨",
    label: "One Last Surprise",
    tone: "gold",
    title: "Happy Birthday, Zoya!",
    body: "May this year be softer to you than the last, kinder than you expect, and full of everything that makes you smile. Keep scrolling — there's more waiting for you.",
    mood: "celebrate",
    say: "Happy Birthday to me!",
    fx: "confetti",
  },
];

export const WHY_LINES: string[] = [
  "Because you make ordinary moments feel special.",
  "Because your smile can change the mood of an entire day.",
  "Because you are uniquely YOU.",
  "Because the world is a little prettier with you in it.",
];
export const WHY_END = "And that's why today belongs to you. 💗";

export const LETTER: string[] = [
  "Dear Zoya,",
  "",
  "Today is your day.",
  "",
  "I hope this year brings you countless reasons to smile, beautiful memories to keep forever, and all the happiness you deserve.",
  "",
  "Keep being the wonderful person you are.",
  "",
  "Happy Birthday, Zoya. 💗",
];

export const COMPLIMENTS = [
  "You make the whole world feel warmer just by being in it.",
  "Your kindness is quietly the most beautiful thing about you.",
  "Nobody smiles like you do — it's honestly unfair to everyone else.",
  "You're proof that soft hearts are the strongest ones.",
  "You're the reason ordinary days turn into good memories.",
];

export const SECRETS = [
  "Secret #1: I smile every time I think of how you laugh.",
  "Secret #2: Your name is my favourite thing to say.",
  "Secret #3: I made this whole little world just to see you smile at it.",
];

export type WheelKey = "compliment" | "secret" | "wish" | "surprise" | "hug" | "love";
export const WHEEL: { key: WheelKey; label: string; emoji: string; line1: string; line2: string }[] = [
  { key: "compliment", label: "Get a Compliment 💗", emoji: "💗", line1: "Get a", line2: "Compliment" },
  { key: "secret", label: "Open a Secret 💌", emoji: "💌", line1: "Open a", line2: "Secret" },
  { key: "wish", label: "Make a Wish ✨", emoji: "✨", line1: "Make a", line2: "Wish" },
  { key: "surprise", label: "Birthday Surprise 🎁", emoji: "🎁", line1: "Birthday", line2: "Surprise" },
  { key: "hug", label: "Virtual Hug 🤗", emoji: "🤗", line1: "Virtual", line2: "Hug" },
  { key: "love", label: "More Love 💕", emoji: "💕", line1: "More", line2: "Love" },
];

/**
 * 📸 PHOTO GALLERY
 * To add a real photo:
 *   1. Copy the image into /public/photos (e.g. /public/photos/us-1.jpg)
 *   2. Set  src: "/photos/us-1.jpg"  on a card below.
 * Cards without a `src` show a pretty placeholder.
 */
export const GALLERY: { src?: string; caption: string; alt: string }[] = [
  { src: "", caption: "The day we first met", alt: "Memory one" },
  { src: "", caption: "That one perfect laugh", alt: "Memory two" },
  { src: "", caption: "Our little adventure", alt: "Memory three" },
  { src: "", caption: "You, being you", alt: "Memory four" },
  { src: "", caption: "A tiny moment I'll never forget", alt: "Memory five" },
  { src: "", caption: "More memories coming soon…", alt: "Memory six" },
];
