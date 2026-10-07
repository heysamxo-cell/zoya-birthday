/**
 * All the words in Zoya's world. Edit freely — make them yours. 💗
 * (Placeholders are written to feel warm and personal; swap in real
 * memories, inside jokes and nicknames to make it even more "her".)
 */

export type IconKey = "smile" | "eye" | "heart" | "habits" | "pout" | "soul" | "chat" | "plane" | "quote" | "reel" | "mic";

export const MEMORY_CARDS: { icon: IconKey; title: string; teaser: string; message: string[] }[] = [
  {
    icon: "smile",
    title: "The Smile I Imagine",
    teaser: "Unseen, but I can picture it",
    message: [
      "I've never seen your smile, Zoya — but I know it's there.",
      "I can hear it in your voice, read it in your words, and picture it every time something makes you laugh.",
      "Some smiles don't need to be seen to be felt. Yours is one of them.",
    ],
  },
  {
    icon: "eye",
    title: "How You See Things",
    teaser: "Clear, honest, fearless",
    message: [
      "You look at things the way a doctor does: you see what's really there, and you say it.",
      "No sugar-coating, no looking away — just the truth, said with courage.",
      "I can't tell you what your eyes look like. But I can tell you how you see, and it's remarkable.",
    ],
  },
  {
    icon: "heart",
    title: "Your Kind Heart",
    teaser: "Soft, warm, rare",
    message: [
      "You stand up for people loudly, and you care for them quietly. That's a rare mix.",
      "The world has too many loud hearts and not enough gentle ones like yours.",
      "Please remember: kindness like yours deserves to be returned in full.",
    ],
  },
  {
    icon: "habits",
    title: "Your Little Ways",
    teaser: "The tiny things I notice",
    message: [
      "The way you type when you're excited. The way a reel makes you say “you have to watch this.”",
      "The way you go from serious to silly in a single message.",
      "They're tiny, but they're my favourite parts of my day.",
    ],
  },
  {
    icon: "pout",
    title: "Your Cute Anger",
    teaser: "Dangerously adorable",
    message: [
      "I can't see the pout, but I can feel it through the screen.",
      "The “I'm not talking to you” energy. The way it melts in two minutes flat.",
      "Fine, I'll say it: I secretly don't mind making you a tiny bit angry. 💗",
    ],
  },
  {
    icon: "soul",
    title: "Your Beautiful Soul",
    teaser: "The prettiest part",
    message: [
      "I may never have seen you with my own eyes — but I can feel your vibe, and it's warm, bright and strong.",
      "It's your soul that makes people feel safe, heard and a little more hopeful.",
      "Zoya, you are a rare kind of beautiful, and the best part is the one that can't be photographed.",
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
    body: "Valid for one (1) very long, very warm hug. Redeemable anytime, anywhere, no expiry date. Delivered virtually until further notice. Terms: you must smile afterwards.",
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
  "Because your words can change the mood of an entire day.",
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
  "Nobody says things the way you do — it's honestly unfair to everyone else.",
  "You're proof that soft hearts are the strongest ones.",
  "You're the reason ordinary days turn into good memories.",
];

export const SECRETS = [
  "Secret #1: I smile every time I hear your voice note.",
  "Secret #2: Your name is my favourite thing to say.",
  "Secret #3: I made this whole little world just to imagine you smiling at it.",
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

/** 💬 Memories with you — the little everyday things that became the best parts of the day. */
export const MEMORIES_WITH_YOU: { icon: IconKey; title: string; text: string; big?: boolean }[] = [
  { icon: "chat", title: "Chatting with you", text: "Hours disappear when we talk. One “hey” turns into a hundred messages, and I never once look at the time." },
  { icon: "plane", title: "Messaging you", text: "Your name lighting up my screen is the nicest notification in the world. I still smile before I even open it." },
  { icon: "quote", title: "Reading your tweets", text: "Every tweet is you — bold, funny, fearless. I read them and think: I know her. And I’m so proud of her." },
  { icon: "reel", title: "Sharing reels on Insta", text: "Reel after reel, “this reminded me of you,” “watch this one.” The scrolling is just an excuse to stay close." },
  {
    icon: "mic",
    title: "Listening to your voice notes",
    text: "Your voice is the sweetest voice in the world. A voice note from you can fix a bad day, and I may have replayed some of them more than once.",
    big: true,
  },
];
