'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { ShieldCheck, MapPin, Wallet, Star, Users, Zap, ArrowRight, CheckCircle, Clock, Route, Sparkles, ChevronRight } from "lucide-react";

function useRevealOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    const children = el.querySelectorAll('.reveal-on-scroll');
    children.forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);
  return ref;
}

function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  return (
    <span className="animate-count-up inline-block">
      {target}{suffix}
    </span>
  );
}

const POPULAR_ROUTES = [
  { from: 'Cairo', to: 'Alexandria', emoji: '🏛️', price: '150' },
  { from: 'Cairo', to: 'Mansoura', emoji: '🌿', price: '120' },
  { from: 'Cairo', to: 'Tanta', emoji: '🕌', price: '80' },
  { from: 'Alexandria', to: 'Marsa Matrouh', emoji: '🏖️', price: '200' },
  { from: 'Cairo', to: 'Ismailia', emoji: '⛵', price: '100' },
  { from: 'Cairo', to: 'Suez', emoji: '🚢', price: '90' },
];

const TESTIMONIALS = [
  { name: 'Ahmed M.', role: 'Passenger', text: 'Best ride-sharing platform in Egypt. Always find reliable drivers.', rating: 5 },
  { name: 'Sara K.', role: 'Passenger', text: 'Safe, comfortable, and affordable. Mashaweer changed how I travel.', rating: 5 },
  { name: 'Omar H.', role: 'Driver', text: 'Great earning opportunity. The platform is easy to use and well organized.', rating: 5 },
];

export default function Home() {
  const sectionRef = useRevealOnScroll();

  return (
    <div ref={sectionRef} className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8 overflow-hidden min-h-[85vh] sm:min-h-[600px]">
        {/* Hero Background Image */}
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: "url('/hero-mashaweer.png')" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/90 via-navy-dark/85 to-navy/95" />
        {/* Animated pattern overlay */}
        <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-60" />

        {/* Logo */}
        <div className="animate-fade-in-up mb-6">
          <div className="mx-auto flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm shadow-2xl shadow-mint/20 border border-white/10 animate-pulse-glow">
            <Image
              src="/mashaweer-logo.png"
              alt="Mashaweer"
              width={80}
              height={80}
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
              priority
            />
          </div>
        </div>

        <h1 className="animate-fade-in-up mx-auto max-w-4xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl leading-tight">
          طريقك الأذكى <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-mint-light via-mint to-emerald-300 animate-gradient-shift">
            والأقرب
          </span>
        </h1>

        <p className="animate-fade-in-up stagger-2 mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-lg sm:leading-8">
          Mashaweer connects you with verified drivers traveling between cities.
          Enjoy comfortable, safe, and affordable trips with our easy-to-use platform.
        </p>

        <div className="animate-fade-in-up stagger-3 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/trips"
            id="hero-find-ride"
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-mint to-mint-light px-8 py-4 text-sm font-bold text-white shadow-lg shadow-mint/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-mint/40 sm:w-auto"
          >
            Find a Ride
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/register"
            id="hero-become-driver"
            className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/8 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:border-white/40 hover:shadow-md sm:w-auto"
          >
            Become a Driver
            <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="animate-fade-in-up stagger-4 mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-white/55">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <AnimatedCounter target="10K" suffix="+" /> Riders
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-amber-400" />
            <AnimatedCounter target="4.9" /> Rating
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <AnimatedCounter target="15" suffix="+" /> Cities
          </span>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-white py-16 sm:py-24 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal-on-scroll mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/10 px-4 py-1.5 text-sm font-semibold text-mint">
              <Zap className="h-3.5 w-3.5" />
              Simple Process
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              How it Works
            </h2>
          </div>

          <div className="mx-auto mt-12 sm:mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Search Trips',
                description: 'Browse available trips between cities and find the perfect ride.',
                icon: MapPin,
                color: 'bg-navy text-white',
                accent: 'border-navy/20',
                delay: 'stagger-1',
              },
              {
                step: '2',
                title: 'Book Your Seat',
                description: 'Select seats, pay from your wallet, and confirm instantly.',
                icon: CheckCircle,
                color: 'bg-mint text-white',
                accent: 'border-mint/20',
                delay: 'stagger-2',
              },
              {
                step: '3',
                title: 'Enjoy the Ride',
                description: 'Meet your verified driver and travel safely to your destination.',
                icon: Route,
                color: 'bg-navy-light text-white',
                accent: 'border-navy-light/20',
                delay: 'stagger-3',
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`reveal-on-scroll ${item.delay} group relative flex flex-col items-center rounded-2xl border ${item.accent} bg-white p-6 sm:p-8 text-center shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl dark:bg-zinc-900 dark:border-zinc-800`}
              >
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${item.color} text-xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
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

      {/* Popular Routes Section */}
      <section className="bg-zinc-50 py-16 sm:py-24 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal-on-scroll mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/10 px-4 py-1.5 text-sm font-semibold text-navy dark:text-navy-light dark:bg-navy/20">
              <Route className="h-3.5 w-3.5" />
              Popular Routes
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Top Destinations
            </h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Most traveled routes by our community
            </p>
          </div>

          <div className="reveal-on-scroll mt-10 sm:mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {POPULAR_ROUTES.map((route, i) => (
              <Link
                key={i}
                href={`/trips?fromCity=${route.from}&toCity=${route.to}`}
                className="group flex flex-col items-center rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-mint/30 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-mint/30"
              >
                <span className="text-2xl mb-2">{route.emoji}</span>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">{route.from}</p>
                <ArrowRight className="h-3 w-3 text-mint my-0.5" />
                <p className="text-xs font-bold text-zinc-900 dark:text-white">{route.to}</p>
                <p className="mt-2 text-xs font-semibold text-mint">from {route.price} EGP</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 sm:py-24 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal-on-scroll mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Why choose Mashaweer?
            </h2>
            <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
              We prioritize your safety, comfort, and time on every journey.
            </p>
          </div>

          <div className="mx-auto mt-12 sm:mt-16 max-w-2xl lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-6 sm:gap-8 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  name: 'Verified Drivers',
                  description: 'Every driver passes thorough background checks and vehicle inspections for your peace of mind.',
                  icon: ShieldCheck,
                  iconColor: 'text-mint dark:text-mint-light',
                  bg: 'bg-mint/10 dark:bg-mint/10',
                  delay: 'stagger-1',
                },
                {
                  name: 'Instant Booking',
                  description: 'Browse available trips, pick your city pair, and book your seat in seconds with our digital wallet.',
                  icon: Zap,
                  iconColor: 'text-navy dark:text-navy-light',
                  bg: 'bg-navy/10 dark:bg-navy/10',
                  delay: 'stagger-2',
                },
                {
                  name: 'Secure Wallet',
                  description: 'Deposit funds via InstaPay or Vodafone Cash. Book instantly and get automatic refunds on cancellations.',
                  icon: Wallet,
                  iconColor: 'text-slate-dark dark:text-slate-light',
                  bg: 'bg-slate/10 dark:bg-slate/10',
                  delay: 'stagger-3',
                },
              ].map((feature) => (
                <div
                  key={feature.name}
                  className={`reveal-on-scroll ${feature.delay} group flex flex-col items-center rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 text-center shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950`}
                >
                  <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${feature.bg} transition-transform duration-300 group-hover:scale-110`}>
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>
                  <dt className="text-lg font-semibold leading-7 text-zinc-900 dark:text-white">
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-zinc-50 py-16 sm:py-24 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal-on-scroll mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              Testimonials
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              What Our Users Say
            </h2>
          </div>

          <div className="reveal-on-scroll mt-10 sm:mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${s <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-navy to-mint text-xs font-bold text-white">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-navy via-navy-light to-mint py-16 sm:py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA0KSIvPjwvc3ZnPg==')] opacity-60" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center lg:px-8">
          <h2 className="reveal-on-scroll text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to hit the road?
          </h2>
          <p className="reveal-on-scroll mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            Join thousands of riders and drivers across Egypt. Your next trip is just a click away.
          </p>
          <div className="reveal-on-scroll mt-8 sm:mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/register"
              id="cta-get-started"
              className="flex w-full items-center justify-center rounded-2xl bg-white px-8 py-4 text-sm font-bold text-navy shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:w-auto"
            >
              Get Started Free
            </Link>
            <Link
              href="/trips"
              id="cta-browse-trips"
              className="flex w-full items-center justify-center rounded-2xl border border-white/30 px-8 py-4 text-sm font-bold text-white transition-all duration-300 hover:bg-white/10 sm:w-auto"
            >
              Browse Trips
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 py-8 sm:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <Image
              src="/mashaweer-logo.png"
              alt="Mashaweer"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
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
