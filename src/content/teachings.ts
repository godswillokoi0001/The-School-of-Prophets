export type Series = {
  slug: string;
  title: string;
  blurb: string;
  /** Cover set in the CMS. Falls back to the first teaching's cover. */
  image?: string;
  imageAlt?: string;
};

export const seriesList: Series[] = [
  {
    slug: "word-of-knowledge",
    title: "Word of Knowledge",
    blurb:
      "How God reveals what you could not have known, how to recognise it, and how to carry it without harming the people it is meant to serve.",
  },
  {
    slug: "faith-series",
    title: "Faith Series",
    blurb:
      "Faith as substance, not sentiment. What it means to believe God when the evidence has not arrived.",
  },
  {
    slug: "mystery-of-the-kingdom",
    title: "The Mystery of the Kingdom",
    blurb:
      "The kingdom hidden in parables, announced by Christ, and now at work among ordinary believers.",
  },
  {
    slug: "gifts-of-the-spirit",
    title: "Gifts of the Spirit",
    blurb:
      "The nine gifts, their purpose in the body, and the character required to steward them.",
  },
  {
    slug: "discerning-of-spirits",
    title: "Discerning of Spirits",
    blurb:
      "Telling the difference between the Holy Spirit, the human spirit and the spirit of the age.",
  },
  {
    slug: "why-the-prophetic-ministry",
    title: "Why the Prophetic Ministry",
    blurb:
      "Why God sent prophets at all, and what their office means for the church today.",
  },
  {
    slug: "book-studies",
    title: "Book Studies",
    blurb:
      "Slow studies through Ephesians, Acts, 1 Timothy, Daniel, Revelation and the Psalms.",
  },
];

export type Format = "video" | "audio" | "notes";

export type Teaching = {
  slug: string;
  title: string;
  series: string; // series slug
  topics: string[];
  format: Format[];
  date: string; // ISO
  scripture: string;
  summary: string;
  /** YouTube id once the recording is supplied. null = written notes only. */
  youtubeId: string | null;
  /** Editorial image used for the card and the teaching page. */
  image: string;
  imageAlt: string;
  audioUrl?: string;
  notes: string[];
  /** Rich-text body authored in the admin editor (DB-backed entries). */
  body?: string;
  /** Admin-marked "teaching of the week". */
  featured?: boolean;
  /** Seed entries are labelled in the UI so nothing is passed off as real. */
  isSample?: boolean;
};

export const teachings: Teaching[] = [
  {
    slug: "the-word-of-knowledge-and-its-manifestation",
    title: "The Word of Knowledge and Its Manifestation",
    series: "word-of-knowledge",
    topics: ["Gifts of the Spirit", "Prophetic ministry"],
    format: ["notes"],
    date: "2026-10-05",
    scripture: "1 Corinthians 12:8",
    summary:
      "A word of knowledge is not a general impression. It is a fragment of God's knowledge, given for a moment, for a person. This study sets out how it arrives, how it is tested, and why restraint is part of the gift.",
    youtubeId: null,
    image: "/images/bible-bedside.webp",
    imageAlt: "A believer studying the Scriptures by lamplight in a quiet room",
    isSample: true,
    notes: [
      "Sample entry. The written outline below is a study summary prepared for this site; replace it with the ministry's own notes when the recording is supplied.",
      "Paul lists the word of knowledge among the manifestations of the Spirit, not among natural abilities. The source is God, the delivery is human, and the purpose is always the good of the hearer.",
      "A word of knowledge usually arrives as a single, specific detail: a name, a place, a condition, a season. It is partial by design. The gift does not make a person omniscient, and anyone who claims otherwise has misunderstood it.",
      "Test it. Bring it to Scripture, to the leadership of the fellowship, and to the person quietly. A true word will bear witness; a false one will not survive the conversation.",
      "Restraint is part of the gift. Not every detail received is a detail to be spoken, and never in a way that exposes what the person has not chosen to share.",
    ],
  },
  {
    slug: "faith-that-holds-when-nothing-moves",
    title: "Faith That Holds When Nothing Moves",
    series: "faith-series",
    topics: ["Faith", "Endurance"],
    format: ["notes"],
    date: "2026-09-28",
    scripture: "Hebrews 11:1–3",
    summary:
      "Faith is described as substance and evidence, not as a feeling. A study of what faith is made of when the answer is slow and the room is quiet.",
    youtubeId: null,
    image: "/images/desert-dawn.webp",
    imageAlt: "A man walking a desert road at sunrise",
    isSample: true,
    notes: [
      "Sample entry. Replace with the ministry's notes and recording.",
      "Hebrews does not define faith by its intensity but by its object. What faith is made of matters more than how strongly it is felt.",
      "The chapter is a long list of people who acted before they saw, and died before the promise was fulfilled. Their faith was credited to them, not measured by outcomes.",
      "Practical shape: obey the last instruction you were given, keep the company of people who believe, and speak the promise without adding a deadline to it.",
    ],
  },
  {
    slug: "the-parable-of-the-hidden-treasure",
    title: "The Parable of the Hidden Treasure",
    series: "mystery-of-the-kingdom",
    topics: ["Kingdom", "Parables"],
    format: ["notes"],
    date: "2026-09-21",
    scripture: "Matthew 13:44",
    summary:
      "A man finds treasure in a field and sells everything he has with joy. The kingdom is not a cost reluctantly paid; it is a discovery that reorganises a life.",
    youtubeId: null,
    image: "/images/potter.webp",
    imageAlt: "A potter shaping clay while an elder watches",
    isSample: true,
    notes: [
      "Sample entry. Replace with the ministry's notes and recording.",
      "The parable's surprise is the joy. The man is not grieving the sale of his possessions; he is glad, because he has seen what he is buying.",
      "The kingdom is hidden, but it is not far. It is found in a field — in the ordinary place where a person was already working.",
      "Ask what the field is in your own life. The call usually arrives attached to the work already in your hands.",
    ],
  },
  {
    slug: "discerning-between-three-voices",
    title: "Discerning Between Three Voices",
    series: "discerning-of-spirits",
    topics: ["Discernment", "Prophetic ministry"],
    format: ["notes"],
    date: "2026-09-14",
    scripture: "1 John 4:1–6",
    summary:
      "Every impression comes from somewhere. A framework for telling the voice of the Spirit from the noise of the soul and the pressure of the age.",
    youtubeId: null,
    image: "/images/eagle-head.webp",
    imageAlt: "An eagle's head in profile against a dark sky",
    isSample: true,
    notes: [
      "Sample entry. Replace with the ministry's notes and recording.",
      "Three sources, three signatures. The Spirit speaks in a way that agrees with Scripture, exalts Christ and produces love, self-control and clarity over time.",
      "The soul speaks in urgency. It borrows the language of God but insists on being obeyed immediately, and it is usually about the person speaking.",
      "The age speaks in agreement. It is the voice that tells you what everyone already thinks, dressed as revelation.",
      "Time is a test, not an enemy. Wait, and the source becomes plain.",
    ],
  },
  {
    slug: "why-god-sent-prophets",
    title: "Why God Sent Prophets",
    series: "why-the-prophetic-ministry",
    topics: ["Prophetic ministry", "Church"],
    format: ["notes"],
    date: "2026-09-19",
    scripture: "Daniel 4:17",
    summary:
      "Adapted from the 5th Anniversary teaching. Man lived in harmony with God until the fall; in love, God sent prophets to teach His ways until Christ came.",
    youtubeId: null,
    image: "/images/shofar-sunset.webp",
    imageAlt: "A shofar raised in a prayer shawl at sunset",
    isSample: true,
    notes: [
      "Sample entry, adapted from the anniversary teaching. Approve the wording with the Prophet before this page is published.",
      "The prophet is not primarily a fortune teller. The office exists so that a people who lost their way might be taught the ways of God again.",
      "Daniel 4:17 gives the theme the fellowship carries: the Most High rules in the kingdom of men. Prophecy is anchored in that government.",
      "Christ is the end of the search. Every prophetic word that is true leads toward Him, and any word that leads elsewhere has failed its own test.",
    ],
  },
  {
    slug: "the-nine-gifts-and-one-body",
    title: "The Nine Gifts and One Body",
    series: "gifts-of-the-spirit",
    topics: ["Gifts of the Spirit", "Church"],
    format: ["notes"],
    date: "2026-09-07",
    scripture: "1 Corinthians 12:4–11",
    summary:
      "The gifts are distributed by one Spirit for one body. A study of the list, its order, and the charity that must govern it.",
    youtubeId: null,
    image: "/images/worship-hands.webp",
    imageAlt: "A young believer worshipping with raised hands",
    isSample: true,
    notes: [
      "Sample entry. Replace with the ministry's notes and recording.",
      "The chapter begins with difference and ends with unity: varieties of gifts, the same Spirit. Division over gifts is a contradiction of the text.",
      "The list in verses 8 to 10 is not a ranking. It is a description of how a body functions when every part is allowed to work.",
      "1 Corinthians 13 follows chapter 12 for a reason. Without love, the most remarkable manifestation is noise.",
    ],
  },
  {
    slug: "ephesians-one-the-great-assembly",
    title: "Ephesians 1: The Great Assembly",
    series: "book-studies",
    topics: ["Ephesians", "Book study"],
    format: ["notes"],
    date: "2026-08-31",
    scripture: "Ephesians 1:3–14",
    summary:
      "A slow reading of Paul's opening sentence: chosen, adopted, redeemed, sealed. One long doxology before a single instruction.",
    youtubeId: null,
    image: "/images/prayer-cave.webp",
    imageAlt: "A man praying on his knees by candlelight",
    isSample: true,
    notes: [
      "Sample entry. Replace with the ministry's notes and recording.",
      "The Greek of verses 3 to 14 is one sentence. Paul does not pause to teach until he has finished worshipping.",
      "Four movements: the Father chooses, the Son redeems, the Spirit seals. The believer's assurance rests in the work of all three.",
      "The chapter's destination is not a doctrine but a life: that we might be to the praise of His glory.",
    ],
  },
  {
    slug: "prayer-that-does-not-let-go",
    title: "Prayer That Does Not Let Go",
    series: "book-studies",
    topics: ["Prayer", "Luke"],
    format: ["notes"],
    date: "2026-08-24",
    scripture: "Luke 18:1–8",
    summary:
      "The persistent widow, the reluctant judge, and the question Christ asks at the end: will He find faith on the earth?",
    youtubeId: null,
    image: "/images/praying-man.webp",
    imageAlt: "A believer praying with his hands clasped, light falling across his face",
    isSample: true,
    notes: [
      "Sample entry. Replace with the ministry's notes and recording.",
      "The parable is introduced with its own interpretation: men ought always to pray and not to faint. The point is persistence, not pestering.",
      "The contrast is between a judge who cares for nothing and a Father who cares for everything. If the first answers, how much more the second.",
      "The closing question turns the parable on the reader. Persistent prayer is finally a question of whether faith will still be found.",
    ],
  },
];

export const teachingOfTheWeek = "why-god-sent-prophets";

export const allTopics = Array.from(
  new Set(teachings.flatMap((t) => t.topics)),
).sort((a, b) => a.localeCompare(b));

export function seriesBySlug(slug: string) {
  return seriesList.find((s) => s.slug === slug);
}

export function teachingsBySeries(slug: string) {
  return teachings
    .filter((t) => t.series === slug)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function teachingBySlug(slug: string) {
  return teachings.find((t) => t.slug === slug);
}
