/**
 * 🕊️ ZOYA KI BATEIN — her most-loved posts and a portrait of her.
 * Edit freely: add a tweet by copying one object below.
 * Counts are approximate (noted October 2026) and shown as she'd see them: K = thousand, M = million.
 */
export const HANDLE = "@Zoya_ki_batein";
export const PROFILE_URL = "https://x.com/Zoya_ki_batein";

export type Tweet = {
  id: string;
  text: string;
  /** a short, neutral line about what she was replying to (never names other people) */
  context?: string;
  date: string;
  likes: string;
  reposts?: string;
  views?: string;
  /** heavy topics sit behind a tap-to-read note */
  note?: string;
};

/** ordered by likes, most loved first */
export const TWEETS: Tweet[] = [
  {
    id: "fathers",
    text: "Fathers don't usually die during childbirth",
    context: "Replying to a post asking “What about the father?” after birth announcements",
    date: "Jul 15, 2025",
    likes: "506K",
    reposts: "49K",
    views: "8.6M",
  },
  {
    id: "lunch",
    text: "Buy a house with my lunch money",
    context: "Answering “You wake up tomorrow and the year is 2005. What do you do?”",
    date: "Sep 2025",
    likes: "284K",
  },
  {
    id: "behalf",
    text: "On behalf of all women, we don’t give a f*** about what men like",
    date: "Jul 6, 2026",
    likes: "258K",
    reposts: "27K",
    views: "4.8M",
  },
  {
    id: "admitting",
    text: "They're finally admitting it.",
    context: "Quote-tweeting a viral post about why many men date women",
    date: "Jan 20, 2026",
    likes: "243K",
    reposts: "28K",
    views: "4.6M",
  },
  {
    id: "feminism",
    text: "feminism is quite literally the best thing that has ever happened to our species",
    context: "Under a historical photo of a 34-year-old man with his 12-year-old bride, 1937",
    date: "Mar 2026",
    likes: "218K",
  },
  {
    id: "predators",
    text: "He raped 3 girls, filmed choking one unconscious, and one needed surgeries for internal injuries. He got no prison time; his mother called arrest “terrible for a kid.”……When privilege protects predators, women pay the price while the next victim waits.",
    context: "About a news story on a teenager arrested for assaulting multiple girls",
    date: "Oct 4, 2026",
    likes: "171K",
    reposts: "35K",
    views: "4.4M",
    note: "sexual violence",
  },
  {
    id: "glitter",
    text: "I think this is brilliant and should be widely adopted. It makes it clear that we, as a female class, oppose cheating, and want to protect other women’s relationships and marriages together.",
    context: "On a trend of women wearing glitter to expose married men on dates",
    date: "Jan 2026",
    likes: "166K",
  },
  {
    id: "beasts",
    text: "Women aren't beasts like men.",
    context: "Under a clip praising a female reporter's professionalism in an interview",
    date: "May 13, 2026",
    likes: "165K",
    reposts: "9.2K",
    views: "2.6M",
  },
  {
    id: "wedding",
    text: "Two women getting married\nMen: How do I make this about myself?!",
    date: "Mar 2026",
    likes: "142K",
  },
];

export const PORTRAIT = {
  eyebrow: "who is she?",
  title: "The Girl Behind the Batein",
  paragraphs: [
    "Some people whisper their opinions. Zoya says hers out loud — plainly, fearlessly, and with a wit sharp enough to make you laugh right before it makes you think.",
    "She’s a doctor, which explains a lot: she looks at what’s really wrong, doesn’t flinch, and says it. Online it’s the same instinct. Her “reality checks” are about women’s safety, the double standards everyone else has learned to step around, and the systems that look away when they shouldn’t. She never dresses the truth up to make it comfortable.",
    "But what I love most is what’s underneath all that fire: love. She defends women as loudly as she celebrates them — their strength, their focus, their right to take up space (and, yes, to buy a house with their lunch money).",
    "Her words travel. One line, “Fathers don’t usually die during childbirth,” was read 8.6 million times. That isn’t luck. It’s what happens when someone says the thing a lot of people were thinking and never had the words for.",
    "Zoya ki batein — Zoya’s talks. May the world keep listening, and may you never stop talking.",
  ],
  stats: [
    { value: "506K", label: "likes on her biggest post" },
    { value: "8.6M", label: "people read that one post" },
    { value: "10+", label: "posts over 140K likes" },
  ],
};
