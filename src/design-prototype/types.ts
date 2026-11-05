export type VisualTheme = 'deep-azure' | 'obsidian-gold' | 'technical-emerald';

export type PrototypeView =
  | 'web-app'
  | 'mobile-app'
  | 'admin-panel'
  | 'states-matrix'
  | 'flow-visualizer'
  | 'design-doc';

export type TaskType = 'web-search' | 'file-analysis' | 'deliverable-gen';

export interface SourceCitation {
  id: number;
  title: string;
  domain: string;
  snippet: string;
  url: string;
  isExample: boolean;
  reliabilityLabel: string;
}

export interface GroundedDoc {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'xlsx';
  size: string;
  pagesOrRows: string;
  uploadedAt: string;
  excerptSnippet: string;
  citations: {
    location: string;
    text: string;
  }[];
}

export interface DeliverableArtifact {
  id: string;
  title: string;
  type: 'report' | 'table' | 'presentation';
  format: 'pdf' | 'docx' | 'xlsx';
  wordCount: number;
  readTime: string;
  summary: string;
  content: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'مستقل (تجريبي)' | 'متجر تجريبي' | 'مكتب تجريبي';
  status: 'active' | 'suspended' | 'trial';
  tasksCount: number;
  creditsAvailable: number;
  creditsFrozen: number;
  joinedDate: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  userName: string;
  type: 'إضافة رصيد (محاكاة)' | 'خصم رصيد (محاكاة)' | 'تجميد رصيد (محاكاة)' | 'تحرير رصيد (محاكاة)';
  amount: number;
  reason: string;
  timestamp: string;
  executedBy: string;
}

export interface AdminAuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
  isMockLog: boolean;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  mockKeyDisplay: string;
  models: {
    id: string;
    name: string;
    isDefault?: boolean;
    assignedTask?: 'بحث الويب' | 'تحليل الملفات' | 'إنشاء المخرجات' | 'عام';
  }[];
}
