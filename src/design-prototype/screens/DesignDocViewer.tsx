import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  CheckCircle2,
  Bookmark,
  Share2,
} from 'lucide-react';
import { VisualTheme } from '../types';
import { THEME_CONFIGS } from '../themeTokens';

interface DesignDocViewerProps {
  theme: VisualTheme;
}

export const DesignDocViewer: React.FC<DesignDocViewerProps> = ({ theme }) => {
  const cfg = THEME_CONFIGS[theme];

  const [copied, setCopied] = useState(false);

  const handleDownloadMarkdown = () => {
    const element = document.createElement('a');
    element.setAttribute('href', '/PHASE_1_PRODUCT_DESIGN.md');
    element.setAttribute('download', 'PHASE_1_PRODUCT_DESIGN.md');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyMarkdown = () => {
    fetch('/PHASE_1_PRODUCT_DESIGN.md')
      .then((res) => res.text())
      .then((text) => {
        navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <div className={`p-4 lg:p-8 min-h-[calc(100vh-52px)] ${cfg.bgClass} text-neutral-100 max-w-4xl mx-auto space-y-6`}>
      {/* Document Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${cfg.chipClass} font-mono`}>
            وثيقة الاعتماد الرسمية · PHASE_1_PRODUCT_DESIGN.md
          </span>
          <h1 className="text-base sm:text-xl font-bold text-white mt-1.5">
            وثيقة تصميم المنتج وتجربة الاستخدام — المرحلة الأولى
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            المستخدم العربي المستهدف · المهام الثلاث المعتمدة · شاشات الويب والهاتف والإدارة · الاتجاهات البصرية
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg ${cfg.buttonPrimaryClass} font-medium transition-colors`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>تنزيل الملف (.md)</span>
          </button>
        </div>
      </div>

      {/* Structured Document Content Container */}
      <div className={`p-6 sm:p-8 rounded-3xl ${cfg.surfaceClass} border ${cfg.borderClass} shadow-xl space-y-6 text-right leading-relaxed text-xs sm:text-sm text-neutral-200`}>
        {/* Section 1 */}
        <section className="space-y-2 border-b border-neutral-800/80 pb-5">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>1. ملخص نتائج فحص المستودع والواجهة الحالية</span>
          </h2>
          <p className="text-neutral-300">
            تمت مطابقة الكود الفعلي بالمستودع ووجد أن البنية التقنية (React + Tailwind + Vite) ممتازة وداعمة للـ RTL. تم نقل التركيز من الشات التقليدي إلى مساحة عمل وكيل مهام متخصصة تركز حصرياً على المهام الثلاث المعتمدة (بحث الويب وتوثيق الروابط، تحليل ملفات PDF/Excel والإحالة لمواضعها، وتوليد مخرجات عمل قابلة للتنزيل)، مع عزل لوحة الإدارة في نطاق مستقل تماماً.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2 border-b border-neutral-800/80 pb-5">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>2. تدفقات الاستخدام المعتمدة (User & Admin Flows)</span>
          </h2>
          <p className="text-neutral-300">
            تم توثيق كافة التدفقات من البداية للنهاية: التعريف المختصر دون حشو، تتبع خطوات الأدوات، تقديم بطاقات المصادر الموثوقة لمنع الهلوسة، وإبراز مواضع الاقتباس في العقود مثل [ص 4 · بند 8.2]، ولوحة المخرجات المخصصة للمعاينة والتنزيل بصيغ متعددة (PDF, Word, Excel).
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-2 border-b border-neutral-800/80 pb-5">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>3. دليل الشاشات وأولوية الهاتف ولوحة الإدارة</span>
          </h2>
          <p className="text-neutral-300">
            تم إعطاء الأولوية القصوى لتجربة الهاتف الذكي وفق معايير بيئة العمل العربية (Thumb Zone): شريط تبويبات سفلي بارتفاع مريح وأزرار لمس بمساحة 44 بكسل على الأقل، وأوراق سحب سفلية للمخرجات والمصادر. وعلى الحاسوب، توفر الواجهة مساحة عمل متكاملة بنظام العرض المنقسم (Split View).
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2 border-b border-neutral-800/80 pb-5">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>4. الاتجاهات البصرية الثلاثة والتوصية</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-blue-500/40 space-y-1">
              <span className="text-[10px] text-blue-400 font-bold">الاتجاه الموصى به</span>
              <p className="font-bold text-white text-xs">النيلي العميق والأزرق الذكي</p>
              <p className="text-[11px] text-neutral-400">أعلى درجات الراحة البصرية وتباين WCAG AA للأعمال والتقارير اليومية.</p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-amber-500/30 space-y-1">
              <span className="text-[10px] text-amber-400 font-bold">خيار الفخامة</span>
              <p className="font-bold text-white text-xs">الذهب والأوبسيديان الملكي</p>
              <p className="text-[11px] text-neutral-400">تطوير رصين للثيم السابق بوقار تنفيذي واثق وهادئ.</p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold">خيار التجارة</span>
              <p className="font-bold text-white text-xs">الرمادي والزمرد التقني</p>
              <p className="text-[11px] text-neutral-400">يعبر عن النمو والاستقرار المالي ومريح للمتاجر والحسابات.</p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-2 border-b border-neutral-800/80 pb-5">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>5. معجم حالات الواجهة وسلوكها</span>
          </h2>
          <p className="text-neutral-300">
            تحديد دقيق للحالات التسع: التحميل الوميضي، تتبع خطوات الأدوات، اكتمال المهمة، الخطأ المؤقت، الشاشات الفارغة، الملفات غير المدعومة، طلب التوضيح، طلب الموافقة الحساسة، ورسالة رصيد الباقة باحترام دون فرض سياسات غير معتمدة.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 pt-1">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>6. قائمة القرارات المطلوب اعتمادها للمرحلة القادمة</span>
          </h2>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-neutral-300 mr-2">
            <li><strong>اعتماد الاتجاه البصري:</strong> اختيار السمة اللونية النهائية من بين الاتجاهات الثلاثة المعروضة تفاعلياً.</li>
            <li><strong>هيكل الرصيد:</strong> هل يُحسب بعدد المهام (مثال: 100 مهمة شهرياً) أم نقاط العمليات؟</li>
            <li><strong>الحد الأقصى للملفات:</strong> اعتماد حد 25 ميجابايت لملفات PDF و Word و Excel.</li>
            <li><strong>تسمية المخرجات:</strong> اعتماد التسمية الأنسب للمستخدم العربي (مخرجات العمل أم المستندات الجاهزة).</li>
            <li><strong>بيئة تشغيل الهاتف:</strong> هل نعتمد PWA متقدم أم تطبيق أصيل للمرحلة القادمة؟</li>
          </ul>
        </section>
      </div>
    </div>
  );
};
