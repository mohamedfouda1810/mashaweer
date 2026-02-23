import Link from "next/link";
import { Car, ShieldCheck, MapPin, Clock, Wallet, Star, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-zinc-50 to-zinc-50 dark:from-blue-900/20 dark:via-zinc-950 dark:to-zinc-950"></div>
        {/* Decorative dots */}
        <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMykiLz48L3N2Zz4=')] opacity-60 dark:opacity-20"></div>

        <div className="animate-float mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-2xl shadow-blue-500/30">
          <Car className="h-10 w-10 text-white" />
        </div>

        <h1 className="animate-fade-in-up mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-7xl">
          Your Premium Inter-City <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Ride Experience
          </span>
        </h1>

        <p className="animate-fade-in-up mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400" style={{ animationDelay: "0.15s" }}>
          Mashaweer connects you with verified drivers traveling between cities. Enjoy comfortable, safe, and affordable
          trips with our easy-to-use platform. Book your seat in seconds.
        </p>

        <div className="animate-fade-in-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: "0.3s" }}>
          <Link
            href="/trips"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 sm:w-auto"
          >
            Find a Ride
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/register"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-8 py-4 text-sm font-semibold text-zinc-900 transition-all duration-300 hover:bg-zinc-50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800/80 sm:w-auto"
          >
            Become a Driver
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="animate-fade-in-up mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500 dark:text-zinc-500" style={{ animationDelay: "0.45s" }}>
          <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 10K+ Riders</span>
          <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-500" /> 4.9 Rating</span>
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> 15+ Cities</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24 sm:py-32 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Why choose Mashaweer?
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              We prioritize your safety, comfort, and time on every journey.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  name: 'Verified Drivers',
                  description: 'Every driver on our platform passes thorough background checks and vehicle inspections for your peace of mind.',
                  icon: ShieldCheck,
                  iconColor: 'text-emerald-600 dark:text-emerald-400',
                  bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                },
                {
                  name: 'Convenient Pickups',
                  description: 'Choose from multiple central gathering points in your city for easy, stress-free departures.',
                  icon: MapPin,
                  iconColor: 'text-blue-600 dark:text-blue-400',
                  bg: 'bg-blue-50 dark:bg-blue-900/20',
                },
                {
                  name: 'Secure Wallet',
                  description: 'Deposit funds via InstaPay or Vodafone Cash. Book instantly and get automatic refunds on cancellations.',
                  icon: Wallet,
                  iconColor: 'text-violet-600 dark:text-violet-400',
                  bg: 'bg-violet-50 dark:bg-violet-900/20',
                },
              ].map((feature) => (
                <div
                  key={feature.name}
                  className="group flex flex-col items-center rounded-2xl border border-zinc-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${feature.bg} transition-transform duration-300 group-hover:scale-110`}>
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>
                  <dt className="text-xl font-semibold leading-7 text-zinc-900 dark:text-white">
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to hit the road?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
            Join thousands of riders and drivers across Egypt. Your next trip is just a click away.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="flex w-full items-center justify-center rounded-xl bg-white px-8 py-4 text-sm font-semibold text-blue-700 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:w-auto"
            >
              Get Started Free
            </Link>
            <Link
              href="/trips"
              className="flex w-full items-center justify-center rounded-xl border border-white/30 px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 sm:w-auto"
            >
              Browse Trips
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Car className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-zinc-900 dark:text-white">Mashaweer</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            © {new Date().getFullYear()} Mashaweer. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/trips" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Trips</Link>
            <Link href="/register" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Register</Link>
            <Link href="/login" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
