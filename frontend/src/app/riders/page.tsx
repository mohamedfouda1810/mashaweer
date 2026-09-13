'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
    ShieldCheck,
    MapPin,
    Wallet,
    CheckCircle2,
    Clock,
    Users,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    Star,
    Zap,
    Heart,
    Sparkles,
    UserCheck,
    GraduationCap,
    Banknote,
    Route,
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

export default function RidersLandingPage() {
    const sectionRef = useRevealOnScroll();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div
            ref={sectionRef}
            dir="rtl"
            style={{ fontFamily: "'Cairo', 'Inter', system-ui, sans-serif" }}
            className="flex min-h-screen flex-col overflow-x-hidden"
        >
            {/* ══════════ HERO — dark navy background ══════════ */}
            <section className="relative flex flex-col items-center justify-center px-4 pt-12 pb-20 text-center sm:px-6 lg:px-8 overflow-hidden min-h-[90vh]">
                <div
                    className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat scale-105 opacity-20"
                    style={{ backgroundImage: "url('/happy-passengers.png')" }}
                />
                <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(to bottom, #0F2D4F 0%, #1A4270 50%, #0F2D4F 100%)' }} />

                {/* Ambient glows */}
                <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl" style={{ background: 'rgba(4,160,86,0.18)' }} />
                <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full blur-3xl" style={{ background: 'rgba(43,90,140,0.30)' }} />

                <div className="mx-auto max-w-4xl pt-6 relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-bold mb-6 animate-pulse-glow"
                        style={{ border: '1px solid rgba(47,191,120,0.4)', background: 'rgba(47,191,120,0.12)', color: '#2FBF78' }}>
                        <GraduationCap className="h-4 w-4 shrink-0" />
                        <span className="tracking-wide" style={{ color: '#2FBF78' }}>المنصة الأولى لمشاركة المشاوير بين طلاب وأعضاء الجامعات</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-snug sm:leading-tight" style={{ color: '#ffffff' }}>
                        رايح الجامعة؟{' '}
                        <span className="animate-gradient-shift bg-gradient-to-r from-mint-light via-emerald-300 to-mint bg-clip-text text-transparent">
                            وفّر وقتك وفلوسك
                        </span>
                    </h1>

                    {/* Sub-headline */}
                    <p className="mt-4 text-lg sm:text-2xl font-black leading-relaxed max-w-3xl mx-auto" style={{ color: '#f1f5f9' }}>
                        احجز مكانك مع زميل جامعي موثق بنفس خط سيرك — أرخص من أي مواصلة وأسرع من أي ميكروباص 🎓🚗
                    </p>
                    <p className="mt-3 text-base sm:text-lg font-semibold leading-relaxed max-w-2xl mx-auto" style={{ color: '#cbd5e1' }}>
                        بدل ما تستنى في المحطة أو تدفع أجرة غالية، اركب مع حد من جامعتك على نفس طريقك بأمان وراحة.
                    </p>

                    {/* Quick badges */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
                        {[
                            { icon: <Banknote className="h-5 w-5" />, text: 'أرخص من أي مواصلة تانية' },
                            { icon: <ShieldCheck className="h-5 w-5" />, text: 'سائقين موثقين بالهوية' },
                            { icon: <Clock className="h-5 w-5" />, text: 'احجز مكانك في ثواني' },
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
                            href="/register"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-4 text-lg font-black transition-all duration-300 hover:scale-105 active:scale-95 group"
                            style={{ background: 'linear-gradient(to right, #04A056, #2FBF78)', color: '#ffffff', boxShadow: '0 20px 40px rgba(4,160,86,0.30)' }}
                        >
                            <span>سجّل مجاناً واحجز أول مشوار</span>
                            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        </Link>
                        <a
                            href="#why-mashaweer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold transition-all active:scale-95"
                            style={{ border: '1px solid rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.12)', color: '#ffffff' }}
                        >
                            <Sparkles className="h-5 w-5" style={{ color: '#2FBF78' }} />
                            <span>ليه مشاوير أحسن اختيار؟</span>
                        </a>
                    </div>

                    {/* Trust strip */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-6 pt-8 text-xs sm:text-sm font-semibold"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.14)', color: '#e2e8f0' }}>
                        {['تسجيل مجاني 100%', 'سائقين وركاب موثقين', 'حجز فوري بضغطة واحدة', 'ادفع كاش أو محفظة'].map((t, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: '#2FBF78' }} />
                                <span>{t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ WHY MASHAWEER — light grey ══════════ */}
            <section id="why-mashaweer" className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: '#f8fafc' }}>
                <div className="mx-auto max-w-5xl">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="inline-block text-sm font-black uppercase tracking-wider mb-2" style={{ color: '#038A48' }}>
                            ليه تختار مشاوير؟
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black" style={{ color: '#0f172a' }}>
                            مشوارك للجامعة بقى أسهل وأوفر وأأمن
                        </h2>
                        <p className="mt-3 text-base sm:text-lg font-medium" style={{ color: '#475569' }}>
                            انسى الزحمة والاستنا والمواصلات الغالية — مشاوير بتوصلك مع زملاءك بأمان وراحة
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            {
                                icon: <Banknote className="h-7 w-7" style={{ color: '#04A056' }} />,
                                iconBg: 'rgba(4,160,86,0.10)',
                                title: 'وفّر فلوسك كل يوم',
                                desc: 'أسعار مشاوير أقل بكتير من التاكسي أو أوبر — ادفع بس ثمن الكرسي الواحد مش العربية كلها. وفّر لغاية 70% من مصاريف مواصلاتك.',
                            },
                            {
                                icon: <UserCheck className="h-7 w-7" style={{ color: '#1A4270' }} />,
                                iconBg: 'rgba(26,66,112,0.10)',
                                title: 'سائقين موثقين ومعروفين',
                                desc: 'كل سائق موثق بهويته ورخصته وكارنيه الجامعة. مش هتركب مع حد غريب — هتركب مع زميل من نفس الجامعة أو المجتمع.',
                            },
                            {
                                icon: <Zap className="h-7 w-7" style={{ color: '#059669' }} />,
                                iconBg: 'rgba(5,150,105,0.10)',
                                title: 'حجز فوري بدون استنا',
                                desc: 'اختار مشوارك واحجز مكانك في ثواني. وقت التحرك محدد مسبقاً — مفيش استنا في محطات ولا ضياع وقت.',
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

            {/* ══════════ SAFETY & TRUST — dark navy card ══════════ */}
            <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: '#ffffff' }}>
                <div className="mx-auto max-w-4xl rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #0F2D4F 0%, #1A4270 55%, #2B5A8C 100%)' }}>
                    <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: 'linear-gradient(to right, #04A056, #2FBF78, #04A056)' }} />
                    <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full blur-2xl" style={{ background: 'rgba(4,160,86,0.12)' }} />

                    <div className="text-center mb-10 relative z-10">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold mb-3"
                            style={{ background: 'rgba(47,191,120,0.20)', color: '#2FBF78', border: '1px solid rgba(47,191,120,0.30)' }}>
                            <ShieldCheck className="h-4 w-4" /> أمانك أولويتنا
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black" style={{ color: '#ffffff' }}>
                            راحتك وأمانك في كل مشوار
                        </h2>
                        <p className="text-sm sm:text-base mt-2 font-medium" style={{ color: '#cbd5e1' }}>
                            صممنا مشاوير عشان تحس إنك في سيارة صاحبك مش مع حد غريب
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
                        {[
                            { icon: <UserCheck className="h-6 w-6" />, title: 'سائقين ومستخدمين موثقين', desc: 'كل مستخدم بيتم التحقق من هويته وبياناته الجامعية قبل ما يقدر يحجز أو يسوق.' },
                            { icon: <Route className="h-6 w-6" />, title: 'خط سير محدد ومعروف', desc: 'المشوار والطريق واضحين من الأول — تعرف من وين وإلى وين وإمتى بالظبط.' },
                            { icon: <Star className="h-6 w-6" />, title: 'تقييمات حقيقية من زملاءك', desc: 'شوف تقييمات الطلاب اللي ركبوا قبلك واختار السائق اللي يريحك.' },
                            { icon: <Wallet className="h-6 w-6" />, title: 'ادفع بالطريقة اللي تريحك', desc: 'ادفع كاش في يد السائق أو عن طريق المحفظة الإلكترونية — أنت حر تختار.' },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 rounded-2xl p-5"
                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0"
                                    style={{ background: 'rgba(47,191,120,0.18)', color: '#2FBF78' }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="text-base font-black mb-1" style={{ color: '#ffffff' }}>{item.title}</h3>
                                    <p className="text-sm font-medium leading-relaxed" style={{ color: '#94a3b8' }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center relative z-10">
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-black transition-all active:scale-95 hover:opacity-90"
                            style={{ background: '#04A056', color: '#ffffff', boxShadow: '0 10px 25px rgba(4,160,86,0.30)' }}
                        >
                            <span>أنشئ حسابك واحجز أول مشوار</span>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════ HOW IT WORKS — light grey ══════════ */}
            <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: '#f8fafc' }}>
                <div className="mx-auto max-w-5xl">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="text-sm font-black uppercase tracking-wider" style={{ color: '#038A48' }}>سهل وسريع</span>
                        <h2 className="text-2xl sm:text-4xl font-black mt-1" style={{ color: '#0f172a' }}>
                            احجز مشوارك في 3 خطوات بس
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { num: '1', bg: '#1A4270', title: 'سجّل حسابك مجاناً', desc: 'أدخل اسمك ورقمك وإيميلك — التسجيل مجاني 100% ومش بياخد أكتر من دقيقة.' },
                            { num: '2', bg: '#04A056', title: 'دوّر على مشوارك', desc: 'اختار وجهتك (الجامعة أو البلد) وشوف المشاوير المتاحة مع الأسعار والمواعيد.' },
                            { num: '3', bg: '#059669', title: 'احجز مكانك وانطلق', desc: 'احجز كرسيك بضغطة واحدة واتواصل مع السائق مباشرة — وصولك مضمون.' },
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

            {/* ══════════ SAVINGS HIGHLIGHT — white ══════════ */}
            <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: '#ffffff' }}>
                <div className="mx-auto max-w-4xl text-center">
                    <span className="inline-block text-sm font-black uppercase tracking-wider mb-2" style={{ color: '#038A48' }}>
                        قارن ووفّر
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black mb-4" style={{ color: '#0f172a' }}>
                        مشاوير أوفر من أي وسيلة تانية
                    </h2>
                    <p className="text-base font-medium mb-10 max-w-2xl mx-auto" style={{ color: '#475569' }}>
                        شوف الفرق بنفسك — مشوار واحد بيوفرلك نص الثمن أو أكتر
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        {[
                            { label: 'ميكروباص / نقل عام', price: '~25-40', highlight: false, note: 'زحمة + استنا + مشي كتير' },
                            { label: 'مشاوير ✨', price: '~30-50', highlight: true, note: 'باب لباب • مع زميلك • بأمان' },
                            { label: 'تاكسي / أوبر', price: '~120-200', highlight: false, note: 'غالي + لوحدك + مش يومي' },
                        ].map((item, i) => (
                            <div key={i} className="rounded-2xl p-6 text-center transition-all hover:-translate-y-1"
                                style={{
                                    background: item.highlight ? 'linear-gradient(135deg, #04A056, #2FBF78)' : '#ffffff',
                                    border: item.highlight ? 'none' : '1px solid #e2e8f0',
                                    boxShadow: item.highlight ? '0 15px 35px rgba(4,160,86,0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
                                    transform: item.highlight ? 'scale(1.05)' : 'none',
                                }}>
                                <p className="text-xs font-bold uppercase tracking-wider mb-3"
                                    style={{ color: item.highlight ? 'rgba(255,255,255,0.85)' : '#64748b' }}>
                                    {item.label}
                                </p>
                                <p className="text-3xl sm:text-4xl font-black mb-1"
                                    style={{ color: item.highlight ? '#ffffff' : '#0f172a' }}>
                                    {item.price}
                                </p>
                                <p className="text-xs font-bold mb-3" style={{ color: item.highlight ? 'rgba(255,255,255,0.90)' : '#64748b' }}>
                                    جنيه / مشوار
                                </p>
                                <p className="text-xs font-semibold" style={{ color: item.highlight ? 'rgba(255,255,255,0.80)' : '#94a3b8' }}>
                                    {item.note}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ FAQ — light grey ══════════ */}
            <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: '#f8fafc' }}>
                <div className="mx-auto max-w-3xl">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-black" style={{ color: '#0f172a' }}>أسئلة بتدور في بالك؟</h2>
                        <p className="text-sm font-medium mt-2" style={{ color: '#64748b' }}>إجابات سريعة لأهم الأسئلة قبل ما تسجّل</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: 'هل التسجيل في مشاوير مجاني؟', a: 'أيوه، التسجيل مجاني تماماً بدون أي رسوم خفية. أنشئ حسابك في دقيقة وابدأ احجز مشاويرك.' },
                            { q: 'إزاي أعرف إن السائق موثوق؟', a: 'كل سائق بيتم التحقق من هويته الشخصية ورخصة القيادة وبيانات العربية. كمان تقدر تشوف تقييمات الطلاب اللي ركبوا معاه قبل كده.' },
                            { q: 'إيه وسائل الدفع المتاحة؟', a: 'تقدر تدفع كاش في يد السائق مباشرة، أو عن طريق المحافظ الإلكترونية زي فودافون كاش وإنستا باي — أنت حر تختار اللي يريحك.' },
                            { q: 'لو المشوار اتلغى أعمل إيه؟', a: 'لو السائق لغى المشوار، بيتم إبلاغك فوراً وتقدر تحجز مشوار بديل. ولو أنت لغيت قبل الموعد بوقت كافي مفيش أي مشكلة.' },
                            { q: 'هل لازم أكون طالب جامعي؟', a: 'المنصة متاحة لطلاب وأعضاء الجامعات في المقام الأول — لكن أي حد يقدر يسجّل ويستخدم الخدمة بعد التحقق من هويته.' },
                        ].map((faq, index) => (
                            <div key={index} className="rounded-2xl overflow-hidden shadow-sm transition-all"
                                style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between p-4 sm:p-5 text-right font-black transition-colors"
                                    style={{ color: '#0f172a' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
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
                        <Heart className="h-8 w-8" style={{ color: '#2FBF78' }} />
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-black leading-tight" style={{ color: '#ffffff' }}>
                        جاهز توفّر وقتك وفلوسك؟
                    </h2>
                    <p className="mt-4 text-base sm:text-xl font-semibold leading-relaxed max-w-xl mx-auto" style={{ color: '#e2e8f0' }}>
                        سجّل حسابك مجاناً دلوقتى واحجز أول مشوار ليك مع زملاءك في الجامعة — الموضوع مش هياخد أكتر من دقيقة.
                    </p>

                    <div className="mt-8">
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center gap-3 rounded-2xl px-10 py-4 text-lg font-black transition-all hover:scale-105 active:scale-95"
                            style={{ background: 'linear-gradient(to right, #04A056, #2FBF78)', color: '#ffffff', boxShadow: '0 20px 40px rgba(4,160,86,0.35)' }}
                        >
                            <span>سجّل مجاناً دلوقتى</span>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold" style={{ color: '#cbd5e1' }}>
                        <ShieldCheck className="h-4 w-4" style={{ color: '#2FBF78' }} />
                        <span>مجاني 100% • سائقين موثقين • حجز فوري • بدون التزام</span>
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
