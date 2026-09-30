'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Compass,
  MapPin,
  Route,
  ShieldCheck,
  Wallet,
  Users,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTranslation } from '@/hooks/useTranslation';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();

  return (
    <div className="home-page">
      <section className="home-hero relative isolate overflow-hidden text-white">
        <div aria-hidden="true" className="home-orb home-orb--one" />
        <div aria-hidden="true" className="home-orb home-orb--two" />
        <div aria-hidden="true" className="home-orb home-orb--three" />

        <div className="relative z-10 mx-auto grid min-h-[min(760px,calc(100svh-3.5rem))] max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-10 lg:py-24">
          <div className="home-enter max-w-2xl text-center lg:text-start">
            <h1 className="text-balance text-4xl font-extrabold leading-[1.2] tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl xl:text-7xl">
              {t('home.hero.title1')}
              <span className="mt-1 block text-emerald-300">{t('home.hero.title2')}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-8 text-slate-100 sm:text-lg lg:mx-0">
              {t('home.hero.subtitle')}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/trips"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-7 py-3 text-base font-bold text-[#062541] shadow-lg shadow-black/15 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#092b4b]"
              >
                {t('home.hero.findRide')}
                <ArrowRight className="h-5 w-5 rtl:rotate-180" />
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/register"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-7 py-3 text-base font-semibold text-white backdrop-blur transition hover:border-white/50 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  {t('home.hero.becomeDriver')}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              )}
            </div>

          </div>

          <div className="home-enter home-enter--delayed relative mx-auto w-full max-w-2xl lg:max-w-none">
            <div className="home-map-panel relative aspect-[1.42/1] overflow-hidden rounded-[1.5rem] border border-white/20 shadow-2xl shadow-black/30 sm:aspect-[1.48/1] sm:rounded-[2rem] lg:aspect-[1.12/1]">
              <div aria-hidden="true" className="home-map-grid absolute inset-0" />
              <div aria-hidden="true" className="home-map-glow home-map-glow--start" />
              <div aria-hidden="true" className="home-map-glow home-map-glow--end" />
              <svg aria-hidden="true" viewBox="0 0 600 460" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
                <path className="home-map-route-glow" d="M82 350 C130 338 150 278 224 294 S318 354 354 269 S433 206 518 118" />
                <path className="home-map-route" d="M82 350 C130 338 150 278 224 294 S318 354 354 269 S433 206 518 118" />
              </svg>
              <span aria-hidden="true" className="home-map-pin home-map-pin--start"><MapPin className="h-5 w-5" /></span>
              <span aria-hidden="true" className="home-map-pin home-map-pin--end"><MapPin className="h-5 w-5" /></span>
              <div className="home-map-label home-map-label--start">{t('home.hero.departure')}</div>
              <div className="home-map-label home-map-label--end">{t('home.hero.destination')}</div>
              <div className="home-map-caption">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/15 text-emerald-200"><Route className="h-5 w-5" /></span>
                <div><p className="text-sm font-bold text-white">{t('home.hero.mapTitle')}</p><p className="mt-1 text-xs leading-5 text-slate-200">{t('home.hero.mapDescription')}</p></div>
              </div>
            </div>
            <div aria-hidden="true" className="absolute -bottom-5 -left-4 -z-10 h-28 w-28 rounded-full border border-emerald-300/20 sm:-left-7 sm:h-40 sm:w-40" />
          </div>
        </div>
      </section>

      <section className="home-section home-section--plain bg-white py-16 sm:py-20" aria-labelledby="how-it-works-title">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="home-kicker"><Compass className="h-4 w-4" />{t('home.howItWorks.badge')}</span>
            <h2 id="how-it-works-title" className="mt-4 text-3xl font-bold tracking-tight text-[#0a2e52] sm:text-4xl">{t('home.howItWorks.title')}</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">{t('home.howItWorks.subtitle')}</p>
          </div>

          <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-5">
            {[
              { icon: MapPin, title: t('home.howItWorks.step1.title'), body: t('home.howItWorks.step1.desc') },
              { icon: CheckCircle2, title: t('home.howItWorks.step2.title'), body: t('home.howItWorks.step2.desc') },
              { icon: Route, title: t('home.howItWorks.step3.title'), body: t('home.howItWorks.step3.desc') },
            ].map(({ icon: Icon, title, body }, index) => (
              <article key={title} className="home-step-card group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100"><Icon className="h-5 w-5" /></span>
                  <span className="text-sm font-bold tracking-widest text-slate-300">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-lg font-bold text-[#0a2e52]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--muted bg-[#f4f7fa] py-16 sm:py-20" aria-labelledby="trust-title">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-10">
          <div className="order-2 overflow-hidden rounded-[1.75rem] shadow-xl lg:order-1">
            <Image src="/verified-driver.png" alt="A Mashaweer driver beside a car" width={1024} height={1024} sizes="(max-width: 1024px) 90vw, 42vw" className="aspect-[1.25/1] w-full object-cover" />
          </div>
          <div className="order-1 lg:order-2">
            <h2 id="trust-title" className="mt-4 whitespace-pre-line text-3xl font-bold leading-tight tracking-tight text-[#0a2e52] sm:text-4xl">{t('home.whyUs.title')}</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">{t('home.whyUs.subtitle')}</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, title: t('home.whyUs.verified.title'), body: t('home.whyUs.verified.desc') },
                { icon: Zap, title: t('home.whyUs.instant.title'), body: t('home.whyUs.instant.desc') },
                { icon: Wallet, title: t('home.whyUs.wallet.title'), body: t('home.whyUs.wallet.desc') },
                { icon: Users, title: t('home.whyUs.commission.title'), body: t('home.whyUs.commission.desc') },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="home-feature-card flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon className="h-4 w-4" /></span>
                  <div><h3 className="text-sm font-bold text-[#0a2e52]">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{body}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="home-driver-cta relative isolate overflow-hidden py-16 text-white sm:py-20" aria-labelledby="driver-title">
          <div aria-hidden="true" className="home-orb home-orb--two" />
          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:gap-12 lg:px-10">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-emerald-100"><Check className="h-4 w-4" />{t('home.driver.badge')}</span>
              <h2 id="driver-title" className="mt-4 whitespace-pre-line text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{t('home.driver.title')}</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-200">{t('home.driver.subtitle')}</p>
            </div>
            <Link href="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-6 py-3 font-bold text-[#062541] shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-200">
              {t('home.driver.cta')}<ArrowRight className="h-5 w-5 rtl:rotate-180" />
            </Link>
          </div>
        </section>
      )}

      <footer className="home-footer border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-3 text-[#0a2e52]">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200"><Image src="/mashaweer-logo.png" alt="" width={40} height={40} className="h-full w-full object-contain" /></span>
            <span className="text-lg font-extrabold">{t('common.mashaweer')}</span>
          </Link>
          <nav aria-label={t('home.footer.quickLinks')} className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-600">
            <Link className="transition hover:text-emerald-800" href="/trips">{t('nav.browseTrips')}</Link>
            <Link className="transition hover:text-emerald-800" href="/help">{t('home.footer.helpCenter')}</Link>
            {!isAuthenticated && <Link className="transition hover:text-emerald-800" href="/login">{t('common.login')}</Link>}
<p className="text-xs text-slate-500">Developed By Eng.Mohamed Fouda </p>

          </nav>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} {t('common.mashaweer')}</p>
        </div>
      </footer>
    </div>
  );
}
