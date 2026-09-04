'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
    ShieldCheck,
    Car,
    Wallet,
    CheckCircle2,
    Clock,
    Users,
    ArrowLeft,
    TrendingUp,
    ChevronDown,
    ChevronUp,
    Navigation,
    UserCheck,
    GraduationCap,
} from 'lucide-react';

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
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );
        const children = el.querySelectorAll('.reveal-on-scroll');
        children.forEach((child) => observer.observe(child));
        return () => observer.disconnect();
    }, []);
    return ref;
}

export default function DriversLandingPage() {
    const sectionRef = useRevealOnScroll();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [seatsCount, setSeatsCount] = useState<number>(3);
    const [tripsPerWeek, setTripsPerWeek] = useState<number>(5);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const estimatedMonthly = Math.round(seatsCount * 35 * 2 * (tripsPerWeek * 4));

    return (
        <div
            ref={sectionRef}
            dir="rtl"
            style={{ fontFamily: "'Cairo', 'Inter', system-ui, sans-serif" }}
            className="flex min-h-screen flex-col overflow-x-hidden"
        >
            {/* ══════════ HERO — always dark navy background ══════════ */}
            <section className="relative flex flex-col items-center justify-center px-4 pt-12 pb-20 text-center sm:px-6 lg:px-8 overflow-hidden min-h-[90vh]">
                <div
                    className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat scale-105 opacity-25"
                    style={{ backgroundImage: "url('/egypt-highway.png')" }}
                />
                <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(to bottom, #0F2D4F 0%, #1A4270 50%, #0F2D4F 100%)' }} />

                {/* Ambient glows */}
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl" style={{ background: 'rgba(4,160,86,0.20)' }} />
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl" style={{ background: 'rgba(43,90,140,0.35)' }} />

                <div className="mx-auto max-w-4xl pt-6 relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-bold mb-6 animate-pulse-glow"
                        style={{ border: '1px solid rgba(47,191,120,0.4)', background: 'rgba(47,191,120,0.12)', color: '#2FBF78' }}>
                        <GraduationCap className="h-4 w-4 shrink-0" />
                        <span className="tracking-wide" style={{ color: '#2FBF78' }}>منصة مشاركة الرحلات الأولى لطلاب وأعضاء الجامعة الأهلية</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-snug sm:leading-tight" style={{ color: '#ffffff' }}>
                        طالع الجامعة الأهلية{' '}
                        <span className="animate-gradient-shift bg-gradient-to-r from-mint-light via-emerald-300 to-mint bg-clip-text text-transparent">
                            بعربيتك؟
                        </span>
                    </h1>

                    {/* Sub-headline */}
                    <p className="mt-4 text-lg sm:text-2xl font-black leading-relaxed max-w-3xl mx-auto" style={{ color: '#f1f5f9' }}>
                        غطّى مصاريفك واعمل دخل إضافى من كراسى عربيتك الفاضية 🚗💰
                    </p>
                    <p className="mt-3 text-base sm:text-lg font-semibold leading-relaxed max-w-2xl mx-auto" style={{ color: '#cbd5e1' }}>
                        شارك مشوارك اليومي مع طلاب وزمايل موثقين بنفس خط سيرك وبدون خروج عن الطريق أو انتظار.
                    </p>

                    {/* Quick badges */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
                        {[
                            { icon: <Navigation className="h-5 w-5" />, text: 'نفس الطريق (بدون تلفيف)' },
                            { icon: <Users className="h-5 w-5" />, text: 'زملاء جامعة واحدة موثقين' },
                            { icon: <Clock className="h-5 w-5" />, text: 'تسجيل بياناتك فى دقيقة' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center sm:justify-center gap-2.5 rounded-xl p-3.5"
                                style={{ border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.09)' }}>
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                                    style={{ background: 'rgba(4,160,86,0.25)', color: '#2FBF78' }}>
                                    {item.icon}
                                </div>
                                <span className="text-sm font-bold" style={{ color: '#ffffff' }}>{item.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                        <Link
                            href="/register?role=driver"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-4 text-lg font-black transition-all duration-300 hover:scale-105 active:scale-95 group"
                            style={{ background: 'linear-gradient(to right, #04A056, #2FBF78)', color: '#ffffff', boxShadow: '0 20px 40px rgba(4,160,86,0.30)' }}
                        >
                            <span>سجّل بيانات عربيتك وابدأ مجاناً</span>
                            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        </Link>
                        <a
                            href="#trust-safety"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold transition-all active:scale-95"
                            style={{ border: '1px solid rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.12)', color: '#ffffff' }}
                        >
                            <ShieldCheck className="h-5 w-5" style={{ color: '#2FBF78' }} />
                            <span>لماذا مشاوير آمنة ومضمونة؟</span>
                        </a>
                    </div>

                    {/* Trust strip */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-6 pt-8 text-xs sm:text-sm font-semibold"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.14)', color: '#e2e8f0' }}>
                        {['100% تسجيل مجاني بدون رسوم', 'تحصيل أرباحك كاش أو محفظة فوراً', 'فحص وتوثيق هوية جميع الركاب'].map((t, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: '#2FBF78' }} />
                                <span>{t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ TRUST & SAFETY — light grey background ══════════ */}
            <section id="trust-safety" className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: '#f8fafc' }}>
                <div className="mx-auto max-w-5xl">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="inline-block text-sm font-black uppercase tracking-wider mb-2" style={{ color: '#038A48' }}>
                            أمان كامل وراحة بال
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black" style={{ color: '#0f172a' }}>
                            ليه السواقة مع مشاوير آمنة ومريحة 100%؟
                        </h2>
                        <p className="mt-3 text-base sm:text-lg font-medium" style={{ color: '#475569' }}>
                            صممنا المنصة مخصوص عشان تديك أعلى مستويات الأمان والراحة في مشوارك اليومي للجامعة
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            {
                                icon: <UserCheck className="h-7 w-7" style={{ color: '#04A056' }} />,
                                iconBg: 'rgba(4,160,86,0.10)',
                                title: 'ركابك طلاب فى نفس الجامعة',
                                desc: 'كل ركب معاك موثق بهويته وشريحته الجامعية. هتسافر وتتحرك مع زملاء الدراسة ومجتمع جامعي معروف وموثوق.',
                            },
                            {
                                icon: <Navigation className="h-7 w-7" style={{ color: '#1A4270' }} />,
                                iconBg: 'rgba(26,66,112,0.10)',
                                title: 'تحرك مباشر على خط سيرك بدون لف',
                                desc: 'مش هتغير طريقك المعتاد ولا هتضيع وقتك في شوارع جانبيّة. الركاب بينتظروك في نقاط تجميع رئيسية على خط سيرك.',
                            },
                            {
                                icon: <Wallet className="h-7 w-7" style={{ color: '#059669' }} />,
                                iconBg: 'rgba(5,150,105,0.10)',
                                title: 'استلام تحصيلك كاش أو محفظة فوراً',
                                desc: 'استلم قيمة الكراسي كاش في يدك أثناء المشوار أو تحويل فوري عبر المحفظة الإلكترونية (فودافون كاش / إنستا باي) مباشرة.',
                            },
                        ].map((card, i) => (
                            <div key={i} className="reveal-on-scroll rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                                style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl mb-6"
                                    style={{ background: card.iconBg }}>
                                    {card.icon}
                                </div>
                                <h3 className="text-xl font-black mb-3" style={{ color: '#0f172a' }}>{card.title}</h3>
                                <p className="text-sm font-medium leading-relaxed" style={{ color: '#475569' }}>{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ EARNINGS ESTIMATOR — dark navy card ══════════ */}
            <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: '#ffffff' }}>
                <div className="mx-auto max-w-4xl rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #0F2D4F 0%, #1A4270 55%, #2B5A8C 100%)' }}>
                    <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: 'linear-gradient(to right, #04A056, #2FBF78, #04A056)' }} />
                    <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full blur-2xl" style={{ background: 'rgba(4,160,86,0.12)' }} />

                    <div className="text-center mb-8 relative z-10">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold mb-3"
                            style={{ background: 'rgba(47,191,120,0.20)', color: '#2FBF78', border: '1px solid rgba(47,191,120,0.30)' }}>
                            <TrendingUp className="h-4 w-4" /> حاسبة الدخل التقديري
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black" style={{ color: '#ffffff' }}>احسب مصاريفك اللي هتغطيها شهرياً</h2>
                        <p className="text-sm sm:text-base mt-2 font-medium" style={{ color: '#cbd5e1' }}>اختر عدد الكراسي الفاضية وعدد المشاوير الأسبوعية</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center rounded-2xl p-6 relative z-10"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}>
                        <div className="space-y-6">
                            {[
                                { label: 'عدد الكراسي المتاحة في عربيتك:', value: seatsCount, suffix: 'كراسي', min: 1, max: 4, setter: setSeatsCount },
                                { label: 'أيام الذهاب والعودة أسبوعياً:', value: tripsPerWeek, suffix: 'أيام', min: 1, max: 6, setter: setTripsPerWeek },
                            ].map((slider, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-center text-sm font-bold mb-2" style={{ color: '#ffffff' }}>
                                        <span>{slider.label}</span>
                                        <span className="text-lg font-black" style={{ color: '#2FBF78' }}>{slider.value} {slider.suffix}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={slider.min}
                                        max={slider.max}
                                        value={slider.value}
                                        onChange={(e) => slider.setter(Number(e.target.value))}
                                        className="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-mint"
                                        style={{ background: 'rgba(15,45,79,0.6)' }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="text-center pt-4 md:pt-0" style={{ borderRight: '1px solid rgba(255,255,255,0.14)' }}>
                            <p className="text-xs sm:text-sm font-bold" style={{ color: '#cbd5e1' }}>متوسط الدخل الشهري المتوقع:</p>
                            <div className="my-2">
                                <span className="text-3xl sm:text-5xl font-black animate-count-up" style={{ color: '#2FBF78' }}>
                                    +{estimatedMonthly.toLocaleString('ar-EG')}
                                </span>
                                <span className="text-lg font-black mr-2" style={{ color: '#ffffff' }}>جنية مصري</span>
                            </div>
                            <p className="text-xs font-semibold" style={{ color: '#94a3b8' }}>
                                * المبلغ يغطي بنزينك، الصيانة الدورية، ومصاريـف الكارتة وركنة العربية بالكامل!
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 text-center relative z-10">
                        <Link
                            href="/register?role=driver"
                            className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-black transition-all active:scale-95 hover:opacity-90"
                            style={{ background: '#04A056', color: '#ffffff', boxShadow: '0 10px 25px rgba(4,160,86,0.30)' }}
                        >
                            <span>سجّل الآن وابدأ في تغطية مصاريفك</span>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════ HOW IT WORKS — light grey background ══════════ */}
            <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: '#f8fafc' }}>
                <div className="mx-auto max-w-5xl">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="text-sm font-black uppercase tracking-wider" style={{ color: '#038A48' }}>خطوات بسيطة وسريعة</span>
                        <h2 className="text-2xl sm:text-4xl font-black mt-1" style={{ color: '#0f172a' }}>
                            كيف تشارك مشوارك في 3 خطوات فقط؟
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { num: '1', bg: '#1A4270', title: 'سجّل بيانات عربيتك', desc: 'أدخل موديل السيارة ورقم رخصتك في استمارة بسيطة لا تستغرق أكثر من دقيقة واحدة.' },
                            { num: '2', bg: '#04A056', title: 'حدد خط سيرك ومواعيدك', desc: 'حدد موعد تحركك اليومي ونقطة الانطلاق والوصول للجامعة وعدد الكراسي المتاحة.' },
                            { num: '3', bg: '#059669', title: 'انطلق واكسب فوراً', desc: 'استقبل طلبات الحجز من طلاب مدينتك أو جامعتك واستلم تحصيلك كاش أو محفظة فورياً.' },
                        ].map((step, i) => (
                            <div key={i} className="reveal-on-scroll flex flex-col items-center text-center p-6 rounded-2xl shadow-sm"
                                style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full text-white font-black text-lg mb-4 shadow-md"
                                    style={{ background: step.bg }}>
                                    {step.num}
                                </div>
                                <h3 className="text-lg font-black mb-2" style={{ color: '#0f172a' }}>{step.title}</h3>
                                <p className="text-sm font-medium leading-relaxed" style={{ color: '#475569' }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ FAQ — white background ══════════ */}
            <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: '#ffffff' }}>
                <div className="mx-auto max-w-3xl">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-black" style={{ color: '#0f172a' }}>الأسئلة الشائعة للكتّاب والسائقين</h2>
                        <p className="text-sm font-medium mt-2" style={{ color: '#64748b' }}>إليك إجابات لأبرز الاستفسارات قبل البدء معنا</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: 'هل التسجيل في منصة مشاوير مجاني؟', a: 'نعم، التسجيل مجاني تماماً 100% بدون أي رسوم اشتراك أو عمولات مخفية للسائقين الجدد.' },
                            { q: 'كيف يتم التأكد من هوية الركاب معنا في العربية؟', a: 'كل راكب يقوم بإنشاء حساب يتم التحقق من بطاقته الشخصية والكارنيه الجامعي أو البريد الإلكتروني الرسمي للجامعة لضمان أمان تام لك ولركابك.' },
                            { q: 'هل يتطلب الأمر الخروج عن خط سيري المعتاد؟', a: 'لا مطلقاً، أنت تحدد نقطة التحرك والجامعة المستهدفة، والركاب هم من يختارون المشوار بناءً على توافق طريقهم مع طريقك.' },
                            { q: 'كيف أستلم قيمة الكراسي المحجوزة؟', a: 'تستلم قيمة المشوار مباشرة كاش في يدك من الركاب أثناء المشوار، أو عن طريق المحافظ الإلكترونية مثل فودافون كاش وإنستا باي.' },
                        ].map((faq, index) => (
                            <div key={index} className="rounded-2xl overflow-hidden shadow-sm transition-all"
                                style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between p-4 sm:p-5 text-right font-black transition-colors hover:bg-slate-100"
                                    style={{ color: '#0f172a' }}
                                >
                                    <span className="text-base">{faq.q}</span>
                                    {openFaq === index
                                        ? <ChevronUp className="h-5 w-5 shrink-0" style={{ color: '#04A056' }} />
                                        : <ChevronDown className="h-5 w-5 shrink-0" style={{ color: '#94a3b8' }} />
                                    }
                                </button>
                                {openFaq === index && (
                                    <div className="p-4 sm:p-5 pt-0 text-sm font-medium leading-relaxed"
                                        style={{ color: '#334155', borderTop: '1px solid #e2e8f0' }}>
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ FINAL CTA BANNER — dark navy ══════════ */}
            <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden text-center"
                style={{ background: 'linear-gradient(to right, #0F2D4F, #1A4270, #2B5A8C)' }}>
                <div className="absolute inset-0 opacity-40"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='rgba(255,255,255,0.05)'/%3E%3C/svg%3E\")" }} />

                <div className="mx-auto max-w-3xl relative z-10">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-6 animate-float"
                        style={{ background: 'rgba(4,160,86,0.20)' }}>
                        <Car className="h-8 w-8" style={{ color: '#2FBF78' }} />
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-black leading-tight" style={{ color: '#ffffff' }}>
                        ابدأ وشارك مشوارك مجاناً الآن
                    </h2>
                    <p className="mt-4 text-base sm:text-xl font-semibold leading-relaxed max-w-xl mx-auto" style={{ color: '#e2e8f0' }}>
                        كراسي عربيتك الفاضية تقدر تغطي كل مصاريفك اليومية، سجل بياناتك في دقيقة وانضم لمئات السائقين الموثقين.
                    </p>

                    <div className="mt-8">
                        <Link
                            href="/register?role=driver"
                            className="inline-flex items-center justify-center gap-3 rounded-2xl px-10 py-4 text-lg font-black transition-all hover:scale-105 active:scale-95"
                            style={{ background: 'linear-gradient(to right, #04A056, #2FBF78)', color: '#ffffff', boxShadow: '0 20px 40px rgba(4,160,86,0.35)' }}
                        >
                            <span>سجّل بيانات عربيتك الآن</span>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold" style={{ color: '#cbd5e1' }}>
                        <ShieldCheck className="h-4 w-4" style={{ color: '#2FBF78' }} />
                        <span>أمان كامل • ركاب موثقين • بدون التزام بمواعيد ثابتة</span>
                    </div>
                </div>
            </section>

            {/* ══════════ FOOTER ══════════ */}
            <footer className="py-6 text-center text-xs font-semibold" style={{ background: '#0F2D4F', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p>© {new Date().getFullYear()} Mashaweer - مشاوير. جميع الحقوق محفوظة.</p>
            </footer>
        </div>
    );
}
