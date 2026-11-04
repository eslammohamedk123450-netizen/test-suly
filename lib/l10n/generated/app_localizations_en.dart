// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'SULY AI';

  @override
  String get tagline => 'More Than AI. Your Intelligent Partner.';

  @override
  String get navHome => 'Home';

  @override
  String get navChat => 'Chat';

  @override
  String get navAdmin => 'Admin';

  @override
  String get languageMenuTooltip => 'Change language';

  @override
  String get languageArabic => 'العربية';

  @override
  String get languageEnglish => 'English';

  @override
  String get welcomeEyebrow => 'YOUR INTELLIGENT PARTNER';

  @override
  String get welcomeTitle => 'A clearer way to get things done.';

  @override
  String get welcomeSubtitle =>
      'Work, create, research, and think with one intelligent partner.';

  @override
  String get startConversation => 'Start a conversation';

  @override
  String get privacyNote => 'Your conversations appear here after you sign in.';

  @override
  String get emptyActivityNote =>
      'No demo tasks or preloaded activity are shown here.';

  @override
  String get loading => 'Loading…';

  @override
  String get loginTitle => 'Sign in to start chatting';

  @override
  String get registerTitle => 'Create an account';

  @override
  String get email => 'Email address';

  @override
  String get password => 'Password';

  @override
  String get minimumPassword =>
      'Use at least 8 characters when creating an account.';

  @override
  String get signIn => 'Sign in';

  @override
  String get createAccount => 'Create account';

  @override
  String get createAccountAndChat => 'Create account and start chatting';

  @override
  String get registerPrompt => 'New to SULY? Create an account';

  @override
  String get loginPrompt => 'Already have an account? Sign in';

  @override
  String get chatHistory => 'Conversation history';

  @override
  String get conversationFallback => 'Conversation';

  @override
  String get conversationLabel => 'Conversation';

  @override
  String get newConversation => 'New conversation';

  @override
  String get signOut => 'Sign out';

  @override
  String get emptyChatTitle => 'What would you like to work on?';

  @override
  String get emptyChatBody =>
      'Write a message or use the microphone for Arabic dictation.';

  @override
  String get connectionError =>
      'Could not connect to the server. Check your internet connection and try again.';

  @override
  String get insufficientCredits =>
      'Your account does not have enough credits. Contact your administrator.';

  @override
  String get providerNotReady =>
      'The AI service is not ready. An administrator must configure an active provider and model.';

  @override
  String get invalidCredentials =>
      'The sign-in details are invalid or your session has expired.';

  @override
  String get emailAlreadyRegistered =>
      'This email is already registered. Sign in instead.';

  @override
  String get tooManyRequests => 'Too many requests. Please try again shortly.';

  @override
  String requestFailed(int status) {
    return 'Could not complete the request (status $status).';
  }

  @override
  String get requiredCredentials => 'Enter your email and password first.';

  @override
  String get passwordTooShort =>
      'Passwords must be at least 8 characters long.';

  @override
  String get missingAccessToken =>
      'The server did not return a valid sign-in token.';

  @override
  String get conversationCreateFailed => 'Could not create a conversation.';

  @override
  String get emptyModelReply => 'No response was returned by the model.';

  @override
  String microphoneError(String message) {
    return 'Could not use the microphone: $message';
  }

  @override
  String get speechUnavailable =>
      'Voice dictation is not supported in this browser.';

  @override
  String get microphonePermissionDenied => 'Microphone access was not allowed.';

  @override
  String get stopListening => 'Stop listening';

  @override
  String get dictateArabic => 'Dictate in Arabic';

  @override
  String get listening => 'Listening…';

  @override
  String get composerHint => 'Write your message…';

  @override
  String get send => 'Send';

  @override
  String get adminSignIn => 'Administrator sign in';

  @override
  String get adminProtected =>
      'Access is protected by backend permissions. No default password is configured.';

  @override
  String get checking => 'Verifying…';

  @override
  String get addProviderTitle => 'Add an AI provider';

  @override
  String get connectionName => 'Connection name';

  @override
  String get connectionNameExample => 'Example: Primary Groq';

  @override
  String get connectionNameRequired => 'Enter a name for this connection.';

  @override
  String get provider => 'Provider';

  @override
  String get apiKey => 'API key';

  @override
  String get apiKeyRequired => 'Enter an API key from your provider account.';

  @override
  String get encryptedKeyHint =>
      'Stored encrypted on the server and never shown in full.';

  @override
  String get providerSetupHelp =>
      'Models will be discovered automatically. If a model rejects a chat request, the service may try the next model and stop at the first successful response. Provider limits or charges may apply to attempts.';

  @override
  String get cancel => 'Cancel';

  @override
  String get discoverAndSave => 'Discover models and save';

  @override
  String providerSavedCount(int count) {
    return 'Connection saved. Discovered $count models.';
  }

  @override
  String get adminOverview => 'Overview';

  @override
  String get adminUsers => 'Users';

  @override
  String get adminProviders => 'AI providers';

  @override
  String get adminModels => 'Models';

  @override
  String get adminPlans => 'Subscription plans';

  @override
  String get adminSettings => 'System settings';

  @override
  String get adminAudit => 'Activity log';

  @override
  String get adminTitle => 'Administration';

  @override
  String get refresh => 'Refresh';

  @override
  String get addProviderTooltip => 'Add a provider and discover its models';

  @override
  String get noData => 'No data is available.';

  @override
  String get adminModuleNotConnected =>
      'This module is not connected to the administration API yet.';

  @override
  String get metricTotalUsers => 'Total users';

  @override
  String get metricActiveUsers => 'Active users';

  @override
  String get metricNewUsers => 'New users';

  @override
  String get metricProjects => 'Projects';

  @override
  String get metricActiveAdmins => 'Active administrators';

  @override
  String get metricCreditsConsumed => 'Credits consumed';

  @override
  String get metricActiveProviders => 'Active providers';

  @override
  String get metricAvailableModels => 'Available models';

  @override
  String get recentActivity => 'Recent activity';

  @override
  String get noRecentActivity => 'No activity has been recorded yet.';

  @override
  String get noUsers => 'No registered users.';

  @override
  String get noProviders => 'No providers are configured yet.';

  @override
  String get noModels => 'No models are configured yet.';

  @override
  String get noPlans => 'No subscription plans have been created yet.';

  @override
  String get noSettings => 'There are no custom settings yet.';

  @override
  String get noAudit => 'There are no administration records yet.';

  @override
  String get active => 'Active';

  @override
  String get inactive => 'Inactive';

  @override
  String creditBalance(int balance) {
    return 'Credits: $balance';
  }

  @override
  String get emptyAdminList => 'No items are available.';
}
