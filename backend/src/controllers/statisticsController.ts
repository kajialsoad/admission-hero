import { Request, Response } from 'express';
import AppStatistics from '../models/AppStatistics';

// Get current statistics (public endpoint)
export const getStatistics = async (req: Request, res: Response) => {
  try {
    let stats = await AppStatistics.findOne().sort({ updatedAt: -1 });
    
    // If no statistics exist, create default
    if (!stats) {
      stats = await AppStatistics.create({
        totalExams: 0,
        totalQuestions: 0,
        totalVideos: 0,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalExams: stats.totalExams,
        totalQuestions: stats.totalQuestions,
        totalVideos: stats.totalVideos,
        updatedAt: stats.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
};

// Update statistics (admin only)
export const updateStatistics = async (req: Request, res: Response) => {
  try {
    const { totalExams, totalQuestions, totalVideos } = req.body;
    const userId = (req as any).user?.id;

    // Validate input
    if (totalExams !== undefined && (typeof totalExams !== 'number' || totalExams < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Total exams must be a non-negative number',
      });
    }

    if (totalQuestions !== undefined && (typeof totalQuestions !== 'number' || totalQuestions < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Total questions must be a non-negative number',
      });
    }

    if (totalVideos !== undefined && (typeof totalVideos !== 'number' || totalVideos < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Total videos must be a non-negative number',
      });
    }

    // Get current statistics or create new
    let stats = await AppStatistics.findOne().sort({ updatedAt: -1 });

    if (!stats) {
      stats = await AppStatistics.create({
        totalExams: totalExams ?? 0,
        totalQuestions: totalQuestions ?? 0,
        totalVideos: totalVideos ?? 0,
        lastUpdatedBy: userId,
      });
    } else {
      // Update only provided fields
      if (totalExams !== undefined) stats.totalExams = totalExams;
      if (totalQuestions !== undefined) stats.totalQuestions = totalQuestions;
      if (totalVideos !== undefined) stats.totalVideos = totalVideos;
      stats.lastUpdatedBy = userId;
      
      await stats.save();
    }

    // Populate lastUpdatedBy
    await stats.populate('lastUpdatedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Statistics updated successfully',
      data: stats,
    });
  } catch (error: any) {
    console.error('Error updating statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update statistics',
      error: error.message,
    });
  }
};

// Get statistics with admin details (admin only)
export const getStatisticsAdmin = async (req: Request, res: Response) => {
  try {
    let stats = await AppStatistics.findOne()
      .sort({ updatedAt: -1 })
      .populate('lastUpdatedBy', 'name email');
    
    // If no statistics exist, create default
    if (!stats) {
      stats = await AppStatistics.create({
        totalExams: 0,
        totalQuestions: 0,
        totalVideos: 0,
      });
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
};
