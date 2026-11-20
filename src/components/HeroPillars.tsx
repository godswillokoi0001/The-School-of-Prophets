import { BookOpen, Calendar, Users } from "lucide-react";

const pillars = [
  {
    icon: Users,
    title: "Global Community",
    subtitle: "Nigeria, Zambia & Beyond",
  },
  {
    icon: Calendar,
    title: "Weekly Gatherings",
    subtitle: "Online Every Week",
  },
  {
    icon: BookOpen,
    title: "Prophetic Teachings",
    subtitle: "Build Your Faith",
  },
  {
    icon: Users,
    title: "A Growing Movement",
    subtitle: "For His Purpose",
  },
];

export function HeroPillars() {
  return (
    <div className="wrap relative pb-10 sm:pb-14">
      <div className="rounded-xl border border-parchment/15 bg-ink-2/95 px-6 py-4 shadow-2xl backdrop-blur-md sm:px-8 sm:py-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="flex items-center gap-3.5 sm:gap-4">
                <Icon
                  className="h-6 w-6 sm:h-7 sm:w-7 shrink-0 text-gold"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-sm font-semibold text-parchment sm:text-base tracking-tight leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-parchment/65 sm:text-[0.8125rem]">
                    {pillar.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
