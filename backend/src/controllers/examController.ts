import { Request, Response } from 'express';
import Exam from '../models/Exam';
import Question from '../models/Question';
import QuestionSet from '../models/QuestionSet';
import ExamResult from '../models/ExamResult';

export const createExam = async (req: Request, res: Response) => {
  const exam = await Exam.create(req.body);
  res.json(exam);
};

export const listExams = async (req: Request, res: Response) => {
  const { university, unit, status } = req.query;
  const q: any = {};
  if (university) q.university = university;
  if (unit) q.unit = unit;
  if (status) q.status = status;
  const exams = await Exam.find(q).populate('university').limit(200);
  res.json(exams);
};

export const addQuestionsBulk = async (req: Request, res: Response) => {
  const { questions = [], examId } = req.body;
  if (!Array.isArray(questions) || questions.length === 0)
    return res.status(400).json({ error: 'No questions' });
  const docs = questions.map((q: any) => ({ ...q, exam: examId }));
  const created = await Question.insertMany(docs);
  if (examId) {
    const cnt = await Question.countDocuments({ exam: examId });
    await Exam.findByIdAndUpdate(examId, { questionsCount: cnt });
  }
  res.json({ createdCount: created.length });
};

// ── Submit Exam Result (Saves to DB) ──────────────────────────────────────────
export const submitExamResult = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;

    const {
      questionSetId,
      totalQuestions,
      totalMarks,
      answers,
      timeTaken,
    } = req.body;

    if (!questionSetId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam submission data',
      });
    }

    // Fetch questions to verify correct answers
    const questions = await Question.find({ questionSetId });
    const questionMap = new Map(questions.map((q: any) => [q._id.toString(), q]));

    // Also try to get question set name
    let questionSetName = '';
    try {
      const qs = await QuestionSet.findById(questionSetId).populate('university', 'name shortName');
      if (qs) {
        questionSetName = `${(qs as any).university?.shortName || (qs as any).university?.name || ''} - ${qs.unit} - ${qs.session}`;
      }
    } catch (_) {}

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unattempted = 0;

    const evaluatedAnswers = answers.map((answer: any) => {
      const question = questionMap.get(answer.questionId);
      const isCorrect = question && question.correctAnswer === answer.selected;

      if (isCorrect) {
        correctAnswers++;
      } else if (answer.selected) {
        wrongAnswers++;
      } else {
        unattempted++;
      }

      return {
        questionId: answer.questionId,
        selected: answer.selected || null,
        correct: question?.correctAnswer || null,
        isCorrect: !!isCorrect,
      };
    });

    const realTotalQ = totalQuestions || answers.length;
    const realTotalMarks = totalMarks || realTotalQ;
    const obtainedMarks = correctAnswers * 1 - wrongAnswers * 0.25;
    const finalObtained = Math.max(0, obtainedMarks);
    const percentage = realTotalMarks > 0
      ? Math.round((finalObtained / realTotalMarks) * 100 * 100) / 100
      : 0;

    // ✅ Save to database
    const savedResult = await ExamResult.create({
      userId,
      questionSetId,
      questionSetName,
      totalQuestions: realTotalQ,
      totalMarks: realTotalMarks,
      obtainedMarks: finalObtained,
      percentage,
      correctAnswers,
      wrongAnswers,
      unattempted,
      answers: evaluatedAnswers,
      timeTaken: timeTaken || 0,
      submittedAt: new Date(),
    });

    const result = {
      _id: savedResult._id,
      questionSetId,
      userId,
      totalQuestions: realTotalQ,
      totalMarks: realTotalMarks,
      obtainedMarks: finalObtained,
      percentage,
      correctAnswers,
      wrongAnswers,
      unattempted,
      answers: evaluatedAnswers,
      timeTaken: timeTaken || 0,
      submittedAt: savedResult.submittedAt,
    };

    res.status(200).json({
      success: true,
      data: result,
      message: 'Exam submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit exam',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ── Get User Performance Stats ────────────────────────────────────────────────
export const getUserPerformanceStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const results = await ExamResult.find({ userId });

    if (results.length === 0) {
      return res.json({
        success: true,
        data: {
          examsTaken: 0,
          totalScore: 0,
          averageScore: 0,
          rank: '-',
          correctAnswers: 0,
          wrongAnswers: 0,
        },
      });
    }

    const examsTaken = results.length;
    const totalScore = results.reduce((sum, r) => sum + r.obtainedMarks, 0);
    const averageScore = results.reduce((sum, r) => sum + r.percentage, 0) / examsTaken;
    const correctAnswers = results.reduce((sum, r) => sum + r.correctAnswers, 0);
    const wrongAnswers = results.reduce((sum, r) => sum + r.wrongAnswers, 0);

    // Rank: count users with higher average score
    const allUserStats = await ExamResult.aggregate([
      {
        $group: {
          _id: '$userId',
          averagePercentage: { $avg: '$percentage' },
        },
      },
      { $sort: { averagePercentage: -1 } },
    ]);

    const rank = allUserStats.findIndex((u) => u._id.toString() === userId.toString()) + 1;

    res.json({
      success: true,
      data: {
        examsTaken,
        totalScore: Math.round(totalScore * 100) / 100,
        averageScore: Math.round(averageScore * 100) / 100,
        rank: rank > 0 ? rank : '-',
        correctAnswers,
        wrongAnswers,
      },
    });
  } catch (error) {
    console.error('Performance stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to load performance stats' });
  }
};

// ── Get Recent Exam Results ────────────────────────────────────────────────────
export const getRecentExamResults = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const limit = parseInt(req.query.limit as string) || 5;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const results = await ExamResult.find({ userId })
      .sort({ submittedAt: -1 })
      .limit(limit)
      .select('-answers'); // exclude answers array to reduce payload

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Recent exams error:', error);
    res.status(500).json({ success: false, message: 'Failed to load recent exams' });
  }
};
