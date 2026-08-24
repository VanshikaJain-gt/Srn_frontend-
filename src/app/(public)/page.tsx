"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ---------- Data ---------- */

const LIVE_AVATARS = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD705ZkVKES3oDx_cWNdZFtfHFMLGbA3OsE4xcPTNkump_rxcwExF_5WeG4_Cpuioe4T0u3dboO9HCYXeqNja5vuUefwQLkq-QUb8oMJcDXCMUKTj3Ujhxo5fUJ8cjWwwj0yz1RmnD7OH6oyZhMjpNu3g6XTdBS213TGYkiq8snaqzGKOU2cYUktFiM0hxEVQ7dhEAPothnvK6JNBQTjm2rGebMAGisVrs9BCcquQwF29QJ0ofFXt7ts4rtISAhTMzjpAP4AdaRxvlS",
    alt: "Smiling female runner in early morning light",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjexa8aYaVkOJ42MhTMU4DnYjmdQ2_UfVGUFjEdBp-2d1E3vKBwj8AJiIKAdKCFTEkGyG6c9WZEXfsVf77vpeguUHaXsvOseFi4da8HI3776SXfS-P0FzFBwfa7Etr2mThuv9ner40dtP1PgfzYz96P5HjAwZW7FUnawp0uInUMcj2B-zBfWAxwl15RzezIMDe0yOsyUMBwqc4UCnKevLwLB_VcfQsPa_IryoXSGCmtlW-1hOOvQd4_VC2MLQCrVf8I4kHV0uXMw-f",
    alt: "Male runner wearing a headband at sunrise",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4-peRpQD78QTm2tmu17w6WnC5VIQ5ttkEnofULrySm1xDTOnPOvFD4YDpWySMbqjrTGLddhf0yV4Vjbh9Fknunwlxjw71qiFGvuXWsTckOd79KXEXoiyTOX4LcENVijGF1y7K90D3DbR6rkgkgoYy1yI_XNao-0JLmtGCXA4tZnHcTySLq9IVS3MWX1VzQbajiKzZ0aIlXjrASYAv-jtMRxWNvOh2vSkot1iJyOV-c3sGoJsemeVr28_NVIsoSLixRK0GXA6DMl6A",
    alt: "Older athlete smiling in running gear",
  },
];

type Stat = {
  icon: string;
  target: number;
  label: string;
  format: (value: number) => string;
};

const STATS: Stat[] = [
  { icon: "groups", target: 15000, label: "Total Members", format: (v) => `${Math.floor(v / 1000)}k+` },
  { icon: "calendar_month", target: 250, label: "Total Events", format: (v) => `${v}+` },
  { icon: "distance", target: 1200000, label: "Total KM Run", format: (v) => `${(v / 1000000).toFixed(1)}M` },
  { icon: "emoji_events", target: 45, label: "Active Challenges", format: (v) => `${v}` },
];

const MILESTONES = [
  { icon: "stars", filled: true, bg: "bg-primary", fg: "text-on-primary", year: "2018: The First Sunrise", copy: "Three runners met in Central Park at 5:00 AM. A tradition was born." },
  { icon: "public", filled: false, bg: "bg-primary-container", fg: "text-on-primary-container", year: "2020: Going Virtual", copy: "Connected 5,000+ runners globally during the lockdowns via digital challenges." },
  { icon: "rocket_launch", filled: false, bg: "bg-primary-container", fg: "text-on-primary-container", year: "2024: Elite Performance", copy: "Launching professional coaching and elite race series for all members." },
];

const EVENTS = [
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjHYlwug-uc5JpMb_ZtgCad1rptf27lPIYuBvla0SFIR6HJuu8rC_eI4kk2IXDg9zKxt9gqVwNdvsRDBt7UjfwydRWSgZzaJug4NMDnwigz2SOpbGJhUf5Bmh860Rg_4GPtl__sfSIEI5CmIv5jgF5ihn7IyWe9lTxCsWfJ1SNOm4NEbH4yq7TYnbw5mNYOHJPPAWESbPQ0-5pX20w8oJzDngdfGFKiJved3dLyr140so-JYKXKhzN8rpDYCjnkj3cbxlACTBVnOrW",
    alt: "Massive marathon start line in a modern city at sunrise",
    month: "MAR", day: "12", tag: "Marathon", distance: "42.2 KM",
    title: "Ocean View Classic",
    copy: "The premier marathon of the season, taking runners along the scenic coast at daybreak.",
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBuVwrUhmnpDrtUaBoX6G0igK7REBQp-ghxIUcfKie2A6cMy53oVPZi6ppWhbBlzI9MiAeAn93CtlGHutvVrbCnTDBV2S1t24pKCbv1qU7S1gkqdzI0jHHlX2MWcNhKgbWafpiLEAZwmpWlmS6Lr2AAjLc5MBq2euKYOsUpmVaLS297BIaksnNct1o86o0FPbxutU_v1WQ5BEpixRI2IFk0fW2gg1LCMvZLGD8Zf5pPdwEyTf8u6kbGa43RmTgSe2dq7VPHHDbm4MT",
    alt: "Runner's legs mid-stride during a fast 10K race at sunrise",
    month: "APR", day: "05", tag: "10K Run", distance: "10 KM",
    title: "City Lights Chase",
    copy: "A high-speed urban run through the illuminated city center before the morning rush.",
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYFxz8I2y6xsivQaguSwCIVNNawI-A3PDqYG7-keRRk6yTPsoevgPqE55AunbtWlvaFIU7ynZ-Ytur34zcqGfPaq09nstyXLV4tLhLv_ZvLTCSk5xArxgqiMRCUwBTyjRHwVHXrUf__CjHG76CD2NbhkScM8uaXSC8BWJ8CF5RYwqgUgghWSNbDlVytlR0oKI5S81mIP-LYNL-epqU7Wtx3v1I5eeYhhiU-xxkYjw1HZEr5mn0zxUDqu4IN5_0jMplSEb3yQh5ZlAS",
    alt: "Group in bright costumes at a community fun run in a sunlit park",
    month: "MAY", day: "20", tag: "Fun Run", distance: "5 KM",
    title: "Color Blast 5K",
    copy: "A vibrant, non-competitive community walk/run for all ages and fitness levels.",
  },
];

const CHALLENGES = [
  {
    icon: "route", bg: "bg-primary-container", fg: "text-on-primary-container",
    title: "Sunrise 100K Streak", percent: 78, percentLabel: "78% Full",
    barColor: "bg-primary", textColor: "text-primary",
    copy: "4,203 Runners participating this month",
    buttonColor: "bg-primary",
  },
  {
    icon: "altitude", bg: "bg-tertiary-container", fg: "text-on-tertiary-container",
    title: "Peak Climber Elite", percent: 25, percentLabel: "25% Full",
    barColor: "bg-tertiary", textColor: "text-tertiary",
    copy: "1,120 Elite runners scaling 10k meters elevation",
    buttonColor: "bg-tertiary",
  },
];

const GALLERY = [
  {
    type: "image" as const, height: "h-80",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZMw7TQFIP9DczW54-GTN25iEdp7NfP2rnrY6K4quMCp8gkGNYQ4K2l5lj0pTt6ZbOTLgOE1Ct6QEX7u3x2I3GpXYRNVcOR7k2lPeXek_bHVzdqUylMBGWV7_NNBi3d-1oXJ_9mHdx4xbV25Aoa-Q2WISIOyPk29HqTxzVBaLe2cSh7_TD-5DVMqs-zzyITaWFuowB-_IPk79YbIFPwkePtx3HoU_3SRGvy0Pg8RhfcgXx2dOyg7El67INcQ9u9igsTCL1hrTYBbvj",
    alt: "Runners high-fiving in a circle, top-down view",
    caption: "Sunday Morning Blast - Seattle Chapter",
  },
  {
    type: "image" as const, height: "h-64 lg:h-[400px]",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzdcfegHacAq3ZnYYZLxyYhEAnTRWT0i24skGDNvI-t_EpGTaWl-fZTKtr_Y0mF-qpeqMbf_34kJYpuKFK-488_QqhXD7YiXbMpMdlIKhqMgMBVEuBDVwd1dwssIO4JC7wLfY0-orlUrp-nOVcqBaXYem4aQnrCDcLtmms7DCKZitiz3whamHyYIFjZCXCjVJuvCH3MhoyYjslm3T3-hCqufbD8srCwYhpas_FcJvTAr6wr_Nu-YahQZe5QosBPbBtx7sz80j7G8Di",
    alt: "Close-up of running shoes mid-stride on wet pavement at dawn",
    caption: "Gear Focus: Performance in every step.",
  },
  {
    type: "quote" as const, height: "h-80",
    quote: "SRN changed my life. I went from couch potato to 10K runner in 6 months thanks to this community.",
    name: "Sarah Jenkins", since: "Member since 2023",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuw3q56BsyziFL7nsfmxOPyeGPO4iLjwV19BXCsbfb-8ra6UYK_uaug8hMX0spJTul6bEWvhID92jaqthJ3arCLkYQGqrQ5AaLUQC4nWQjmNA_0zgtAEK0LGvedxm0wo4zfv8N1KYY6xHIGAqn4yPqTnAjBc11Co3w56-yZb9CwPpwVnkybkThloy37dVAUe18Neyt5vou-Oah2nHjnKbiA_PVVQXF0C-4009KgY8BMojd292ObG2gBG0Hl5ArN66bf9Zow2ePMD1r",
  },
  {
    type: "image" as const, height: "h-96 lg:h-[350px]",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRYYnouNcD_RDFkf0Gp5VTnbqT_GHRRLJmFfIrRSOJzEF6b-KASxXeq4GtiJGFmqxghhW2Gnql3UHQWc6P1dg66UsZ42p-MRV2dHD9rnTGhoUrkCUzx8RJwirZa-FMYgZ5I2dXZyPYZDUrmLp0zkca3g10jDeQqSyiiuugTOi73rwT1Y6O3ux9i7aRXYyFqa94fSjJPLKG7bIWWJ1HxTRASIIVqPSrJ9ojGpHQ5AtuGG_N9SYm6MpqnHv7xnOq9YwkRoeJmHiDWVLb",
    alt: "Trail race path winding through a misty forest at dawn",
    caption: "Trail Discovery Series - Oregon",
  },
];

/* ---------- Counter hook (used by Stats section) ---------- */

function useCountUp(target: number, active: boolean, duration = 2000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    let frame: number;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value;
}

function StatCard({ stat, active }: { stat: Stat; active: boolean }) {
  const value = useCountUp(stat.target, active);
  return (
    <div className="group flex flex-col items-center rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-lg text-center shadow-sm transition-shadow hover:shadow-lg">
      <span className="material-symbols-outlined mb-sm text-4xl text-primary">{stat.icon}</span>
      <span className="font-stat-value text-stat-value text-on-surface">
        {active ? stat.format(value) : stat.format(0)}
      </span>
      <span className="font-label-bold text-label-bold uppercase text-on-surface-variant">
        {stat.label}
      </span>
    </div>
  );
}

/* ---------- Page ---------- */

export default function Home() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsActive, setStatsActive] = useState(false);

  useEffect(() => {
    const node = statsRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      {/* Hero */}
      {/* Hero */}
<section className="relative min-h-screen overflow-hidden">
  {/* Background Image */}
  <div className="absolute inset-0">
    <Image
      src="https://images.unsplash.com/photo-1502224562085-639556652f33?q=80&w=2028&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      alt="Sunrise runners"
      fill
      priority
      className="object-cover"
    />

    {/* Overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/20" />
  </div>

  {/* Content */}
  <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] items-center justify-between px-6 py-20 lg:px-14">

    {/* LEFT CONTENT */}
    <div className="max-w-[620px]">

      <h1 className="leading-[0.9] uppercase">
        <span className="block text-6xl font-black tracking-tight text-white md:text-7xl lg:text-8xl">
          TEAM
        </span>

        <span className="block text-6xl font-black tracking-tight text-[#ff6b1a] md:text-7xl lg:text-8xl">
          SUNRISERS
        </span>
      </h1>

      <h2 className="mt-8 text-2xl font-bold text-white lg:text-4xl">
        Run Together • Grow Together
      </h2>

      <p className="mt-8 max-w-[520px] text-lg leading-8 text-white/90 lg:text-xl">
        A community of passionate runners inspiring each other
        to be better every single day.
      </p>

      <div className="mt-12 flex flex-wrap gap-5">

        <button className="flex items-center gap-2 rounded-xl bg-[#ff6b1a] px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-[#ff7a2f]">
          Join Community
          <span className="material-symbols-outlined">
            arrow_forward
          </span>
        </button>

        <button className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20">
          Upcoming Runs
          <span className="material-symbols-outlined">
            arrow_forward
          </span>
        </button>

      </div>

    </div>

    {/* RIGHT CARD */}

    <div className="hidden lg:block">

      <div className="w-[360px] rounded-3xl border border-white/20 bg-black/30 p-8 text-white shadow-2xl backdrop-blur-xl">

        <div className="mb-8 flex items-center justify-between">

          <span className="text-sm font-semibold uppercase tracking-[3px] text-white/70">
            Live Activity
          </span>

          <div className="flex items-center gap-2 rounded-full bg-red-500/80 px-3 py-1 text-xs font-bold">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            LIVE
          </div>

        </div>

        <h3 className="text-4xl font-bold">
          Sunrise 5K
        </h3>

        <p className="mt-3 text-lg text-white/80">
          342 runners active across 12 cities
        </p>

        <div className="mt-8 flex -space-x-3">

          {LIVE_AVATARS.map((avatar) => (
            <Image
              key={avatar.src}
              src={avatar.src}
              alt={avatar.alt}
              width={50}
              height={50}
              className="rounded-full border-2 border-white object-cover"
            />
          ))}

          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#ff6b1a] text-sm font-bold">
            +339
          </div>

        </div>

      </div>

    </div>

  </div>
</section>

      {/* Stats */}
      <section className="bg-surface-container-lowest py-xl">
        <div ref={statsRef} className="mx-auto grid max-w-[1280px] grid-cols-2 gap-lg px-lg md:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} active={statsActive} />
          ))}
        </div>
      </section>

      {/* About + Timeline */}
      <section className="overflow-hidden py-xl">
        <div className="mx-auto max-w-[1280px] px-lg">
          <div className="flex flex-col items-center gap-xl md:flex-row">
            <div className="space-y-lg md:w-1/2">
              <span className="font-label-bold text-label-bold uppercase tracking-widest text-primary">
                Our Story
              </span>
              <h2 className="font-headline-lg text-headline-lg leading-tight text-on-surface">
                From a Morning Jog to a Global Network.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Sunrise Runners Network began with three friends who wanted to
                reclaim their mornings. Today, we represent the peak of
                community-driven performance across 40 countries.
              </p>

              <div className="relative space-y-lg before:absolute before:bottom-4 before:left-4 before:top-4 before:w-px before:bg-outline-variant">
                {MILESTONES.map((item) => (
                  <div key={item.year} className="relative pl-12">
                    <div
                      className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-background ${item.bg} ${item.fg}`}
                    >
                      <span className={`material-symbols-outlined text-sm ${item.filled ? "fill" : ""}`}>
                        {item.icon}
                      </span>
                    </div>
                    <h4 className="font-label-bold text-label-bold text-on-surface">{item.year}</h4>
                    <p className="text-on-surface-variant">{item.copy}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* <div className="relative md:w-1/2">
              <div className="relative z-10 aspect-square overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqlNe-2kAkrhAHvM4JEuU0Y2Euku4xKdp7BUgn-PGMNsNgbELYBy__ZbyhWKWNHdzia9aoKFC_cJGBrvK_EschaN6NT42t-EFMdiWu5j6LeHr8GzvqUmjtGuama__Ybq993rjlVE44X9ptko0WhDCaJzlyIkGLkIu57IK50b483sbyZc3r3M0O843l8GvyPZORX60hfEP59O8vy_4gJIrtIPCdeFfq9PaZps-gL4DGrDyx8ztXklS1kHiv79-47O0HSHhYmMh2R8vg"
                  alt="Two runners high-fiving at the finish line of a local race"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -right-12 -top-12 -z-0 h-64 w-64 rounded-full bg-primary-container/20 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 -z-0 h-64 w-64 rounded-full bg-tertiary-container/20 blur-3xl" />
            </div> */}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="bg-surface-container-low py-xl">
        <div className="mx-auto max-w-[1280px] px-lg">
          <div className="mb-xl flex items-end justify-between">
            <div className="space-y-sm">
              <span className="font-label-bold text-label-bold uppercase tracking-widest text-primary">
                Next Stops
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Upcoming Events</h2>
            </div>
            <button className="hidden items-center gap-sm font-label-bold text-label-bold text-primary hover:underline md:flex">
              View All Calendar <span className="material-symbols-outlined">calendar_today</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
            {EVENTS.map((event) => (
              <div
                key={event.title}
                className="group overflow-hidden rounded-3xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm transition-all hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute right-4 top-4 rounded-2xl bg-surface-container-lowest/90 px-md py-sm text-center shadow-md backdrop-blur-md">
                    <span className="block font-bold leading-none text-primary">{event.month}</span>
                    <span className="block text-xl font-extrabold leading-none text-on-surface">{event.day}</span>
                  </div>
                </div>
                <div className="space-y-md p-lg">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-secondary-container px-md py-xs text-xs font-bold uppercase tracking-wider text-on-secondary-container">
                      {event.tag}
                    </span>
                    <span className="flex items-center gap-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm">distance</span> {event.distance}
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">{event.title}</h3>
                  <p className="line-clamp-2 text-on-surface-variant">{event.copy}</p>
                  <button className="btn-gradient w-full rounded-2xl py-md font-label-bold text-label-bold text-on-primary transition-transform active:scale-95">
                    Register Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Monthly Challenges */}
      <section className="py-xl">
        <div className="mx-auto max-w-[1280px] px-lg">
          <div className="grid grid-cols-1 gap-xl lg:grid-cols-2">
            <div className="space-y-lg">
              <span className="font-label-bold text-label-bold uppercase tracking-widest text-primary">
                Push Your Limits
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Monthly Challenges</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Join global leaderboard challenges and earn exclusive digital
                and physical medals.
              </p>

              <div className="space-y-md pt-lg">
                {CHALLENGES.map((challenge) => (
                  <div
                    key={challenge.title}
                    className="flex flex-col items-center gap-md rounded-3xl border border-outline-variant/30 bg-surface-container p-lg md:flex-row"
                  >
                    <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full ${challenge.bg} ${challenge.fg}`}>
                      <span className="material-symbols-outlined fill text-4xl">{challenge.icon}</span>
                    </div>
                    <div className="flex-grow space-y-sm">
                      <div className="flex justify-between">
                        <h4 className="font-label-bold text-label-bold">{challenge.title}</h4>
                        <span className={`font-bold ${challenge.textColor}`}>{challenge.percentLabel}</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-outline-variant/30">
                        <div className={`h-full ${challenge.barColor}`} style={{ width: `${challenge.percent}%` }} />
                      </div>
                      <p className="text-xs text-on-surface-variant">{challenge.copy}</p>
                    </div>
                    <button className={`rounded-xl px-lg py-sm text-xs font-bold uppercase text-on-primary ${challenge.buttonColor}`}>
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="relative h-[400px] w-full overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWIVBEqmxdxk-JDxA5HnzpwmqsDi7nXYaVQCg8-0tFPCM9o_WqcX6tkA0l9fqmVYbo2eaUvD0M9g5N51Qiy-4YZSJkmRpnH41EX8uVwvpjPNun8aRnI4tYLOcJ7cM-NEdz2r5YPtJ3-3CsXLR5C-z3y8GN2FpKHB9zbEL3SaoGBO_gwItnz2UB29y6JmWyJm3rZb90ZRl5jUbJR-oLJ7RqslBek9ar0wzPpmIDXEo9GY3wumLm3nK7-aK_cHFE446jAErmqwHDaaYc"
                  alt="Phone displaying an activity dashboard held by a runner at sunrise"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="glass-card absolute -bottom-6 -right-6 max-w-[240px] rounded-2xl border border-white/20 p-lg text-on-primary shadow-xl">
                <div className="mb-sm flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary-fixed">military_tech</span>
                  <span className="font-bold">Latest Badge</span>
                </div>
                <p className="text-sm opacity-90">
                  You&apos;ve earned the &lsquo;Dawn Warrior&rsquo; badge for
                  10 consecutive sunrise runs!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Highlights */}
      <section className="bg-surface-container-highest/20 py-xl">
        <div className="mx-auto max-w-[1280px] px-lg">
          <div className="mb-xl space-y-sm text-center">
            <span className="font-label-bold text-label-bold uppercase tracking-widest text-primary">
              The Network In Action
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Community Highlights</h2>
          </div>

          <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
            {GALLERY.map((item, i) => {
              if (item.type === "quote") {
                return (
                  <div
                    key={i}
                    className={`relative overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm ${item.height}`}
                  >
                    <div className="flex h-full flex-col justify-between bg-primary-container/10 p-lg">
                      <span className="material-symbols-outlined text-4xl text-primary">format_quote</span>
                      <p className="font-headline-md italic text-on-surface">&ldquo;{item.quote}&rdquo;</p>
                      <div className="flex items-center gap-sm">
                        <Image
                          src={item.avatar}
                          alt={`Headshot of ${item.name}`}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="text-sm font-bold">{item.name}</h4>
                          <p className="text-xs text-on-surface-variant">{item.since}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={i}
                  className={`group relative overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm ${item.height}`}
                >
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-lg opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-sm text-white">{item.caption}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Large CTA */}
      {/* Premium CTA Section */}
<section className="relative overflow-hidden py-24">

  {/* Background */}
  <div className="absolute inset-0">
    <Image
      src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2000&auto=format&fit=crop"
      alt="Running Community"
      fill
      className="object-cover"
    />

    <div className="absolute inset-0 bg-black/70" />
  </div>

  <div className="relative z-10 mx-auto max-w-7xl px-6">

    <div className="rounded-[40px] border border-white/10 bg-white/10 p-12 text-center shadow-2xl backdrop-blur-xl lg:p-20">

      <span className="inline-block rounded-full bg-[#ff6b1a]/20 px-5 py-2 text-sm font-semibold uppercase tracking-[3px] text-[#ff8a45]">
        Join The Community
      </span>

      <h2 className="mt-8 text-5xl font-black leading-tight text-white md:text-7xl">
        Ready to Find
        <br />
        Your Sunrise?
      </h2>

      <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-white/80">
        Join thousands of passionate runners, participate in weekly events,
        compete in exciting challenges and become a part of India's fastest
        growing running community.
      </p>

      <div className="mt-12 flex flex-wrap justify-center gap-6">

        <button className="rounded-xl bg-[#ff6b1a] px-10 py-5 text-lg font-bold text-white transition hover:scale-105 hover:bg-[#ff7d2f]">
          Join Community →
        </button>

        <button className="rounded-xl border border-white/30 bg-white/10 px-10 py-5 text-lg font-bold text-white backdrop-blur-lg transition hover:bg-white/20">
          Upcoming Runs →
        </button>

      </div>

      <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">

        <div>
          <h3 className="text-4xl font-black text-[#ff6b1a]">
            15K+
          </h3>
          <p className="mt-2 text-white/70">
            Active Members
          </p>
        </div>

        <div>
          <h3 className="text-4xl font-black text-[#ff6b1a]">
            250+
          </h3>
          <p className="mt-2 text-white/70">
            Events
          </p>
        </div>

        <div>
          <h3 className="text-4xl font-black text-[#ff6b1a]">
            1.2M
          </h3>
          <p className="mt-2 text-white/70">
            KM Completed
          </p>
        </div>

        <div>
          <h3 className="text-4xl font-black text-[#ff6b1a]">
            40+
          </h3>
          <p className="mt-2 text-white/70">
            Cities
          </p>
        </div>

      </div>

    </div>

  </div>

</section>
    </main>
  );
}