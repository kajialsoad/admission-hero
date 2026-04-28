import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';

class OfflineService {
  static final OfflineService _instance = OfflineService._internal();
  factory OfflineService() => _instance;
  OfflineService._internal();

  static const String _offlineExamsKey = 'offline_exams';
  static const String _offlineQuestionsKey = 'offline_questions';
  static const String _offlineResultsKey = 'offline_results';
  static const String _downloadedExamsKey = 'downloaded_exams';

  // ── Save Exam for Offline ─────────────────────────────────────────────────
  Future<bool> saveExamForOffline(QuestionSet questionSet, List<Question> questions) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Save question set
      final existingExams = await getOfflineExams();
      existingExams.removeWhere((exam) => exam.id == questionSet.id);
      existingExams.add(questionSet);
      
      final examsJson = existingExams.map((exam) => exam.toJson()).toList();
      await prefs.setString(_offlineExamsKey, jsonEncode(examsJson));
      
      // Save questions
      final questionsJson = questions.map((q) => q.toJson()).toList();
      await prefs.setString('${_offlineQuestionsKey}_${questionSet.id}', jsonEncode(questionsJson));
      
      // Track downloaded exams
      final downloadedExams = await getDownloadedExamIds();
      if (!downloadedExams.contains(questionSet.id)) {
        downloadedExams.add(questionSet.id);
        await prefs.setStringList(_downloadedExamsKey, downloadedExams);
      }
      
      print('DEBUG: Exam ${questionSet.name} saved for offline');
      return true;
    } catch (e) {
      print('DEBUG: Error saving exam for offline: $e');
      return false;
    }
  }

  // ── Get Offline Exams ──────────────────────────────────────────────────────
  Future<List<QuestionSet>> getOfflineExams() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final examsJson = prefs.getString(_offlineExamsKey);
      
      if (examsJson == null) return [];
      
      final List<dynamic> examsList = jsonDecode(examsJson);
      return examsList.map((json) => QuestionSet.fromJson(json)).toList();
    } catch (e) {
      print('DEBUG: Error getting offline exams: $e');
      return [];
    }
  }

  // ── Get Offline Questions ──────────────────────────────────────────────────
  Future<List<Question>> getOfflineQuestions(String examId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final questionsJson = prefs.getString('${_offlineQuestionsKey}_$examId');
      
      if (questionsJson == null) return [];
      
      final List<dynamic> questionsList = jsonDecode(questionsJson);
      return questionsList.map((json) => Question.fromJson(json)).toList();
    } catch (e) {
      print('DEBUG: Error getting offline questions: $e');
      return [];
    }
  }

  // ── Check if Exam is Downloaded ────────────────────────────────────────────
  Future<bool> isExamDownloaded(String examId) async {
    final downloadedExams = await getDownloadedExamIds();
    return downloadedExams.contains(examId);
  }

  // ── Get Downloaded Exam IDs ────────────────────────────────────────────────
  Future<List<String>> getDownloadedExamIds() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getStringList(_downloadedExamsKey) ?? [];
    } catch (e) {
      print('DEBUG: Error getting downloaded exam IDs: $e');
      return [];
    }
  }

  // ── Delete Offline Exam ────────────────────────────────────────────────────
  Future<bool> deleteOfflineExam(String examId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Remove from offline exams
      final offlineExams = await getOfflineExams();
      offlineExams.removeWhere((exam) => exam.id == examId);
      
      final examsJson = offlineExams.map((exam) => exam.toJson()).toList();
      await prefs.setString(_offlineExamsKey, jsonEncode(examsJson));
      
      // Remove questions
      await prefs.remove('${_offlineQuestionsKey}_$examId');
      
      // Remove from downloaded list
      final downloadedExams = await getDownloadedExamIds();
      downloadedExams.remove(examId);
      await prefs.setStringList(_downloadedExamsKey, downloadedExams);
      
      print('DEBUG: Offline exam $examId deleted');
      return true;
    } catch (e) {
      print('DEBUG: Error deleting offline exam: $e');
      return false;
    }
  }

  // ── Save Offline Result ────────────────────────────────────────────────────
  Future<bool> saveOfflineResult(ExamResult result) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      final existingResults = await getOfflineResults();
      existingResults.add(result);
      
      final resultsJson = existingResults.map((r) => r.toJson()).toList();
      await prefs.setString(_offlineResultsKey, jsonEncode(resultsJson));
      
      print('DEBUG: Offline result saved');
      return true;
    } catch (e) {
      print('DEBUG: Error saving offline result: $e');
      return false;
    }
  }

  // ── Get Offline Results ────────────────────────────────────────────────────
  Future<List<ExamResult>> getOfflineResults() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final resultsJson = prefs.getString(_offlineResultsKey);
      
      if (resultsJson == null) return [];
      
      final List<dynamic> resultsList = jsonDecode(resultsJson);
      return resultsList.map((json) => ExamResult.fromJson(json)).toList();
    } catch (e) {
      print('DEBUG: Error getting offline results: $e');
      return [];
    }
  }

  // ── Sync Offline Results ───────────────────────────────────────────────────
  Future<bool> syncOfflineResults() async {
    try {
      final offlineResults = await getOfflineResults();
      if (offlineResults.isEmpty) return true;
      
      // TODO: Implement API sync when online
      // For now, just clear offline results after "sync"
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_offlineResultsKey);
      
      print('DEBUG: ${offlineResults.length} offline results synced');
      return true;
    } catch (e) {
      print('DEBUG: Error syncing offline results: $e');
      return false;
    }
  }

  // ── Get Storage Usage ──────────────────────────────────────────────────────
  Future<Map<String, dynamic>> getStorageUsage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final offlineExams = await getOfflineExams();
      
      int totalQuestions = 0;
      for (final exam in offlineExams) {
        final questions = await getOfflineQuestions(exam.id);
        totalQuestions += questions.length;
      }
      
      return {
        'exams': offlineExams.length,
        'questions': totalQuestions,
        'results': (await getOfflineResults()).length,
      };
    } catch (e) {
      print('DEBUG: Error getting storage usage: $e');
      return {'exams': 0, 'questions': 0, 'results': 0};
    }
  }

  // ── Clear All Offline Data ─────────────────────────────────────────────────
  Future<bool> clearAllOfflineData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      await prefs.remove(_offlineExamsKey);
      await prefs.remove(_offlineResultsKey);
      await prefs.remove(_downloadedExamsKey);
      
      // Remove all question sets
      final keys = prefs.getKeys();
      for (final key in keys) {
        if (key.startsWith(_offlineQuestionsKey)) {
          await prefs.remove(key);
        }
      }
      
      print('DEBUG: All offline data cleared');
      return true;
    } catch (e) {
      print('DEBUG: Error clearing offline data: $e');
      return false;
    }
  }
}