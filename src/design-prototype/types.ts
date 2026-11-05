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
  reliability: string;
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
  role: 'مستقل' | 'متجر إلكتروني' | 'مكتب خدمات';
  status: 'active' | 'suspended' | 'trial';
  tasksCount: number;
  creditsBalance: number;
  joinedDate: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  userName: string;
  type: 'استهلاك مهمة' | 'شحن رصيد' | 'تسوية إدارية' | 'ترقية باقة';
  amount: number;
  timestamp: string;
  taskRef?: string;
}

export interface AdminAuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
}
