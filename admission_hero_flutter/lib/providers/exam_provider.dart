import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class ExamProvider extends ChangeNotifier {
  List<QuestionSet> _questionSets = [];
  QuestionSet? _currentSet;
  List<Question> _currentQuestions = [];
  bool _isLoading = false;
  String? _error;

  // ── Exam State ─────────────────────────────────────────────────────────────
  int _currentQuestionIndex = 0;
  Map<String, String> _answers = {};
  int _timeRemaining = 0;
  bool _isSubmitted = false;
  ExamResult? _lastResult;

  List<QuestionSet> get questionSets => _questionSets;
  QuestionSet? get currentSet => _currentSet;
  List<Question> get currentQuestions => _currentQuestions;
  bool get isLoading => _isLoading;
  String? get error => _error;

  int get currentQuestionIndex => _currentQuestionIndex;
  Map<String, String> get answers => _answers;
  int get timeRemaining => _timeRemaining;
  bool get isSubmitted => _isSubmitted;
  ExamResult? get lastResult => _lastResult;

  Question? get currentQuestion =>
      _currentQuestions.isNotEmpty && _currentQuestionIndex < _currentQuestions.length
          ? _currentQuestions[_currentQuestionIndex]
          : null;

  final ApiService _api = ApiService();

  // ── Fetch Question Sets ────────────────────────────────────────────────────
  Future<void> fetchQuestionSets({
    String? universityId,
    String? unit,
    String? session,
    int page = 1,
    int limit = 20,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final params = <String, String>{};
      if (universityId != null) params['universityId'] = universityId;
      if (unit != null) params['unit'] = unit;
      if (session != null) params['session'] = session;
      params['page'] = page.toString();
      params['limit'] = limit.toString();

      final query = params.entries.map((e) => '${e.key}=${e.value}').join('&');
      final url = '${AppConstants.questionSetsEndpoint}?$query';
      
      print('DEBUG: Fetching question sets from: ${AppConstants.baseUrl}$url');
      print('DEBUG: Parameters - universityId: $universityId, unit: $unit, session: $session');
      
      final response = await _api.get(url, requiresAuth: false);
      print('DEBUG: API Response: $response');
      
      final List<dynamic> data = response['data'] ?? [];
      print('DEBUG: Found ${data.length} question sets');
      
      _questionSets = data.map((s) => QuestionSet.fromJson(s)).toList();
      print('DEBUG: Parsed ${_questionSets.length} question sets successfully');
    } on ApiException catch (e) {
      print('DEBUG: API Exception: ${e.message}');
      _error = e.message;
    } catch (e) {
      print('DEBUG: General Exception: $e');
      _error = 'Failed to load exams.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ── Load Exam (Questions) ──────────────────────────────────────────────────
  Future<void> loadExam(String setId) async {
    _isLoading = true;
    _error = null;
    _currentQuestions = [];
    _answers = {};
    _currentQuestionIndex = 0;
    _isSubmitted = false;
    notifyListeners();

    try {
      // Questions endpoint is public — no auth needed
      final response = await _api.get(
        '/questions/sets/$setId/questions',
        requiresAuth: false,
      );

      final data = response['data'];
      if (data is List) {
        _currentQuestions = data.map((q) => Question.fromJson(q)).toList();
        if (_currentQuestions.isNotEmpty) {
          final first = _currentQuestions.first;
          _currentSet = QuestionSet(
            id: first.questionSetId ?? setId,
            name: 'Question Set',
            university: first.university is Map<String, dynamic> 
                ? first.university as Map<String, dynamic>
                : {'_id': first.university ?? '', 'name': 'Unknown University'},
            unit: first.unit ?? '',
            session: first.session ?? '',
            totalQuestions: _currentQuestions.length,
            createdAt: DateTime.now(),
          );
        } else {
          _error = 'No questions found for this exam set.';
        }
      } else if (data is Map<String, dynamic>) {
        _currentSet = QuestionSet.fromJson(data);
        _currentQuestions = _currentSet?.questions ?? [];
        if (_currentQuestions.isEmpty) {
          _error = 'No questions found for this exam set.';
        }
      } else {
        _error = 'No questions available.';
      }

      if (_currentQuestions.isNotEmpty) {
        _timeRemaining = _currentQuestions.length * AppConstants.secondsPerQuestion;
      }
    } on ApiException catch (e) {
      print('DEBUG: loadExam ApiException: ${e.message}');
      _error = e.message;
    } catch (e) {
      print('DEBUG: loadExam unexpected error: $e');
      _error = 'Failed to load exam questions. Check your connection.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ── Exam Actions ───────────────────────────────────────────────────────────
  void answerQuestion(String questionId, String answer) {
    _answers[questionId] = answer;
    notifyListeners();
  }

  void goToQuestion(int index) {
    if (index >= 0 && index < _currentQuestions.length) {
      _currentQuestionIndex = index;
      notifyListeners();
    }
  }

  void nextQuestion() => goToQuestion(_currentQuestionIndex + 1);
  void previousQuestion() => goToQuestion(_currentQuestionIndex - 1);

  void updateTimer(int seconds) {
    _timeRemaining = seconds;
    notifyListeners();
  }

  // ── Submit Exam ────────────────────────────────────────────────────────────
  Future<ExamResult?> submitExam(int timeTaken) async {
    if (_currentSet == null) return null;

    int correct = 0, wrong = 0, unattempted = 0;
    final answerList = <AnswerReview>[];

    for (final q in _currentQuestions) {
      final selected = _answers[q.id] ?? '';
      if (selected.isEmpty) {
        unattempted++;
      } else if (selected == q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
      answerList.add(AnswerReview(
        questionId: q.id,
        selected: selected,
        correct: q.correctAnswer,
      ));
    }

    final totalQ = _currentQuestions.length;
    final obtained = correct * 1.0 - wrong * AppConstants.negativeMarkPerWrong;
    final percentage = totalQ > 0 ? (obtained / totalQ) * 100 : 0.0;

    final result = ExamResult(
      questionSetId: _currentSet!.id,
      totalQuestions: totalQ,
      totalMarks: totalQ,
      obtainedMarks: obtained,
      percentage: percentage,
      correctAnswers: correct,
      wrongAnswers: wrong,
      unattempted: unattempted,
      answers: answerList,
      timeTaken: timeTaken,
    );

    try {
      print('DEBUG: Submitting exam to backend...');
      final response = await ApiService.submitExam(result.toJson());
      
      if (response != null && response['success'] == true) {
        print('DEBUG: Exam submitted successfully to backend');
        _lastResult = ExamResult.fromJson(response['data']);
      } else {
        print('DEBUG: Backend submission failed, using local result');
        _lastResult = result;
      }
    } catch (e) {
      print('DEBUG: Error submitting to backend: $e');
      // Save locally even if backend fails
      _lastResult = result;
    }

    _isSubmitted = true;
    notifyListeners();
    return _lastResult;
  }

  // ── Get Performance Stats ──────────────────────────────────────────────────
  Future<Map<String, dynamic>?> getPerformanceStats() async {
    try {
      final response = await ApiService.getPerformanceStats();
      if (response != null && response['success'] == true) {
        return response['data'];
      }
    } catch (e) {
      print('DEBUG: Error getting performance stats: $e');
    }
    return null;
  }

  // ── Get Recent Exam Results ────────────────────────────────────────────────
  Future<List<ExamResult>> getRecentExamResults({int limit = 5}) async {
    try {
      final response = await ApiService.getRecentExamResults(limit: limit);
      if (response != null && response['success'] == true) {
        final results = <ExamResult>[];
        for (var resultData in response['data']) {
          results.add(ExamResult.fromJson(resultData));
        }
        return results;
      }
    } catch (e) {
      print('DEBUG: Error getting recent exam results: $e');
    }
    return [];
  }

  void resetExam() {
    _currentSet = null;
    _currentQuestions = [];
    _answers = {};
    _currentQuestionIndex = 0;
    _isSubmitted = false;
    _lastResult = null;
    _timeRemaining = 0;
    notifyListeners();
  }
}
