import 'package:flutter/material.dart';

// ─── Banner Model ──────────────────────────────────────────────────────────────
class BannerModel {
  final String id;
  final String title;
  final String imageUrl;
  final String? link;
  final bool isActive;
  final int order;

  BannerModel({
    required this.id,
    required this.title,
    required this.imageUrl,
    this.link,
    this.isActive = true,
    this.order = 0,
  });

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    return BannerModel(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      link: json['link'],
      isActive: json['isActive'] ?? true,
      order: json['order'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'title': title,
      'imageUrl': imageUrl,
      'link': link,
      'isActive': isActive,
      'order': order,
    };
  }
}

// ─── User Model ────────────────────────────────────────────────────────────────
class UserModel {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String? role;
  final String? avatar;
  final String? subscriptionStatus;
  final String? subscriptionType;
  final DateTime? subscriptionExpireAt;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.role,
    this.avatar,
    this.subscriptionStatus,
    this.subscriptionType,
    this.subscriptionExpireAt,
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
      subscriptionType: json['subscriptionType'],
      subscriptionExpireAt: json['subscriptionExpireAt'] != null
          ? DateTime.tryParse(json['subscriptionExpireAt'])
          : (json['subscriptionExpiry'] != null 
              ? DateTime.tryParse(json['subscriptionExpiry'])
              : null),
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
      'subscriptionType': subscriptionType,
      'subscriptionExpireAt': subscriptionExpireAt?.toIso8601String(),
    };
  }

  bool get isSubscribed => subscriptionStatus == 'Premium';
}


// ─── University Model ──────────────────────────────────────────────────────────
class University {
  final String id;
  final String name;
  final String? shortName;
  final String? logo;
  final List<String> units;
  final DateTime createdAt;
  final int? freeQuestionSetsCount;
  final int? paidQuestionSetsCount;

  University({
    required this.id,
    required this.name,
    this.shortName,
    this.logo,
    required this.units,
    required this.createdAt,
    this.freeQuestionSetsCount,
    this.paidQuestionSetsCount,
  });

  int get totalQuestionSets => (freeQuestionSetsCount ?? 0) + (paidQuestionSetsCount ?? 0);

  factory University.fromJson(Map<String, dynamic> json) {
    return University(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      shortName: json['shortName'],
      logo: json['logo'],
      units: List<String>.from(json['units'] ?? []),
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      freeQuestionSetsCount: json['freeQuestionSetsCount'],
      paidQuestionSetsCount: json['paidQuestionSetsCount'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'shortName': shortName,
      'logo': logo,
      'units': units,
      'createdAt': createdAt.toIso8601String(),
      'freeQuestionSetsCount': freeQuestionSetsCount,
      'paidQuestionSetsCount': paidQuestionSetsCount,
    };
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

  Map<String, dynamic> toJson() {
    return {
      'key': key,
      'text': text,
    };
  }
}


// ─── Question Model ────────────────────────────────────────────────────────────
class Question {
  final String id;
  final String? questionSetId;
  final dynamic university; // Can be either String (ID) or Map<String, dynamic> (object)
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

  // Helper getter to get university ID regardless of format
  String? get universityId {
    if (university is String) {
      return university as String;
    } else if (university is Map<String, dynamic>) {
      return university['_id'] ?? university['id'];
    }
    return null;
  }

  // Helper getter to get university name if available
  String? get universityName {
    if (university is Map<String, dynamic>) {
      return university['name'];
    }
    return null;
  }

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['_id'] ?? '',
      questionSetId: json['questionSetId'],
      university: json['university'], // Accept both String and Map
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

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'questionSetId': questionSetId,
      'university': university,
      'unit': unit,
      'session': session,
      'questionNumber': questionNumber,
      'text': text,
      'questionType': questionType,
      'options': options.map((o) => o.toJson()).toList(),
      'correctAnswer': correctAnswer,
      'explanations': explanations,
    };
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
  final String accessType; // New field: 'free' or 'Premium'
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
    this.accessType = 'Premium', // Default to Premium
    this.questions,
    required this.createdAt,
  });

  String get universityShortName => university['shortName'] ?? university['name'] ?? '';
  String get universityName => university['name'] ?? '';

  int get durationInMinutes => (totalQuestions * 45) ~/ 60;
  
  bool get isPaid => accessType == 'Premium';
  bool get isFree => accessType == 'free';

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
      accessType: json['accessType'] ?? 'Premium', // Default to Premium if not specified
      questions: json['questions'] != null
          ? (json['questions'] as List).map((q) => Question.fromJson(q)).toList()
          : null,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'university': university,
      'unit': unit,
      'session': session,
      'totalQuestions': totalQuestions,
      'description': description,
      'videoUrl': videoUrl,
      'accessType': accessType, // Add access type
      'questions': questions?.map((q) => q.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
    };
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


// ─── Package Model ─────────────────────────────────────────────────────────────
class Package {
  final String id;
  final String type;
  final String name;
  final int durationDays;
  final double price;
  final List<String> features;
  final String status;
  final String? description;
  final String? videoUrl;

  Package({
    required this.id,
    required this.type,
    required this.name,
    required this.durationDays,
    required this.price,
    required this.features,
    required this.status,
    this.description,
    this.videoUrl,
  });

  factory Package.fromJson(Map<String, dynamic> json) {
    return Package(
      id: json['_id'] ?? '',
      type: json['type'] ?? '',
      name: json['name'] ?? '',
      durationDays: json['durationDays'] ?? 0,
      price: (json['price'] ?? 0).toDouble(),
      features: List<String>.from(json['features'] ?? []),
      status: json['status'] ?? 'active',
      description: json['description'],
      videoUrl: json['videoUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'type': type,
      'name': name,
      'durationDays': durationDays,
      'price': price,
      'features': features,
      'status': status,
      'description': description,
      'videoUrl': videoUrl,
    };
  }

  String get durationText {
    if (durationDays >= 365) {
      return '${(durationDays / 365).round()} Year';
    } else if (durationDays >= 30) {
      return '${(durationDays / 30).round()} Months';
    } else {
      return '$durationDays Days';
    }
  }
}


// ─── Promo Code Model ──────────────────────────────────────────────────────────
class PromoCode {
  final String code;
  final String discountType;
  final double discountValue;

  PromoCode({
    required this.code,
    required this.discountType,
    required this.discountValue,
  });

  factory PromoCode.fromJson(Map<String, dynamic> json) {
    return PromoCode(
      code: json['code'] ?? '',
      discountType: json['discountType'] ?? 'percentage',
      discountValue: (json['discountValue'] ?? 0).toDouble(),
    );
  }

  double calculateDiscount(double price) {
    if (discountType == 'percentage') {
      return (price * discountValue) / 100;
    } else {
      return discountValue;
    }
  }

  String get discountText {
    if (discountType == 'percentage') {
      return '${discountValue.toInt()}% OFF';
    } else {
      return '৳${discountValue.toInt()} OFF';
    }
  }
}


// ─── Subscription Model ────────────────────────────────────────────────────────
class Subscription {
  final String id;
  final String userId;
  final String packageName;
  final String? planId;
  final DateTime startAt;
  final DateTime? expireAt;
  final bool active;
  final String? paymentMethod;
  final String? transactionID;
  final double? amount;
  final int? duration;

  Subscription({
    required this.id,
    required this.userId,
    required this.packageName,
    this.planId,
    required this.startAt,
    this.expireAt,
    required this.active,
    this.paymentMethod,
    this.transactionID,
    this.amount,
    this.duration,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      id: json['_id'] ?? '',
      userId: json['user'] ?? '',
      packageName: json['packageName'] ?? '',
      planId: json['planId'],
      startAt: DateTime.tryParse(json['startAt'] ?? '') ?? DateTime.now(),
      expireAt: json['expireAt'] != null ? DateTime.tryParse(json['expireAt']) : null,
      active: json['active'] ?? false,
      paymentMethod: json['paymentMethod'],
      transactionID: json['transactionID'],
      amount: json['amount'] != null ? (json['amount'] as num).toDouble() : null,
      duration: json['duration'],
    );
  }

  bool get isExpired {
    if (expireAt == null) return true;
    return DateTime.now().isAfter(expireAt!);
  }

  int get daysRemaining {
    if (expireAt == null) return 0;
    final diff = expireAt!.difference(DateTime.now());
    return diff.inDays > 0 ? diff.inDays : 0;
  }
}


// ─── Payment Model ─────────────────────────────────────────────────────────────
class Payment {
  final String id;
  final String userId;
  final double amount;
  final String method;
  final String? transactionId;
  final String status;
  final String? promoCode;
  final double discountAmount;
  final double finalAmount;
  final String? packageType;
  final DateTime createdAt;

  Payment({
    required this.id,
    required this.userId,
    required this.amount,
    required this.method,
    this.transactionId,
    required this.status,
    this.promoCode,
    required this.discountAmount,
    required this.finalAmount,
    this.packageType,
    required this.createdAt,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['_id'] ?? '',
      userId: json['user'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      method: json['method'] ?? '',
      transactionId: json['transactionId'],
      status: json['status'] ?? 'pending',
      promoCode: json['promoCode'],
      discountAmount: (json['discountAmount'] ?? 0).toDouble(),
      finalAmount: (json['finalAmount'] ?? 0).toDouble(),
      packageType: json['packageType'],
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }

  String get statusText {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  }

  Color get statusColor {
    switch (status) {
      case 'completed':
        return const Color(0xFF10B981);
      case 'pending':
        return const Color(0xFFF59E0B);
      case 'failed':
        return const Color(0xFFEF4444);
      default:
        return const Color(0xFF6B7280);
    }
  }
}
