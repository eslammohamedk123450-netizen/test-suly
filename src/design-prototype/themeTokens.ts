import { VisualTheme } from './types';

export interface ThemeConfig {
  id: VisualTheme;
  nameAr: string;
  subtitleAr: string;
  badgeAr: string;
  bgClass: string;
  surfaceClass: string;
  surfaceElevatedClass: string;
  borderClass: string;
  borderHoverClass: string;
  accentTextClass: string;
  accentBgClass: string;
  accentBorderClass: string;
  accentGradient: string;
  buttonPrimaryClass: string;
  chipClass: string;
  hexPrimary: string;
}

export const THEME_CONFIGS: Record<VisualTheme, ThemeConfig> = {
  'deep-azure': {
    id: 'deep-azure',
    nameAr: 'النيلي العميق والأزرق الذكي (التوصية)',
    subtitleAr: 'حكمة ومصداقية وإنتاجية عالية — راحة تامة للعين وفق معايير WCAG AA',
    badgeAr: 'الاتجاه الموصى به',
    bgClass: 'bg-[#0B1120]',
    surfaceClass: 'bg-[#111A2E]',
    surfaceElevatedClass: 'bg-[#16233B]',
    borderClass: 'border-[#1E2D4A]',
    borderHoverClass: 'hover:border-[#3B82F6]/50',
    accentTextClass: 'text-[#38BDF8]',
    accentBgClass: 'bg-[#2563EB]',
    accentBorderClass: 'border-[#2563EB]/40',
    accentGradient: 'from-[#38BDF8] via-[#2563EB] to-[#1D4ED8]',
    buttonPrimaryClass: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg shadow-blue-600/20',
    chipClass: 'bg-[#1E3A8A]/40 text-[#93C5FD] border border-[#2563EB]/30',
    hexPrimary: '#2563EB',
  },
  'obsidian-gold': {
    id: 'obsidian-gold',
    nameAr: 'الذهب الملكي والأوبسيديان الفاخر',
    subtitleAr: 'فخامة تنفيذية حصرية ووقار للمكاتب والأعمال الراقية',
    badgeAr: 'خيار الفخامة التنفيذية',
    bgClass: 'bg-[#07080A]',
    surfaceClass: 'bg-[#0F1219]',
    surfaceElevatedClass: 'bg-[#151924]',
    borderClass: 'border-[#232836]',
    borderHoverClass: 'hover:border-[#D4AF37]/50',
    accentTextClass: 'text-[#F3E5AB]',
    accentBgClass: 'bg-[#D4AF37]',
    accentBorderClass: 'border-[#D4AF37]/40',
    accentGradient: 'from-[#F3E5AB] via-[#D4AF37] to-[#AA7C11]',
    buttonPrimaryClass: 'bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E0BE4C] hover:to-[#C29D2C] text-black font-semibold shadow-lg shadow-amber-500/10',
    chipClass: 'bg-[#2B2310] text-[#F3E5AB] border border-[#D4AF37]/30',
    hexPrimary: '#D4AF37',
  },
  'technical-emerald': {
    id: 'technical-emerald',
    nameAr: 'الرمادي التقني والزمرد الهادئ',
    subtitleAr: 'استقرار وازدهار مالي ملائم للتجارة والشركات والمتاجر المصغرة',
    badgeAr: 'خيار التجارة والأعمال',
    bgClass: 'bg-[#0F172A]',
    surfaceClass: 'bg-[#1E293B]',
    surfaceElevatedClass: 'bg-[#26354D]',
    borderClass: 'border-[#334155]',
    borderHoverClass: 'hover:border-[#10B981]/50',
    accentTextClass: 'text-[#34D399]',
    accentBgClass: 'bg-[#059669]',
    accentBorderClass: 'border-[#059669]/40',
    accentGradient: 'from-[#34D399] via-[#059669] to-[#047857]',
    buttonPrimaryClass: 'bg-[#059669] hover:bg-[#047857] text-white shadow-lg shadow-emerald-600/20',
    chipClass: 'bg-[#064E3B]/40 text-[#A7F3D0] border border-[#059669]/30',
    hexPrimary: '#059669',
  },
};
