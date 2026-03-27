'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Search,
    ChevronDown,
    ChevronUp,
    MessageCircle,
    Mail,
    Phone,
    User,
    Send,
    MapPin,
    HelpCircle,
    Shield,
    Clock,
    CreditCard,
    XCircle,
    Heart,
    Car,
} from 'lucide-react';

const FAQS = [
    {
        q: 'اى هى خدمة مشاويرك؟',
        a: 'مشاوير هي منصة لمشاركة الرحلات بين المدن في مصر. بنوصل الركاب بسائقين موثوقين عشان يسافروا براحة وأمان وبأسعار معقولة. كل السائقين عندنا متحققين ومعتمدين.',
    },
    {
        q: 'إزاي أستخدم الخدمة؟',
        a: 'ببساطة سجل حساب جديد، ابحث عن الرحلات المتاحة من مدينتك للمدينة اللي عايز تروحها، اختار الرحلة المناسبة واحجز مقعدك. هتلاقي كل تفاصيل الرحلة والسائق قبل ما تحجز.',
    },
    {
        q: 'هل الخدمة آمنة؟',
        a: 'أيوه! سلامتك أولويتنا. كل السائقين بيتم التحقق من هويتهم ورخصهم وسياراتهم قبل قبولهم. كمان بنوفر نظام تقييم يساعدك تختار أحسن سائق. لو حصلت أي مشكلة، فريق الدعم موجود ٢٤/٧.',
    },
    {
        q: 'هل اقدر اللغى الرحله ؟',
        a: 'أيوه، تقدر تلغي الرحلة قبل موعدها بساعة على الأقل واسترداد كامل المبلغ. لو الإلغاء كان قبل أقل من ساعة، ممكن يتم خصم جزء من المبلغ حسب سياسة الإلغاء.',
    },
    {
        q: 'الدفع بيكون إزاي؟',
        a: 'الدفع بيكون من خلال المحفظة الرقمية في التطبيق. تقدر تشحن محفظتك عن طريق InstaPay أو فودافون كاش. المبلغ بيتخصم تلقائياً لما بتحجز مقعد.',
    },
    {
        q: 'لو حصل مشكلة أعمل إيه؟',
        a: 'تقدر تتواصل معانا فوراً من خلال واتساب أو الإيميل أو نموذج الاتصال الموجود في الصفحة دي. فريق الدعم بتاعنا هيساعدك في أي مشكلة في أسرع وقت.',
    },
    {
        q: 'لى استخدم موقع مشاوير؟',
        a: 'مشاوير بتوفرلك رحلات آمنة ومريحة بين المدن بأسعار معقولة. بدل ما تدور على أي سائق، عندنا سائقين متحققين وموثوقين. كمان بتقدر تقارن الأسعار وتختار أحسن رحلة ليك. المنصة سهلة الاستخدام وبتوفرلك وقت ومجهود.',
    },
];

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [contactForm, setContactForm] = useState({ name: '', phone: '', message: '' });
    const [formSubmitted, setFormSubmitted] = useState(false);

    const filteredFaqs = searchQuery.trim()
        ? FAQS.filter(
              (faq) =>
                  faq.q.includes(searchQuery) || faq.a.includes(searchQuery)
          )
        : FAQS;

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormSubmitted(true);
        setContactForm({ name: '', phone: '', message: '' });
        setTimeout(() => setFormSubmitted(false), 4000);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-dark to-navy px-4 py-16 text-center sm:py-24">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-60" />
                <div className="relative mx-auto max-w-3xl">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-mint/20 backdrop-blur-sm">
                        <HelpCircle className="h-8 w-8 text-mint-light" />
                    </div>
                    <h1 className="text-3xl font-bold text-white sm:text-5xl">
                        كيف نقدر نساعدك؟
                    </h1>
                    <p className="mt-4 text-lg text-slate-light/80">
                        ابحث عن إجابتك أو تصفح الأسئلة الشائعة
                    </p>

                    {/* Search Bar */}
                    <div className="relative mx-auto mt-8 max-w-xl">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث عن سؤالك..."
                            dir="rtl"
                            className="w-full rounded-2xl border border-white/10 bg-white/10 py-4 pl-12 pr-5 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:border-mint/50 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-mint/30"
                        />
                    </div>

                    {/* CTA */}
                    <Link
                        href="/trips"
                        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-mint px-8 py-3.5 font-semibold text-white shadow-lg shadow-mint/20 transition-all hover:scale-105 hover:bg-mint-light hover:shadow-xl"
                    >
                        <MapPin className="h-5 w-5" />
                        Find a Ride
                    </Link>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
                <div className="mb-10 text-center">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
                        الأسئلة الشائعة
                    </h2>
                    <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                        أجوبة لأكثر الأسئلة اللي بتتسأل
                    </p>
                </div>

                <div className="space-y-3" dir="rtl">
                    {filteredFaqs.map((faq, index) => (
                        <div
                            key={index}
                            className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all hover:border-mint/30 dark:border-zinc-800 dark:bg-zinc-900"
                        >
                            <button
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                className="flex w-full items-center justify-between gap-4 p-5 text-right transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                            >
                                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 sm:text-base">
                                    {faq.q}
                                </span>
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${openFaq === index ? 'bg-mint text-white rotate-180' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'}`}>
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </button>
                            {openFaq === index && (
                                <div className="animate-fade-in border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-800/30">
                                    <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                                        {faq.a}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredFaqs.length === 0 && (
                        <div className="py-12 text-center">
                            <Search className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                            <p className="mt-3 text-zinc-500">مفيش نتائج. جرب كلمات تانية.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Contact Section */}
            <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-10 text-center">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
                            تواصل معانا
                        </h2>
                        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                            فريق الدعم موجود عشان يساعدك
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Quick Contact Buttons */}
                        <div className="space-y-4">
                            <a
                                href="https://wa.me/201000000000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-green-300 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-green-600"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 transition-transform group-hover:scale-110 dark:bg-green-900/30">
                                    <MessageCircle className="h-7 w-7 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                        WhatsApp
                                    </h3>
                                    <p className="text-sm text-zinc-500">رد فوري على واتساب</p>
                                </div>
                            </a>

                            <a
                                href="mailto:support@mashaweer.com"
                                className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-navy/30 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-navy"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 transition-transform group-hover:scale-110 dark:bg-blue-900/30">
                                    <Mail className="h-7 w-7 text-navy" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                        Email
                                    </h3>
                                    <p className="text-sm text-zinc-500">support@mashaweer.com</p>
                                </div>
                            </a>
                        </div>

                        {/* Contact Form */}
                        <form
                            onSubmit={handleContactSubmit}
                            className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800"
                        >
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                أرسل رسالة
                            </h3>
                            {formSubmitted && (
                                <div className="rounded-lg bg-mint/10 p-3 text-sm text-mint-dark dark:text-mint-light">
                                    ✓ تم إرسال رسالتك بنجاح! هنتواصل معاك قريب.
                                </div>
                            )}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    الاسم
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        required
                                        value={contactForm.name}
                                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                        placeholder="اسمك الكامل"
                                        dir="rtl"
                                        className="w-full rounded-xl border border-zinc-300 bg-white py-3 pl-10 pr-4 text-sm transition-colors focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    رقم الموبايل
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        required
                                        type="tel"
                                        value={contactForm.phone}
                                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                        placeholder="01xxxxxxxxx"
                                        className="w-full rounded-xl border border-zinc-300 bg-white py-3 pl-10 pr-4 text-sm transition-colors focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    الرسالة
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                    placeholder="اكتب رسالتك هنا..."
                                    dir="rtl"
                                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm transition-colors focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                                />
                            </div>
                            <button
                                type="submit"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3 text-sm font-semibold text-white transition-all hover:bg-navy-light hover:shadow-lg active:scale-[0.98]"
                            >
                                <Send className="h-4 w-4" />
                                إرسال
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="bg-gradient-to-r from-mint to-navy px-4 py-16 text-center">
                <div className="mx-auto max-w-2xl">
                    <Car className="mx-auto mb-4 h-12 w-12 text-white/80" />
                    <h2 className="text-2xl font-bold text-white sm:text-3xl">
                        جاهز تبدأ رحلتك؟
                    </h2>
                    <p className="mt-3 text-lg text-white/80">
                        اكتشف رحلات آمنة ومريحة بين المدن
                    </p>
                    <Link
                        href="/trips"
                        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-10 py-4 font-bold text-navy shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                    >
                        <MapPin className="h-5 w-5" />
                        Find a Ride
                    </Link>
                </div>
            </section>
        </div>
    );
}
