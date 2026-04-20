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
      final response = await _api.get('${AppConstants.questionSetsEndpoint}?$query');
      final List<dynamic> data = response['data'] ?? [];
      _questionSets = data.map((s) => QuestionSet.fromJson(s)).toList();
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
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
    _answers = {};
    _currentQuestionIndex = 0;
    _isSubmitted = false;
    notifyListeners();

    try {
      final response = await _api.get(
        '${AppConstants.questionSetByIdEndpoint}/$setId/questions',
      );

      final data = response['data'];
      if (data is List) {
        _currentQuestions = data.map((q) => Question.fromJson(q)).toList();
        if (_currentQuestions.isNotEmpty) {
          final first = _currentQuestions.first;
          _currentSet = QuestionSet(
            id: first.questionSetId ?? setId,
            name: 'Question Set',
            university: first.university ?? {},
            unit: first.unit ?? '',
            session: first.session ?? '',
            totalQuestions: _currentQuestions.length,
            createdAt: DateTime.now(),
          );
        }
      } else if (data is Map<String, dynamic>) {
        _currentSet = QuestionSet.fromJson(data);
        _currentQuestions = _currentSet?.questions ?? [];
      }

      _timeRemaining = _currentQuestions.length * AppConstants.secondsPerQuestion;
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = 'Failed to load exam questions.';
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
      final response = await _api.post(
        AppConstants.submitExamEndpoint,
        result.toJson(),
      );
      _lastResult = ExamResult.fromJson(response['data'] ?? result.toJson());
    } catch (_) {
      // Save locally even if backend fails
      _lastResult = result;
    }

    _isSubmitted = true;
    notifyListeners();
    return _lastResult;
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
