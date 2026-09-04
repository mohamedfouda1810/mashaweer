'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ShieldCheck,
    Car,
    MapPin,
    Wallet,
    CheckCircle2,
    Clock,
    Zap,
    Users,
    ArrowLeft,
    Sparkles,
    Shield,
    Banknote,
    TrendingUp,
    ChevronDown,
    ChevronUp,
    Navigation,
    UserCheck,
    GraduationCap,
    Award
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

    // Estimated monthly earnings: avg 35 EGP per seat * 2 (round trip) * seats * (tripsPerWeek * 4 weeks)
    const estimatedMonthly = Math.round(seatsCount * 35 * 2 * (tripsPerWeek * 4));

    return (
        <div ref={sectionRef} dir="rtl" className="flex min-h-screen flex-col font-sans bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-x-hidden selection:bg-mint/20">
            {/* ══════════ Hero Section ══════════ */}
            <section className="relative flex flex-col items-center justify-center px-4 pt-12 pb-20 text-center sm:px-6 lg:px-8 overflow-hidden min-h-[90vh]">
                {/* Background image & gradient overlays */}
                <div
                    className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-[20s] hover:scale-110 opacity-30"
                    style={{ backgroundImage: "url('/egypt-highway.png')" }}
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-dark/95 via-navy/90 to-navy-dark/95" />
                <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-60" />

                {/* Floating ambient light effects */}
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-mint/25 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-navy-light/40 blur-3xl" />

                <div className="mx-auto max-w-4xl pt-6">
                    {/* Top Trust Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-mint/40 bg-mint/15 px-4 py-2 text-xs sm:text-sm font-bold text-mint-light backdrop-blur-md mb-6 animate-pulse-glow shadow-sm">
                        <GraduationCap className="h-4 w-4 text-mint-light shrink-0" />
                        <span className="tracking-wide">منصة مشاركة الرحلات الأولى لطلاب وأعضاء الجامعة الأهلية</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl sm:leading-tight leading-snug drop-shadow-sm">
                        طالع الجامعة الأهلية <span className="bg-gradient-to-r from-mint-light via-emerald-300 to-mint bg-clip-text text-transparent animate-gradient-shift">بعربيتك؟</span>
                    </h1>

                    {/* Main Value Sub-headline */}
                    <p className="mt-4 text-lg sm:text-2xl font-black text-zinc-100 leading-relaxed max-w-3xl mx-auto drop-shadow-sm">
                        غطّى مصاريفك واعمل دخل إضافى من كراسى عربيتك الفاضية 🚗💰
                    </p>

                    <p className="mt-3 text-base sm:text-lg text-zinc-200 leading-relaxed max-w-2xl mx-auto font-semibold">
                        شارك مشوارك اليومي مع طلاب وزمايل موثقين بنفس خط سيرك وبدون خروج عن الطريق أو انتظار.
                    </p>

                    {/* Quick Highlight Badges */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-right sm:text-center">
                        <div className="flex items-center sm:justify-center gap-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-3.5 text-white shadow-sm">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mint/30 text-mint-light font-bold">
                                <Navigation className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-bold text-white">نفس الطريق (بدون تلفيف)</span>
                        </div>
                        <div className="flex items-center sm:justify-center gap-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-3.5 text-white shadow-sm">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mint/30 text-mint-light font-bold">
                                <Users className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-bold text-white">زملاء جامعة واحدة موثقين</span>
                        </div>
                        <div className="flex items-center sm:justify-center gap-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-3.5 text-white shadow-sm">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mint/30 text-mint-light font-bold">
                                <Clock className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-bold text-white">تسجيل بياناتك فى دقيقة</span>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                        <Link
                            href="/register?role=driver"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-mint to-mint-light px-8 py-4 text-lg font-black text-white shadow-xl shadow-mint/30 transition-all duration-300 hover:scale-105 hover:shadow-mint/50 active:scale-95 group"
                        >
                            <span>سجّل بيانات عربيتك وابدأ مجاناً</span>
                            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        </Link>
                        <a
                            href="#trust-safety"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/15 px-6 py-4 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/25 active:scale-95 shadow-sm"
                        >
                            <ShieldCheck className="h-5 w-5 text-mint-light" />
                            <span>لماذا مشاوير آمنة ومضمونة؟</span>
                        </a>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-6 border-t border-white/15 pt-8 text-xs sm:text-sm text-zinc-100 font-semibold">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4.5 w-4.5 text-mint-light" />
                            <span>100% تسجيل مجاني بدون رسوم</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4.5 w-4.5 text-mint-light" />
                            <span>تحصيل أرباحك كاش أو محفظة فوراً</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4.5 w-4.5 text-mint-light" />
                            <span>فحص وتوثيق هوية جميع الركاب</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════ Trust & Safety Section (أمان كامل) ══════════ */}
            <section id="trust-safety" className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900/60 relative overflow-hidden">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="inline-block text-sm font-black text-mint-dark dark:text-mint-light uppercase tracking-wider mb-2">أمان كامل وراحة بال</span>
                        <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white">
                            ليه السواقة مع مشاوير آمنة ومريحة 100%؟
                        </h2>
                        <p className="mt-3 text-zinc-700 dark:text-zinc-300 text-base sm:text-lg font-medium">
                            صممنا المنصة مخصوص عشان تديك أعلى مستويات الأمان والراحة في مشوارك اليومي للجامعة
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {/* Card 1 */}
                        <div className="reveal-on-scroll rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/15 text-mint-dark dark:text-mint-light font-bold mb-6">
                                <UserCheck className="h-7 w-7 text-mint-dark dark:text-mint-light" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-950 dark:text-white mb-3">
                                ركابك طلاب فى نفس الجامعة
                            </h3>
                            <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium leading-relaxed">
                                كل ركب معاك موثق بهويته وشريحته الجامعية. هتسافر وتتحرك مع زملاء الدراسة ومجتمع جامعي معروف وموثوق.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="reveal-on-scroll rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy/15 dark:bg-navy-light/30 text-navy dark:text-navy-light font-bold mb-6">
                                <Navigation className="h-7 w-7 text-navy dark:text-navy-light" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-950 dark:text-white mb-3">
                                تحرك مباشر على خط سيرك بدون لف
                            </h3>
                            <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium leading-relaxed">
                                مش هتغير طريقك المعتاد ولا هتضيع وقتك في شوارع جانبيّة. الركاب بينتظروك في نقاط تجميع رئيسية على خط سيرك.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="reveal-on-scroll rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold mb-6">
                                <Wallet className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-950 dark:text-white mb-3">
                                استلام تحصيلك كاش أو محفظة فوراً
                            </h3>
                            <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium leading-relaxed">
                                استلم قيمة الكراسي كاش في يدك أثناء المشوار أو تحويل فوري عبر المحفظة الإلكترونية (فودافون كاش / إنستا باي) مباشرة.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════ Earnings Estimator Section ══════════ */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-950">
                <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-navy-dark via-navy to-navy-light p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-mint via-mint-light to-mint" />
                    <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-mint/15 blur-2xl" />

                    <div className="text-center mb-8">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/25 px-3.5 py-1 text-xs font-bold text-mint-light mb-3 border border-mint/30">
                            <TrendingUp className="h-4 w-4" /> حاسبة الدخل التقديري
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-white">احسب مصاريفك اللي هتغطيها شهرياً</h2>
                        <p className="text-zinc-200 text-sm sm:text-base mt-2 font-medium">اختر عدد الكراسي الفاضية وعدد المشاوير الأسبوعية</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15">
                        {/* Sliders */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center text-sm font-bold mb-2 text-white">
                                    <span>عدد الكراسي المتاحة في عربيتك:</span>
                                    <span className="text-mint-light font-black text-lg">{seatsCount} كراسي</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="4"
                                    value={seatsCount}
                                    onChange={(e) => setSeatsCount(Number(e.target.value))}
                                    className="w-full h-2.5 bg-navy-dark rounded-lg appearance-none cursor-pointer accent-mint"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center text-sm font-bold mb-2 text-white">
                                    <span>أيام الذهاب والعودة أسبوعياً:</span>
                                    <span className="text-mint-light font-black text-lg">{tripsPerWeek} أيام</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="6"
                                    value={tripsPerWeek}
                                    onChange={(e) => setTripsPerWeek(Number(e.target.value))}
                                    className="w-full h-2.5 bg-navy-dark rounded-lg appearance-none cursor-pointer accent-mint"
                                />
                            </div>
                        </div>

                        {/* Result Display */}
                        <div className="text-center md:border-r md:border-white/15 md:pr-8 pt-4 md:pt-0">
                            <p className="text-xs sm:text-sm text-zinc-200 font-bold">متوسط الدخل الشهري المتوقع:</p>
                            <div className="my-2">
                                <span className="text-3xl sm:text-5xl font-black text-mint-light animate-count-up drop-shadow">
                                    +{estimatedMonthly.toLocaleString('ar-EG')}
                                </span>
                                <span className="text-lg font-black text-white mr-2">جنية مصري</span>
                            </div>
                            <p className="text-xs text-zinc-300 font-semibold">
                                * المبلغ يغطي بنزينك، الصيانة الدورية، ومصاريـف الكارتة وركنة العربية بالكامل!
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <Link
                            href="/register?role=driver"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-mint px-8 py-3.5 text-base font-black text-white shadow-lg hover:bg-mint-light transition-all active:scale-95"
                        >
                            <span>سجّل الآن وابدأ في تغطية مصاريفك</span>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════ How It Works (خطوات التسجيل) ══════════ */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900/60">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="text-sm font-black text-mint-dark dark:text-mint-light uppercase tracking-wider">خطوات بسيطة وسريعة</span>
                        <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white mt-1">
                            كيف تشارك مشوارك في 3 خطوات فقط؟
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Step 1 */}
                        <div className="reveal-on-scroll relative flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white font-black text-lg mb-4 shadow-md">
                                1
                            </div>
                            <h3 className="text-lg font-black text-zinc-950 dark:text-white mb-2">سجّل بيانات عربيتك</h3>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                                أدخل موديل السيارة ورقم رخصتك في استمارة بسيطة لا تستغرق أكثر من دقيقة واحدة.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="reveal-on-scroll relative flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mint text-white font-black text-lg mb-4 shadow-md">
                                2
                            </div>
                            <h3 className="text-lg font-black text-zinc-950 dark:text-white mb-2">حدد خط سيرك ومواعيدك</h3>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                                حدد موعد تحركك اليومي ونقطة الانطلاق والوصول للجامعة وعدد الكراسي المتاحة.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="reveal-on-scroll relative flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white font-black text-lg mb-4 shadow-md">
                                3
                            </div>
                            <h3 className="text-lg font-black text-zinc-950 dark:text-white mb-2">انطلق واكسب فوراً</h3>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                                استقبل طلبات الحجز من طلاب مدينتك أو جامعتك واستلم تحصيلك كاش أو محفظة فورياً.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════ FAQ Section ══════════ */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-950">
                <div className="mx-auto max-w-3xl">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">الأسئلة الشائعة للكتّاب والسائقين</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium mt-2">إليك إجابات لأبرز الاستفسارات قبل البدء معنا</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "هل التسجيل في منصة مشاوير مجاني؟",
                                a: "نعم، التسجيل مجاني تماماً 100% بدون أي رسوم اشتراك أو عمولات مخفية للسائقين الجدد."
                            },
                            {
                                q: "كيف يتم التأكد من هوية الركاب معنا في العربية؟",
                                a: "كل راكب يقوم بإنشاء حساب يتم التحقق من بطاقته الشخصية والكارنيه الجامعي أو البريد الإلكتروني الرسمي للجامعة لضمان أمان تام لك ولركابك."
                            },
                            {
                                q: "هل يتطلب الأمر الخروج عن خط سيري المعتاد؟",
                                a: "لا مطلقاً، أنت تحدد نقطة التحرك والجامعة المستهدفة، والركاب هم من يختارون المشوار بناءً على توافق طريقهم مع طريقك."
                            },
                            {
                                q: "كيف أستلم قيمة الكراسي المحجوزة؟",
                                a: "تستلم قيمة المشوار مباشرة كاش في يدك من الركاب أثناء المشوار، أو عن طريق المحافظ الإلكترونية مثل فودافون كاش وإنستا باي."
                            }
                        ].map((faq, index) => (
                            <div
                                key={index}
                                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden transition-all shadow-sm"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between p-4 sm:p-5 text-right font-black text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
                                >
                                    <span className="text-base">{faq.q}</span>
                                    {openFaq === index ? (
                                        <ChevronUp className="h-5 w-5 text-mint-dark dark:text-mint-light shrink-0" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-zinc-500 shrink-0" />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <div className="p-4 sm:p-5 pt-0 text-sm font-medium text-zinc-700 dark:text-zinc-200 leading-relaxed border-t border-zinc-200/80 dark:border-zinc-800/80">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ Final Conversion Banner ══════════ */}
            <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-navy via-navy-light to-navy-dark text-white overflow-hidden text-center">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-40" />

                <div className="mx-auto max-w-3xl relative z-10">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-mint/25 text-mint-light mb-6 animate-float">
                        <Car className="h-8 w-8 text-mint-light" />
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                        ابدأ وشارك مشوارك مجاناً الآن
                    </h2>
                    <p className="mt-4 text-base sm:text-xl text-zinc-100 leading-relaxed max-w-xl mx-auto font-semibold">
                        كراسي عربيتك الفاضية تقدر تغطي كل مصاريفك اليومية، سجل بياناتك في دقيقة وانضم لمئات السائقين الموثقين.
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href="/register?role=driver"
                            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-mint to-mint-light px-10 py-4 text-lg font-black text-white shadow-2xl shadow-mint/40 hover:scale-105 active:scale-95 transition-all"
                        >
                            <span>سجّل بيانات عربيتك الآن</span>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-zinc-200">
                        <ShieldCheck className="h-4 w-4 text-mint-light" />
                        <span>أمان كامل • ركاب موثقين • بدون التزام بمواعيد ثابتة</span>
                    </div>
                </div>
            </section>

            {/* Footer Notice */}
            <footer className="py-6 bg-navy-dark text-center text-xs text-zinc-300 font-semibold border-t border-white/10">
                <p>© {new Date().getFullYear()} Mashaweer - مشاوير. جميع الحقوق محفوظة.</p>
            </footer>
        </div>
    );
}
