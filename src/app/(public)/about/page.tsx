import Image from "next/image";
import Link from "next/link";

/* ---------- Data ---------- */

const TEAM = [
  {
    name: "Marcus Chen",
    role: "Founder & CEO",
    bio: "A sub-3 marathoner with a passion for building scalable communities through technology.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD71qjTxrmk1OUjBT-Pt4kihPreVbmNa_uE6Wi6gIHEcvn3cyRsn-I9ufjRzamleL8IhDQQxyFX6aVUOiOyzkjzssiBo_vvhSNXNgW6mDPn2avP0RUH6OiA27-GAy8tXbQoHOS43omMB6QlGwxqSYHlSVLsF6EiMpMgZoHE07B4OKia4r1JWnI4vXXMC7MvViQjBYFr6sUH-y3pcPebWJ09lUNoL8AbO7yc8oSMmxMJPlpLukVcXNRZnA",
    alt: "Headshot of Marcus Chen, founder, in athletic apparel with a city skyline at sunrise behind him",
  },
  {
    name: "Elena Rodriguez",
    role: "Community Lead",
    bio: "Connecting thousands of runners across 12 countries to ensure no one runs alone.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDfzO6cayj3ZEknBtnkH51bsNUHmFiC-1qaGqSfryFTxM5hCF5ViOBoKun9tr-4p9byDEdqZOVSxjABtyRR-Ec40hF-9hVUvdgU_HmcZ9sVAcOjDISVNTUyH14klUeqZgOijyiA0UCyVQjM_9mBuioQXttZvr57iGgC_V0O5OdeJO_uHk0sD3BeYUCfjeM_U3UkWlKqMpdDRuaHOZt09jSzD8ueX01tctUI3V2ume6doDR4RwisrV-vag",
    alt: "Headshot of Elena Rodriguez, community lead, wearing a navy running jacket",
  },
  {
    name: "David Vance",
    role: "Head of Training",
    bio: "Ex-Olympic coach dedicated to optimizing morning performance for all levels.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBQLLEM1x9DmKHq173pzAGmbaH6s92wakEdpr1rw04gBtw-TPEVoM5aiJ__cBfnBLf9GtoS6M9yGEWAxtx05SjlZIR1zY12NpoEulryXOgi-_aX8ORAIffOsQnOWCu1Yt25xznnOv10dXeiSfqHzlaKvPy4FFkkZNw4-9Sgq9p0H1R98Bjnvwh1XUl-6TPrvNNnrRgbHAtqgm6x9kgfXmoVQ5hwlnd_ZnQlLMEGoa7iqpLuPGAj7rtMAA",
    alt: "Headshot of David Vance, head of training, on a track at dawn",
  },
  {
    name: "Sarah Jenkins",
    role: "Ops & Strategy",
    bio: "Keeping the network running smoothly from logistics to global event planning.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB0Ch_q2b1fCnHn27k4q3mwJEDsd3513FeX5YQUAvV-eDmQFUquw1bLNwaKfZbKf3jW8eZytuAQi6nBgv7EwodYXfshfTIJB95tCvTfgd9wRSAgVmbAvWa7Phe2_GSgScTB98MXd-CFhOUbTvWr9c7MvZqnvL8-Zkf6GrxGIhc84ciSvvGMyMu7k0UB7yFQphS8Vm5fHZk-kbLlH0aqoxqO1R4WKMiC7dNKi_D6zbrFle7BndS_jLNbLw",
    alt: "Headshot of Sarah Jenkins, ops and strategy lead, in a bright glass-walled office",
  },
];

const IMPACT_STATS = [
  { value: "15,000+", label: "Active Runners" },
  { value: "2.5M", label: "Kilometers Run" },
  { value: "120+", label: "Annual Events" },
  { value: "50+", label: "Active Chapters" },
];

/* ---------- Page ---------- */

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative flex h-[600px] items-center justify-center overflow-hidden md:h-[700px]">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6p6odI4UTmbvh5uhNLc62MevYCbtUEDFXUJKUM7b01V1rw3SKWOu9vTW6gqOCa5mTSrWuA26VJsUUHq8_HLxWBkgEf8sgCUi0wmAa5xbQZfepRA35tI5qr4hyCqWvKheXrW_PmNVy6idtO6GMDYpnvYGbc4yUTFeMWkgkG4KY_7682g1yQg9kVYySXuRFWi14HMlt3l8auTbGA8jKLJCeLEjDYtTvNXABpIJt_MTsbthld5rkam1ZCw"
          alt="A group of runners silhouetted against a sunrise on a coastal path"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-black/20 to-black/10" />
        <div className="relative z-10 mx-auto max-w-[1280px] px-6 text-center lg:px-14">
          <div className="glass-card mb-6 inline-block rounded-full border border-white/20 px-6 py-2">
            <span className="font-label-bold text-label-bold uppercase tracking-widest text-white">
              Est. 2018
            </span>
          </div>
          <h1 className="font-display-xl text-display-xl-mobile text-white drop-shadow-lg md:text-display-xl">
            Empowering Every Step
            <br />
            <span className="text-primary-container">Towards the Horizon</span>
          </h1>
          <p className="font-body-lg text-body-lg mx-auto mt-6 max-w-2xl text-white/90 drop-shadow-md">
            Join a global network of early risers who turn the dawn into
            their competitive edge. Kinetic energy starts here.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="mx-auto max-w-[1280px] px-6 py-xl lg:px-14">
        <div className="grid items-center gap-xl lg:grid-cols-2">
          <div className="space-y-6">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Our Story
            </h2>
            <div className="sunrise-gradient h-1 w-16 rounded-full" />
            <div className="font-body-lg text-body-lg space-y-4 text-on-surface-variant">
              <p>
                It started with four friends, a damp park in Seattle, and a
                shared challenge: who could show up at 5:15 AM for a
                three-mile loop before the world woke up? What began as a
                local pact to beat the snooze button quickly evolved into
                something much larger.
              </p>
              <p>
                We realized that the quiet of the morning isn&apos;t just
                about avoiding traffic — it&apos;s about &quot;activated
                focus.&quot; As word spread, our small group of joggers
                became a movement. Runners from across the globe began
                reaching out, asking for training plans, community
                challenges, and the shared accountability that only comes
                from knowing your team is already out there, hitting the
                pavement while the stars are still visible.
              </p>
              <p>
                Today, Sunrise Runners Network is a global ecosystem. From
                Sydney to San Francisco, we are united by the same mission we
                started with: making the first mile the most rewarding part
                of your day.
              </p>
            </div>
          </div>
          <div className="group relative">
            <div className="absolute -inset-4 -rotate-2 rounded-2xl bg-primary-container/10 transition-transform duration-500 group-hover:rotate-0" />
            <div className="relative h-[400px] overflow-hidden rounded-2xl shadow-xl md:h-[500px]">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3SXL7BL274S9OL44RzJaCRp6vnqQW0yuSQWRYd5107bF84rCy2ytJyvt0_epklU39tSlTB63wmcUpZ8vVP3esRzgvcuk1xDr9_WAq58F5UzFBAgDlr9dsBC4tj3nP33hJZVFOy0VEx97TXAhO_voWP3Zijh2O8O1JZ2AYLoQexHZSKelo1VeyZ8qX4aXVu7UbHl-jSs0bQ0pKcckwHVLMyV6E-mcS-NLv0rbDLBHSkNzpPlBTZhPqUw"
                alt="The four founding members of Sunrise Runners Network celebrating at the end of a morning run"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-surface-container-low py-xl">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-14">
          <div className="grid gap-lg md:grid-cols-2">
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-[0px_4px_20px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-fixed">
                <span className="material-symbols-outlined text-3xl text-primary">
                  groups
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-4 text-on-surface">
                Our Mission
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                To build the world&apos;s most connected community of early
                risers, providing the tools, motivation, and camaraderie
                needed to transform morning routines into peak athletic
                performance.
              </p>
            </div>
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-[0px_4px_20px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-fixed">
                <span className="material-symbols-outlined text-3xl text-primary">
                  bolt
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-4 text-on-surface">
                Our Vision
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                To ignite kinetic energy in every runner, envisioning a world
                where the dawn is synonymous with personal growth, health,
                and a globally synchronized community of athletes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-[1280px] px-6 py-xl lg:px-14">
        <div className="mb-xl text-center">
          <h2 className="font-headline-lg text-headline-lg mb-2 text-on-surface">
            The Pace Setters
          </h2>
          <p className="font-body-md text-on-surface-variant">
            The dedicated team behind the global morning movement.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((member) => (
            <div key={member.name} className="group">
              <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl bg-surface-container-high">
                <Image
                  src={member.image}
                  alt={member.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h4 className="font-label-bold text-lg text-on-surface">
                {member.name}
              </h4>
              <p className="font-label-bold mb-2 text-sm uppercase text-primary">
                {member.role}
              </p>
              <p className="text-sm text-on-surface-variant">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community Impact */}
      <section className="relative overflow-hidden bg-on-background py-xl">
        <div className="sunrise-gradient absolute -right-48 -top-48 h-96 w-96 rounded-full opacity-20 blur-[120px]" />
        <div className="sunrise-gradient absolute -bottom-48 -left-48 h-96 w-96 rounded-full opacity-10 blur-[120px]" />
        <div className="relative z-10 mx-auto max-w-[1280px] px-6 lg:px-14">
          <div className="mb-xl text-center">
            <h2 className="font-headline-lg text-headline-lg text-white">
              Our Impact
            </h2>
            <p className="font-body-md mt-2 text-white/60">
              Measuring the kinetic energy of our global community.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-lg lg:grid-cols-4">
            {IMPACT_STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`p-md text-center ${
                  i !== IMPACT_STATS.length - 1
                    ? "border-r border-white/10"
                    : ""
                }`}
              >
                <span className="font-stat-value mb-2 block text-5xl text-primary-container">
                  {stat.value}
                </span>
                <span className="font-label-bold uppercase tracking-wider text-white">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-[1280px] px-6 py-xl lg:px-14">
        <div className="sunrise-gradient relative overflow-hidden rounded-2xl p-lg text-center text-white shadow-xl md:p-xl">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <h2 className="font-display-xl text-display-xl-mobile relative z-10 mb-6 md:text-headline-lg">
            Ready to Find Your Sunrise?
          </h2>
          <p className="font-body-lg text-body-lg relative z-10 mx-auto mb-8 max-w-[36rem] opacity-90">
            Stop running alone. Join the world&apos;s most motivated morning
            crew and turn your dawn into a destination.
          </p>
          <div className="relative z-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 font-label-bold text-label-bold text-primary shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Join the Community
              <span className="material-symbols-outlined">trending_flat</span>
            </Link>
            <Link
              href="/events"
              className="rounded-2xl border-2 border-white/30 bg-transparent px-8 py-4 font-label-bold text-label-bold text-white transition-all hover:bg-white/10"
            >
              View Local Chapters
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}