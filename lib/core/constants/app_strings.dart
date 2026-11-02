/// Centralized user-facing strings for SULY AI.
///
/// Text is grouped here so localization can be expanded later without
/// hunting through widgets. Arabic is the primary interface language;
/// English remains available as a secondary language.
abstract final class AppStrings {
  AppStrings._();

  static const String appName = 'SULY AI';
  static const String tagline = 'More Than AI. Your Intelligent Partner.';

  // Navigation labels (kept as source-of-truth labels).
  static const String navHome = 'Home';
  static const String navNewChat = 'New Chat';
  static const String navAgents = 'AI Agents';
  static const String navProjects = 'Projects';
  static const String navFiles = 'Files';
  static const String navStudio = 'Studio';
  static const String navConnectors = 'Connectors';
  static const String navSettings = 'Settings';

  // Status
  static const String underDevelopment = 'Under development';
  static const String comingSoon = 'Coming soon';
  static const String unavailable = 'Unavailable';

  // Dashboard
  static const String welcomeTitle = 'Welcome to SULY AI';
  static const String welcomeSubtitle =
      'Your intelligent partner for work, code, research, and creation.';
  static const String workspaceTitle = 'Main workspace';
  static const String startConversation = 'Start a conversation';
  static const String startConversationHint =
      'The chat engine will be available in a future step.';
  static const String futureCapabilities = 'Future capabilities';
  static const String futureCapabilitiesHint =
      'Visual previews only. These modules are not operational yet.';

  // Profile area
  static const String guestUser = 'Guest';
  static const String profileUnavailable = 'Profile available in a future step';

  // Capability titles
  static const String capAssistant = 'AI Assistant';
  static const String capAgents = 'AI Agents';
  static const String capCoding = 'Coding';
  static const String capResearch = 'Research';
  static const String capProjects = 'Projects';
  static const String capStudio = 'Studio';

  // Agent mode
  static const String agentModeTitle = 'نمط الوكيل';
  static const String normalChatMode = 'الدردشة العادية';
  static const String returnToChat = 'العودة إلى الدردشة';
  static const String agentActive = 'الوكيل نشط';
  static const String selectToolCategory = 'اختر فئة أداة (اختياري)';
  static const String continueWithoutCategory = 'المتابعة دون اختيار فئة';
  static const String switchingToAgent = 'جاري التحويل إلى نمط الوكيل...';
  static const String availableToolCategories = 'الفئات المتاحة للأدوات';

  // Agent categories (visual presentation only — not implemented in this phase)
  static const String catCoding = 'التطوير';
  static const String catResearch = 'البحث';
  static const String catBrowser = 'المتصفح';
  static const String catProjects = 'المشاريع';
  static const String catStudio = 'الأستوديو';
  static const String catAutomation = 'الأتمتة';
}
