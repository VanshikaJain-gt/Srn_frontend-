import Image from "next/image";

/* ---------- Data (static — swap for API calls later) ---------- */

const RING_CIRCUMFERENCE = 213.6; // 2 * PI * r(34)

type ActiveChallenge = {
  id: string;
  icon: string;
  iconColorClass: string;
  badge: string;
  title: string;
  description: string;
  percent: number;
  ringColorClass: string;
} & (
  | {
      variant: "avatars";
      progressLabel: string;
      timeLabel: string;
      avatars: string[];
      moreCount: string;
    }
  | {
      variant: "button";
      progressLabel: string;
      timeLabel: string;
      buttonLabel: string;
    }
);

const ACTIVE_CHALLENGES: ActiveChallenge[] = [
  {
    id: "morning-mile-100",
    icon: "speed",
    iconColorClass: "text-primary",
    badge: "Elite Series",
    title: "Morning Mile 100",
    description: "Complete 100 miles before the end of the month.",
    percent: 70,
    ringColorClass: "text-primary",
    variant: "avatars",
    progressLabel: "70.4 / 100 Mi",
    timeLabel: "12 Days Left",
    avatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCWrsWhJXj9GxTXk0BQz5DwYonfas5erdtg1bMYqPKboznKY47BeAOQDj95XIwpftS2PFVApZF2ilBATLw3rDajNr6ao_ebYMsrbVGNiz-ZL3t6-GQD6Q8uvb-WPDy0uQy6GkD3mq0_EEyY2u8t1bfms9PrSwtVO_BaNv_AB3IFu8wVK7xCN7ZQMo7Y53Fny4XL0yROvfAff8phBlywDbxOp7Aiue4ZDA6TM2Bc-EgkRB54b6pTwVumlmqFrRqK5MFDF1kYoNc5mwuA",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB-LU-fPUxPXP0qHGLEW_cC1IvHhmpM5J4SaNAl2kpHBz6htLLxFKW371ZvJGhasWgLTEMXAqdPI-3Z8CTXyjs6dag7Z6KL-6LGuorlXZkU3g_c4yAphEwuXe1tyMbKoglVJOnBF1tn8yTr_aWr8HRHpW8oLJ0Eqdwo6ZCo1Y7xIQco-B_eoW4-unk3bnb0qc5Yd0BPXaPt59KVM9BSDhDtbQdjKH5vZi1AqbZqoSHFEPBvNxVgXUdNsdvUEIsJsbDYNPVwrtlzHUUO",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBCIZfpQOjucB0uOqARdiJxIjvM3KGU3oRKGK0O4KPzuCmVyCXCznRzf7Clx9HoW7XVL3GFFP5T6Nrnz1LFa0mvct1g6Xw6PwxbnuCoWiVBAHkaK4f2qA2lMQxGa3SBECiPVz8E5YoE-Suk6Pw4a8KxhWlLdQQ9E9JPJHmZlZcwl4Bs5fxdlHwZC_4a-6Cc00XF5DQs694N4ff5Bpa-xeRIRUxymGik9OTvRyq0fWe1YsDCHXrBPNnm-15mSWwu3bsjokMQelRC1kix",
    ],
    moreCount: "+12k",
  },
  {
    id: "vertical-5k",
    icon: "altitude",
    iconColorClass: "text-tertiary",
    badge: "Climb Higher",
    title: "Vertical 5k",
    description: "Climb a total of 5,000 ft in elevation this week.",
    percent: 30,
    ringColorClass: "text-tertiary",
    variant: "button",
    progressLabel: "1,500 / 5k Ft",
    timeLabel: "2 Days Left",
    buttonLabel: "Record Activity",
  },
];

type UpcomingChallenge = {
  id: string;
  image: string;
  alt: string;
  title: string;
  date: string;
  metaIcon: string;
  metaLabel: string;
  reminderChecked?: boolean;
};

const UPCOMING_CHALLENGES: UpcomingChallenge[] = [
  {
    id: "autumn-solstice-relay",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBgASkw-Q1rN7bSUne9BpAXlZ03LeMVG03ho4HHyuzzP5soz6RoLbvV4S3SPr9HT-BaySFyhJqeOmDOVGhFRxqTF13Wn7sAk8gjtasMs_k8iWB8R_hLUJSrFe5v1QfyalTnsKZHHmczzkaQFvV7O95XRLAwZk3FZEMcDSmMLbvjVrfNe7FFnd0KW5EGHS318T4fLb_zy_Tr88y-UUREPLt7xZtyRRPm0ZUuaMAqkQNkQyKRkeCj2RIzehW-FzfAvJMxCf4rEsZoIJ8M",
    alt: "Energetic running shoe with neon orange light trails",
    title: "Autumn Solstice Relay",
    date: "Oct 12, 2026",
    metaIcon: "group",
    metaLabel: "Team Event",
  },
  {
    id: "personal-record-week",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDv5UUj4N284JzMlojYiykoCkca6HoCI123mYrYl0aCni47rhBG_WsW9IapzfYpoNaj2vMtxHLGpt8QL4Whw38qFoPQOeLRmTXFboW2IAAal3SmyyLmGWfT_rwaS871YquRZi6KNUaGEqxGVHCS3WGhMZ9IbbRWszmh6u1yty-Ru6zaWQMY-c3SENMXYn-bft-cln48-la3f559DA_Gbr-sobMSUObr8DvmjlF6fu2qllB9fNxQZFEFPV7gmluPrG8zJMVA5wdmZv3J",
    alt: "Close up of a professional stopwatch on a running track at sunrise",
    title: "Personal Record Week",
    date: "Nov 01, 2026",
    metaIcon: "military_tech",
    metaLabel: "Achievement Focus",
    reminderChecked: true,
  },
  {
    id: "trail-blazer-challenge",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCokb_WIAP04_0jZ06jdQjV-jpIPQgROCyooHqabIKw79B5WkUvpPmGaM3JggNZYEPGqqt_Xufm5yNpzeqZnW2GXwIIVUaOWzXKDPeNShAbUaQS1IpiK3mGZJ70YUseJXkZa74b_1wX4l0--8ZB2MwezLPM4J5C_vAVi-HsTZO9dh-orv3XfFoHBbCydh1Y8ALGF9MGHi6I915AGAma6GlmbPxnTLgFai2ZwHvS39PkU2rLY1pDkAzNSkZfl2KqbYKy6BDenxVniR24",
    alt: "Winding forest trail bathed in warm golden morning light",
    title: "Trail Blazer Challenge",
    date: "Nov 15, 2026",
    metaIcon: "terrain",
    metaLabel: "Trail Running",
  },
];

type LeaderboardEntry = {
  rank: number;
  name: string;
  avatar: string;
  weeklyMiles: string;
  trend: "up" | "down" | "flat";
  highlight?: boolean;
};

const LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    name: "Alex River",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCkhwte-wh62LBogbz7fmRYdu3S2GD44FUiP0mLwODQU6mbCyXxiuTe3tMgCFgrrhvJHlJu9XHRFmAFV_0RCO-_ZwoJfx-Ti-hXdav-Hn2t7GHhQ28-v9hjX0bDzZgQwUHTf2OWljyin72tDUkDCMshowCwlUmibiJRlEcu9Iw5lAdZpOC7bnYnRiuE1HOa67YcezbR_s16P6FhZ9LAx8B9FOLavlkctuHRi6nAL8tqdO06JlcNUyMDRdWTXlHzaVAgWogGKcGo2-s3",
    weeklyMiles: "92.4 Mi this week",
    trend: "up",
    highlight: true,
  },
  {
    rank: 2,
    name: "Sarah Chen",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-VoaM6uyOHWeqHR76Dw97t9XRUXHjO8pj8Apz0uIqbLV-1E6ZkcHRsT5vTaQo0Nm69wzswRkRqKcIGnCwfHgRHXJbjI0-cTRxD-TEvmER1_zjbHWk3CitbPfi2kzEkfWJfw0oyFMJ9Okp9N-1p2Nk1aa2eSXXzN5mWCZaE1_XkbL4zFh6gkrVfVpOPFAQgeFuASCBqNTGiG8XRx0om1n6Y5_sJu-0w-LqU7bTuLGWi3zNN7BQlb0bBIrMkN47wJu2UVlwjxLnqEPk",
    weeklyMiles: "88.1 Mi this week",
    trend: "flat",
  },
  {
    rank: 3,
    name: "Marcus Thorne",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC3Q1N8IRvCoUEwjQUu1aLdni8cEZo7EpperMxKC5tMdvFEe2hY6o3zYr6r7_YD2mf2HCeTWeWDIzl5Ad200Yw1aMg49k8yxkbebrwVII61eHddi483jh6yFFxPulMDuq-lbfNDIFTKA5B0bPvCkOHRunNUa1Qd-WJ11_uAw_n-mIowfTriklj7m8ZpREEhuxE9qthm6Kwch3kDFWPY7kPOeyj_U6gI081mU5HBRzIKtroTYOydW-64JFFhPaXQX2v710ZjaLl1s9h6",
    weeklyMiles: "85.5 Mi this week",
    trend: "up",
  },
  {
    rank: 4,
    name: "Elena Rodriguez",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAMTRTquLy7m58te8jOycYyiK2UfVY1fi7CpeFyzqzrh2WWMaJ95v68IXclnsrVqZGvvqZkwJ6_Lw0xPUrPMD81D48bge2jwjHK2Ez95MLu7JIGkVieXbD465ABAgebaMt99PLmt5MBAbPgJOCXUZUIDwC8n3oyvcSAENnHmjfidzTnipdS9heHbo0SfoV4lKHT-Ods53JYlzQkiY4hkpqF5xZVExe2OtvgNCQ7rKuEoXw3Mgi5ZOIbhpCc06joBZOGHz4lQv8VYnj6",
    weeklyMiles: "82.0 Mi this week",
    trend: "down",
  },
  {
    rank: 5,
    name: "James Wilson",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAFXQfZjicNDH6YrrVKhWsWt7ZLxmmNG4vbgK9LPp7DjEeUbjTYL4gTcz7z5jZyYhVSO43jbLTlrRfr8U9tbNC6jRiyrcX5bI2xpz0x4qbipXoWQSRC51jSfX3l7Ei61ENiDz0KkBTPleQJBUrc0alIH2oWdCfbZvsVnS9UyJzQJRT2BxZw7iMqkQ1j5wnA9Ku4NarxHlHcSi-zevDaAaTj1tpFwLxAVM6ib_8ElH2BYiyI5GCvjWcmdRsLlfUxrC709CA8ay605o2",
    weeklyMiles: "79.2 Mi this week",
    trend: "flat",
  },
];

function trendIcon(trend: LeaderboardEntry["trend"]) {
  if (trend === "up") return { icon: "trending_up", className: "text-green-600" };
  if (trend === "down") return { icon: "trending_down", className: "text-red-500" };
  return { icon: "horizontal_rule", className: "text-on-surface-variant" };
}

/* ---------- Page ---------- */

export default function ChallengesPage() {
  return (
    <main className="mx-auto max-w-[1280px] px-lg py-xl">
      {/* Hero */}
      <section className="relative mb-xl flex h-[400px] items-center overflow-hidden rounded-2xl shadow-sm">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSzOip7IBJYPw8DVP2DGjKKOFs6JO7aAXkmT04Dw5DpAN_QI4V_upFaeCdv4bCXwigEqIZiuMenMGJXKCmVj_IZU4Afr4VfFrsT4jbK_YLqs-bmHzeqoInYI-zVOiJxAVTON__9HRlBDTdu9JzUt1QfEhijUuUA0VBF9zIghEpph30Y0UP7WDMWVV3g0hK5oSg99lqnmZzyDPms6xSKSfnrZMIlmFcZl7RTtqNfORM51WZHMOkjBxZY6ZmuURBLpGfWDRnh2UVrrxw"
            alt="Runner's silhouette at the peak of a mountain at dawn"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-on-surface/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl px-xl">
          <h1 className="font-display-xl text-display-xl mb-md text-white">
            Ignite Your Performance.
          </h1>
          <p className="mb-lg font-body-lg text-body-lg text-white/90">
            Join the Sunrise Runners Network challenges. Push your limits
            with a global community of elite athletes and casual runners
            alike.
          </p>
          <div className="flex gap-md">
            <button className="sunrise-gradient inner-glow rounded-2xl px-xl py-md font-label-bold text-white transition-all hover:scale-[1.02]">
              Explore Challenges
            </button>
            <button className="rounded-2xl border-2 border-white px-xl py-md font-label-bold text-white transition-all hover:bg-white/10">
              Watch Trailer
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="flex flex-col gap-xl lg:flex-row lg:items-start lg:gap-xl">
        {/* Left: Challenges */}
        <div className="flex flex-col gap-xl lg:w-2/3">
          {/* Active Community Goals */}
          <div>
            <div className="mb-lg flex items-center justify-between">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                Active Community Goals
              </h2>
              <span className="cursor-pointer font-label-bold text-primary hover:underline">
                View All
              </span>
            </div>

            <div className="grid grid-cols-1 gap-md md:grid-cols-2">
              {ACTIVE_CHALLENGES.map((challenge) => {
                const dashoffset =
                  RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * challenge.percent) / 100;
                return (
                  <div
                    key={challenge.id}
                    className="relative flex h-[280px] flex-col justify-between overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm"
                  >
                    <div className="absolute right-0 top-0 h-32 w-32 opacity-10">
                      <span className={`material-symbols-outlined text-[120px] ${challenge.iconColorClass}`}>
                        {challenge.icon}
                      </span>
                    </div>

                    <div>
                      <span className="mb-md inline-block rounded-full bg-on-secondary-fixed px-sm py-1 font-label-bold text-[10px] uppercase tracking-widest text-white">
                        {challenge.badge}
                      </span>
                      <h3 className="mb-xs font-headline-md text-headline-md text-on-surface">
                        {challenge.title}
                      </h3>
                      <p className="font-body-md text-on-surface-variant">
                        {challenge.description}
                      </p>
                    </div>

                    <div className="mt-md flex items-center gap-lg">
                      <div className="relative h-20 w-20 shrink-0">
                        <svg className="h-20 w-20">
                          <circle
                            className="text-surface-container-highest"
                            cx="40"
                            cy="40"
                            fill="transparent"
                            r="34"
                            stroke="currentColor"
                            strokeWidth="8"
                          />
                          <circle
                            className={`progress-ring__circle ${challenge.ringColorClass}`}
                            cx="40"
                            cy="40"
                            fill="transparent"
                            r="34"
                            stroke="currentColor"
                            strokeDasharray={RING_CIRCUMFERENCE}
                            strokeDashoffset={dashoffset}
                            strokeLinecap="round"
                            strokeWidth="8"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-stat-value text-label-bold text-on-surface">
                            {challenge.percent}%
                          </span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="mb-1 flex justify-between text-label-bold text-on-surface-variant">
                          <span>{challenge.progressLabel}</span>
                          <span>{challenge.timeLabel}</span>
                        </div>

                        {challenge.variant === "avatars" ? (
                          <div className="flex -space-x-2">
                            {challenge.avatars.map((src, i) => (
                              <div
                                key={i}
                                className="h-8 w-8 overflow-hidden rounded-full border-2 border-white"
                              >
                                <Image
                                  src={src}
                                  alt="Challenge participant"
                                  width={32}
                                  height={32}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-surface-container-high text-[10px] font-bold">
                              {challenge.moreCount}
                            </div>
                          </div>
                        ) : (
                          <button
                            className={`mt-2 w-full rounded-xl border-2 py-2 font-label-bold transition-all active:scale-95 ${challenge.ringColorClass} border-tertiary`}
                          >
                            {challenge.buttonLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Challenges */}
          <div>
            <h2 className="mb-lg font-headline-lg text-headline-lg text-on-surface">
              Upcoming Challenges
            </h2>
            <div className="space-y-md">
              {UPCOMING_CHALLENGES.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between rounded-2xl border border-outline-variant bg-white p-md shadow-sm transition-all hover:border-primary"
                >
                  <div className="flex items-center gap-md">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-container-high">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-headline-md text-[18px] text-on-surface">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-sm font-label-bold text-[12px] text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">
                          calendar_month
                        </span>
                        {item.date}
                        <span className="mx-1 h-1 w-1 rounded-full bg-outline-variant" />
                        <span className="material-symbols-outlined text-[16px]">
                          {item.metaIcon}
                        </span>
                        {item.metaLabel}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-lg">
                    <div className="hidden flex-col items-end md:flex">
                      <span className="text-[12px] font-label-bold uppercase text-on-surface-variant">
                        Reminder
                      </span>
                      <label className="relative mt-1 inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          defaultChecked={item.reminderChecked}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-surface-variant transition-all after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
                      </label>
                    </div>
                    <button className="material-symbols-outlined text-on-surface-variant transition-colors hover:text-primary">
                      chevron_right
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Leaderboard */}
        <aside className="lg:w-1/3">
          <div className="sticky top-24 rounded-2xl border border-outline-variant bg-surface-container p-lg shadow-md">
            <div className="mb-lg flex items-center gap-sm">
              <span className="material-symbols-outlined fill text-primary">military_tech</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Leaderboard</h2>
            </div>

            <div className="space-y-md">
              {LEADERBOARD.map((entry) => {
                const trend = trendIcon(entry.trend);
                return (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between rounded-xl p-sm transition-colors ${
                      entry.highlight
                        ? "border border-outline-variant/30 bg-surface-container-lowest shadow-sm"
                        : "hover:bg-surface-container-high"
                    }`}
                  >
                    <div className="flex items-center gap-md">
                      <span
                        className={`w-6 text-center font-stat-value text-[20px] ${
                          entry.highlight ? "text-primary" : "text-on-surface-variant"
                        }`}
                      >
                        {entry.rank}
                      </span>
                      <div
                        className={`h-10 w-10 overflow-hidden rounded-2xl ${
                          entry.highlight ? "border border-outline-variant" : ""
                        }`}
                      >
                        <Image
                          src={entry.avatar}
                          alt={`Profile photo of ${entry.name}`}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-label-bold text-on-surface">{entry.name}</p>
                        <p className="text-[11px] font-medium text-on-surface-variant">
                          {entry.weeklyMiles}
                        </p>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined ${trend.className}`}>
                      {trend.icon}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-lg border-t border-outline-variant pt-lg">
              <div className="flex items-center justify-between rounded-2xl bg-primary-container p-md">
                <div className="flex items-center gap-md">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
                    <span className="material-symbols-outlined fill text-[18px]">person</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-label-bold uppercase text-white/80">
                      Your Rank
                    </p>
                    <p className="font-label-bold text-white">#1,248 Elite</p>
                  </div>
                </div>
                <button className="material-symbols-outlined text-white">expand_more</button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}