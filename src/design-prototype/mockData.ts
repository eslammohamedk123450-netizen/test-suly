import {
  SourceCitation,
  GroundedDoc,
  DeliverableArtifact,
  AdminUser,
  CreditTransaction,
  AdminAuditLog,
} from './types';

export const MOCK_SEARCH_SOURCES: SourceCitation[] = [
  {
    id: 1,
    title: 'تقرير التجارة الإلكترونية وحلول الشحن اللوجستي في السعودية 2026',
    domain: 'logistics-arabia.com',
    snippet: 'تراوحت أسعار الشحن الداخلي بين 18 إلى 26 ريالاً للشحنات الخفيفة عبر الشركات الناشئة، بينما تستقر الشركات الكبرى عند 28-35 ريالاً مع مزايا التوصيل في نفس اليوم.',
    url: 'https://logistics-arabia.com/reports/saudi-shipping-2026',
    reliability: 'تقرير قطاعي معتمد',
  },
  {
    id: 2,
    title: 'دليل أصحاب المتاجر: مقارنة شركات الشحن السريع في الخليج',
    domain: 'ecommerce-guide.sa',
    snippet: 'أهم معايير الاختيار لأصحاب المتاجر الصغيرة هي نسبة نجاح التسليم من المحاولة الأولى وتوفر خيار الدفع عند الاستلام الإلكتروني.',
    url: 'https://ecommerce-guide.sa/shipping-comparison',
    reliability: 'دليل أعمال موثق',
  },
  {
    id: 3,
    title: 'نشرة التكلفة التشغيلية لرواد الأعمال والمستقلين',
    domain: 'businesspulse.me',
    snippet: 'متوسط استهلاك المتاجر المصغرة للشحن يمثل 12% من إجمالي هامش الربح، مما يجعل الاتفاقيات المخفضة ذات الحد الأدنى الأسبوعي الخيار الأوفر.',
    url: 'https://businesspulse.me/insights/retail-costs',
    reliability: 'نشرة اقتصادية دورية',
  },
];

export const MOCK_GROUNDED_DOCS: GroundedDoc[] = [
  {
    id: 'doc-contract-01',
    name: 'عقد_توريد_وشحن_المتجر_2026.pdf',
    type: 'pdf',
    size: '3.4 MB',
    pagesOrRows: '18 صفحة',
    uploadedAt: 'منذ ساعتين',
    excerptSnippet: 'اتفاقية توريد خدمات لوجستية وتوزيع بين متجر النخبة وشركة المسار السريع.',
    citations: [
      {
        location: 'صفحة 4 · بند 8.2 (شروط السداد)',
        text: 'يلتزم الطرف الثاني بسداد المستحقات شهرياً خلال 10 أيام عمل من تاريخ إصدار كشف الحساب المعتمد عبر التحويل البنكي المباشر.',
      },
      {
        location: 'صفحة 7 · بند 12.1 (شروط الفسخ والتعويض)',
        text: 'يحق لأي من الطرفين إنهاء الاتفاقية بإخطار خطي مسبق مدته ثلاثون يوماً، مع تسوية كامل الذمم المالية المعلقة.',
      },
      {
        location: 'صفحة 11 · بند 15.4 (الحد الأدنى للشحنات)',
        text: 'يُشترط التزام المتجر بحد أدنى قدره 120 شحنة شهرياً للحفاظ على فئة السعر التفضيلية (21 ريالاً للشحنة).',
      },
    ],
  },
  {
    id: 'doc-pricing-02',
    name: 'جدول_تكاليف_المنتجات_والأرباح.xlsx',
    type: 'xlsx',
    size: '1.2 MB',
    pagesOrRows: '4 أوراق عمل · 280 صفاً',
    uploadedAt: 'أمس',
    excerptSnippet: 'حساب هوامش الربح للمنتجات الأكثر طلباً لعام 2026 وتكاليف التعبئة والتسويق.',
    citations: [
      {
        location: 'ورقة [الأرباح] · صف 14',
        text: 'هامش الربح الصافي للقطعة رقم SK-204 يبلغ 38.5% بعد خصم تكاليف الشحن والعمولات.',
      },
    ],
  },
];

export const MOCK_DELIVERABLES: DeliverableArtifact[] = [
  {
    id: 'art-01',
    title: 'مسودة عرض أسعار وخدمات متكاملة لعميل تجاري',
    type: 'report',
    format: 'pdf',
    wordCount: 840,
    readTime: '3 دقائق',
    summary: 'عرض سعر احترافي مخصص لمتجر عطور ومستحضرات تجميل يشمل إدارة الطلبات والتسليم في 24 ساعة وضمان الجودة.',
    createdAt: 'منذ 15 دقيقة',
    content: `# عرض خدمات لوجستية وتوزيع مخصص
**مقدم إلى:** متجر الأناقة للمستحضرات والعطور  
**التاريخ:** نوفمبر 2026  
**المرجع:** SULY-PROP-2026-089  

---

### 1. نبذة عن نطاق العمل
يسرنا تقديم هذا العرض لإدارة عمليات التوزيع والتوصيل السريع لمتجركم في جميع مناطق المملكة، مع التركيز على تجربة عميل راقية، وتغليف آمن ومحكم للمنتجات الحساسة، وربط تقني فوري لمتابعة الشحنات خطوة بخطوة.

### 2. باقات الأسعار المعتمدة
| الخدمة | النطاق الجغرافي | زمن التوصيل | السعر للطلب (ريال) |
| :--- | :--- | :--- | :--- |
| التوصيل الفائق | داخل المدن الرئيسية | خلال 4 إلى 8 ساعات | 26.00 |
| التوصيل السريع | بين المدن الرئيسية | 24 - 48 ساعة | 22.00 |
| الشحن للمناطق البعيدة | القرى والضواحي | 48 - 72 ساعة | 29.00 |

### 3. شروط الدفع والضمان
- السداد بنظام الفوترة النصف شهرية عبر التحويل البنكي.
- تأمين شامل مجاني على الشحنات بقيمة تصل إلى 1,000 ريال للطلب الواحد.
- لوحة تحكم إلكترونية مدمجة مجاناً لتتبع مسار المندوبين وإشعارات الرسائل للعملاء.`,
  },
  {
    id: 'art-02',
    title: 'جدول مقارنة عروض الشحن للربع الأول 2026',
    type: 'table',
    format: 'xlsx',
    wordCount: 420,
    readTime: 'دقيقتان',
    summary: 'مقارنة دقيقة بين 4 شركات شحن محلية من حيث التكلفة، زمن التسليم، ورسوم الدفع عند الاستلام.',
    createdAt: 'منذ ساعة',
    content: `جدول المقارنة اللوجستية للربع الأول 2026:
- شركة أ: سعر 21 ر.س، زمن 24 س، نسبة التسليم 96.2%
- شركة ب: سعر 24 ر.س، زمن 18 س، نسبة التسليم 98.1%
- شركة ج: سعر 19 ر.س، زمن 48 س، نسبة التسليم 93.4%`,
  },
];

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: 'USR-8801',
    name: 'عبدالله بن سعد المطيري',
    email: 'abdullah.saad@business.sa',
    role: 'متجر إلكتروني',
    status: 'active',
    tasksCount: 142,
    creditsBalance: 88,
    joinedDate: '2026-09-12',
  },
  {
    id: 'USR-8802',
    name: 'سارة خالد المنصور',
    email: 'sara.designer@freelance.me',
    role: 'مستقل',
    status: 'active',
    tasksCount: 79,
    creditsBalance: 45,
    joinedDate: '2026-10-01',
  },
  {
    id: 'USR-8803',
    name: 'مكتب الرؤية للاستشارات المالية',
    email: 'contact@alrouya-consult.com',
    role: 'مكتب خدمات',
    status: 'active',
    tasksCount: 260,
    creditsBalance: 320,
    joinedDate: '2026-08-20',
  },
  {
    id: 'USR-8804',
    name: 'فهد العتيبي',
    email: 'fahad.store@outlook.com',
    role: 'متجر إلكتروني',
    status: 'trial',
    tasksCount: 12,
    creditsBalance: 15,
    joinedDate: '2026-11-02',
  },
];

export const MOCK_CREDIT_TRANSACTIONS: CreditTransaction[] = [
  {
    id: 'TX-9041',
    userId: 'USR-8801',
    userName: 'عبدالله بن سعد المطيري',
    type: 'استهلاك مهمة',
    amount: -1,
    timestamp: '2026-11-05 11:24:10',
    taskRef: 'تحليل عقد التوريد واستخراج الشروط',
  },
  {
    id: 'TX-9040',
    userId: 'USR-8803',
    userName: 'مكتب الرؤية للاستشارات',
    type: 'شحن رصيد',
    amount: +100,
    timestamp: '2026-11-05 10:15:00',
    taskRef: 'شحن عبر باقة الأعمال المصغرة',
  },
  {
    id: 'TX-9039',
    userId: 'USR-8802',
    userName: 'سارة خالد المنصور',
    type: 'استهلاك مهمة',
    amount: -1,
    timestamp: '2026-11-05 09:42:33',
    taskRef: 'بحث أسعار الشحن والتوصيل 2026',
  },
  {
    id: 'TX-9038',
    userId: 'USR-8804',
    userName: 'فهد العتيبي',
    type: 'تسوية إدارية',
    amount: +10,
    timestamp: '2026-11-04 16:30:12',
    taskRef: 'منحة ترحيبية للمستخدم الجديد',
  },
];

export const MOCK_ADMIN_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'LOG-551',
    actor: 'admin@suly.ai',
    action: 'تعديل النموذج الافتراضي لأداة البحث',
    target: 'Gemini 3.8 Flash (Grounding Enabled)',
    timestamp: '2026-11-05 08:30:15',
    ip: '192.168.1.104',
  },
  {
    id: 'LOG-550',
    actor: 'admin@suly.ai',
    action: 'إضافة تسوية رصيد ترحيبية للمستخدم فهد العتيبي',
    target: 'USR-8804 (+10 نقاط)',
    timestamp: '2026-11-04 16:30:12',
    ip: '192.168.1.104',
  },
  {
    id: 'LOG-549',
    actor: 'superadmin@suly.ai',
    action: 'تحديث هوية النظام وشعار SULY AI',
    target: 'Branding Settings (Theme: Sovereign Azure)',
    timestamp: '2026-11-04 14:10:00',
    ip: '192.168.1.101',
  },
];
