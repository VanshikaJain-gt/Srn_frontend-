import Image from "next/image";
import Link from "next/link";

const EXPLORE_LINKS = [
  { label: "Events Calendar", href: "/events" },
  { label: "Global Leaderboard", href: "/results" },
  { label: "Training Programs", href: "/challenges" },
  { label: "Digital Badges", href: "/results" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-gray-200 bg-white text-gray-900">

      {/* Top */}

      <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="grid gap-16 lg:grid-cols-4">

          {/* Logo */}

          <div className="min-w-0 lg:col-span-2">

            <Image
              src="/logo.png.jpeg"
              alt="Sunrisers"
              width={90}
              height={90}
              className="mb-6"
            />
            <p className="w-full max-w-[650px] text-lg leading-8 text-black/70">
              Building India's fastest growing running community.
              Whether you're preparing for your first 5K or your next marathon,
              you'll always find a place to run together, grow together and
              challenge yourself.
            </p>

            <div className="mt-8 flex gap-4">

              {["facebook","camera_alt","play_circle","alternate_email"].map((icon)=>(
                <button
                  key={icon}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-700 transition-all duration-300 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                >
                  <span className="material-symbols-outlined">
                    {icon}
                  </span>
                </button>
              ))}

            </div>

          </div>

          {/* Explore */}

          <div>

            <h3 className="mb-6 text-xl font-bold uppercase tracking-wider text-orange-600">
              Explore
            </h3>

            <ul className="space-y-4">

              {EXPLORE_LINKS.map((item)=>(
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-lg text-gray-600 transition hover:text-orange-600"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

            </ul>

          </div>

          {/* Company */}

          <div>

            <h3 className="mb-6 text-xl font-bold uppercase tracking-wider text-[#ff6b1a]">
              Company
            </h3>

            <ul className="space-y-4">

              {COMPANY_LINKS.map((item)=>(
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-lg text-black/70 transition hover:text-[#ff6b1a]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

            </ul>

          </div>

        </div>

        {/* Bottom */}

        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-gray-200 pt-8 lg:flex-row">

          <p className="text-gray-500">
            © {new Date().getFullYear()} Sunrise Runners Network.
            All Rights Reserved.
          </p>

          <div className="flex gap-8">

            <Link href="/privacy" className="text-gray-500 transition hover:text-orange-600">
              Privacy
            </Link>

            <Link href="/terms" className="text-gray-500 transition hover:text-orange-600">
              Terms
            </Link>

            <Link href="/contact" className="text-gray-500 transition hover:text-orange-600">
              Contact
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
}