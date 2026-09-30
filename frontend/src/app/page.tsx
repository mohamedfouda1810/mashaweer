'use client';

import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck, MapPin, Wallet, Star, Users, Zap, ArrowRight, CheckCircle, Clock, Route, Sparkles, ChevronRight, Car, Globe, Award, HeartHandshake } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={sectionRef} className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-zinc-50 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8 overflow-hidden min-h-[90vh] sm:min-h-[700px]">
        {/* Background */}
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-[20s] hover:scale-110"
          style={{ backgroundImage: "url('/egypt-highway.png')" }}
        />
        <div className="absolute inset-0 -z-10 bg-navy/90 backdrop-blur-[2px]" />
        
        {/* Liquid Orbs */}
        <div className="liquid-orb bg-emerald/30 -left-20 top-24 blur-[80px]" />
        <div className="liquid-orb-1 bg-amber-500/20 right-[-5rem] top-1/3 blur-[80px]" />
        <div className="liquid-orb-2 bg-emerald/20 left-1/4 bottom-10 blur-[80px]" />

        {/* Glass Logo */}
        <div className="animate-fade-in-up mb-8">
          <div className="glass mx-auto flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-[2rem] shadow-2xl shadow-emerald/20">
            <Image
              src="/mashaweer-logo.png"
              alt={t('common.mashaweer' as any)}
              width={96}
              height={96}
              className="h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-lg"
              priority
            />
          </div>
        </div>

        <h1 className="animate-fade-in-up max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-7xl leading-tight">
          {t('home.hero.title1' as any)} <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald to-teal-400">
            {t('home.hero.title2' as any)}
          </span>
        </h1>

        <p className="animate-fade-in-up delay-100 mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-300 sm:text-xl">
          {t('home.hero.subtitle' as any)}
        </p>

        {/* Trust Badge Row */}
        <div className="animate-fade-in-up delay-200 mt-6 flex flex-wrap justify-center gap-4 text-sm font-medium text-emerald">
          <span className="flex items-center gap-1 bg-emerald/10 px-3 py-1 rounded-full border border-emerald/20 backdrop-blur-md">
            {t('common.verifiedDriver' as any)}
          </span>
          <span className="flex items-center gap-1 bg-emerald/10 px-3 py-1 rounded-full border border-emerald/20 backdrop-blur-md">
            🛡️ {t('home.whyUs.wallet.title' as any)}
          </span>
          <span className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20 backdrop-blur-md">
            ⭐ 4.9 {t('home.stats.rating' as any)}
          </span>
        </div>

        <div className="animate-fade-in-up delay-300 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 w-full px-4 sm:px-0">
          <Link
            href="/trips"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-emerald px-10 py-4 text-lg font-bold text-navy shadow-xl shadow-emerald/30 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
          >
            {t('home.hero.findRide' as any)}
            <ArrowRight className="h-5 w-5 rtl:rotate-180" />
          </Link>
          {!isAuthenticated && (
            <Link
              href="/register"
              className="glass flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl px-10 py-4 text-lg font-bold text-white transition-all duration-300 hover:bg-white/10"
            >
              {t('home.hero.becomeDriver' as any)}
              <Car className="h-5 w-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Wave Divider */}
      <div className="wave-divider text-navy bg-white -mt-1 relative z-10">
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-[60px]">
          <path d="M0,0 C300,60 900,0 1200,60 L1200,0 L0,0 Z" fill="currentColor" />
        </svg>
      </div>

      {/* 2. Stats Bar */}
      <section className="bg-white py-12 relative z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-8">
            {[
              { icon: Users, label: t('home.stats.activeRiders' as any), value: '10K+', color: 'text-emerald' },
              { icon: Star, label: t('home.stats.rating' as any), value: '4.9', color: 'text-amber-500' },
              { icon: Globe, label: t('home.stats.cities' as any), value: '25+', color: 'text-emerald' },
              { icon: Route, label: t('home.stats.tripsCompleted' as any), value: '50K+', color: 'text-emerald' },
            ].map((stat, i) => (
              <div key={i} className="glass-card hover-lift flex flex-col items-center gap-2 rounded-3xl bg-zinc-50 p-6 text-center border border-zinc-100 shadow-sm">
                <div className={`p-3 rounded-2xl bg-white shadow-sm ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-extrabold text-navy">
                  <AnimatedCounter target={stat.value} />
                </div>
                <span className="text-sm font-medium text-zinc-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="bg-zinc-50 py-20 sm:py-28 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal-on-scroll mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-4 py-1.5 text-sm font-semibold text-emerald">
              <Zap className="h-4 w-4" />
              {t('home.howItWorks.badge' as any)}
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy sm:text-5xl">
              {t('home.howItWorks.title' as any)}
            </h2>
            <p className="mt-4 text-base text-zinc-500">
              {t('home.howItWorks.subtitle' as any)}
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3 relative">
            <div className="hidden sm:block absolute top-[45px] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-emerald/10 via-emerald to-emerald/10 opacity-30" />

            {[
              {
                step: '1',
                title: t('home.howItWorks.step1.title' as any),
                description: t('home.howItWorks.step1.desc' as any),
                icon: MapPin,
                delay: 'delay-100',
              },
              {
                step: '2',
                title: t('home.howItWorks.step2.title' as any),
                description: t('home.howItWorks.step2.desc' as any),
                icon: CheckCircle,
                delay: 'delay-200',
              },
              {
                step: '3',
                title: t('home.howItWorks.step3.title' as any),
                description: t('home.howItWorks.step3.desc' as any),
                icon: Route,
                delay: 'delay-300',
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`reveal-on-scroll ${item.delay} hover-lift glass-card relative flex flex-col items-center rounded-3xl bg-white p-8 text-center border border-zinc-100`}
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy text-2xl font-bold text-white shadow-xl shadow-navy/20 z-10 ring-4 ring-white">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="wave-divider text-zinc-50 bg-white">
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-[60px]">
          <path d="M0,0 C300,60 900,0 1200,60 L1200,0 L0,0 Z" fill="currentColor" />
        </svg>
      </div>

      {/* 4. Why Choose Us */}
      <section className="bg-white py-20 sm:py-28 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="reveal-on-scroll">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/10 px-4 py-1.5 text-sm font-semibold text-navy">
                <Award className="h-4 w-4" />
                {t('home.whyUs.badge' as any)}
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy sm:text-5xl whitespace-pre-line">
                {t('home.whyUs.title' as any)}
              </h2>
              <p className="mt-4 text-base text-zinc-600 leading-relaxed">
                {t('home.whyUs.subtitle' as any)}
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {[
                  { icon: ShieldCheck, title: t('home.whyUs.verified.title' as any), desc: t('home.whyUs.verified.desc' as any), bg: 'bg-emerald/10', color: 'text-emerald', border: 'border-emerald/20' },
                  { icon: Zap, title: t('home.whyUs.instant.title' as any), desc: t('home.whyUs.instant.desc' as any), bg: 'bg-amber-500/10', color: 'text-amber-500', border: 'border-amber-500/20' },
                  { icon: Wallet, title: t('home.whyUs.wallet.title' as any), desc: t('home.whyUs.wallet.desc' as any), bg: 'bg-emerald/10', color: 'text-emerald', border: 'border-emerald/20' },
                  { icon: HeartHandshake, title: t('home.whyUs.commission.title' as any), desc: t('home.whyUs.commission.desc' as any), bg: 'bg-navy/10', color: 'text-navy', border: 'border-navy/20' },
                ].map((feature, idx) => (
                  <div key={idx} className={`glass-card p-5 rounded-2xl border ${feature.border} hover:shadow-md transition-shadow bg-white`}>
                    <div className={`mb-4 inline-flex p-3 rounded-xl ${feature.bg} ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-navy mb-1">{feature.title}</h3>
                    <p className="text-sm text-zinc-500 leading-snug">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal-on-scroll delay-200 relative lg:ml-auto">
              <div className="relative overflow-hidden rounded-[2rem] shadow-2xl border-4 border-white">
                <Image
                  src="/happy-passengers.png"
                  alt="Happy passengers"
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
              
              {/* Floating Badges */}
              <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-4 shadow-xl border border-zinc-100 flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="bg-emerald/10 p-3 rounded-full">
                  <ShieldCheck className="h-8 w-8 text-emerald" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-navy">100%</p>
                  <p className="text-sm font-medium text-zinc-500">{t('home.whyUs.verifiedBadge' as any)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Popular Routes */}
      <section className="bg-zinc-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal-on-scroll mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-4 py-1.5 text-sm font-semibold text-emerald">
              <Route className="h-4 w-4" />
              {t('home.routes.badge' as any)}
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              {t('home.routes.title' as any)}
            </h2>
            <p className="mt-3 text-base text-zinc-500">
              {t('home.routes.subtitle' as any)}
            </p>
          </div>

          <div className="reveal-on-scroll delay-100 mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_ROUTES.map((route, i) => (
              <Link
                key={i}
                href={`/trips?fromCity=${route.from}&toCity=${route.to}`}
                className="hover-lift glass-card group flex items-center justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm hover:border-emerald/30"
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl transition-transform duration-300 group-hover:scale-110">
                    {route.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-navy">{route.from}</p>
                      <ArrowRight className="h-4 w-4 text-emerald rtl:rotate-180" />
                      <p className="font-bold text-navy">{route.to}</p>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">
                      {t('home.routes.from' as any)} <span className="font-bold text-emerald">{route.price} {t('common.egp' as any)}</span>
                    </p>
                  </div>
                </div>
                <div className="bg-zinc-50 p-3 rounded-full group-hover:bg-emerald group-hover:text-white transition-colors text-zinc-400">
                  <ChevronRight className="h-5 w-5 rtl:rotate-180" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Driver CTA Section */}
      {!isAuthenticated && (
        <section className="bg-navy py-20 sm:py-28 relative overflow-hidden">
          <div className="liquid-orb bg-emerald/20 right-0 top-0 blur-[100px] h-96 w-96" />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="reveal-on-scroll relative order-2 lg:order-1">
                <div className="relative overflow-hidden rounded-[2rem] shadow-2xl border-4 border-navy-light/30">
                  <Image
                    src="/verified-driver.png"
                    alt="Driver"
                    width={600}
                    height={500}
                    className="w-full h-auto object-cover opacity-90"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 rounded-3xl bg-white p-6 shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="bg-amber-500/10 p-4 rounded-2xl">
                      <Wallet className="h-8 w-8 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-navy">+5K {t('common.egp' as any)}</p>
                      <p className="text-sm text-zinc-500">{t('home.driver.avgEarning' as any)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="reveal-on-scroll delay-200 order-1 lg:order-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/20 px-4 py-1.5 text-sm font-semibold text-emerald border border-emerald/30">
                  <Car className="h-4 w-4" />
                  {t('home.driver.badge' as any)}
                </span>
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-5xl whitespace-pre-line leading-tight">
                  {t('home.driver.title' as any)}
                </h2>
                <p className="mt-6 text-lg text-zinc-300 leading-relaxed">
                  {t('home.driver.subtitle' as any)}
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    t('home.driver.point1' as any),
                    t('home.driver.point2' as any),
                    t('home.driver.point3' as any),
                    t('home.driver.point4' as any),
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-base text-zinc-200">
                      <CheckCircle className="h-6 w-6 flex-shrink-0 text-emerald" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-emerald px-8 py-4 text-lg font-bold text-navy shadow-lg transition-all hover:scale-105 hover:bg-emerald/90"
                >
                  {t('home.driver.cta' as any)}
                  <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Wave Divider (only needed if Driver section rendered, but let's just make testimonials bg white) */}

      {/* 7. Testimonials */}
      <section className="bg-white py-20 sm:py-28 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal-on-scroll mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-semibold text-amber-500">
              <Sparkles className="h-4 w-4" />
              {t('home.testimonials.badge' as any)}
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              {t('home.testimonials.title' as any)}
            </h2>
            <p className="mt-3 text-base text-zinc-500">
              {t('home.testimonials.subtitle' as any)}
            </p>
          </div>

          <div className="reveal-on-scroll delay-100 mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((t_item, i) => (
              <div
                key={i}
                className={`glass-card transition-all duration-500 rounded-3xl p-6 border ${
                  i === activeTestimonial
                    ? 'border-emerald/40 shadow-xl shadow-emerald/5 scale-[1.02] bg-white'
                    : 'border-zinc-100 bg-zinc-50/50 hover:bg-white hover:border-zinc-200'
                }`}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${s <= t_item.rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-200'}`} />
                  ))}
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed mb-6 min-h-[80px]">
                  &ldquo;{t_item.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-zinc-100 pt-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-sm font-bold text-emerald shadow-inner">
                    {t_item.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy">{t_item.name}</p>
                    <p className="text-xs text-zinc-500">{t_item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-10">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === activeTestimonial ? 'w-10 bg-emerald' : 'w-2.5 bg-zinc-200 hover:bg-zinc-300'
                }`}
                aria-label={`Show testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="gradient-cta relative overflow-hidden bg-navy py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/90 to-emerald/80" />
        <div className="liquid-orb-3 bg-white/10 absolute -top-32 -right-32 blur-[100px] h-96 w-96 rounded-full" />
        <div className="liquid-orb-2 bg-emerald/20 absolute -bottom-32 -left-32 blur-[100px] h-96 w-96 rounded-full" />
        
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center lg:px-8">
          <h2 className="reveal-on-scroll text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            {t('home.cta.title' as any)}
          </h2>
          <p className="reveal-on-scroll delay-100 mx-auto mt-6 max-w-xl text-lg text-zinc-200">
            {t('home.cta.subtitle' as any)}
          </p>
          <div className="reveal-on-scroll delay-200 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isAuthenticated ? (
              <Link
                href="/trips"
                className="flex w-full sm:w-auto items-center justify-center rounded-2xl bg-emerald px-10 py-4 text-lg font-bold text-navy shadow-xl shadow-emerald/30 transition-transform hover:scale-105"
              >
                {t('home.cta.browseTrips' as any)}
              </Link>
            ) : (
              <Link
                href="/register"
                className="flex w-full sm:w-auto items-center justify-center rounded-2xl bg-emerald px-10 py-4 text-lg font-bold text-navy shadow-xl shadow-emerald/30 transition-transform hover:scale-105"
              >
                {t('home.cta.getStarted' as any)}
              </Link>
            )}
            <Link
              href="/trips"
              className="glass flex w-full sm:w-auto items-center justify-center rounded-2xl px-10 py-4 text-lg font-bold text-white transition-colors hover:bg-white/10 border border-white/20"
            >
              {t('home.cta.browseTrips' as any)}
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="glass-nav border-t border-zinc-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src="/mashaweer-logo.png"
                  alt={t('common.mashaweer' as any)}
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain drop-shadow-sm"
                />
                <span className="text-2xl font-extrabold text-navy">{t('common.mashaweer' as any)}</span>
              </div>
              <p className="text-sm text-zinc-500 max-w-sm mb-6 leading-relaxed">
                {t('home.footer.desc' as any)}
              </p>
              <div className="flex gap-3 text-xs font-semibold text-emerald">
                <span className="bg-emerald/10 px-3 py-1.5 rounded-full border border-emerald/20">
                  {t('common.secureEncrypted' as any)}
                </span>
                <span className="bg-emerald/10 px-3 py-1.5 rounded-full border border-emerald/20">
                  {t('common.support247' as any)}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-navy uppercase tracking-wider">{t('home.footer.quickLinks' as any)}</h3>
              <nav className="flex flex-col gap-3">
                <Link href="/trips" className="text-sm font-medium text-zinc-500 hover:text-emerald transition-colors">{t('nav.browseTrips' as any)}</Link>
                <Link href="/register" className="text-sm font-medium text-zinc-500 hover:text-emerald transition-colors">{t('common.register' as any)}</Link>
                <Link href="/login" className="text-sm font-medium text-zinc-500 hover:text-emerald transition-colors">{t('common.login' as any)}</Link>
                <Link href="/help" className="text-sm font-medium text-zinc-500 hover:text-emerald transition-colors">{t('home.footer.helpCenter' as any)}</Link>
              </nav>
            </div>
            
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-navy uppercase tracking-wider">{t('home.footer.contact' as any)}</h3>
              <div className="flex flex-col gap-3 text-sm font-medium text-zinc-500">
                <p>support@mashaweer.com</p>
                <p>Cairo, Egypt</p>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-zinc-200 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm font-medium text-zinc-400">
              © {new Date().getFullYear()} {t('common.mashaweer' as any)}. {t('home.footer.rights' as any)}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
