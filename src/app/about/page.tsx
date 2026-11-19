import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FacebookIcon, YouTubeIcon } from "@/components/BrandIcons";
import { Seal } from "@/components/Seal";
import { Reveal } from "@/components/Reveal";
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

const mission = [
  "To demystify the voice of God.",
  "To teach and bring believers into Christ-consciousness.",
];

const timeline = [
  {
    date: "18 September 2021",
    title: "The fellowship begins",
    body: "A small gathering of believers from different churches, meeting online to be taught properly.",
  },
  {
    date: "2021–2025",
    title: "The week takes shape",
    body: "Teaching, Bible study, prayer and Sunday exhortation settle into a weekly rhythm in WAT.",
  },
  {
    date: "2025",
    title: "The Bible institute",
    body: "A formal track for those called into ministry, taught by the Prophet and reviewed by his team.",
  },
  {
    date: "19 September 2026",
    title: "Five years",
    body: "The fellowship marks its fifth anniversary, still interdenominational, still online, still gathering.",
  },
];

export default function AboutPage() {
  return (
    <>
      <header className="border-b border-ink/15">
        <div className="wrap grid gap-12 py-14 md:grid-cols-12 md:py-20">
          <div className="md:col-span-8">
            <p className="label text-ember">About</p>
            <h1 className="mt-5 font-display text-hero">
              A prophetic community of saints, called by God.
            </h1>
            <p className="measure mt-6 font-display text-lead leading-snug text-quiet">
              Bound by love, united by one Spirit, led by Prophet Lawrence Iwara.
              Founded on {site.founded} as an interdenominational mandate for the
              whole body of Christ.
            </p>
          </div>
          <div className="md:col-span-4 md:pl-8">
            <Seal size={170} idKey="about" className="md:ml-auto" />
          </div>
        </div>
      </header>

      {/* The story, set as a long read with margin notes. */}
      <section className="wrap grid gap-12 py-16 md:grid-cols-12 md:gap-8 md:py-24">
        <div className="md:col-span-3">
          <p className="label sticky top-28 text-quiet">The story</p>
        </div>

        <div className="md:col-span-6">
          <div className="space-y-6 text-[1.0625rem] leading-[1.72]">
            <p className="opening">
              We began as a small gathering of believers from different churches who
              wanted the same thing: to hear God clearly and to be taught properly.
              What started online in September 2021 has grown into a fellowship that
              gathers almost every night of the week, with members across Nigeria,
              Zambia and beyond.
            </p>
            <p>
              We are not a denomination, and we do not ask anyone to leave their
              local church. The fellowship exists alongside the local church: a
              place for teaching, for training, and for prayer that carries the
              weight of a whole body rather than a single congregation.
            </p>
            <p>
              The eagle carries our crest, with Daniel 4:17 beneath it: the Most High
              rules in the kingdom of men. It is a reminder that what happens here is
              not our own project. We watch, we listen, and we say what we are given
              to say.
            </p>
          </div>

          <blockquote className="mt-10 border-y border-ink/15 py-8">
            <p className="pullquote max-w-[24ch] font-display text-3xl leading-[1.15]">
              “One of the reasons God sent prophets was simply because He loves His
              people.”
            </p>
            <footer className="mt-5 text-xs uppercase tracking-[0.13em] text-quiet">
              {site.leader} · 5th Anniversary teaching, 19 September 2026
            </footer>
          </blockquote>
        </div>

        <aside className="md:col-span-3 md:pl-6">
          <div className="border-t border-ink/25 pt-4">
            <p className="label text-quiet">At a glance</p>
            <dl className="mt-4 space-y-4 text-sm">
              {[
                ["Founded", site.founded],
                ["Overseer", site.leader],
                ["Scope", "Interdenominational"],
                ["Rhythm", "Weekly, online"],
                ["Watchword", "Daniel 4:17"],
              ].map(([term, value]) => (
                <div key={term}>
                  <dt className="text-xs uppercase tracking-[0.12em] text-quiet">{term}</dt>
                  <dd className="mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-quiet">
            The fellowship meets online only. There is no building to visit and no
            membership fee.
          </p>
        </aside>
      </section>

      {/* Vision and mission */}
      <section className="border-y border-ink/15 bg-paper">
        <div className="wrap grid gap-12 py-16 md:grid-cols-12 md:gap-8 md:py-24">
          <div className="md:col-span-7">
            <p className="label text-ember">Our vision</p>
            <ol className="mt-6">
              {vision.map((item, i) => (
                <li key={item} className="flex gap-6 border-t border-ink/20 py-6">
                  <span className="font-display text-xl tabular-nums text-ember">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="max-w-[46ch] font-display text-xl leading-snug md:text-2xl">
                    {item}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="md:col-span-4 md:col-start-9">
            <p className="label text-ember">Our mission</p>
            <ol className="mt-6">
              {mission.map((item, i) => (
                <li key={item} className="flex gap-5 border-t border-ink/20 py-6">
                  <span className="font-display text-xl tabular-nums text-ember">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-display text-xl leading-snug">{item}</p>
                </li>
              ))}
            </ol>
            <p className="mt-2 text-sm leading-relaxed text-quiet">
              Word, worship and prayer are how both are carried out. Every session
              in the week belongs to one of the three.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline: only confirmed dates. */}
      <section className="wrap py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="label text-quiet">The years</p>
          </div>
          <div className="md:col-span-9">
            <ol>
              {timeline.map((entry) => (
                <li
                  key={entry.date}
                  className="grid gap-2 border-t border-ink/20 py-6 sm:grid-cols-[10rem_1fr] sm:gap-8"
                >
                  <p className="text-xs uppercase tracking-[0.12em] text-ember">
                    {entry.date}
                  </p>
                  <div>
                    <h3 className="font-display text-2xl">{entry.title}</h3>
                    <p className="mt-1.5 max-w-[54ch] text-sm leading-relaxed text-quiet">
                      {entry.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-quiet">
              Dates and milestones are drawn from the ministry&apos;s own account.
              Anything not yet confirmed is held back rather than guessed.
            </p>
          </div>
        </div>
      </section>

      {/* Why the prophetic */}
      <section className="bg-ink text-parchment">
        <div className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-24">
          <div className="md:col-span-4">
            <p className="label text-gold-soft/85">Why the prophetic</p>
            <Reveal>
              <h2 className="mt-5 font-display text-hero">
                Man lived in harmony with God until the fall.
              </h2>
            </Reveal>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <div className="grid gap-6 text-parchment/65 sm:grid-cols-2">
              <p>
                In love, God sent prophets to teach us His ways and lead us in His
                paths until Christ, the perfect One, came to bring us back. We exist
                to serve that purpose in our generation.
              </p>
              <p>
                That is why the teaching here is not built on novelty. It is built on
                the Scriptures, on the person of Christ, and on the plain work of the
                Holy Spirit among ordinary believers.
              </p>
            </div>
            <p className="mt-8 max-w-[52ch] border-t border-parchment/15 pt-6 font-display text-2xl leading-snug">
              The prophetic is not a spectacle. It is God speaking plainly to people
              He loves.
            </p>
          </div>
        </div>
      </section>

      {/* The Prophet */}
      <section id="prophet" className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <figure className="md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden bg-ink">
            <Image
              src="/images/prophet-portrait.webp"
              alt="Prophet Lawrence Iwara, founder and overseer of The School of Prophets"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-top"
            />
          </div>
          <figcaption className="figure-caption mt-3">
            Prophet Lawrence Iwara · founder and overseer
          </figcaption>
        </figure>

        <div className="md:col-span-6 md:col-start-7">
          <p className="label text-ember">Meet the Prophet</p>
          <h2 className="mt-4 font-display text-hero">Prophet Lawrence Iwara</h2>
          <div className="mt-6 space-y-5 text-quiet">
            <p>
              Prophet Lawrence Iwara is the founder and overseer of The School of
              Prophets. He teaches weekly, trains those called into ministry at the
              Bible institute, and shepherds the fellowship in prayer.
            </p>
            <div className="border-l-2 border-gold pl-4 space-y-3 text-sm leading-relaxed text-ink/80 italic">
              <p>
                “I was born on 5 February 2002. I gave my life to Christ in September 2018 and began serving and seeking to know God more deeply. That same year, I discovered my calling.
              </p>
              <p>
                I started the work of ministry in 2019 under the Assemblies of God Church, Ketabebe, Ugep. In 2020, I pastored a church in Port Harcourt. Since 2024, I have served as a youth pastor at Kingdomlife Threshold Assembly.”
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-ink/15 py-4 text-sm">
            <Link href="/book" className="link-quiet font-semibold text-ink">
              Book a call
            </Link>
            <Link href="/training" className="link-quiet text-quiet">
              Ask about training
            </Link>
            <a
              href={site.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-quiet hover:text-ink"
            >
              <YouTubeIcon aria-hidden="true" className="h-3.5 w-3.5" />
              YouTube
            </a>
            <a
              href={site.social.facebookPage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-quiet hover:text-ink"
            >
              <FacebookIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Facebook
            </a>
          </div>

          <Link
            href="/gatherings"
            className="link-quiet mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink"
          >
            See when he teaches next
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
