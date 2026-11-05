import {
  SourceCitation,
  GroundedDoc,
  DeliverableArtifact,
  AdminUser,
  CreditTransaction,
  AdminAuditLog,
  AIProviderConfig,
} from './types';

export const MOCK_SEARCH_SOURCES: SourceCitation[] = [
  {
    id: 1,
    title: 'دراسة افتراضية: مؤشرات الشحن للتجارة الإلكترونية (بيانات نموذجية)',
    domain: 'shipping-study.example',
    snippet: 'مقتطف افتراضي يُظهر أرقاماً تقريبية للاسترشاد فقط في إطار نموذج التصميم.',
    url: 'https://shipping-study.example/sample-report',
    isExample: true,
    reliabilityLabel: 'وصف تجريبي للمصدر (بيانات اختبار)',
  },
  {
    id: 2,
    title: 'دليل افتراضي: معايير مقارنة حلول التوصيل (بيانات نموذجية)',
    domain: 'logistics-guide.example',
    snippet: 'نص افتراضي لتوضيح كيفية عرض ملخصات البحث والروابط للمستخدم.',
    url: 'https://logistics-guide.example/comparison-sample',
    isExample: true,
    reliabilityLabel: 'وصف تجريبي للمصدر (بيانات اختبار)',
  },
  {
    id: 3,
    title: 'نشرة افتراضية: تقديرات تكاليف الأعمال المصغرة (بيانات نموذجية)',
    domain: 'business-costs.example',
    snippet: 'مثال توضيحي لبطاقة المصدر وكيفية إحالة المعلومات بنموذج التصميم.',
    url: 'https://business-costs.example/sample-insight',
    isExample: true,
    reliabilityLabel: 'وصف تجريبي للمصدر (بيانات اختبار)',
  },
];

export const MOCK_GROUNDED_DOCS: GroundedDoc[] = [
  {
    id: 'doc-contract-sample',
    name: 'نموذج_عقد_توريد_افتراضي.pdf',
    type: 'pdf',
    size: 'حجم توضيحي (الحد الأقصى سيُحدد لاحقاً)',
    pagesOrRows: '12 صفحة افتراضية',
    uploadedAt: 'عنصر اختبار',
    excerptSnippet: 'ملف افتراضي مخصص لاختبار واجهة استخراج البنود والمراجع المكانية.',
    citations: [
      {
        location: 'صفحة 4 · بند افتراضي 8.2 (شروط السداد النموذجية)',
        text: 'يلتزم الطرف الثاني بسداد المستحقات شهرياً خلال 10 أيام عمل عبر تحويل بنكي (نص افتراضي للتصميم).',
      },
      {
        location: 'صفحة 7 · بند افتراضي 12.1 (شروط الفسخ النموذجية)',
        text: 'يحق لأي من الطرفين إنهاء الاتفاقية بإخطار خطي مسبق مدته ثلاثون يوماً (نص افتراضي للتصميم).',
      },
      {
        location: 'صفحة 11 · بند افتراضي 15.4 (الحد الأدنى النموذجي)',
        text: 'يُشترط التزام المتجر بحد أدنى من العمليات للحفاظ على الفئة التفضيلية (نص افتراضي للتصميم).',
      },
    ],
  },
  {
    id: 'doc-pricing-sample',
    name: 'نموذج_جدول_تكاليف_افتراضي.xlsx',
    type: 'xlsx',
    size: 'حجم توضيحي (الحد الأقصى سيُحدد لاحقاً)',
    pagesOrRows: '3 أوراق عمل افتراضية',
    uploadedAt: 'عنصر اختبار',
    excerptSnippet: 'جدول افتراضي لاختبار واجهة استخراج الأرقام من ملفات Excel.',
    citations: [
      {
        location: 'ورقة [الأرباح النموذجية] · صف 14',
        text: 'هامش الربح التقديري المحسوب افتراضياً للمنتج النموذجي (نص تجريبي).',
      },
    ],
  },
];

export const MOCK_DELIVERABLES: DeliverableArtifact[] = [
  {
    id: 'art-sample-01',
    title: 'مسودة افتراضية: عرض خدمات وتوزيع تجاري (نموذج تصميم)',
    type: 'report',
    format: 'pdf',
    wordCount: 350,
    readTime: 'قراءة تجريبية دقيقة واحدة',
    summary: 'مسودة افتراضية لتوضيح شكل المعاينة والتنزيل — المحتوى تمثيلي فقط.',
    createdAt: 'مخرج تجريبي',
    content: `# عرض خدمات لوجستية وتوزيع (مسودة افتراضية للتصميم)
**تنبيه:** هذا المحتوى تجريبي لتوضيح شكل وتنسيق المخرج القابل للمعاينة والتنزيل فقط، ولا يمثل اتفاقية أو عرضاً فعلياً.

---

### 1. نبذة عن نطاق العمل (افتراضي)
يسرنا تقديم هذا النموذج لتوضيح طريقة إعداد التقارير بالعربية بنسق جاهز للمراجعة والطباعة.

### 2. جدول أسعار افتراضي (للتصميم فقط — الأسعار غير معتمدة)
| الخدمة الافتراضية | النطاق النموذجي | زمن التوصيل الافتراضي | السعر التوضيحي (غير معتمد) |
| :--- | :--- | :--- | :--- |
| خدمة تجريبية أ | داخل المدينة | 24 ساعة | رقم افتراضي للتصميم |
| خدمة تجريبية ب | بين المدن | 48 ساعة | رقم افتراضي للتصميم |

### 3. شروط عامة افتراضية
- هذا المستند يمثل محاكاة لتوليد التقارير في المرحلة الأولى.
- التنزيل يمثل محاكاة واجهة ولن يؤثر على أي ملفات أو أنظمة خارجية.`,
  },
  {
    id: 'art-sample-02',
    title: 'جدول مقارنة افتراضي (نموذج تصميم)',
    type: 'table',
    format: 'xlsx',
    wordCount: 180,
    readTime: 'قراءة تجريبية دقيقة واحدة',
    summary: 'جدول افتراضي لتوضيح إمكانية استخراج وتنزيل ملفات الجداول.',
    createdAt: 'مخرج تجريبي',
    content: `جدول افتراضي للتصميم فقط:
- خيار تجريبي 1: مواصفات نموذجية
- خيار تجريبي 2: مواصفات نموذجية`,
  },
];

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: 'USR-TEST-001',
    name: 'مستخدم تجريبي 01',
    email: 'user01@example.com',
    role: 'متجر تجريبي',
    status: 'active',
    tasksCount: 14,
    creditsAvailable: 50,
    creditsFrozen: 10,
    joinedDate: '2026-01-15 (تاريخ افتراضي)',
  },
  {
    id: 'USR-TEST-002',
    name: 'مستخدم تجريبي 02',
    email: 'user02@example.com',
    role: 'مستقل (تجريبي)',
    status: 'trial',
    tasksCount: 6,
    creditsAvailable: 25,
    creditsFrozen: 0,
    joinedDate: '2026-02-01 (تاريخ افتراضي)',
  },
  {
    id: 'USR-TEST-003',
    name: 'مستخدم تجريبي 03',
    email: 'user03@example.com',
    role: 'مكتب تجريبي',
    status: 'suspended',
    tasksCount: 42,
    creditsAvailable: 0,
    creditsFrozen: 80,
    joinedDate: '2026-01-10 (تاريخ افتراضي)',
  },
];

export const MOCK_CREDIT_TRANSACTIONS: CreditTransaction[] = [
  {
    id: 'TX-TEST-101',
    userId: 'USR-TEST-001',
    userName: 'مستخدم تجريبي 01',
    type: 'إضافة رصيد (محاكاة)',
    amount: 50,
    reason: 'شحن رصيد تجريبي لاختبار واجهة المشرف',
    timestamp: '2026-01-20 10:00 (افتراضي)',
    executedBy: 'admin@example.com',
  },
  {
    id: 'TX-TEST-102',
    userId: 'USR-TEST-001',
    userName: 'مستخدم تجريبي 01',
    type: 'تجميد رصيد (محاكاة)',
    amount: -10,
    reason: 'حجز تجريبي لمهمة قيد المعالجة (محاكاة فقط)',
    timestamp: '2026-01-20 11:30 (افتراضي)',
    executedBy: 'نظام آلي (محاكاة)',
  },
  {
    id: 'TX-TEST-103',
    userId: 'USR-TEST-002',
    userName: 'مستخدم تجريبي 02',
    type: 'تحرير رصيد (محاكاة)',
    amount: 10,
    reason: 'إلغاء حجز تجريبي بعد إيقاف المهمة',
    timestamp: '2026-01-20 12:15 (افتراضي)',
    executedBy: 'admin@example.com',
  },
];

export const MOCK_ADMIN_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'LOG-TEST-01',
    actor: 'admin@example.com',
    action: 'تعديل تخصيص النموذج الافتراضي (محاكاة واجهة)',
    target: 'مزود اختبار / نموذج افتراضي',
    timestamp: '2026-01-20 09:30 (افتراضي)',
    ip: '192.0.2.1 (عنوان تجريبي)',
    isMockLog: true,
  },
  {
    id: 'LOG-TEST-02',
    actor: 'admin@example.com',
    action: 'إضافة رصيد تجريبي للمستخدم (محاكاة واجهة)',
    target: 'USR-TEST-001 (50 نقطة افتراضية)',
    timestamp: '2026-01-20 10:00 (افتراضي)',
    ip: '192.0.2.1 (عنوان تجريبي)',
    isMockLog: true,
  },
];

export const MOCK_AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'provider-test-google',
    name: 'مزود الذكاء الاصطناعي 1 (تجريبي)',
    status: 'active',
    mockKeyDisplay: 'sk-mock-google-••••••••••••',
    models: [
      { id: 'model-fast', name: 'نموذج سريع (مخصص للبحث والتلخيص - تمثيلي)', isDefault: true, assignedTask: 'بحث الويب' },
      { id: 'model-advanced', name: 'نموذج متقدم (مخصص لتحليل الملفات - تمثيلي)', assignedTask: 'تحليل الملفات' },
    ],
  },
  {
    id: 'provider-test-secondary',
    name: 'مزود الذكاء الاصطناعي 2 (تجريبي / بديل)',
    status: 'inactive',
    mockKeyDisplay: 'sk-mock-secondary-••••••••••••',
    models: [
      { id: 'model-secondary-general', name: 'نموذج عام بديل (تمثيلي)', assignedTask: 'عام' },
    ],
  },
];
