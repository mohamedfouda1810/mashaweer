// ============================================================================
// Mashaweer — Internationalization (i18n) System
// Complete Arabic ↔ English translations for ALL pages
// ============================================================================

export type Locale = 'ar' | 'en';

export type TranslationKey = keyof typeof translations;

// ─── Translation Dictionary ─────────────────────────────────────────────────
// Every user-facing string in the app, organized by page/section
// ─────────────────────────────────────────────────────────────────────────────

export const translations = {
  // ══════════ Common / Shared ══════════
  'common.mashaweer': { ar: 'مشاوير', en: 'Mashaweer' },
  'common.login': { ar: 'تسجيل الدخول', en: 'Login' },
  'common.register': { ar: 'إنشاء حساب', en: 'Register' },
  'common.logout': { ar: 'تسجيل الخروج', en: 'Logout' },
  'common.loading': { ar: 'جاري التحميل...', en: 'Loading...' },
  'common.save': { ar: 'حفظ', en: 'Save' },
  'common.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'common.confirm': { ar: 'تأكيد', en: 'Confirm' },
  'common.delete': { ar: 'حذف', en: 'Delete' },
  'common.edit': { ar: 'تعديل', en: 'Edit' },
  'common.back': { ar: 'رجوع', en: 'Back' },
  'common.next': { ar: 'التالي', en: 'Next' },
  'common.submit': { ar: 'إرسال', en: 'Submit' },
  'common.search': { ar: 'بحث', en: 'Search' },
  'common.close': { ar: 'إغلاق', en: 'Close' },
  'common.details': { ar: 'التفاصيل', en: 'Details' },
  'common.egp': { ar: 'جنيه', en: 'EGP' },
  'common.seat': { ar: 'مقعد', en: 'seat' },
  'common.seats': { ar: 'مقاعد', en: 'seats' },
  'common.available': { ar: 'متاح', en: 'available' },
  'common.from': { ar: 'من', en: 'From' },
  'common.to': { ar: 'إلى', en: 'To' },
  'common.date': { ar: 'التاريخ', en: 'Date' },
  'common.time': { ar: 'الوقت', en: 'Time' },
  'common.price': { ar: 'السعر', en: 'Price' },
  'common.status': { ar: 'الحالة', en: 'Status' },
  'common.previous': { ar: 'السابق', en: 'Previous' },
  'common.tryAgain': { ar: 'حاول مرة أخرى', en: 'Try Again' },
  'common.dismiss': { ar: 'تجاهل', en: 'Dismiss' },
  'common.perSeat': { ar: 'جنيه/مقعد', en: 'EGP/seat' },
  'tripStatus.SCHEDULED': { ar: 'مجدولة', en: 'Scheduled' },
  'tripStatus.DRIVER_CONFIRMED': { ar: 'أكد السائق الرحلة', en: 'Driver confirmed' },
  'tripStatus.IN_PROGRESS': { ar: 'جارية الآن', en: 'In progress' },
  'tripStatus.COMPLETED': { ar: 'مكتملة', en: 'Completed' },
  'tripStatus.CANCELLED': { ar: 'ملغاة', en: 'Cancelled' },
  'bookingStatus.PENDING': { ar: 'قيد الانتظار', en: 'Pending' },
  'bookingStatus.CONFIRMED': { ar: 'مؤكد', en: 'Confirmed' },
  'bookingStatus.CANCELLED': { ar: 'ملغي', en: 'Cancelled' },
  'bookingStatus.COMPLETED': { ar: 'مكتمل', en: 'Completed' },
  'common.secureEncrypted': { ar: '🔒 آمن ومشفّر', en: '🔒 Secure & Encrypted' },
  'common.verifiedDriver': { ar: '✅ سائق موثق', en: '✅ Verified Driver' },
  'common.support247': { ar: '📱 دعم ٢٤/٧', en: '📱 24/7 Support' },
  'common.trustedPlatform': { ar: 'منصة موثوقة', en: 'Trusted Platform' },

  // ══════════ Navbar ══════════
  'nav.trips': { ar: 'الرحلات', en: 'Trips' },
  'nav.bookings': { ar: 'الحجوزات', en: 'Bookings' },
  'nav.wallet': { ar: 'المحفظة', en: 'Wallet' },
  'nav.chat': { ar: 'المحادثة', en: 'Chat' },
  'nav.notifications': { ar: 'الإشعارات', en: 'Notifications' },
  'nav.dashboard': { ar: 'لوحة التحكم', en: 'Dashboard' },
  'nav.newTrip': { ar: 'رحلة جديدة', en: 'New Trip' },
  'nav.admin': { ar: 'الإدارة', en: 'Admin' },
  'nav.browseTrips': { ar: 'تصفح الرحلات', en: 'Browse Trips' },
  'nav.help': { ar: 'مساعدة', en: 'Help' },
  'nav.toggleMenu': { ar: 'القائمة', en: 'Toggle menu' },

  // ══════════ Home Page ══════════
  'home.hero.title1': { ar: 'مشوارك', en: 'Your Ride' },
  'home.hero.title2': { ar: 'و ناسك', en: '& Your People' },
  'home.hero.subtitle': {
    ar: 'المنصة الأولى لمشاركة الرحلات بين المدن في مصر. تواصل مع سائقين موثقين، احجز مقعدك فوراً، وسافر بأمان.',
    en: "Egypt's #1 inter-city ride-sharing platform. Connect with verified drivers, book seats instantly, and travel safely between cities.",
  },
  'home.hero.findRide': { ar: 'ابحث عن رحلة', en: 'Find a Ride' },
  'home.hero.becomeDriver': { ar: 'كن سائقاً', en: 'Become a Driver' },
  'home.stats.activeRiders': { ar: 'راكب نشط', en: 'Active Riders' },
  'home.stats.rating': { ar: 'التقييم', en: 'Rating' },
  'home.stats.cities': { ar: 'مدينة', en: 'Cities' },
  'home.stats.tripsCompleted': { ar: 'رحلة مكتملة', en: 'Trips Completed' },

  'home.howItWorks.badge': { ar: 'خطوات بسيطة', en: 'Simple Process' },
  'home.howItWorks.title': { ar: 'كيف تعمل', en: 'How it Works' },
  'home.howItWorks.subtitle': { ar: 'ابدأ في ثلاث خطوات سهلة', en: 'Get started in three easy steps' },
  'home.howItWorks.step1.title': { ar: 'ابحث عن رحلة', en: 'Search Trips' },
  'home.howItWorks.step1.desc': { ar: 'تصفح الرحلات المتاحة بين المدن واعثر على الرحلة المثالية لجدولك.', en: 'Browse available trips between cities and find the perfect ride for your schedule.' },
  'home.howItWorks.step2.title': { ar: 'احجز مقعدك', en: 'Book Your Seat' },
  'home.howItWorks.step2.desc': { ar: 'اختر مقاعدك، ادفع من محفظتك، وأكد حجزك فوراً.', en: 'Select seats, pay from your wallet, and confirm your booking instantly.' },
  'home.howItWorks.step3.title': { ar: 'استمتع بالرحلة', en: 'Enjoy the Ride' },
  'home.howItWorks.step3.desc': { ar: 'قابل سائقك الموثق في نقطة التجمع وسافر بأمان.', en: 'Meet your verified driver at the gathering point and travel safely.' },

  'home.whyUs.badge': { ar: 'لماذا مشاوير', en: 'Why Mashaweer' },
  'home.whyUs.title': { ar: 'سافر بذكاء،\nمش بصعوبة', en: 'Travel smarter,\nnot harder' },
  'home.whyUs.subtitle': { ar: 'بنينا أكتر منصة موثوقة لمشاركة الرحلات بين المدن في مصر، بنهتم بسلامتك وراحتك ومحفظتك في كل رحلة.', en: "We've built the most trusted inter-city ride-sharing platform in Egypt, prioritizing your safety, comfort, and wallet on every journey." },
  'home.whyUs.verified.title': { ar: 'سائقين موثقين', en: 'Verified Drivers' },
  'home.whyUs.verified.desc': { ar: 'فحص خلفيات وفحص سيارات', en: 'Background checks and vehicle inspections' },
  'home.whyUs.instant.title': { ar: 'حجز فوري', en: 'Instant Booking' },
  'home.whyUs.instant.desc': { ar: 'تصفح واحجز مقعدك في ثوانٍ', en: 'Browse and book your seat in seconds' },
  'home.whyUs.wallet.title': { ar: 'محفظة آمنة', en: 'Secure Wallet' },
  'home.whyUs.wallet.desc': { ar: 'إيداع عبر InstaPay وفودافون كاش', en: 'InstaPay & Vodafone Cash deposits' },
  'home.whyUs.commission.title': { ar: 'عمولة عادلة', en: 'Fair Commission' },
  'home.whyUs.commission.desc': { ar: 'أسعار شفافة، بدون رسوم مخفية', en: 'Transparent pricing, no hidden fees' },
  'home.whyUs.verifiedBadge': { ar: 'سائقين موثقين', en: 'Verified Drivers' },
  'home.whyUs.avgRating': { ar: 'متوسط التقييم', en: 'Average rating' },

  'home.routes.badge': { ar: 'الخطوط الشائعة', en: 'Popular Routes' },
  'home.routes.title': { ar: 'أشهر الوجهات', en: 'Top Destinations' },
  'home.routes.subtitle': { ar: 'أكثر الخطوط سفراً بواسطة مجتمعنا', en: 'Most traveled routes by our community' },
  'home.routes.from': { ar: 'من', en: 'from' },

  'home.driver.badge': { ar: 'للسائقين', en: 'For Drivers' },
  'home.driver.title': { ar: 'قود مع مشاوير،\nاكسب بطريقتك', en: 'Drive with Mashaweer,\nearn your way' },
  'home.driver.subtitle': { ar: 'حوّل رحلتك اليومية لفرصة كسب. حدد جدولك، اختار خطوطك، واكسب من الرحلات اللي بتعملها فعلاً.', en: 'Turn your daily commute into an earning opportunity. Set your own schedule, pick your routes, and get paid for the trips you\'re already making.' },
  'home.driver.point1': { ar: 'حدد جدولك وخطوطك', en: 'Set your own schedule and routes' },
  'home.driver.point2': { ar: 'هيكل عمولة شفاف', en: 'Transparent commission structure' },
  'home.driver.point3': { ar: 'دفعات فورية للمحفظة', en: 'Instant wallet payouts' },
  'home.driver.point4': { ar: 'خريطة تفاعلية لإنشاء الرحلات', en: 'Interactive map for easy trip creation' },
  'home.driver.cta': { ar: 'ابدأ القيادة اليوم', en: 'Start Driving Today' },
  'home.driver.avgEarning': { ar: 'متوسط الكسب الشهري', en: 'Avg. monthly earning' },

  'home.testimonials.badge': { ar: 'آراء العملاء', en: 'Testimonials' },
  'home.testimonials.title': { ar: 'محبوب من الآلاف', en: 'Loved by thousands' },
  'home.testimonials.subtitle': { ar: 'شوف آراء الركاب والسائقين', en: 'See what our riders and drivers have to say' },

  'home.cta.title': { ar: 'جاهز تبدأ رحلتك؟', en: 'Ready to hit the road?' },
  'home.cta.subtitle': { ar: 'انضم لآلاف الركاب والسائقين في مصر. رحلتك الجاية على بُعد نقرة.', en: 'Join thousands of riders and drivers across Egypt. Your next trip is just a click away.' },
  'home.cta.getStarted': { ar: 'ابدأ مجاناً', en: 'Get Started Free' },
  'home.cta.browseTrips': { ar: 'تصفح الرحلات', en: 'Browse Trips' },

  'home.footer.desc': { ar: 'منصة مصر الموثوقة لمشاركة الرحلات بين المدن. آمنة ومعقولة ومريحة.', en: "Egypt's trusted inter-city ride-sharing platform. Safe, affordable, and convenient." },
  'home.footer.quickLinks': { ar: 'روابط سريعة', en: 'Quick Links' },
  'home.footer.contact': { ar: 'تواصل معنا', en: 'Contact' },
  'home.footer.helpCenter': { ar: 'مركز المساعدة', en: 'Help Center' },
  'home.footer.rights': { ar: 'جميع الحقوق محفوظة.', en: 'All rights reserved.' },

  // ══════════ Login Page ══════════
  'login.title': { ar: 'مرحباً بعودتك', en: 'Welcome back' },
  'login.subtitle': { ar: 'سجل دخول لحسابك في مشاوير', en: 'Sign in to your Mashaweer account' },
  'login.email': { ar: 'البريد الإلكتروني', en: 'Email' },
  'login.password': { ar: 'كلمة المرور', en: 'Password' },
  'login.forgotPassword': { ar: 'نسيت كلمة المرور؟', en: 'Forgot password?' },
  'login.signIn': { ar: 'تسجيل الدخول', en: 'Sign In' },
  'login.signingIn': { ar: 'جاري التسجيل...', en: 'Signing in...' },
  'login.noAccount': { ar: 'ليس لديك حساب؟', en: "Don't have an account?" },
  'login.welcomeBack': { ar: 'مرحباً بعودتك!', en: 'Welcome back!' },
  'login.secureLogin': { ar: 'تسجيل دخول آمن', en: 'Secure Login' },

  // ══════════ Register Page ══════════
  'register.title': { ar: 'إنشاء حساب', en: 'Create an account' },
  'register.subtitle': { ar: 'انضم لمشاوير وابدأ السفر', en: 'Join Mashaweer and start traveling' },
  'register.iWantTo': { ar: 'أريد...', en: 'I want to...' },
  'register.bookRides': { ar: 'حجز رحلات', en: 'Book Rides' },
  'register.driveEarn': { ar: 'قود واكسب', en: 'Drive & Earn' },
  'register.firstName': { ar: 'الاسم الأول', en: 'First Name' },
  'register.lastName': { ar: 'الاسم الأخير', en: 'Last Name' },
  'register.email': { ar: 'البريد الإلكتروني', en: 'Email' },
  'register.phone': { ar: 'رقم الموبايل', en: 'Phone' },
  'register.password': { ar: 'كلمة المرور', en: 'Password' },
  'register.confirmPassword': { ar: 'تأكيد', en: 'Confirm' },
  'register.agreeTerms': { ar: 'أوافق على', en: 'I agree to the' },
  'register.termsConditions': { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },
  'register.ofPlatform': { ar: 'الخاصة بمنصة مشاوير', en: 'of Mashaweer platform' },
  'register.accountInfo': { ar: 'معلومات الحساب', en: 'Account Info' },
  'register.vehicleDetails': { ar: 'تفاصيل السيارة', en: 'Vehicle Details' },
  'register.documents': { ar: 'المستندات', en: 'Documents' },
  'register.carModel': { ar: 'نوع السيارة', en: 'Car Model' },
  'register.plateNumber': { ar: 'رقم اللوحة', en: 'Plate Number' },
  'register.licenseNumber': { ar: 'رقم الرخصة', en: 'License #' },
  'register.uploadDocuments': { ar: 'رفع المستندات', en: 'Upload Documents' },
  'register.uploadFrontBack': { ar: 'رفع صورتين (أمام وخلف) لكل مستند', en: 'Upload 2 photos (front & back) for each' },
  'register.personalPhoto': { ar: '👤 صورة شخصية', en: '👤 Personal Photo' },
  'register.identity': { ar: '🪪 بطاقة الهوية (أ و خ)', en: '🪪 Identity (F & B)' },
  'register.drivingLicense': { ar: '🚗 رخصة القيادة (أ و خ)', en: '🚗 License (F & B)' },
  'register.carLicense': { ar: '📄 رخصة السيارة (أ و خ)', en: '📄 Car License (F & B)' },
  'register.clickToUpload': { ar: 'اضغط للرفع', en: 'Click to upload' },
  'register.selectPhotos': { ar: 'اختر صورتين', en: 'Select 2 photos' },
  'register.submitApplication': { ar: 'إرسال الطلب', en: 'Submit Application' },
  'register.createAccount': { ar: 'إنشاء حساب', en: 'Create Account' },
  'register.uploading': { ar: 'جاري الرفع...', en: 'Uploading...' },
  'register.creating': { ar: 'جاري الإنشاء...', en: 'Creating...' },
  'register.haveAccount': { ar: 'لديك حساب بالفعل؟', en: 'Already have an account?' },
  'register.signIn': { ar: 'تسجيل الدخول', en: 'Sign in' },
  'register.success.driver.title': { ar: 'تم إرسال الطلب ✅', en: 'Request Submitted ✅' },
  'register.success.driver.desc': { ar: 'طلبك قيد المراجعة. سيتم مراجعة مستنداتك من قبل الإدارة.', en: 'Your request is under review. Admin will verify your documents.' },
  'register.success.passenger.title': { ar: 'تم إنشاء الحساب ✅', en: 'Account Created ✅' },
  'register.success.passenger.desc': { ar: 'تم إنشاء الحساب بنجاح!', en: 'Account created successfully!' },
  'register.success.goToLogin': { ar: 'تسجيل الدخول', en: 'Go to Login' },
  'register.vehicleInfo': { ar: 'معلومات سيارتك للركاب', en: 'Your car information for passengers' },
  'register.passwordsDoNotMatch': { ar: 'كلمات المرور غير متطابقة', en: 'Passwords do not match' },
  'register.registrationFailed': { ar: 'فشل التسجيل', en: 'Registration failed' },
  'register.registrationSuccess': { ar: 'تم التسجيل بنجاح!', en: 'Registration successful!' },
  'register.uploadAllPhotos': { ar: 'يرجى رفع جميع الصور المطلوبة (صورتين لكل مستند)', en: 'Please upload all required driver photos (2 of each required front & back)' },

  // ══════════ Trips Page ══════════
  'trips.title': { ar: 'الرحلات المتاحة', en: 'Available Trips' },
  'trips.subtitle.passenger': { ar: 'ابحث واحجز رحلات بين المدن', en: 'Find and book inter-city rides' },
  'trips.subtitle.driver': { ar: 'تصفح الرحلات المتاحة', en: 'Browse available trips' },
  'trips.filter.title': { ar: 'تصفية الرحلات', en: 'Filter Trips' },
  'trips.filter.search': { ar: 'بحث', en: 'Search' },
  'trips.filter.searchPlaceholder': { ar: 'ابحث بالمدينة، العنوان، نقطة التجمع، اسم السائق...', en: 'Search by city, address, meeting point, driver name...' },
  'trips.filter.allCities': { ar: 'كل المدن', en: 'All Cities' },
  'trips.filter.allDestinations': { ar: 'كل الوجهات', en: 'All Destinations' },
  'trips.filter.clear': { ar: 'مسح', en: 'Clear' },
  'trips.filter.showPrice': { ar: 'عرض فلتر السعر', en: 'Show Price Filters' },
  'trips.filter.hidePrice': { ar: 'إخفاء فلتر السعر', en: 'Hide Price Filters' },
  'trips.filter.minPrice': { ar: 'أقل سعر (جنيه)', en: 'Min Price (EGP)' },
  'trips.filter.maxPrice': { ar: 'أقصى سعر (جنيه)', en: 'Max Price (EGP)' },
  'trips.showing': { ar: 'عرض', en: 'Showing' },
  'trips.of': { ar: 'من', en: 'of' },
  'trips.tripsCount': { ar: 'رحلة', en: 'trips' },
  'trips.finding': { ar: 'جاري البحث عن رحلات...', en: 'Finding trips for you...' },
  'trips.noTrips': { ar: 'لم يتم العثور على رحلات', en: 'No trips found' },
  'trips.noTripsHint': { ar: 'جرب تعديل الفلترات أو عُد لاحقاً', en: 'Try adjusting your filters or check back later' },
  'trips.networkError': { ar: 'تعذر الاتصال. يرجى التحقق من اتصالك بالإنترنت.', en: 'Unable to connect. Please check your internet connection.' },
  'trips.serverError': { ar: 'الخادم غير متاح مؤقتاً. يرجى المحاولة مرة أخرى.', en: 'Server is temporarily unavailable. Please try again.' },
  'trips.bookSeat': { ar: 'احجز مقعد', en: 'Book Seat' },
  'trips.booking': { ar: 'جاري الحجز...', en: 'Booking...' },
  'trips.joinWaitlist': { ar: 'انضم لقائمة الانتظار', en: 'Join Waitlist' },
  'trips.alreadyBooked': { ar: '✓ تم الحجز', en: '✓ Already Booked' },
  'trips.driverReady': { ar: 'السائق جاهز', en: 'Driver Ready' },
  'trips.meetingPoint': { ar: 'نقطة التجمع', en: 'Meeting Point' },

  // ══════════ Bookings Page ══════════
  'bookings.title': { ar: 'حجوزاتي', en: 'My Bookings' },
  'bookings.subtitle': { ar: 'إدارة حجوزات رحلاتك', en: 'Manage your trip reservations' },
  'bookings.empty': { ar: 'لا توجد حجوزات بعد', en: 'No bookings yet' },
  'bookings.emptyHint': { ar: 'تصفح الرحلات واحجز أول رحلة!', en: 'Browse trips and book your first ride!' },
  'bookings.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'bookings.cancelling': { ar: 'جاري الإلغاء...', en: 'Cancelling...' },
  'bookings.confirmCancel': { ar: 'هل أنت متأكد من إلغاء هذا الحجز؟', en: 'Are you sure you want to cancel this booking?' },
  'bookings.refund': { ar: 'تم إلغاء الحجز. تم إضافة مبلغ الاسترداد', en: 'Booking cancelled. Refund of' },
  'bookings.refundSuffix': { ar: 'جنيه لمحفظتك.', en: 'EGP has been added to your wallet.' },
  'bookings.showQR': { ar: 'عرض رمز QR للركوب', en: 'Show Boarding QR Code' },
  'bookings.qrTitle': { ar: 'رمز QR للركوب', en: 'Boarding QR Code' },
  'bookings.qrInstruction': { ar: 'أظهر هذا الرمز للسائق عند الركوب', en: 'Show this code to the driver when boarding' },
  'bookings.status.PENDING': { ar: 'معلق', en: 'PENDING' },
  'bookings.status.CONFIRMED': { ar: 'مؤكد', en: 'CONFIRMED' },
  'bookings.status.COMPLETED': { ar: 'مكتمل', en: 'COMPLETED' },
  'bookings.status.CANCELLED': { ar: 'ملغي', en: 'CANCELLED' },

  // ══════════ Wallet Page ══════════
  'wallet.title': { ar: 'محفظتي', en: 'My Wallet' },
  'wallet.commissionTitle': { ar: '💰 محفظة العمولات', en: '💰 Commission Wallet' },
  'wallet.commissionSubtitle': { ar: 'تتبع ديون العمولات وإرسال المدفوعات', en: 'Track commission debt and submit payments' },
  'wallet.remaining': { ar: 'المتبقي', en: 'Remaining' },
  'wallet.totalDebt': { ar: 'إجمالي الدين', en: 'Total Debt' },
  'wallet.paid': { ar: 'مدفوع', en: 'Paid' },
  'wallet.pending': { ar: 'معلق', en: 'Pending' },
  'wallet.payCommission': { ar: 'دفع العمولة', en: 'Pay Commission' },
  'wallet.cancelPayment': { ar: 'إلغاء الدفع', en: 'Cancel Payment' },
  'wallet.submitPayment': { ar: 'إرسال الدفع للمراجعة', en: 'Submit Payment for Review' },
  'wallet.submitting': { ar: 'جاري الإرسال...', en: 'Submitting...' },
  'wallet.paymentMethod': { ar: 'طريقة الدفع', en: 'Payment Method' },
  'wallet.amount': { ar: 'المبلغ (جنيه)', en: 'Amount (EGP)' },
  'wallet.referenceNumber': { ar: 'رقم المرجع', en: 'Reference Number' },
  'wallet.paymentScreenshot': { ar: 'صورة الدفع', en: 'Payment Screenshot' },
  'wallet.uploadScreenshot': { ar: 'اضغط لرفع صورة الدفع', en: 'Click to upload payment screenshot' },
  'wallet.removeScreenshot': { ar: 'حذف الصورة', en: 'Remove screenshot' },
  'wallet.sendPaymentTo': { ar: 'أرسل الدفع إلى:', en: 'Send payment to:' },
  'wallet.tabs.overview': { ar: '📊 نظرة عامة', en: '📊 Overview' },
  'wallet.tabs.commissions': { ar: '📋 العمولات', en: '📋 Commissions' },
  'wallet.tabs.payments': { ar: '💳 المدفوعات', en: '💳 Payments' },
  'wallet.recentCommissions': { ar: 'آخر العمولات', en: 'Recent Commissions' },
  'wallet.recentPayments': { ar: 'آخر المدفوعات', en: 'Recent Payments' },
  'wallet.noCommissions': { ar: 'لا توجد عمولات بعد. أكمل رحلات لتظهر هنا.', en: 'No commissions yet. Complete trips to see them here.' },
  'wallet.noPayments': { ar: 'لا توجد مدفوعات بعد.', en: 'No payments yet.' },
  'wallet.noPaymentRequests': { ar: 'لا توجد طلبات دفع بعد.', en: 'No payment requests yet.' },
  'wallet.unpaid': { ar: 'غير مدفوع', en: 'Unpaid' },
  'wallet.earned': { ar: 'الأرباح', en: 'Earned' },
  'wallet.rate': { ar: 'النسبة', en: 'Rate' },

  // ══════════ Help Page ══════════
  'help.hero.title': { ar: 'كيف نقدر نساعدك؟', en: 'How can we help?' },
  'help.hero.subtitle': { ar: 'ابحث عن إجابتك أو تصفح الأسئلة الشائعة', en: 'Search for your answer or browse FAQs' },
  'help.search.placeholder': { ar: 'ابحث عن سؤالك...', en: 'Search your question...' },
  'help.findRide': { ar: 'ابحث عن رحلة', en: 'Find a Ride' },
  'help.faq.title': { ar: 'الأسئلة الشائعة', en: 'Frequently Asked Questions' },
  'help.faq.subtitle': { ar: 'أجوبة لأكثر الأسئلة اللي بتتسأل', en: 'Answers to the most common questions' },
  'help.faq.noResults': { ar: 'مفيش نتائج. جرب كلمات تانية.', en: 'No results found. Try different keywords.' },
  'help.contact.title': { ar: 'تواصل معانا', en: 'Contact Us' },
  'help.contact.subtitle': { ar: 'فريق الدعم موجود عشان يساعدك', en: 'Our support team is here to help' },
  'help.contact.whatsapp': { ar: 'رد فوري على واتساب', en: 'Instant reply on WhatsApp' },
  'help.contact.sendMessage': { ar: 'أرسل رسالة', en: 'Send a Message' },
  'help.contact.name': { ar: 'الاسم', en: 'Name' },
  'help.contact.phone': { ar: 'رقم الموبايل', en: 'Phone Number' },
  'help.contact.message': { ar: 'الرسالة', en: 'Message' },
  'help.contact.namePlaceholder': { ar: 'اسمك الكامل', en: 'Your full name' },
  'help.contact.messagePlaceholder': { ar: 'اكتب رسالتك هنا...', en: 'Write your message here...' },
  'help.contact.send': { ar: 'إرسال', en: 'Send' },
  'help.contact.success': { ar: '✓ تم إرسال رسالتك بنجاح! هنتواصل معاك قريب.', en: '✓ Message sent successfully! We\'ll get back to you soon.' },
  'help.cta.title': { ar: 'جاهز تبدأ رحلتك؟', en: 'Ready to start your trip?' },
  'help.cta.subtitle': { ar: 'اكتشف رحلات آمنة ومريحة بين المدن', en: 'Discover safe and comfortable inter-city rides' },

  // ══════════ Notifications Page ══════════
  'notifications.title': { ar: 'الإشعارات', en: 'Notifications' },
  'notifications.subtitle': { ar: 'تابع آخر التحديثات', en: 'Stay updated' },
  'notifications.empty': { ar: 'لا توجد إشعارات', en: 'No notifications' },
  'notifications.emptyHint': { ar: 'ستظهر هنا الإشعارات الجديدة', en: 'New notifications will appear here' },
  'notifications.markAllRead': { ar: 'تعليم الكل كمقروء', en: 'Mark all as read' },

  // ══════════ Forgot Password ══════════
  'forgot.title': { ar: 'نسيت كلمة المرور', en: 'Forgot Password' },
  'forgot.subtitle': { ar: 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين', en: 'Enter your email and we\'ll send you a reset link' },
  'forgot.send': { ar: 'إرسال رابط إعادة التعيين', en: 'Send Reset Link' },
  'forgot.sending': { ar: 'جاري الإرسال...', en: 'Sending...' },
  'forgot.backToLogin': { ar: 'العودة لتسجيل الدخول', en: 'Back to Login' },
  'forgot.success': { ar: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني', en: 'Reset link sent to your email' },

  // ══════════ Reset Password ══════════
  'reset.title': { ar: 'إعادة تعيين كلمة المرور', en: 'Reset Password' },
  'reset.subtitle': { ar: 'أدخل كلمة المرور الجديدة', en: 'Enter your new password' },
  'reset.newPassword': { ar: 'كلمة المرور الجديدة', en: 'New Password' },
  'reset.confirmPassword': { ar: 'تأكيد كلمة المرور', en: 'Confirm Password' },
  'reset.submit': { ar: 'إعادة التعيين', en: 'Reset Password' },
  'reset.resetting': { ar: 'جاري إعادة التعيين...', en: 'Resetting...' },
  'reset.success': { ar: 'تم إعادة تعيين كلمة المرور بنجاح', en: 'Password reset successfully' },

  // ══════════ Chat Page ══════════
  'chat.title': { ar: 'المحادثة المجتمعية', en: 'Community Chat' },
  'chat.subtitle': { ar: 'تواصل مع مجتمع مشاوير', en: 'Connect with the Mashaweer community' },
  'chat.placeholder': { ar: 'اكتب رسالتك...', en: 'Type your message...' },
  'chat.send': { ar: 'إرسال', en: 'Send' },

  // ══════════ Driver Dashboard ══════════
  'driver.title': { ar: 'لوحة تحكم السائق', en: 'Driver Dashboard' },
  'driver.subtitle': { ar: 'إدارة رحلاتك وأرباحك', en: 'Manage your trips and earnings' },
  'driver.ready': { ar: 'تأكيد الجاهزية', en: 'Confirm Ready' },
  'driver.startTrip': { ar: 'بدء الرحلة', en: 'Start Trip' },
  'driver.completeTrip': { ar: 'إنهاء الرحلة', en: 'Complete Trip' },
  'driver.createTrip': { ar: 'إنشاء رحلة جديدة', en: 'Create New Trip' },
  'driver.myTrips': { ar: 'رحلاتي', en: 'My Trips' },
  'driver.noTrips': { ar: 'لا توجد رحلات بعد', en: 'No trips yet' },

  // ══════════ Create Trip ══════════
  'createTrip.title': { ar: 'إنشاء رحلة جديدة', en: 'Create a New Trip' },
  'createTrip.subtitle': { ar: 'أنشئ رحلة واكسب من الركاب', en: 'Create a trip and earn from passengers' },
  'createTrip.fromCity': { ar: 'مدينة الانطلاق', en: 'From City' },
  'createTrip.toCity': { ar: 'مدينة الوصول', en: 'To City' },
  'createTrip.gatheringLocation': { ar: 'نقطة التجمع', en: 'Gathering Point' },
  'createTrip.departureTime': { ar: 'وقت الانطلاق', en: 'Departure Time' },
  'createTrip.totalSeats': { ar: 'عدد المقاعد', en: 'Total Seats' },
  'createTrip.pricePerSeat': { ar: 'سعر المقعد', en: 'Price per Seat' },
  'createTrip.notes': { ar: 'ملاحظات (اختياري)', en: 'Notes (optional)' },
  'createTrip.submit': { ar: 'إنشاء الرحلة', en: 'Create Trip' },
  'createTrip.creating': { ar: 'جاري الإنشاء...', en: 'Creating...' },

  // ══════════ Admin Page ══════════
  'admin.title': { ar: 'لوحة الإدارة', en: 'Admin Dashboard' },
  'admin.users': { ar: 'المستخدمين', en: 'Users' },
  'admin.trips': { ar: 'الرحلات', en: 'Trips' },
  'admin.deposits': { ar: 'الإيداعات', en: 'Deposits' },
  'admin.drivers': { ar: 'السائقين', en: 'Drivers' },
  'admin.pendingDrivers': { ar: 'سائقين في الانتظار', en: 'Pending Drivers' },
  'admin.pendingDeposits': { ar: 'إيداعات في الانتظار', en: 'Pending Deposits' },
  'admin.approve': { ar: 'قبول', en: 'Approve' },
  'admin.reject': { ar: 'رفض', en: 'Reject' },
  'admin.ban': { ar: 'حظر', en: 'Ban' },
  'admin.unban': { ar: 'رفع الحظر', en: 'Unban' },

  // ══════════ Booking Rules Modal ══════════
  'booking.rules.title': { ar: 'شروط الحجز', en: 'Booking Rules' },
  'booking.payment.title': { ar: 'طريقة الدفع', en: 'Payment Method' },
  'booking.qr.title': { ar: 'رمز QR للركوب', en: 'Boarding QR Code' },
  'booking.rules.rule1': { ar: 'الالتزام بالحضور في نقطة التجمع قبل موعد الرحلة بوقت كافٍ. التأخير قد يؤدي لإلغاء الحجز.', en: 'Arrive at the gathering point before departure time. Delays may result in booking cancellation.' },
  'booking.rules.rule2': { ar: 'لا يمكن إلغاء الحجز قبل موعد الرحلة بأقل من ٨ ساعات. يُرجى التأكد من جديّة الحجز.', en: 'Bookings cannot be cancelled less than 8 hours before departure. Please ensure you are serious about booking.' },
  'booking.rules.rule3': { ar: 'الركاب ملزمون بالتعامل باحترام مع السائق والركاب الآخرين طوال الرحلة.', en: 'Passengers must treat the driver and other passengers with respect throughout the trip.' },
  'booking.rules.warning': { ar: 'تنبيه هام: في حالة عدم الحضور (No-Show) بدون إلغاء مسبق، قد يتم تقييد حسابك من الحجز مستقبلاً.', en: 'Important: No-shows without prior cancellation may result in account restrictions.' },
  'booking.rules.proceed': { ar: 'أوافق وأكمل', en: 'I Agree & Continue' },
  'booking.payment.wallet': { ar: 'المحفظة (Wallet)', en: 'Wallet' },
  'booking.payment.walletDesc': { ar: 'الدفع من رصيد المحفظة', en: 'Pay from wallet balance' },
  'booking.payment.walletBalance': { ar: 'الرصيد المتاح:', en: 'Available balance:' },
  'booking.payment.insufficient': { ar: '(غير كافٍ)', en: '(Insufficient)' },
  'booking.payment.cash': { ar: 'كاش (Cash)', en: 'Cash' },
  'booking.payment.cashDesc': { ar: 'الدفع للسائق عند الرحلة', en: 'Pay the driver at trip time' },
  'booking.payment.totalPrice': { ar: 'إجمالي السعر', en: 'Total Price' },
  'booking.payment.confirmBooking': { ar: 'تأكيد الحجز', en: 'Confirm Booking' },
  'booking.payment.processing': { ar: 'جاري المعالجة...', en: 'Processing...' },
  'booking.payment.cancelNotice': { ar: 'يمكنك إلغاء الحجز حتى ٨ ساعات قبل موعد الرحلة فقط.', en: 'You can only cancel up to 8 hours before departure.' },
  'booking.success': { ar: 'تم الحجز بنجاح! 🎉', en: 'Booking successful! 🎉' },
  'booking.success.walletMsg': { ar: 'تم الحجز بنجاح! تم الخصم من المحفظة ✅', en: 'Booked successfully! Deducted from wallet ✅' },
  'booking.success.cashMsg': { ar: 'تم تأكيد الحجز! الدفع كاش عند الرحلة ✅', en: 'Booking confirmed! Pay cash at trip time ✅' },
  'booking.success.keepQR': { ar: 'احتفظ بهذا الرمز — سيطلبه منك السائق عند الركوب', en: 'Keep this code — the driver will ask for it when boarding' },

  // ══════════ Review Modal ══════════
  'review.title': { ar: 'كيف كانت رحلتك؟', en: 'How was your ride?' },
  'review.rateExperience': { ar: 'قيّم تجربتك مع', en: 'Rate your experience with' },
  'review.tapToRate': { ar: 'اضغط للتقييم', en: 'Tap to rate' },
  'review.writeReview': { ar: 'اكتب تقييمك (اختياري)', en: 'Write a review (optional)' },
  'review.placeholder': { ar: 'أخبرنا عن تجربتك...', en: 'Tell us about your experience...' },
  'review.submit': { ar: 'إرسال التقييم', en: 'Submit Review' },
  'review.submitting': { ar: 'جاري الإرسال...', en: 'Submitting...' },
  'review.success': { ar: 'تم إرسال التقييم!', en: 'Review Submitted!' },
  'review.thankYou': { ar: 'شكراً لمساعدتك في تحسين مجتمعنا', en: 'Thank you for helping our community' },
  'review.star1': { ar: 'سيء', en: 'Poor' },
  'review.star2': { ar: 'مقبول', en: 'Fair' },
  'review.star3': { ar: 'جيد', en: 'Good' },
  'review.star4': { ar: 'جيد جداً', en: 'Very Good' },
  'review.star5': { ar: 'ممتاز', en: 'Excellent' },

  // ══════════ Error / 404 Pages ══════════
  'error.title': { ar: 'حدث خطأ', en: 'Something went wrong' },
  'error.subtitle': { ar: 'نأسف، حدث خطأ غير متوقع', en: 'Sorry, an unexpected error occurred' },
  'error.goHome': { ar: 'العودة للرئيسية', en: 'Go Home' },
  'notFound.title': { ar: 'الصفحة غير موجودة', en: 'Page Not Found' },
  'notFound.subtitle': { ar: 'الصفحة اللي بتدور عليها مش موجودة', en: "The page you're looking for doesn't exist" },
  'notFound.goHome': { ar: 'العودة للرئيسية', en: 'Go Home' },

  // ══════════ Terms Modal ══════════
  'terms.driverTitle': { ar: 'سياسات السائق', en: 'Driver Policies' },
  'terms.passengerTitle': { ar: 'سياسات الراكب', en: 'Passenger Policies' },
  'terms.subtitle': { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },
  'terms.agree': { ar: 'فهمت وموافق', en: 'I Understand & Agree' },

  // ══════════ Language Toggle ══════════
  'lang.switchToEnglish': { ar: 'Switch to English', en: 'Switch to English' },
  'lang.switchToArabic': { ar: 'التبديل إلى العربية', en: 'التبديل إلى العربية' },
  'lang.en': { ar: 'EN', en: 'EN' },
  'lang.ar': { ar: 'عربي', en: 'عربي' },

  // ══════════ Trip Details Page ══════════
  'tripDetails.backToTrips': { ar: 'العودة للرحلات', en: 'Back to Trips' },
  'tripDetails.boardPassengers': { ar: 'صعود الركاب', en: 'Board Passengers' },
  'tripDetails.bookedSuccessfully': { ar: 'تم الحجز بنجاح!', en: 'Booked successfully!' },
  'tripDetails.bookingCashSuccess': { ar: 'تم تأكيد الحجز! الدفع كاش عند الرحلة ✅', en: 'Booking confirmed! Pay cash at trip time ✅' },
  'tripDetails.bookingFailed': { ar: 'فشل الحجز. حاول مرة أخرى.', en: 'Booking failed. Please try again.' },
  'tripDetails.bookingWalletSuccess': { ar: 'تم الحجز بنجاح! تم الخصم من المحفظة ✅', en: 'Booked! Deducted from wallet ✅' },
  'tripDetails.completeTrip': { ar: 'إنهاء الرحلة', en: 'Complete Trip' },
  'tripDetails.confirmComplete': { ar: 'هل تريد إنهاء هذه الرحلة؟', en: 'Complete this trip?' },
  'tripDetails.date': { ar: 'التاريخ', en: 'Date' },
  'tripDetails.destinationPoint': { ar: 'نقطة الوصول', en: 'Destination Point' },
  'tripDetails.driver': { ar: 'السائق', en: 'Driver' },
  'tripDetails.goBack': { ar: 'العودة', en: 'Go Back' },
  'tripDetails.groupPoint': { ar: 'نقطة التجمع', en: 'Gathering Point' },
  'tripDetails.joinWaitlist': { ar: 'انضم لقائمة الانتظار', en: 'Join Waitlist' },
  'tripDetails.noRatings': { ar: 'لا توجد تقييمات بعد', en: 'No ratings yet' },
  'tripDetails.notes': { ar: 'ملاحظات', en: 'Notes' },
  'tripDetails.notFound': { ar: 'الرحلة غير موجودة', en: 'Trip not found' },
  'tripDetails.onWaitlist': { ar: 'أنت في قائمة الانتظار', en: 'On Waitlist' },
  'tripDetails.passengers': { ar: 'الركاب', en: 'Passengers' },
  'tripDetails.price': { ar: 'السعر', en: 'Price' },
  'tripDetails.pricePerSeat': { ar: 'سعر المقعد', en: 'Price per Seat' },
  'tripDetails.processing': { ar: 'جاري المعالجة...', en: 'Processing...' },
  'tripDetails.rateDriver': { ar: 'قيّم السائق', en: 'Rate Driver' },
  'tripDetails.ratings': { ar: 'التقييمات', en: 'Ratings' },
  'tripDetails.reviewPlaceholder': { ar: 'اكتب تقييمك...', en: 'Write your review...' },
  'tripDetails.seatConfirmed': { ar: 'مقعدك مؤكد', en: 'Your seat is confirmed' },
  'tripDetails.seats': { ar: 'المقاعد', en: 'Seats' },
  'tripDetails.seatSuffix': { ar: 'مقعد', en: 'seat(s)' },
  'tripDetails.selectSeats': { ar: 'اختر عدد المقاعد', en: 'Select Seats' },
  'tripDetails.submitRating': { ar: 'إرسال التقييم', en: 'Submit Rating' },
  'tripDetails.submitting': { ar: 'جاري الإرسال...', en: 'Submitting...' },
  'tripDetails.time': { ar: 'الوقت', en: 'Time' },
  'tripDetails.total': { ar: 'الإجمالي', en: 'Total' },
  'tripDetails.totalTripPrice': { ar: 'إجمالي سعر الرحلة', en: 'Total Trip Price' },
  'tripDetails.tripControls': { ar: 'التحكم بالرحلة', en: 'Trip Controls' },
  'tripDetails.verified': { ar: 'موثق', en: 'Verified' },
  'tripDetails.viewMyBookings': { ar: 'عرض حجوزاتي', en: 'View My Bookings' },
  'tripDetails.youAreBooked': { ar: 'أنت محجوز على هذه الرحلة', en: 'You are booked on this trip' },

  // ══════════ Create Trip (extra keys) ══════════
  'createTrip.destinationPoint': { ar: 'نقطة الوصول', en: 'Destination Point' },
  'createTrip.pickLocationsOnMap': { ar: 'حدد المواقع على الخريطة', en: 'Pick locations on the map' },
} as const;

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Get the current locale from localStorage (client-side only).
 * Falls back to 'ar' (Arabic) as the default language.
 */
export function getLocale(): Locale {
  if (typeof window === 'undefined') return 'ar';
  return (window.localStorage.getItem('mashaweer-locale') as Locale) || 'ar';
}

/**
 * Translate a key to the current locale.
 * Returns the key itself if no translation is found (for debugging).
 */
export function t(key: TranslationKey, locale?: Locale): string {
  const l = locale || getLocale();
  const entry = translations[key];
  if (!entry) {
    console.warn(`[i18n] Missing translation key: "${key}"`);
    return key as string;
  }
  return entry[l] || entry.en || (key as string);
}

/**
 * Get all translation keys matching a prefix.
 * Useful for iterating over a section's translations.
 */
export function getKeysWithPrefix(prefix: string): TranslationKey[] {
  return (Object.keys(translations) as TranslationKey[]).filter((key) =>
    (key as string).startsWith(prefix)
  );
}
