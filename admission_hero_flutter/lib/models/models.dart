// ─── User Model ────────────────────────────────────────────────────────────────
class UserModel {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String? role;
  final String? avatar;
  final String? subscriptionStatus;
  final DateTime? subscriptionExpiry;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.role,
    this.avatar,
    this.subscriptionStatus,
    this.subscriptionExpiry,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'],
      avatar: json['avatar'],
      subscriptionStatus: json['subscriptionStatus'],
      subscriptionExpiry: json['subscriptionExpiry'] != null
          ? DateTime.tryParse(json['subscriptionExpiry'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
      'avatar': avatar,
      'subscriptionStatus': subscriptionStatus,
      'subscriptionExpiry': subscriptionExpiry?.toIso8601String(),
    };
  }

  bool get isSubscribed => subscriptionStatus == 'active';
}


// ─── University Model ──────────────────────────────────────────────────────────
class University {
  final String id;
  final String name;
  final String? shortName;
  final String? logo;
  final List<String> units;
  final DateTime createdAt;

  University({
    required this.id,
    required this.name,
    this.shortName,
    this.logo,
    required this.units,
    required this.createdAt,
  });

  factory University.fromJson(Map<String, dynamic> json) {
    return University(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      shortName: json['shortName'],
      logo: json['logo'],
      units: List<String>.from(json['units'] ?? []),
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}


// ─── Question Option ───────────────────────────────────────────────────────────
class QuestionOption {
  final String key;
  final String text;

  QuestionOption({required this.key, required this.text});

  factory QuestionOption.fromJson(Map<String, dynamic> json) {
    return QuestionOption(
      key: json['key'] ?? '',
      text: json['text'] ?? '',
    );
  }
}


// ─── Question Model ────────────────────────────────────────────────────────────
class Question {
  final String id;
  final String? questionSetId;
  final Map<String, dynamic>? university;
  final String? unit;
  final String? session;
  final int questionNumber;
  final String text;
  final String questionType;
  final List<QuestionOption> options;
  final String correctAnswer;
  final List<Map<String, dynamic>>? explanations;

  Question({
    required this.id,
    this.questionSetId,
    this.university,
    this.unit,
    this.session,
    required this.questionNumber,
    required this.text,
    required this.questionType,
    required this.options,
    required this.correctAnswer,
    this.explanations,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['_id'] ?? '',
      questionSetId: json['questionSetId'],
      university: json['university'],
      unit: json['unit'],
      session: json['session'],
      questionNumber: json['questionNumber'] ?? 0,
      text: json['text'] ?? '',
      questionType: json['questionType'] ?? 'mcq',
      options: (json['options'] as List<dynamic>? ?? [])
          .map((o) => QuestionOption.fromJson(o))
          .toList(),
      correctAnswer: json['correctAnswer'] ?? '',
      explanations: json['explanations'] != null
          ? List<Map<String, dynamic>>.from(json['explanations'])
          : null,
    );
  }
}


// ─── Question Set Model ────────────────────────────────────────────────────────
class QuestionSet {
  final String id;
  final String name;
  final Map<String, dynamic> university;
  final String unit;
  final String session;
  final int totalQuestions;
  final String? description;
  final String? videoUrl;
  final List<Question>? questions;
  final DateTime createdAt;

  QuestionSet({
    required this.id,
    required this.name,
    required this.university,
    required this.unit,
    required this.session,
    required this.totalQuestions,
    this.description,
    this.videoUrl,
    this.questions,
    required this.createdAt,
  });

  String get universityShortName => university['shortName'] ?? university['name'] ?? '';
  String get universityName => university['name'] ?? '';

  int get durationInMinutes => (totalQuestions * 45) ~/ 60;

  factory QuestionSet.fromJson(Map<String, dynamic> json) {
    return QuestionSet(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      university: json['university'] ?? {},
      unit: json['unit'] ?? '',
      session: json['session'] ?? '',
      totalQuestions: json['totalQuestions'] ?? 0,
      description: json['description'],
      videoUrl: json['videoUrl'],
      questions: json['questions'] != null
          ? (json['questions'] as List).map((q) => Question.fromJson(q)).toList()
          : null,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}


// ─── Exam Result Model ─────────────────────────────────────────────────────────
class ExamResult {
  final String? id;
  final String questionSetId;
  final String? userId;
  final int totalQuestions;
  final int totalMarks;
  final double obtainedMarks;
  final double percentage;
  final int correctAnswers;
  final int wrongAnswers;
  final int unattempted;
  final List<AnswerReview> answers;
  final int timeTaken;
  final DateTime? submittedAt;

  ExamResult({
    this.id,
    required this.questionSetId,
    this.userId,
    required this.totalQuestions,
    required this.totalMarks,
    required this.obtainedMarks,
    required this.percentage,
    required this.correctAnswers,
    required this.wrongAnswers,
    required this.unattempted,
    required this.answers,
    required this.timeTaken,
    this.submittedAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'questionSetId': questionSetId,
      'totalQuestions': totalQuestions,
      'totalMarks': totalMarks,
      'obtainedMarks': obtainedMarks,
      'percentage': percentage,
      'correctAnswers': correctAnswers,
      'wrongAnswers': wrongAnswers,
      'unattempted': unattempted,
      'answers': answers.map((a) => a.toJson()).toList(),
      'timeTaken': timeTaken,
    };
  }

  factory ExamResult.fromJson(Map<String, dynamic> json) {
    return ExamResult(
      id: json['_id'],
      questionSetId: json['questionSetId'] ?? '',
      userId: json['userId'],
      totalQuestions: json['totalQuestions'] ?? 0,
      totalMarks: json['totalMarks'] ?? 0,
      obtainedMarks: (json['obtainedMarks'] ?? 0).toDouble(),
      percentage: (json['percentage'] ?? 0).toDouble(),
      correctAnswers: json['correctAnswers'] ?? 0,
      wrongAnswers: json['wrongAnswers'] ?? 0,
      unattempted: json['unattempted'] ?? 0,
      answers: (json['answers'] as List<dynamic>? ?? [])
          .map((a) => AnswerReview.fromJson(a))
          .toList(),
      timeTaken: json['timeTaken'] ?? 0,
      submittedAt: json['submittedAt'] != null
          ? DateTime.tryParse(json['submittedAt'])
          : null,
    );
  }
}

class AnswerReview {
  final String questionId;
  final String selected;
  final String correct;

  AnswerReview({
    required this.questionId,
    required this.selected,
    required this.correct,
  });

  bool get isCorrect => selected == correct;

  Map<String, dynamic> toJson() => {
    'questionId': questionId,
    'selected': selected,
    'correct': correct,
  };

  factory AnswerReview.fromJson(Map<String, dynamic> json) {
    return AnswerReview(
      questionId: json['questionId'] ?? '',
      selected: json['selected'] ?? '',
      correct: json['correct'] ?? '',
    );
  }
}
