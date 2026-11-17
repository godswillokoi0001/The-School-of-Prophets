import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Flame,
  Globe,
  GraduationCap,
  HandHeart,
  Quote,
  Users,
} from "lucide-react";
import { FacebookIcon, YouTubeIcon } from "@/components/BrandIcons";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { Crest } from "@/components/Crest";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story, vision and mission of The School of Prophets: an interdenominational prophetic fellowship founded on 18 September 2021 and led by Prophet Lawrence Iwara.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About The School of Prophets",
    description:
      "An interdenominational prophetic fellowship founded in 2021, building a prophetic people through the Word and the Spirit.",
    url: "/about",
  },
};

const vision = [
  "To build a prophetic people through the teaching of the Word and the demonstration of the Spirit's power.",
  "To train those called into the prophetic office, and every believer in Christ, to grow into the fullness of their calling and spiritual manifestations.",
  "To build a Christian community of intercessors.",
];

const mission = ["To demystify the voice of God.", "To teach and bring believers into Christ-consciousness."];

const systems = [
  {
    title: "Word",
    icon: BookOpen,
    body: "The Scriptures opened, book by book and line by line, until they are understood rather than merely quoted.",
  },
  {
    title: "Worship",
    icon: Flame,
    body: "We bless His name before we ask Him for anything. Worship is the posture of the house.",
  },
  {
    title: "Prayer",
    icon: HandHeart,
    body: "Intercession is not an event here. It is the daily work of a community that carries one another.",
  },
];

const gallery = [
  {
    src: "/images/desert-dawn.webp",
    alt: "A man walking a desert road in the early light",
    caption: "The way",
  },
  {
    src: "/images/shofar-sunset.webp",
    alt: "A shofar raised within a prayer shawl at sunset",
    caption: "The sound",
  },
  {
    src: "/images/prayer-cave.webp",
    alt: "A man on his knees in prayer by candlelight",
    caption: "The watch",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        label="About"
        title="About the School of Prophets"
        lead="A prophetic community of saints called by God, bound by love, united by one Spirit, and led by God's servant, Prophet Lawrence Iwara. Founded on 18 September 2021 as an interdenominational mandate for the whole body of Christ."
        image="/images/eagle-head.webp"
        imageAlt="An eagle's head in profile, the fellowship's emblem of sight"
      />

      {/* STORY */}
      <section className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-7">
          <p className="label flex items-center gap-2 text-ember">
            <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
            The story
          </p>
          <div className="mt-6 space-y-5 text-[0.975rem] leading-relaxed text-ink/80">
            <p>
              We began as a small gathering of believers from different churches
              who wanted the same thing: to hear God clearly and to be taught
              properly. What started online in September 2021 has grown into a
              fellowship that gathers almost every night of the week, with members
              across Nigeria, Zambia and beyond.
            </p>
            <p>
              We are not a denomination, and we do not ask anyone to leave their
              local church. The fellowship exists alongside the local church: a
              place for teaching, for training, and for prayer that carries the
              weight of a whole body rather than a single congregation.
            </p>
            <p>
              The eagle carries our crest, with Daniel 4:17 beneath it: the Most
              High rules in the kingdom of men. It is a reminder that what we do
              here is not our own project. We watch, we listen, and we say what we
              are given to say.
            </p>
          </div>

          <dl className="mt-10 grid gap-x-8 gap-y-5 border-t border-ink/15 pt-6 sm:grid-cols-2">
            {[
              { term: "Founded", value: site.founded, icon: CalendarDays },
              { term: "Overseer", value: site.leader, icon: Users },
              { term: "Scope", value: "Interdenominational", icon: Globe },
              { term: "Rhythm", value: "Gathering weekly, online", icon: BookOpen },
            ].map((fact) => (
              <div key={fact.term} className="flex gap-3">
                <fact.icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                <div>
                  <dt className="label text-quiet">{fact.term}</dt>
                  <dd className="mt-1 text-sm">{fact.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div className="md:col-span-5 md:pl-6">
          <div className="border border-ink/15 bg-parchment-2/60 p-6">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[16rem]">
              <Image
                src="/images/tsop-crest.webp"
                alt="The School of Prophets crest"
                fill
                sizes="(max-width: 768px) 60vw, 256px"
                className="object-contain"
              />
            </div>
            <p className="label mt-5 border-t border-ink/15 pt-4 text-center text-quiet">
              Watchers · Daniel 4:17
            </p>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-quiet">
            Our crest, the eagle over the shield. Sight, and rising above the
            storm.
          </p>
        </div>
      </section>

      {/* GALLERY */}
      <section aria-label="Images from the ministry" className="border-y border-ink/15 bg-parchment-2/60">
        <div className="wrap grid gap-4 py-8 sm:grid-cols-3">
          {gallery.map((item) => (
            <figure key={item.caption} className="group relative overflow-hidden">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 32vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              </div>
              <figcaption className="absolute bottom-3 left-4 font-display text-lg text-parchment">
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* VISION + MISSION */}
      <section className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-6">
          <p className="label flex items-center gap-2 text-ember">
            <Flame aria-hidden="true" className="h-3.5 w-3.5" />
            Our vision
          </p>
          <ol className="mt-6 space-y-6">
            {vision.map((item, i) => (
              <li key={item} className="flex gap-5 border-t border-ink/15 pt-5">
                <span className="font-display text-lg text-ember">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="max-w-[42ch] font-display text-xl leading-snug">{item}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="md:col-span-6 md:pl-8">
          <p className="label flex items-center gap-2 text-ember">
            <HandHeart aria-hidden="true" className="h-3.5 w-3.5" />
            Our mission
          </p>
          <ol className="mt-6 space-y-6">
            {mission.map((item, i) => (
              <li key={item} className="flex gap-5 border-t border-ink/15 pt-5">
                <span className="font-display text-lg text-ember">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="max-w-[34ch] font-display text-xl leading-snug">{item}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 border-t border-ink/15 pt-6">
            <p className="label text-quiet">Our systems</p>
            <p className="mt-3 text-sm text-quiet">
              Word. Worship. Prayer. Everything we do is built on these three.
            </p>
          </div>
        </div>
      </section>

      {/* SYSTEMS */}
      <section className="border-y border-ink/15 bg-parchment-2/70">
        <div className="wrap grid gap-10 py-14 md:grid-cols-3">
          {systems.map((system) => (
            <div key={system.title} className="border-t border-ink/20 pt-5">
              <system.icon aria-hidden="true" className="h-6 w-6 text-ember" strokeWidth={1.4} />
              <h2 className="mt-4 font-display text-2xl">{system.title}</h2>
              <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-quiet">
                {system.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY THE PROPHETIC */}
      <section id="why" className="relative overflow-hidden bg-ink text-parchment">
        <div className="wrap grid items-center gap-10 py-16 md:grid-cols-12 md:py-24">
          <div className="relative aspect-[3/4] overflow-hidden md:col-span-5">
            <Image
              src="/images/crucifixion.webp"
              alt="A painting of the crucifixion, the centre of the prophetic purpose"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover opacity-90"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
          </div>

          <div className="md:col-span-7 md:pl-6">
            <p className="label flex items-center gap-2 text-gold">
              <Quote aria-hidden="true" className="h-3.5 w-3.5" />
              Why the prophetic?
            </p>
            <Reveal>
              <h2 className="mt-4 max-w-[26ch] font-display text-hero">
                Man lived in harmony with God until the fall.
              </h2>
            </Reveal>
            <div className="mt-6 grid gap-6 text-parchment/65 md:grid-cols-2">
              <p>
                In love, God sent prophets to teach us His ways and lead us in His
                paths until Christ, the perfect One, came to bring us back. We
                exist to serve that purpose in our generation.
              </p>
              <p>
                That is why the teaching here is not built on novelty. It is built
                on the Scriptures, on the person of Christ, and on the plain work
                of the Holy Spirit among ordinary believers.
              </p>
            </div>
            <blockquote className="mt-9 border-l border-gold/50 pl-5">
              <p className="max-w-[30ch] font-display text-2xl leading-snug">
                &ldquo;One of the reasons God sent prophets was simply because He
                loves His people.&rdquo;
              </p>
              <footer className="label mt-4 text-parchment/45">
                {site.leader} · 5th Anniversary teaching
              </footer>
            </blockquote>
            <p className="mt-4 text-xs text-parchment/35">
              Quoted from the 5th Anniversary teaching, 19 September 2026. Pending
              final approval before publication.
            </p>
          </div>
        </div>
      </section>

      {/* THE PROPHET */}
      <section id="prophet" className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden bg-ink">
            <Image
              src="/images/prophet-portrait.webp"
              alt="Prophet Lawrence Iwara, founder and overseer of The School of Prophets"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-top"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/85 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
              <p className="label text-parchment/70">Founder & overseer</p>
              <Crest className="h-12 w-auto opacity-90" decorative />
            </div>
          </div>
        </div>

        <div className="md:col-span-7 md:pl-4">
          <p className="label flex items-center gap-2 text-ember">
            <Users aria-hidden="true" className="h-3.5 w-3.5" />
            Meet the Prophet
          </p>
          <h2 className="mt-4 font-display text-hero">Prophet Lawrence Iwara</h2>
          <div className="mt-6 space-y-5 text-[0.975rem] leading-relaxed text-ink/80">
            <p>
              Prophet Lawrence Iwara is the founder and overseer of the School of
              Prophets. He teaches weekly, trains those called into ministry, and
              shepherds the fellowship in prayer.
            </p>
            <p className="border-l-2 border-gold/60 pl-4 text-sm text-quiet">
              [To be confirmed] A short paragraph on his calling, his church and
              his years in ministry, supplied by the Prophet himself.
            </p>
          </div>

          <ul className="mt-8 grid gap-4 border-y border-ink/15 py-5 sm:grid-cols-3">
            {[
              { icon: BookOpen, label: "Teaches weekly" },
              { icon: GraduationCap, label: "Trains the called" },
              { icon: HandHeart, label: "Shepherds in prayer" },
            ].map((fact) => (
              <li key={fact.label} className="flex items-center gap-2.5 text-sm text-ink/75">
                <fact.icon aria-hidden="true" className="h-4 w-4 text-ember" />
                {fact.label}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={site.social.facebookPage}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <FacebookIcon aria-hidden="true" className="h-4 w-4" />
              Facebook
            </a>
            <a
              href={site.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <YouTubeIcon aria-hidden="true" className="h-4 w-4" />
              YouTube
            </a>
            <Link href="/training" className="btn btn-gold">
              <GraduationCap aria-hidden="true" className="h-4 w-4" />
              Ask about training
            </Link>
          </div>

          <Link
            href="/gatherings"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
          >
            See when he teaches next
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
