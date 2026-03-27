import Link from "next/link";
import { Car, ShieldCheck, MapPin, Wallet, Star, Users, Zap, ArrowRight, Clock, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8 overflow-hidden min-h-[600px]">
        {/* Hero Background Image */}
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-mashaweer.png')" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/85 via-navy-dark/80 to-navy/90" />
        {/* Pattern overlay */}
        <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-60" />

        <div className="animate-float animate-pulse-glow mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-mint to-mint-dark shadow-2xl shadow-mint/30">
          <Car className="h-10 w-10 text-white" />
        </div>

        <h1 className="animate-fade-in-up mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
          طريقك الأذكى <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-mint-light to-mint">
            والأقرب
          </span>
        </h1>

        <p className="animate-fade-in-up mx-auto mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg" style={{ animationDelay: "0.15s" }}>
          Mashaweer connects you with verified drivers traveling between cities. 
          Enjoy comfortable, safe, and affordable trips with our easy-to-use platform.
        </p>

        <div className="animate-fade-in-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: "0.3s" }}>
          <Link
            href="/trips"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-mint/30 transition-all duration-300 hover:scale-105 hover:bg-mint-light hover:shadow-xl sm:w-auto"
          >
            Find a Ride
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/register"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:shadow-md sm:w-auto"
          >
            Become a Driver
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="animate-fade-in-up mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-white/60" style={{ animationDelay: "0.45s" }}>
          <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 10K+ Riders</span>
          <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-400" /> 4.9 Rating</span>
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> 15+ Cities</span>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-white py-20 sm:py-28 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/10 px-4 py-1.5 text-sm font-semibold text-mint">
              <Zap className="h-3.5 w-3.5" />
              Simple Process
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              How it Works
            </h2>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Search Trips',
                description: 'Browse available trips between cities and find the perfect ride for you.',
                icon: MapPin,
                color: 'bg-navy text-white',
                accent: 'border-navy/20',
              },
              {
                step: '2',
                title: 'Book Your Seat',
                description: 'Select your seat count, pay from your wallet, and confirm your booking instantly.',
                icon: CheckCircle,
                color: 'bg-mint text-white',
                accent: 'border-mint/20',
              },
              {
                step: '3',
                title: 'Enjoy the Ride',
                description: 'Meet your verified driver at the pickup point and travel safely to your destination.',
                icon: Car,
                color: 'bg-navy-light text-white',
                accent: 'border-navy-light/20',
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`group relative flex flex-col items-center rounded-2xl border ${item.accent} bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:bg-zinc-900 dark:border-zinc-800`}
              >
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${item.color} text-xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-zinc-50 py-20 sm:py-28 dark:bg-zinc-900">
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
                  description: 'Every driver passes thorough background checks and vehicle inspections for your peace of mind.',
                  icon: ShieldCheck,
                  iconColor: 'text-mint dark:text-mint-light',
                  bg: 'bg-mint/10 dark:bg-mint/10',
                },
                {
                  name: 'Instant Booking',
                  description: 'Browse available trips, pick your city pair, and book your seat in seconds with our digital wallet.',
                  icon: Zap,
                  iconColor: 'text-navy dark:text-navy-light',
                  bg: 'bg-navy/10 dark:bg-navy/10',
                },
                {
                  name: 'Secure Wallet',
                  description: 'Deposit funds via InstaPay or Vodafone Cash. Book instantly and get automatic refunds on cancellations.',
                  icon: Wallet,
                  iconColor: 'text-slate-dark dark:text-slate-light',
                  bg: 'bg-slate/10 dark:bg-slate/10',
                },
              ].map((feature) => (
                <div
                  key={feature.name}
                  className="group flex flex-col items-center rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
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
      <section className="relative overflow-hidden bg-gradient-to-r from-navy via-navy-light to-mint py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA0KSIvPjwvc3ZnPg==')] opacity-60" />
        <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to hit the road?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Join thousands of riders and drivers across Egypt. Your next trip is just a click away.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="flex w-full items-center justify-center rounded-xl bg-white px-8 py-4 text-sm font-semibold text-navy shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:w-auto"
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-navy to-mint">
              <Car className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-zinc-900 dark:text-white">Mashaweer</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            © {new Date().getFullYear()} Mashaweer. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/trips" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Trips</Link>
            <Link href="/help" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Help</Link>
            <Link href="/register" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Register</Link>
            <Link href="/login" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
