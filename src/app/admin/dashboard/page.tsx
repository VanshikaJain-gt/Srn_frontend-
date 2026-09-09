"use client";

export default function AdminDashboardPage() {
  return (
    <section>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">
          Admin Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-black text-gray-950">
          Welcome to SRN Administration
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Manage challenges, events, registrations, payments and community
          data from one place.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Challenges", "emoji_events", "/admin/challenges"],
          ["Events", "event", "/admin/events"],
          ["Users", "group", "/admin/users"],
          ["Results", "military_tech", "/admin/results"],
        ].map(([label, icon, href]) => (
          <a
            key={label}
            href={href}
            className="group rounded-3xl border border-orange-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <span className="material-symbols-outlined">{icon}</span>
            </div>

            <h2 className="mt-5 text-lg font-black text-gray-900">
              {label}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Open {label.toLowerCase()} management.
            </p>

            <div className="mt-5 text-sm font-bold text-orange-600">
              Manage →
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-white p-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-gray-400">
          Integration status
        </p>

        <h2 className="mt-2 text-xl font-black text-gray-900">
          Challenge management is next
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          The admin shell is ready. We will now connect the Challenges section
          to the existing backend CRUD APIs.
        </p>
      </div>
    </section>
  );
}