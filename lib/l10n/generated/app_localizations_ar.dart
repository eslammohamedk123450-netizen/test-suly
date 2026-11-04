// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appName => 'SULY AI';

  @override
  String get tagline => 'More Than AI. Your Intelligent Partner.';

  @override
  String get navHome => 'الرئيسية';

  @override
  String get navChat => 'محادثة';

  @override
  String get navAdmin => 'الإدارة';

  @override
  String get languageMenuTooltip => 'تغيير اللغة';

  @override
  String get languageArabic => 'العربية';

  @override
  String get languageEnglish => 'English';

  @override
  String get welcomeEyebrow => 'شريكك الذكي';

  @override
  String get welcomeTitle => 'إنجاز أوضح، من مكان واحد.';

  @override
  String get welcomeSubtitle => 'اعمل وأنشئ وابحث وفكّر بمساعدة شريك ذكي واحد.';

  @override
  String get startConversation => 'ابدأ محادثة';

  @override
  String get privacyNote => 'ستظهر محادثاتك هنا بعد تسجيل الدخول.';

  @override
  String get emptyActivityNote => 'لا توجد مهام تجريبية أو سجل جاهز هنا.';

  @override
  String get loading => 'جارٍ التحميل…';

  @override
  String get loginTitle => 'سجّل الدخول لبدء المحادثة';

  @override
  String get registerTitle => 'إنشاء حساب جديد';

  @override
  String get email => 'البريد الإلكتروني';

  @override
  String get password => 'كلمة المرور';

  @override
  String get minimumPassword => 'استخدم 8 أحرف على الأقل عند إنشاء الحساب.';

  @override
  String get signIn => 'تسجيل الدخول';

  @override
  String get createAccount => 'إنشاء حساب';

  @override
  String get createAccountAndChat => 'إنشاء الحساب وبدء المحادثة';

  @override
  String get registerPrompt => 'مستخدم جديد؟ أنشئ حسابًا';

  @override
  String get loginPrompt => 'لديك حساب؟ سجّل الدخول';

  @override
  String get chatHistory => 'سجل المحادثات';

  @override
  String get conversationFallback => 'محادثة';

  @override
  String get conversationLabel => 'المحادثة';

  @override
  String get newConversation => 'محادثة جديدة';

  @override
  String get signOut => 'تسجيل الخروج';

  @override
  String get emptyChatTitle => 'ما الذي تريد أن نعمل عليه؟';

  @override
  String get emptyChatBody =>
      'اكتب رسالتك أو استخدم الميكروفون للإملاء الصوتي بالعربية.';

  @override
  String get connectionError =>
      'تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت ثم أعد المحاولة.';

  @override
  String get insufficientCredits =>
      'رصيد الحساب غير كافٍ. تواصل مع مدير النظام.';

  @override
  String get providerNotReady =>
      'خدمة الذكاء الاصطناعي غير جاهزة. يحتاج المدير إلى إعداد مزود ونموذج مفعّل.';

  @override
  String get invalidCredentials => 'بيانات الدخول غير صحيحة أو انتهت الجلسة.';

  @override
  String get emailAlreadyRegistered =>
      'هذا البريد مسجل بالفعل. سجّل الدخول بدلًا من ذلك.';

  @override
  String get tooManyRequests => 'تم تجاوز حد الطلبات مؤقتًا. حاول بعد قليل.';

  @override
  String requestFailed(int status) {
    return 'تعذر إكمال الطلب (الرمز $status).';
  }

  @override
  String get requiredCredentials =>
      'أدخل البريد الإلكتروني وكلمة المرور أولًا.';

  @override
  String get passwordTooShort =>
      'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.';

  @override
  String get missingAccessToken => 'لم يُرجع الخادم رمز دخول صالحًا.';

  @override
  String get conversationCreateFailed => 'تعذر إنشاء محادثة جديدة.';

  @override
  String get emptyModelReply => 'لم يصل رد من النموذج.';

  @override
  String microphoneError(String message) {
    return 'تعذر استخدام الميكروفون: $message';
  }

  @override
  String get speechUnavailable => 'الإملاء الصوتي غير مدعوم في هذا المتصفح.';

  @override
  String get microphonePermissionDenied => 'لم يُسمح بالوصول إلى الميكروفون.';

  @override
  String get stopListening => 'إيقاف الاستماع';

  @override
  String get dictateArabic => 'إملاء صوتي بالعربية';

  @override
  String get listening => 'أستمع إليك…';

  @override
  String get composerHint => 'اكتب رسالتك…';

  @override
  String get send => 'إرسال';

  @override
  String get adminSignIn => 'دخول لوحة الإدارة';

  @override
  String get adminProtected =>
      'الوصول محمي بصلاحيات الخادم. لا توجد كلمة مرور افتراضية.';

  @override
  String get checking => 'جارٍ التحقق…';

  @override
  String get addProviderTitle => 'إضافة مزود ذكاء اصطناعي';

  @override
  String get connectionName => 'اسم لتمييز الاتصال';

  @override
  String get connectionNameExample => 'مثال: مزود Groq الرئيسي';

  @override
  String get connectionNameRequired => 'اكتب اسمًا للاتصال.';

  @override
  String get provider => 'مزود الخدمة';

  @override
  String get apiKey => 'مفتاح API';

  @override
  String get apiKeyRequired => 'أدخل مفتاح API من حسابك لدى المزود.';

  @override
  String get encryptedKeyHint => 'يُحفظ مشفرًا على الخادم ولا يُعرض كاملًا.';

  @override
  String get providerSetupHelp =>
      'سنكتشف النماذج تلقائيًا. عند رفض نموذج لطلب المحادثة، قد ينتقل النظام للنموذج التالي ويتوقف عند أول رد ناجح. قد تُطبق حدود أو رسوم المزود على المحاولات.';

  @override
  String get cancel => 'إلغاء';

  @override
  String get discoverAndSave => 'اكتشف النماذج واحفظ';

  @override
  String providerSavedCount(int count) {
    return 'تم حفظ الاتصال واكتشاف $count نموذجًا.';
  }

  @override
  String get adminOverview => 'نظرة عامة';

  @override
  String get adminUsers => 'المستخدمون';

  @override
  String get adminProviders => 'مزودو الذكاء الاصطناعي';

  @override
  String get adminModels => 'النماذج';

  @override
  String get adminPlans => 'خطط الاشتراك';

  @override
  String get adminSettings => 'إعدادات النظام';

  @override
  String get adminAudit => 'سجل النشاط';

  @override
  String get adminTitle => 'لوحة الإدارة';

  @override
  String get refresh => 'تحديث';

  @override
  String get addProviderTooltip => 'إضافة مزود واكتشاف نماذجه';

  @override
  String get noData => 'لا توجد بيانات متاحة.';

  @override
  String get adminModuleNotConnected =>
      'لم تُربط هذه الوحدة بواجهة الإدارة بعد.';

  @override
  String get metricTotalUsers => 'المستخدمون';

  @override
  String get metricActiveUsers => 'المستخدمون النشطون';

  @override
  String get metricNewUsers => 'المستخدمون الجدد';

  @override
  String get metricProjects => 'المشاريع';

  @override
  String get metricActiveAdmins => 'المشرفون النشطون';

  @override
  String get metricCreditsConsumed => 'الأرصدة المستهلكة';

  @override
  String get metricActiveProviders => 'المزودون الفعالون';

  @override
  String get metricAvailableModels => 'النماذج المتاحة';

  @override
  String get recentActivity => 'آخر النشاطات';

  @override
  String get noRecentActivity => 'لا توجد نشاطات مسجلة بعد.';

  @override
  String get noUsers => 'لا يوجد مستخدمون مسجلون.';

  @override
  String get noProviders => 'لم يتم إعداد مزودين بعد.';

  @override
  String get noModels => 'لم يتم إعداد نماذج بعد.';

  @override
  String get noPlans => 'لم يتم إنشاء خطط بعد.';

  @override
  String get noSettings => 'لا توجد إعدادات مخصصة بعد.';

  @override
  String get noAudit => 'لا توجد سجلات إدارية بعد.';

  @override
  String get active => 'فعال';

  @override
  String get inactive => 'غير فعال';

  @override
  String creditBalance(int balance) {
    return 'الرصيد: $balance';
  }

  @override
  String get emptyAdminList => 'لا توجد عناصر متاحة.';
}
