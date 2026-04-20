class AppConstants {
  // API Base URL - change this to your deployed backend URL
  static const String baseUrl = 'https://munns-production.up.railway.app/api';
  // static const String baseUrl = 'http://localhost:5000/api';

  // Auth endpoints
  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  static const String profileEndpoint = '/auth/profile';

  // University endpoints
  static const String universitiesEndpoint = '/universities';

  // Questions endpoints
  static const String questionSetsEndpoint = '/questions/sets/all';
  static const String questionSetByIdEndpoint = '/questions/sets';

  // Exam endpoints
  static const String submitExamEndpoint = '/exams/submit';
  static const String examResultsEndpoint = '/exams/results';

  // Subscription endpoints
  static const String subscriptionEndpoint = '/subscription';

  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String tokenExpiryKey = 'token_expiry';

  // Exam Settings
  static const int secondsPerQuestion = 45;
  static const double negativeMarkPerWrong = 0.25;

  // Pagination
  static const int defaultPageLimit = 20;
}
