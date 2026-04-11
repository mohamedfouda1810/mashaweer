'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck, MapPin, Wallet, Star, Users, Zap, ArrowRight, CheckCircle, Clock, Route, Sparkles, ChevronRight, Car, Globe, Award, HeartHandshake } from "lucide-react";

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
  { from: 'Cairo', to: 'Alexandria', emoji: '🏛️', price: '150', img: '/egypt-highway.png' },
  { from: 'Cairo', to: 'Mansoura', emoji: '🌿', price: '120', img: '/egypt-highway.png' },
  { from: 'Cairo', to: 'Tanta', emoji: '🕌', price: '80', img: '/egypt-highway.png' },
  { from: 'Alexandria', to: 'Marsa Matrouh', emoji: '🏖️', price: '200', img: '/egypt-highway.png' },
  { from: 'Cairo', to: 'Ismailia', emoji: '⛵', price: '100', img: '/egypt-highway.png' },
  { from: 'Cairo', to: 'Suez', emoji: '🚢', price: '90', img: '/egypt-highway.png' },
];

const TESTIMONIALS = [
  { name: 'Ahmed M.', role: 'Regular Passenger', text: 'Best ride-sharing platform in Egypt. Always find reliable drivers and the booking process is incredibly smooth.', rating: 5, avatar: 'AM' },
  { name: 'Sara K.', role: 'Daily Commuter', text: 'Safe, comfortable, and affordable. Mashaweer changed how I travel between cities. I save so much time!', rating: 5, avatar: 'SK' },
  { name: 'Omar H.', role: 'Verified Driver', text: 'Great earning opportunity. The platform is easy to use and the commission structure is fair and transparent.', rating: 5, avatar: 'OH' },
  { name: 'Nour A.', role: 'Student', text: 'As a university student, Mashaweer is a lifesaver! Affordable rides between home and university every weekend.', rating: 5, avatar: 'NA' },
];

export default function Home() {
  const sectionRef = useRevealOnScroll();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={sectionRef} className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* ══════════ Hero Section ══════════ */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8 overflow-hidden min-h-[90vh] sm:min-h-[700px]">
        {/* Background */}
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-[20s] hover:scale-110"
          style={{ backgroundImage: "url('/egypt-highway.png')" }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-dark/95 via-navy/90 to-navy-dark/95" />
        <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-60" />

        {/* Floating road decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/5 to-transparent -z-5" />

        {/* Logo */}
        <div className="animate-fade-in-up mb-8">
          <div className="mx-auto flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl shadow-mint/20 border border-white/15 animate-pulse-glow">
            <Image
              src="/mashaweer-logo.png"
              alt="Mashaweer"
              width={96}
              height={96}
              className="h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-lg"
              priority
            />
          </div>
        </div>

        <h1 className="animate-fade-in-up mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
          طريقك الأذكى <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-mint-light via-emerald-300 to-mint animate-gradient-shift">
            والأقرب
          </span>
        </h1>

        <p className="animate-fade-in-up stagger-2 mx-auto mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
          Egypt's #1 inter-city ride-sharing platform. Connect with verified drivers,
          book seats instantly, and travel safely between cities.
        </p>

        <div className="animate-fade-in-up stagger-3 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/trips"
            id="hero-find-ride"
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-mint to-mint-light px-10 py-4 text-base font-bold text-white shadow-xl shadow-mint/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-mint/40 sm:w-auto"
          >
            Find a Ride
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/register"
            id="hero-become-driver"
            className="group flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-white/25 bg-white/8 px-10 py-4 text-base font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:border-white/40 hover:shadow-lg sm:w-auto"
          >
            Become a Driver
            <Car className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="animate-fade-in-up stagger-4 mt-16 sm:mt-20 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {[
            { icon: Users, label: 'Active Riders', value: '10K+', color: 'text-mint-light' },
            { icon: Star, label: 'Rating', value: '4.9', color: 'text-amber-400' },
            { icon: Globe, label: 'Cities', value: '15+', color: 'text-sky-400' },
            { icon: Car, label: 'Trips Completed', value: '50K+', color: 'text-mint-light' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span className="text-2xl font-extrabold text-white">{stat.value}</span>
              <span className="text-xs text-white/50">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ Photo Strip ══════════ */}
      <section className="relative -mt-1 overflow-hidden bg-gradient-to-r from-navy via-mint to-navy py-1">
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-mint/80 to-navy opacity-90" />
      </section>

      {/* ══════════ How it Works ══════════ */}
      <section className="bg-white py-20 sm:py-28 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal-on-scroll mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/10 px-4 py-1.5 text-sm font-semibold text-mint">
              <Zap className="h-3.5 w-3.5" />
              Simple Process
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
              How it Works
            </h2>
            <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
              Get started in three easy steps
            </p>
          </div>

          <div className="mx-auto mt-16 sm:mt-20 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3 relative">
            {/* Connector Line */}
            <div className="hidden sm:block absolute top-[60px] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-navy via-mint to-navy-light opacity-30" />

            {[
              {
                step: '1',
                title: 'Search Trips',
                description: 'Browse available trips between cities and find the perfect ride for your schedule.',
                icon: MapPin,
                gradient: 'from-navy to-navy-light',
                delay: 'stagger-1',
              },
              {
                step: '2',
                title: 'Book Your Seat',
                description: 'Select seats, pay from your wallet, and confirm your booking instantly.',
                icon: CheckCircle,
                gradient: 'from-mint to-mint-light',
                delay: 'stagger-2',
              },
              {
                step: '3',
                title: 'Enjoy the Ride',
                description: 'Meet your verified driver at the gathering point and travel safely.',
                icon: Route,
                gradient: 'from-navy-light to-mint',
                delay: 'stagger-3',
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`reveal-on-scroll ${item.delay} group relative flex flex-col items-center rounded-3xl border border-zinc-100 bg-white p-8 text-center shadow-sm transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl dark:bg-zinc-900 dark:border-zinc-800`}
              >
                {/* Step Number - Floating */}
                <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${item.gradient} text-3xl font-bold text-white shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ Why Choose Us + Photo ══════════ */}
      <section className="bg-zinc-50 py-20 sm:py-28 dark:bg-zinc-900 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Left - Content */}
            <div className="reveal-on-scroll">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/10 px-4 py-1.5 text-sm font-semibold text-navy dark:text-navy-light dark:bg-navy/20">
                <Award className="h-3.5 w-3.5" />
                Why Mashaweer
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                Travel smarter,<br />not harder
              </h2>
              <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                We've built the most trusted inter-city ride-sharing platform in Egypt, 
                prioritizing your safety, comfort, and wallet on every journey.
              </p>

              <div className="mt-8 space-y-5">
                {[
                  { icon: ShieldCheck, title: 'Verified Drivers', desc: 'Background checks and vehicle inspections', color: 'text-mint bg-mint/10' },
                  { icon: Zap, title: 'Instant Booking', desc: 'Browse and book your seat in seconds', color: 'text-navy bg-navy/10' },
                  { icon: Wallet, title: 'Secure Wallet', desc: 'InstaPay & Vodafone Cash deposits', color: 'text-amber-600 bg-amber-100' },
                  { icon: HeartHandshake, title: 'Fair Commission', desc: 'Transparent pricing, no hidden fees', color: 'text-rose-600 bg-rose-100' },
                ].map((feature) => (
                  <div key={feature.title} className="group flex items-start gap-4 rounded-2xl p-3 transition-all hover:bg-white hover:shadow-md dark:hover:bg-zinc-800">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${feature.color} transition-transform group-hover:scale-110`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-white">{feature.title}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Photo */}
            <div className="reveal-on-scroll stagger-2 relative">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src="/happy-passengers.png"
                  alt="Happy passengers sharing a ride"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent" />
              </div>
              {/* Floating Stats Card */}
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 rounded-2xl bg-white p-4 shadow-xl border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint/10">
                    <ShieldCheck className="h-6 w-6 text-mint" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">100%</p>
                    <p className="text-xs text-zinc-500">Verified Drivers</p>
                  </div>
                </div>
              </div>
              {/* Floating Rating Card */}
              <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 rounded-2xl bg-white p-3 shadow-xl border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">4.9</span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">Average rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ Popular Routes ══════════ */}
      <section className="bg-white py-20 sm:py-28 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal-on-scroll mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/10 px-4 py-1.5 text-sm font-semibold text-navy dark:text-navy-light dark:bg-navy/20">
              <Route className="h-3.5 w-3.5" />
              Popular Routes
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Top Destinations
            </h2>
            <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
              Most traveled routes by our community
            </p>
          </div>

          <div className="reveal-on-scroll mt-12 sm:mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {POPULAR_ROUTES.map((route, i) => (
              <Link
                key={i}
                href={`/trips?fromCity=${route.from}&toCity=${route.to}`}
                className="group flex flex-col items-center rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-mint/30 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-mint/30"
              >
                <span className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-125">{route.emoji}</span>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">{route.from}</p>
                <div className="my-1 flex items-center gap-1">
                  <div className="h-0.5 w-3 bg-mint/40 rounded" />
                  <ArrowRight className="h-3 w-3 text-mint" />
                  <div className="h-0.5 w-3 bg-mint/40 rounded" />
                </div>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">{route.to}</p>
                <p className="mt-3 text-sm font-bold text-mint">from {route.price} EGP</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ Driver CTA Section ══════════ */}
      <section className="bg-zinc-50 py-20 sm:py-28 dark:bg-zinc-900 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Left - Photo */}
            <div className="reveal-on-scroll relative order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src="/verified-driver.png"
                  alt="Verified Mashaweer driver"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/30 to-transparent" />
              </div>
              {/* Floating Earning Card */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 rounded-2xl bg-white p-4 shadow-xl border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint/10">
                    <Wallet className="h-6 w-6 text-mint" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-zinc-900 dark:text-white">+5K EGP</p>
                    <p className="text-xs text-zinc-500">Avg. monthly earning</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div className="reveal-on-scroll stagger-2 order-1 lg:order-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/10 px-4 py-1.5 text-sm font-semibold text-mint">
                <Car className="h-3.5 w-3.5" />
                For Drivers
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                Drive with Mashaweer,<br />earn your way
              </h2>
              <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Turn your daily commute into an earning opportunity. Set your own schedule, 
                pick your routes, and get paid for the trips you're already making.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Set your own schedule and routes',
                  'Transparent commission structure',
                  'Instant wallet payouts',
                  'Interactive map for easy trip creation',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-mint" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-navy to-navy-light px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                Start Driving Today
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ Testimonials ══════════ */}
      <section className="bg-white py-20 sm:py-28 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal-on-scroll mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              Testimonials
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Loved by thousands
            </h2>
            <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
              See what our riders and drivers have to say
            </p>
          </div>

          <div className="reveal-on-scroll mt-12 sm:mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className={`group rounded-3xl border bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl dark:bg-zinc-950 ${
                  i === activeTestimonial
                    ? 'border-mint/40 shadow-mint/10 scale-[1.02]'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${s <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`} />
                  ))}
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-5 min-h-[60px]">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-navy to-mint text-sm font-bold text-white shadow-md">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeTestimonial ? 'w-8 bg-mint' : 'w-2 bg-zinc-300 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA Section ══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-light to-mint py-20 sm:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA0KSIvPjwvc3ZnPg==')] opacity-60" />
        {/* Animated circles */}
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-mint/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center lg:px-8">
          <h2 className="reveal-on-scroll text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to hit the road?
          </h2>
          <p className="reveal-on-scroll mx-auto mt-5 max-w-xl text-base text-white/75 sm:text-lg">
            Join thousands of riders and drivers across Egypt. Your next trip is just a click away.
          </p>
          <div className="reveal-on-scroll mt-10 sm:mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              id="cta-get-started"
              className="flex w-full items-center justify-center rounded-2xl bg-white px-10 py-4 text-base font-bold text-navy shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl sm:w-auto"
            >
              Get Started Free
            </Link>
            <Link
              href="/trips"
              id="cta-browse-trips"
              className="flex w-full items-center justify-center rounded-2xl border-2 border-white/30 px-10 py-4 text-base font-bold text-white transition-all duration-300 hover:bg-white/10 sm:w-auto"
            >
              Browse Trips
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ Footer ══════════ */}
      <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/mashaweer-logo.png"
                  alt="Mashaweer"
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                />
                <span className="text-lg font-bold text-zinc-900 dark:text-white">Mashaweer</span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 max-w-xs">
                Egypt's trusted inter-city ride-sharing platform. Safe, affordable, and convenient.
              </p>
            </div>
            {/* Links */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Quick Links</h3>
              <Link href="/trips" className="text-sm text-zinc-500 hover:text-mint transition-colors">Browse Trips</Link>
              <Link href="/register" className="text-sm text-zinc-500 hover:text-mint transition-colors">Register</Link>
              <Link href="/login" className="text-sm text-zinc-500 hover:text-mint transition-colors">Login</Link>
              <Link href="/help" className="text-sm text-zinc-500 hover:text-mint transition-colors">Help Center</Link>
            </div>
            {/* Contact */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Contact</h3>
              <p className="text-sm text-zinc-500">support@mashaweer.com</p>
              <p className="text-sm text-zinc-500">Cairo, Egypt</p>
            </div>
          </div>
          <div className="mt-8 border-t border-zinc-200 pt-6 text-center dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              © {new Date().getFullYear()} Mashaweer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
