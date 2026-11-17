import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const envLines = fs.readFileSync(".env.local", "utf8").split("\n");
const env = {};
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
  const idx = trimmed.indexOf("=");
  const key = trimmed.slice(0, idx).trim();
  const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
  env[key] = val;
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const scheduleSessions = [
  {
    day: 1,
    title: "Teaching / Convergence",
    type: "Teaching",
    start_time: "20:00",
    end_time: "21:00",
    description: "The week opens here. A full teaching from the Word, followed by ministry and convergence in prayer.",
    join_url: "",
    active: true,
    sort_order: 1,
  },
  {
    day: 3,
    title: "Bible Study",
    type: "Bible Study",
    start_time: "21:00",
    end_time: "22:00",
    description: "Book by book, line by line. We stay in a passage until it is understood, not merely read.",
    join_url: "",
    active: true,
    sort_order: 2,
  },
  {
    day: 5,
    title: "Prayer",
    type: "Prayer",
    start_time: "21:00",
    end_time: "22:00",
    description: "Intercession for the body, the nations and one another. Bring your requests; we stand together.",
    join_url: "",
    active: true,
    sort_order: 3,
  },
  {
    day: 0,
    title: "Exhortation & Teaching",
    type: "Teaching",
    start_time: "18:00",
    end_time: "19:00",
    description: "A shorter weekend session: exhortation, questions and a word to carry into the week.",
    join_url: "",
    active: true,
    sort_order: 4,
  },
];

const seriesList = [
  {
    slug: "word-of-knowledge",
    title: "Word of Knowledge",
    description: "How God reveals what you could not have known, how to recognise it, and how to carry it without harming the people it is meant to serve.",
    status: "published",
    sort_order: 1,
  },
  {
    slug: "faith-series",
    title: "Faith Series",
    description: "Faith as substance, not sentiment. What it means to believe God when the evidence has not arrived.",
    status: "published",
    sort_order: 2,
  },
  {
    slug: "mystery-of-the-kingdom",
    title: "The Mystery of the Kingdom",
    description: "The kingdom hidden in parables, announced by Christ, and now at work among ordinary believers.",
    status: "published",
    sort_order: 3,
  },
  {
    slug: "gifts-of-the-spirit",
    title: "Gifts of the Spirit",
    description: "The nine gifts, their purpose in the body, and the character required to steward them.",
    status: "published",
    sort_order: 4,
  },
  {
    slug: "discerning-of-spirits",
    title: "Discerning of Spirits",
    description: "Telling the difference between the Holy Spirit, the human spirit and the spirit of the age.",
    status: "published",
    sort_order: 5,
  },
  {
    slug: "why-the-prophetic-ministry",
    title: "Why the Prophetic Ministry",
    description: "Why God sent prophets at all, and what their office means for the church today.",
    status: "published",
    sort_order: 6,
  },
  {
    slug: "book-studies",
    title: "Book Studies",
    description: "Slow studies through Ephesians, Acts, 1 Timothy, Daniel, Revelation and the Psalms.",
    status: "published",
    sort_order: 7,
  },
];

const teachingsList = [
  {
    slug: "the-word-of-knowledge-and-its-manifestation",
    title: "The Word of Knowledge and Its Manifestation",
    series_slug: "word-of-knowledge",
    topics: ["Gifts of the Spirit", "Prophetic ministry"],
    date: "2026-10-05",
    scripture: "1 Corinthians 12:8",
    summary: "A word of knowledge is not a general impression. It is a fragment of God's knowledge, given for a moment, for a person. This study sets out how it arrives, how it is tested, and why restraint is part of the gift.",
    image: "/images/bible-bedside.webp",
    imageAlt: "A believer studying the Scriptures by lamplight in a quiet room",
    featured: false,
    notes: [
      "Paul lists the word of knowledge among the manifestations of the Spirit, not among natural abilities. The source is God, the delivery is human, and the purpose is always the good of the hearer.",
      "A word of knowledge usually arrives as a single, specific detail: a name, a place, a condition, a season. It is partial by design. The gift does not make a person omniscient, and anyone who claims otherwise has misunderstood it.",
      "Test it. Bring it to Scripture, to the leadership of the fellowship, and to the person quietly. A true word will bear witness; a false one will not survive the conversation.",
      "Restraint is part of the gift. Not every detail received is a detail to be spoken, and never in a way that exposes what the person has not chosen to share.",
    ],
  },
  {
    slug: "faith-that-holds-when-nothing-moves",
    title: "Faith That Holds When Nothing Moves",
    series_slug: "faith-series",
    topics: ["Faith", "Endurance"],
    date: "2026-09-28",
    scripture: "Hebrews 11:1–3",
    summary: "Faith is described as substance and evidence, not as a feeling. A study of what faith is made of when the answer is slow and the room is quiet.",
    image: "/images/desert-dawn.webp",
    imageAlt: "A man walking a desert road at sunrise",
    featured: false,
    notes: [
      "Hebrews does not define faith by its intensity but by its object. What faith is made of matters more than how strongly it is felt.",
      "The chapter is a long list of people who acted before they saw, and died before the promise was fulfilled. Their faith was credited to them, not measured by outcomes.",
      "Practical shape: obey the last instruction you were given, keep the company of people who believe, and speak the promise without adding a deadline to it.",
    ],
  },
  {
    slug: "the-parable-of-the-hidden-treasure",
    title: "The Parable of the Hidden Treasure",
    series_slug: "mystery-of-the-kingdom",
    topics: ["Kingdom", "Parables"],
    date: "2026-09-21",
    scripture: "Matthew 13:44",
    summary: "A man finds treasure in a field and sells everything he has with joy. The kingdom is not a cost reluctantly paid; it is a discovery that reorganises a life.",
    image: "/images/potter.webp",
    imageAlt: "A potter shaping clay while an elder watches",
    featured: false,
    notes: [
      "The parable's surprise is the joy. The man is not grieving the sale of his possessions; he is glad, because he has seen what he is buying.",
      "The kingdom is hidden, but it is not far. It is found in a field — in the ordinary place where a person was already working.",
      "Ask what the field is in your own life. The call usually arrives attached to the work already in your hands.",
    ],
  },
  {
    slug: "discerning-between-three-voices",
    title: "Discerning Between Three Voices",
    series_slug: "discerning-of-spirits",
    topics: ["Discernment", "Prophetic ministry"],
    date: "2026-09-14",
    scripture: "1 John 4:1–6",
    summary: "Every impression comes from somewhere. A framework for telling the voice of the Spirit from the noise of the soul and the pressure of the age.",
    image: "/images/eagle-head.webp",
    imageAlt: "An eagle's head in profile against a dark sky",
    featured: false,
    notes: [
      "Three sources, three signatures. The Spirit speaks in a way that agrees with Scripture, exalts Christ and produces love, self-control and clarity over time.",
      "The soul speaks in urgency. It borrows the language of God but insists on being obeyed immediately, and it is usually about the person speaking.",
      "The age speaks in agreement. It is the voice that tells you what everyone already thinks, dressed as revelation.",
      "Time is a test, not an enemy. Wait, and the source becomes plain.",
    ],
  },
  {
    slug: "why-god-sent-prophets",
    title: "Why God Sent Prophets",
    series_slug: "why-the-prophetic-ministry",
    topics: ["Prophetic ministry", "Church"],
    date: "2026-09-19",
    scripture: "Daniel 4:17",
    summary: "Adapted from the 5th Anniversary teaching. Man lived in harmony with God until the fall; in love, God sent prophets to teach His ways until Christ came.",
    image: "/images/shofar-sunset.webp",
    imageAlt: "A shofar raised in a prayer shawl at sunset",
    featured: true,
    notes: [
      "The prophet is not primarily a fortune teller. The office exists so that a people who lost their way might be taught the ways of God again.",
      "Daniel 4:17 gives the theme the fellowship carries: the Most High rules in the kingdom of men. Prophecy is anchored in that government.",
      "Christ is the end of the search. Every prophetic word that is true leads toward Him, and any word that leads elsewhere has failed its own test.",
    ],
  },
  {
    slug: "the-nine-gifts-and-one-body",
    title: "The Nine Gifts and One Body",
    series_slug: "gifts-of-the-spirit",
    topics: ["Gifts of the Spirit", "Church"],
    date: "2026-09-07",
    scripture: "1 Corinthians 12:4–11",
    summary: "The gifts are distributed by one Spirit for one body. A study of the list, its order, and the charity that must govern it.",
    image: "/images/worship-hands.webp",
    imageAlt: "A young believer worshipping with raised hands",
    featured: false,
    notes: [
      "The chapter begins with difference and ends with unity: varieties of gifts, the same Spirit. Division over gifts is a contradiction of the text.",
      "The list in verses 8 to 10 is not a ranking. It is a description of how a body functions when every part is allowed to work.",
      "1 Corinthians 13 follows chapter 12 for a reason. Without love, the most remarkable manifestation is noise.",
    ],
  },
  {
    slug: "ephesians-one-the-great-assembly",
    title: "Ephesians 1: The Great Assembly",
    series_slug: "book-studies",
    topics: ["Ephesians", "Book study"],
    date: "2026-08-31",
    scripture: "Ephesians 1:3–14",
    summary: "A slow reading of Paul's opening sentence: chosen, adopted, redeemed, sealed. One long doxology before a single instruction.",
    image: "/images/prayer-cave.webp",
    imageAlt: "A man praying on his knees by candlelight",
    featured: false,
    notes: [
      "The Greek of verses 3 to 14 is one sentence. Paul does not pause to teach until he has finished worshipping.",
      "Four movements: the Father chooses, the Son redeems, the Spirit seals. The believer's assurance rests in the work of all three.",
      "The chapter's destination is not a doctrine but a life: that we might be to the praise of His glory.",
    ],
  },
  {
    slug: "prayer-that-does-not-let-go",
    title: "Prayer That Does Not Let Go",
    series_slug: "book-studies",
    topics: ["Prayer", "Luke"],
    date: "2026-08-24",
    scripture: "Luke 18:1–8",
    summary: "The persistent widow, the reluctant judge, and the question Christ asks at the end: will He find faith on the earth?",
    image: "/images/praying-man.webp",
    imageAlt: "A believer praying with his hands clasped, light falling across his face",
    featured: false,
    notes: [
      "The parable is introduced with its own interpretation: men ought always to pray and not to faint. The point is persistence, not pestering.",
      "The contrast is between a judge who cares for nothing and a Father who cares for everything. If the first answers, how much more the second.",
      "The closing question turns the parable on the reader. Persistent prayer is finally a question of whether faith will still be found.",
    ],
  },
];

async function sync() {
  console.log("1. Syncing schedule_sessions...");
  const { data: existingSessions } = await supabase.from("schedule_sessions").select("id,title");
  if (!existingSessions || existingSessions.length === 0) {
    const { error: sessErr } = await supabase.from("schedule_sessions").insert(scheduleSessions);
    if (sessErr) console.error("Error inserting schedule_sessions:", sessErr);
    else console.log("Successfully inserted schedule_sessions.");
  } else {
    console.log(`schedule_sessions already has ${existingSessions.length} rows.`);
  }

  console.log("2. Syncing series...");
  for (const s of seriesList) {
    const { error: serErr } = await supabase
      .from("series")
      .upsert(s, { onConflict: "slug" });
    if (serErr) console.error(`Error upserting series ${s.slug}:`, serErr);
  }
  console.log("Series upserted.");

  const { data: allSeries } = await supabase.from("series").select("id,slug");
  const seriesMap = new Map((allSeries || []).map((s) => [s.slug, s.id]));

  console.log("3. Syncing teachings...");
  for (const t of teachingsList) {
    const seriesId = seriesMap.get(t.series_slug) || null;
    const row = {
      title: t.title,
      slug: t.slug,
      series_id: seriesId,
      date_taught: t.date,
      speaker: "Prophet Lawrence Iwara",
      summary: t.summary,
      body: t.notes.join("\n\n"),
      cover_url: t.image,
      cover_alt: t.imageAlt,
      scripture: [t.scripture],
      tags: t.topics,
      featured: t.featured,
      status: "published",
    };

    const { error: teachErr } = await supabase
      .from("teachings")
      .upsert(row, { onConflict: "slug" });
    if (teachErr) console.error(`Error upserting teaching ${t.slug}:`, teachErr);
  }
  console.log("Teachings upserted.");
  console.log("ALL DATA SYNCED SUCCESSFULLY!");
}

sync();
