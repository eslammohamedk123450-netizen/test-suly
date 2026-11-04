import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'generated/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en')
  ];

  /// No description provided for @appName.
  ///
  /// In en, this message translates to:
  /// **'SULY AI'**
  String get appName;

  /// No description provided for @tagline.
  ///
  /// In en, this message translates to:
  /// **'More Than AI. Your Intelligent Partner.'**
  String get tagline;

  /// No description provided for @navHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navChat.
  ///
  /// In en, this message translates to:
  /// **'Chat'**
  String get navChat;

  /// No description provided for @navAdmin.
  ///
  /// In en, this message translates to:
  /// **'Admin'**
  String get navAdmin;

  /// No description provided for @languageMenuTooltip.
  ///
  /// In en, this message translates to:
  /// **'Change language'**
  String get languageMenuTooltip;

  /// No description provided for @languageArabic.
  ///
  /// In en, this message translates to:
  /// **'العربية'**
  String get languageArabic;

  /// No description provided for @languageEnglish.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get languageEnglish;

  /// No description provided for @welcomeEyebrow.
  ///
  /// In en, this message translates to:
  /// **'YOUR INTELLIGENT PARTNER'**
  String get welcomeEyebrow;

  /// No description provided for @welcomeTitle.
  ///
  /// In en, this message translates to:
  /// **'A clearer way to get things done.'**
  String get welcomeTitle;

  /// No description provided for @welcomeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Work, create, research, and think with one intelligent partner.'**
  String get welcomeSubtitle;

  /// No description provided for @startConversation.
  ///
  /// In en, this message translates to:
  /// **'Start a conversation'**
  String get startConversation;

  /// No description provided for @privacyNote.
  ///
  /// In en, this message translates to:
  /// **'Your conversations appear here after you sign in.'**
  String get privacyNote;

  /// No description provided for @emptyActivityNote.
  ///
  /// In en, this message translates to:
  /// **'No demo tasks or preloaded activity are shown here.'**
  String get emptyActivityNote;

  /// No description provided for @loading.
  ///
  /// In en, this message translates to:
  /// **'Loading…'**
  String get loading;

  /// No description provided for @loginTitle.
  ///
  /// In en, this message translates to:
  /// **'Sign in to start chatting'**
  String get loginTitle;

  /// No description provided for @registerTitle.
  ///
  /// In en, this message translates to:
  /// **'Create an account'**
  String get registerTitle;

  /// No description provided for @email.
  ///
  /// In en, this message translates to:
  /// **'Email address'**
  String get email;

  /// No description provided for @password.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// No description provided for @minimumPassword.
  ///
  /// In en, this message translates to:
  /// **'Use at least 8 characters when creating an account.'**
  String get minimumPassword;

  /// No description provided for @signIn.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get signIn;

  /// No description provided for @createAccount.
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get createAccount;

  /// No description provided for @createAccountAndChat.
  ///
  /// In en, this message translates to:
  /// **'Create account and start chatting'**
  String get createAccountAndChat;

  /// No description provided for @registerPrompt.
  ///
  /// In en, this message translates to:
  /// **'New to SULY? Create an account'**
  String get registerPrompt;

  /// No description provided for @loginPrompt.
  ///
  /// In en, this message translates to:
  /// **'Already have an account? Sign in'**
  String get loginPrompt;

  /// No description provided for @chatHistory.
  ///
  /// In en, this message translates to:
  /// **'Conversation history'**
  String get chatHistory;

  /// No description provided for @conversationFallback.
  ///
  /// In en, this message translates to:
  /// **'Conversation'**
  String get conversationFallback;

  /// No description provided for @conversationLabel.
  ///
  /// In en, this message translates to:
  /// **'Conversation'**
  String get conversationLabel;

  /// No description provided for @newConversation.
  ///
  /// In en, this message translates to:
  /// **'New conversation'**
  String get newConversation;

  /// No description provided for @signOut.
  ///
  /// In en, this message translates to:
  /// **'Sign out'**
  String get signOut;

  /// No description provided for @emptyChatTitle.
  ///
  /// In en, this message translates to:
  /// **'What would you like to work on?'**
  String get emptyChatTitle;

  /// No description provided for @emptyChatBody.
  ///
  /// In en, this message translates to:
  /// **'Write a message or use the microphone for Arabic dictation.'**
  String get emptyChatBody;

  /// No description provided for @connectionError.
  ///
  /// In en, this message translates to:
  /// **'Could not connect to the server. Check your internet connection and try again.'**
  String get connectionError;

  /// No description provided for @insufficientCredits.
  ///
  /// In en, this message translates to:
  /// **'Your account does not have enough credits. Contact your administrator.'**
  String get insufficientCredits;

  /// No description provided for @providerNotReady.
  ///
  /// In en, this message translates to:
  /// **'The AI service is not ready. An administrator must configure an active provider and model.'**
  String get providerNotReady;

  /// No description provided for @invalidCredentials.
  ///
  /// In en, this message translates to:
  /// **'The sign-in details are invalid or your session has expired.'**
  String get invalidCredentials;

  /// No description provided for @emailAlreadyRegistered.
  ///
  /// In en, this message translates to:
  /// **'This email is already registered. Sign in instead.'**
  String get emailAlreadyRegistered;

  /// No description provided for @tooManyRequests.
  ///
  /// In en, this message translates to:
  /// **'Too many requests. Please try again shortly.'**
  String get tooManyRequests;

  /// No description provided for @requestFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not complete the request (status {status}).'**
  String requestFailed(int status);

  /// No description provided for @requiredCredentials.
  ///
  /// In en, this message translates to:
  /// **'Enter your email and password first.'**
  String get requiredCredentials;

  /// No description provided for @passwordTooShort.
  ///
  /// In en, this message translates to:
  /// **'Passwords must be at least 8 characters long.'**
  String get passwordTooShort;

  /// No description provided for @missingAccessToken.
  ///
  /// In en, this message translates to:
  /// **'The server did not return a valid sign-in token.'**
  String get missingAccessToken;

  /// No description provided for @conversationCreateFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not create a conversation.'**
  String get conversationCreateFailed;

  /// No description provided for @emptyModelReply.
  ///
  /// In en, this message translates to:
  /// **'No response was returned by the model.'**
  String get emptyModelReply;

  /// No description provided for @microphoneError.
  ///
  /// In en, this message translates to:
  /// **'Could not use the microphone: {message}'**
  String microphoneError(String message);

  /// No description provided for @speechUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Voice dictation is not supported in this browser.'**
  String get speechUnavailable;

  /// No description provided for @microphonePermissionDenied.
  ///
  /// In en, this message translates to:
  /// **'Microphone access was not allowed.'**
  String get microphonePermissionDenied;

  /// No description provided for @stopListening.
  ///
  /// In en, this message translates to:
  /// **'Stop listening'**
  String get stopListening;

  /// No description provided for @dictateArabic.
  ///
  /// In en, this message translates to:
  /// **'Dictate in Arabic'**
  String get dictateArabic;

  /// No description provided for @listening.
  ///
  /// In en, this message translates to:
  /// **'Listening…'**
  String get listening;

  /// No description provided for @composerHint.
  ///
  /// In en, this message translates to:
  /// **'Write your message…'**
  String get composerHint;

  /// No description provided for @send.
  ///
  /// In en, this message translates to:
  /// **'Send'**
  String get send;

  /// No description provided for @adminSignIn.
  ///
  /// In en, this message translates to:
  /// **'Administrator sign in'**
  String get adminSignIn;

  /// No description provided for @adminProtected.
  ///
  /// In en, this message translates to:
  /// **'Access is protected by backend permissions. No default password is configured.'**
  String get adminProtected;

  /// No description provided for @checking.
  ///
  /// In en, this message translates to:
  /// **'Verifying…'**
  String get checking;

  /// No description provided for @addProviderTitle.
  ///
  /// In en, this message translates to:
  /// **'Add an AI provider'**
  String get addProviderTitle;

  /// No description provided for @connectionName.
  ///
  /// In en, this message translates to:
  /// **'Connection name'**
  String get connectionName;

  /// No description provided for @connectionNameExample.
  ///
  /// In en, this message translates to:
  /// **'Example: Primary Groq'**
  String get connectionNameExample;

  /// No description provided for @connectionNameRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter a name for this connection.'**
  String get connectionNameRequired;

  /// No description provided for @provider.
  ///
  /// In en, this message translates to:
  /// **'Provider'**
  String get provider;

  /// No description provided for @apiKey.
  ///
  /// In en, this message translates to:
  /// **'API key'**
  String get apiKey;

  /// No description provided for @apiKeyRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter an API key from your provider account.'**
  String get apiKeyRequired;

  /// No description provided for @encryptedKeyHint.
  ///
  /// In en, this message translates to:
  /// **'Stored encrypted on the server and never shown in full.'**
  String get encryptedKeyHint;

  /// No description provided for @providerSetupHelp.
  ///
  /// In en, this message translates to:
  /// **'Models will be discovered automatically. If a model rejects a chat request, the service may try the next model and stop at the first successful response. Provider limits or charges may apply to attempts.'**
  String get providerSetupHelp;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @discoverAndSave.
  ///
  /// In en, this message translates to:
  /// **'Discover models and save'**
  String get discoverAndSave;

  /// No description provided for @providerSavedCount.
  ///
  /// In en, this message translates to:
  /// **'Connection saved. Discovered {count} models.'**
  String providerSavedCount(int count);

  /// No description provided for @adminOverview.
  ///
  /// In en, this message translates to:
  /// **'Overview'**
  String get adminOverview;

  /// No description provided for @adminUsers.
  ///
  /// In en, this message translates to:
  /// **'Users'**
  String get adminUsers;

  /// No description provided for @adminProviders.
  ///
  /// In en, this message translates to:
  /// **'AI providers'**
  String get adminProviders;

  /// No description provided for @adminModels.
  ///
  /// In en, this message translates to:
  /// **'Models'**
  String get adminModels;

  /// No description provided for @adminPlans.
  ///
  /// In en, this message translates to:
  /// **'Subscription plans'**
  String get adminPlans;

  /// No description provided for @adminSettings.
  ///
  /// In en, this message translates to:
  /// **'System settings'**
  String get adminSettings;

  /// No description provided for @adminAudit.
  ///
  /// In en, this message translates to:
  /// **'Activity log'**
  String get adminAudit;

  /// No description provided for @adminTitle.
  ///
  /// In en, this message translates to:
  /// **'Administration'**
  String get adminTitle;

  /// No description provided for @refresh.
  ///
  /// In en, this message translates to:
  /// **'Refresh'**
  String get refresh;

  /// No description provided for @addProviderTooltip.
  ///
  /// In en, this message translates to:
  /// **'Add a provider and discover its models'**
  String get addProviderTooltip;

  /// No description provided for @noData.
  ///
  /// In en, this message translates to:
  /// **'No data is available.'**
  String get noData;

  /// No description provided for @adminModuleNotConnected.
  ///
  /// In en, this message translates to:
  /// **'This module is not connected to the administration API yet.'**
  String get adminModuleNotConnected;

  /// No description provided for @metricTotalUsers.
  ///
  /// In en, this message translates to:
  /// **'Total users'**
  String get metricTotalUsers;

  /// No description provided for @metricActiveUsers.
  ///
  /// In en, this message translates to:
  /// **'Active users'**
  String get metricActiveUsers;

  /// No description provided for @metricNewUsers.
  ///
  /// In en, this message translates to:
  /// **'New users'**
  String get metricNewUsers;

  /// No description provided for @metricProjects.
  ///
  /// In en, this message translates to:
  /// **'Projects'**
  String get metricProjects;

  /// No description provided for @metricActiveAdmins.
  ///
  /// In en, this message translates to:
  /// **'Active administrators'**
  String get metricActiveAdmins;

  /// No description provided for @metricCreditsConsumed.
  ///
  /// In en, this message translates to:
  /// **'Credits consumed'**
  String get metricCreditsConsumed;

  /// No description provided for @metricActiveProviders.
  ///
  /// In en, this message translates to:
  /// **'Active providers'**
  String get metricActiveProviders;

  /// No description provided for @metricAvailableModels.
  ///
  /// In en, this message translates to:
  /// **'Available models'**
  String get metricAvailableModels;

  /// No description provided for @recentActivity.
  ///
  /// In en, this message translates to:
  /// **'Recent activity'**
  String get recentActivity;

  /// No description provided for @noRecentActivity.
  ///
  /// In en, this message translates to:
  /// **'No activity has been recorded yet.'**
  String get noRecentActivity;

  /// No description provided for @noUsers.
  ///
  /// In en, this message translates to:
  /// **'No registered users.'**
  String get noUsers;

  /// No description provided for @noProviders.
  ///
  /// In en, this message translates to:
  /// **'No providers are configured yet.'**
  String get noProviders;

  /// No description provided for @noModels.
  ///
  /// In en, this message translates to:
  /// **'No models are configured yet.'**
  String get noModels;

  /// No description provided for @noPlans.
  ///
  /// In en, this message translates to:
  /// **'No subscription plans have been created yet.'**
  String get noPlans;

  /// No description provided for @noSettings.
  ///
  /// In en, this message translates to:
  /// **'There are no custom settings yet.'**
  String get noSettings;

  /// No description provided for @noAudit.
  ///
  /// In en, this message translates to:
  /// **'There are no administration records yet.'**
  String get noAudit;

  /// No description provided for @active.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get active;

  /// No description provided for @inactive.
  ///
  /// In en, this message translates to:
  /// **'Inactive'**
  String get inactive;

  /// No description provided for @creditBalance.
  ///
  /// In en, this message translates to:
  /// **'Credits: {balance}'**
  String creditBalance(int balance);

  /// No description provided for @emptyAdminList.
  ///
  /// In en, this message translates to:
  /// **'No items are available.'**
  String get emptyAdminList;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
