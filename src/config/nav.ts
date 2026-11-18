import {
  BookOpen,
  CalendarDays,
  CalendarHeart,
  CalendarPlus,
  ClipboardCheck,
  Crown,
  Flame,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Layers,
  Library,
  Mail,
  MessageCircle,
  Mountain,
  PenLine,
  Quote,
  ScrollText,
  Sparkles,
  User,
  Users,
  Wind,
} from "lucide-react";
import type { ComponentType } from "react";
import { YouTubeIcon } from "@/components/BrandIcons";

export type NavIcon = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export type NavItem = {
  label: string;
  href: string;
  description: string;
  icon: NavIcon;
  external?: boolean;
};

export type NavGroup = {
  label: string;
  href: string;
  items: NavItem[];
};

/** Header menus. Everything here is real navigation, not decoration. */
export const navGroups: NavGroup[] = [
  {
    label: "About",
    href: "/about",
    items: [
      {
        label: "Our story",
        href: "/about",
        description: "How the fellowship began in September 2021.",
        icon: BookOpen,
      },
      {
        label: "The Prophet",
        href: "/about#prophet",
        description: "Prophet Lawrence Iwara, founder and overseer.",
        icon: User,
      },
      {
        label: "Book a call",
        href: "/book",
        description: "One-on-one pastoral & prophetic counsel with Prophet Lawrence.",
        icon: CalendarPlus,
      },
      {
        label: "Why the prophetic",
        href: "/about#why",
        description: "Why God sent prophets, and what that means now.",
        icon: Flame,
      },
      {
        label: "Our covenant",
        href: "/gatherings#covenant",
        description: "The four commitments that keep the house in order.",
        icon: ScrollText,
      },
    ],
  },
  {
    label: "Gatherings",
    href: "/gatherings",
    items: [
      {
        label: "Weekly timetable",
        href: "/gatherings#timetable",
        description: "Every session, in WAT and in your own time.",
        icon: CalendarDays,
      },
      {
        label: "What to expect",
        href: "/gatherings#expect",
        description: "Worship, the Word, then prayer. About an hour.",
        icon: Users,
      },
      {
        label: "Prayer nights",
        href: "/prayer",
        description: "Stand with the intercessors through the week.",
        icon: HandHeart,
      },
      {
        label: "Add to calendar",
        href: "/schedule.ics",
        description: "Download the whole week as an .ics file.",
        icon: CalendarPlus,
      },
    ],
  },
  {
    label: "Teachings",
    href: "/teachings",
    items: [
      {
        label: "Teaching library",
        href: "/teachings",
        description: "Filter by series, format or passage.",
        icon: Library,
      },
      {
        label: "Word of Knowledge",
        href: "/teachings/series/word-of-knowledge",
        description: "How the gift arrives, and how it is tested.",
        icon: Sparkles,
      },
      {
        label: "Faith Series",
        href: "/teachings/series/faith-series",
        description: "Faith as substance, not sentiment.",
        icon: Mountain,
      },
      {
        label: "Mystery of the Kingdom",
        href: "/teachings/series/mystery-of-the-kingdom",
        description: "The kingdom hidden in parables.",
        icon: Crown,
      },
      {
        label: "Gifts of the Spirit",
        href: "/teachings/series/gifts-of-the-spirit",
        description: "The nine gifts and the character that carries them.",
        icon: Wind,
      },
      {
        label: "All series",
        href: "/teachings#series",
        description: "Every series in the library, in one place.",
        icon: Layers,
      },
      {
        label: "YouTube channel",
        href: "https://youtube.com/@prophetlawrencefiwara",
        description: "Recorded teachings and anniversary services.",
        icon: YouTubeIcon,
        external: true,
      },
    ],
  },
  {
    label: "Training",
    href: "/training",
    items: [
      {
        label: "The Bible institute",
        href: "/training",
        description: "Intensive training for those called into ministry.",
        icon: GraduationCap,
      },
      {
        label: "Enrolment status",
        href: "/training#apply",
        description: "Cohorts open for limited periods.",
        icon: ClipboardCheck,
      },
      {
        label: "Apply or waitlist",
        href: "/training#apply",
        description: "A short application, reviewed personally.",
        icon: PenLine,
      },
      {
        label: "Ask a question",
        href: "/contact",
        description: "Reach the team before you apply.",
        icon: MessageCircle,
      },
    ],
  },
  {
    label: "Community",
    href: "/contact",
    items: [
      {
        label: "Events",
        href: "/events",
        description: "Anniversaries, conferences and watch nights.",
        icon: CalendarHeart,
      },
      {
        label: "Testimonies",
        href: "/testimonies",
        description: "What God is doing, shared with permission.",
        icon: Quote,
      },
      {
        label: "Prayer request",
        href: "/prayer",
        description: "Private, and seen only by the prayer team.",
        icon: HandHeart,
      },
      {
        label: "Newsletter",
        href: "/newsletter",
        description: "Weekly apostolic epistles and prophetic letters.",
        icon: ScrollText,
      },
      {
        label: "Donate",
        href: "/give",
        description: "Sow into teaching, training and outreach.",
        icon: HeartHandshake,
      },
      {
        label: "Contact & join",
        href: "/contact",
        description: "Community links and a direct line to the team.",
        icon: Mail,
      },
    ],
  },
];
