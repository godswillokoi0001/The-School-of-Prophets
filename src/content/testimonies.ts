/**
 * Testimonies are published only with written consent. The entries below are
 * placeholders so the page can be reviewed; each is labelled "Sample" in the UI
 * and must be deleted before launch. Replace them through /admin (or by editing
 * this file) once the ministry has approved real submissions.
 */

export type Testimony = {
  id: string;
  name: string;
  location?: string;
  date: string;
  body: string;
  isSample?: boolean;
};

export const testimonies: Testimony[] = [
  {
    id: "sample-1",
    name: "Sample testimony",
    location: "Lagos, Nigeria",
    date: "2026-10-12",
    body: "Placeholder entry. This is where an approved testimony will sit: a short account of what God did, in the member's own words, with their written consent on file.",
    isSample: true,
  },
  {
    id: "sample-2",
    name: "Sample testimony",
    location: "Lusaka, Zambia",
    date: "2026-09-30",
    body: "Placeholder entry. Testimonies appear here only after the admin team has confirmed consent and reviewed the wording. Nothing is edited to exaggerate it.",
    isSample: true,
  },
  {
    id: "sample-3",
    name: "Sample testimony",
    date: "2026-09-19",
    body: "Placeholder entry. Submissions arrive through the form on this page, are held privately, and are published only after approval.",
    isSample: true,
  },
];

export const testimonyNote =
  "These entries are placeholders while the first approved testimonies are being collected. Nothing here describes a real person.";
