import type { Request, Response } from 'express';
import ExamResult from '../models/ExamResult';
import User from '../models/User';

// Get user performance stats
export const getPerformanceStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Get all exam results for user
    const results = await ExamResult.find({ user: userId })
      .populate('questionSet', 'name university unit session')
      .sort({ createdAt: -1 });

    if (results.length === 0) {
      return res.json({
        success: true,
        data: {
          totalExams: 0,
          averageScore: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          unattempted: 0,
          accuracy: 0,
          recentResults: [],
          progressData: []
        },
        message: 'No exam data found'
      });
    }

    // Calculate stats
    const totalExams = results.length;
    const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
    const correctAnswers = results.reduce((sum, r) => sum + r.correctAnswers, 0);
    const wrongAnswers = results.reduce((sum, r) => sum + r.wrongAnswers, 0);
    const unattempted = results.reduce((sum, r) => sum + r.unattempted, 0);
    const totalMarks = results.reduce((sum, r) => sum + r.obtainedMarks, 0);
    const maxMarks = results.reduce((sum, r) => sum + r.totalMarks, 0);
    
    const averageScore = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Progress data for chart (last 10 exams)
    const progressData = results.slice(0, 10).reverse().map((result, index) => ({
      exam: index + 1,
      score: result.percentage,
      date: (result as any).createdAt
    }));

    // Recent results (last 5)
    const recentResults = results.slice(0, 5).map(result => ({
      id: result._id,
      questionSetName: (result.questionSetId as any)?.name || 'Unknown',
      score: result.percentage,
      correctAnswers: result.correctAnswers,
      wrongAnswers: result.wrongAnswers,
      totalQuestions: result.totalQuestions,
      timeTaken: result.timeTaken,
      date: (result as any).createdAt
    }));

    res.json({
      success: true,
      data: {
        totalExams,
        averageScore: Math.round(averageScore * 100) / 100,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        unattempted,
        accuracy: Math.round(accuracy * 100) / 100,
        recentResults,
        progressData
      },
      message: 'Performance stats retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get performance stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve performance stats'
    });
  }
};

// Get recent exam results
export const getRecentExamResults = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const limit = parseInt(req.query.limit as string) || 5;

    const results = await ExamResult.find({ user: userId })
      .populate('questionSet', 'name university unit session')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: results,
      message: 'Recent exam results retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get recent exam results error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve recent exam results'
    });
  }
};

// Get detailed exam result
export const getExamResultDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { resultId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const result = await ExamResult.findOne({
      _id: resultId,
      user: userId
    }).populate('questionSet', 'name university unit session');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Exam result not found'
      });
    }

    res.json({
      success: true,
      data: result,
      message: 'Exam result details retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get exam result details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve exam result details'
    });
  }
};
