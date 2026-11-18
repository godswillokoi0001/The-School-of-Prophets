/**
 * SINGLE SOURCE OF IDENTITY.
 * Re-skin this site for another ministry by editing this file and src/content/*.
 */

export const site = {
  name: "The School of Prophets",
  shortName: "TSOP",
  wordmark: ["The School", "of Prophets"],
  crest: "WATCHERS · DAN 4:17",
  tagline: "A community of the called.",
  description:
    "An interdenominational prophetic community learning the Word, worship and prayer. Weekly online gatherings and a Bible institute for those called into ministry.",
  leader: "Prophet Lawrence Iwara",
  founded: "18 September 2021",
  foundedISO: "2021-09-18",
  timezone: "Africa/Lagos",
  timezoneLabel: "WAT",
  locale: "en-NG",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://theschoolofprophets.org",
  analytics: {
    // Plausible domain. Empty string = no analytics script at all.
    plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "",
  },
  nav: [
    { label: "About", href: "/about" },
    { label: "Gatherings", href: "/gatherings" },
    { label: "Teachings", href: "/teachings" },
    { label: "Training", href: "/training" },
    { label: "Events", href: "/events" },
    { label: "Prayer", href: "/prayer" },
    { label: "Give", href: "/give" },
    { label: "Contact", href: "/contact" },
  ],
  social: {
    // Supplied by the ministry: these three are live.
    facebookPage: "https://web.facebook.com/lawrence.iwara.581",
    facebookGroup: "https://web.facebook.com/groups/549551002660877",
    youtube: "https://youtube.com/@prophetlawrencefiwara",
    // TODO(ministry): paste the current invite links. While empty, every join
    // button routes to /contact so visitors can request access instead of
    // landing on a dead link.
    whatsappInvite: "",
    telegramInvite: "",
  },
  email: {
    // TODO(ministry): a mailbox for general enquiries. Until then the contact
    // form is the front door and submissions go to FORMS_INBOX.
    publicAddress: "",
  },
  /**
   * Colophon credit. Left empty for this build: a studio name is a fact, not a
   * design decision. Set both fields to print "Site by …" in the footer.
   * TODO(studio): set credit.name (and credit.href) when the site ships.
   */
  credit: {
    label: "Site by",
    name: "",
    href: "",
  },
} as const;

export type SocialKey = keyof typeof site.social;

export const socialLinks = [
  {
    key: "whatsapp" as const,
    label: "WhatsApp",
    href: site.social.whatsappInvite,
    fallbackHref: "/contact",
    note: "The main gathering room: session links, notices and teaching alerts.",
  },
  {
    key: "telegram" as const,
    label: "Telegram",
    href: site.social.telegramInvite,
    fallbackHref: "/contact",
    note: "A second room for members who prefer Telegram.",
  },
  {
    key: "facebookGroup" as const,
    label: "Facebook group",
    href: site.social.facebookGroup,
    fallbackHref: site.social.facebookGroup,
    note: "Discussion between gatherings.",
  },
  {
    key: "facebookPage" as const,
    label: "Facebook page",
    href: site.social.facebookPage,
    fallbackHref: site.social.facebookPage,
    note: "Announcements and teaching clips.",
  },
  {
    key: "youtube" as const,
    label: "YouTube",
    href: site.social.youtube,
    fallbackHref: site.social.youtube,
    note: "Recorded teachings and anniversary services.",
  },
];
