import { Request, Response } from 'express';
import Exam from '../models/Exam';
import Question from '../models/Question';

export const createExam = async (req: Request, res: Response) => {
  const exam = await Exam.create(req.body);
  res.json(exam);
};

export const listExams = async (req: Request, res: Response) => {
  const { university, unit, status } = req.query;
  const q:any = {};
  if (university) q.university = university;
  if (unit) q.unit = unit;
  if (status) q.status = status;
  const exams = await Exam.find(q).populate('university').limit(200);
  res.json(exams);
};

export const addQuestionsBulk = async (req: Request, res: Response) => {
  // expects body.questions = [{...}, ...] and body.examId, body.university, body.unit
  const { questions = [], examId } = req.body;
  if (!Array.isArray(questions) || questions.length === 0) return res.status(400).json({ error: 'No questions' });
  const docs = questions.map((q:any) => ({ ...q, exam: examId }));
  const created = await Question.insertMany(docs);
  // update exam question count
  if (examId) {
    const cnt = await Question.countDocuments({ exam: examId });
    await Exam.findByIdAndUpdate(examId, { questionsCount: cnt });
  }
  res.json({ createdCount: created.length });
};

export const submitExamResult = async (req: Request, res: Response) => {
  try {
    const {
      questionSetId,
      totalQuestions,
      totalMarks,
      answers,
      timeTaken,
    } = req.body;

    // Validate input
    if (!questionSetId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam submission data',
      });
    }

    // Calculate results
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unattempted = 0;

    // Fetch questions to check correct answers
    const questions = await Question.find({ questionSetId });
    const questionMap = new Map(questions.map((q: any) => [q._id.toString(), q]));

    // Evaluate answers
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
        isCorrect,
      };
    });

    const obtainedMarks = correctAnswers * 1; // 1 mark per question
    const percentage = totalQuestions > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

    // Create result object
    const result = {
      questionSetId,
      userId: req.user?.id || null,
      totalQuestions,
      totalMarks,
      obtainedMarks,
      percentage: Math.round(percentage * 100) / 100,
      correctAnswers,
      wrongAnswers,
      unattempted,
      answers: evaluatedAnswers,
      timeTaken,
      submittedAt: new Date().toISOString(),
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
