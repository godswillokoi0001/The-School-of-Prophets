export type EventItem = {
  slug: string;
  title: string;
  kind: "upcoming" | "past";
  date: string; // ISO date, WAT
  time?: string;
  endTime?: string;
  location: string;
  summary: string;
  detail?: string[];
  image: string;
  imageAlt: string;
  isSample?: boolean;
  needsConfirmation?: boolean;
};

export const events: EventItem[] = [
  {
    slug: "fifth-anniversary-why-the-prophetic-ministry",
    title: "5th Anniversary: Why the Prophetic Ministry?",
    kind: "past",
    date: "2026-09-19",
    time: "20:00",
    location: "Online",
    summary:
      "The fellowship marked five years since 18 September 2021 with a teaching on why God sent prophets at all, and what their office means for the church now.",
    image: "/images/shofar-sunset.webp",
    imageAlt: "A shofar raised at sunset",
    detail: [
      "The anniversary gathering was held online and taught by Prophet Lawrence Iwara, with prayers for the body and for the year ahead.",
      "The teaching traced the prophetic ministry from the fall to Christ: a people taught the ways of God, led in His paths, and pointed forward to the One who would bring them back.",
    ],
  },
  {
    slug: "youth-fire-conference",
    title: "Youth Fire Conference",
    kind: "upcoming",
    date: "2026-12-12",
    location: "To be confirmed",
    summary:
      "A gathering for young believers: the fire of God, the discipline of the Word, and a generation that will not settle for a borrowed faith.",
    image: "/images/worship-hands.webp",
    imageAlt: "A young man worshipping with raised hands",
    needsConfirmation: true,
    isSample: true,
  },
  {
    slug: "watch-night-december",
    title: "Watch Night",
    kind: "upcoming",
    date: "2026-12-31",
    time: "22:00",
    location: "Online",
    summary:
      "We close the year in prayer and open the next in thanksgiving, watching through the night together.",
    image: "/images/prayer-cathedral.webp",
    imageAlt: "A congregation at prayer in a cathedral lit by a shaft of light",
    needsConfirmation: true,
    isSample: true,
  },
];

export function eventBySlug(slug: string) {
  return events.find((e) => e.slug === slug);
}
