import { Request, Response } from 'express';
import AppContent from '../models/AppContent';

// Get all app content (for admin)
export const getAllContent = async (req: Request, res: Response) => {
  try {
    const contents = await AppContent.find()
      .populate('lastUpdatedBy', 'name email')
      .sort({ key: 1 });

    res.json({
      success: true,
      data: contents,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content',
      error: error.message,
    });
  }
};

// Get single content by key (public)
export const getContentByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    
    const content = await AppContent.findOne({ 
      key, 
      status: 'published' 
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found',
      });
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content',
      error: error.message,
    });
  }
};

// Get all published content (public)
export const getPublishedContent = async (req: Request, res: Response) => {
  try {
    const contents = await AppContent.find({ status: 'published' })
      .select('key title updatedAt')
      .sort({ key: 1 });

    res.json({
      success: true,
      data: contents,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content',
      error: error.message,
    });
  }
};

// Create or update content (admin only)
export const upsertContent = async (req: Request, res: Response) => {
  try {
    const { key, title, content, status } = req.body;
    const userId = (req as any).user?.id;

    if (!key || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Key, title, and content are required',
      });
    }

    const updatedContent = await AppContent.findOneAndUpdate(
      { key },
      {
        key,
        title,
        content,
        status: status || 'published',
        lastUpdatedBy: userId,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    ).populate('lastUpdatedBy', 'name email');

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: updatedContent,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update content',
      error: error.message,
    });
  }
};

// Delete content (admin only)
export const deleteContent = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const content = await AppContent.findOneAndDelete({ key });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found',
      });
    }

    res.json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete content',
      error: error.message,
    });
  }
};

// Initialize default content (run once)
export const initializeDefaultContent = async (req: Request, res: Response) => {
  try {
    const defaultContents = [
      {
        key: 'about_app',
        title: 'About Admission Hero',
        content: '<h2>About Admission Hero</h2><p>Admission Hero is your ultimate companion for university admission preparation in Bangladesh.</p>',
        status: 'published',
      },
      {
        key: 'privacy_policy',
        title: 'Privacy Policy',
        content: '<h2>Privacy Policy</h2><p>Your privacy is important to us. This policy explains how we collect and use your data.</p>',
        status: 'published',
      },
      {
        key: 'terms_conditions',
        title: 'Terms & Conditions',
        content: '<h2>Terms & Conditions</h2><p>By using Admission Hero, you agree to these terms and conditions.</p>',
        status: 'published',
      },
      {
        key: 'refund_policy',
        title: 'Refund Policy',
        content: '<h2>Refund Policy</h2><p>We offer refunds within 7 days of purchase under certain conditions.</p>',
        status: 'published',
      },
      {
        key: 'contact_us',
        title: 'Contact Us',
        content: '<h2>Contact Us</h2><p>Email: support@admission-hero.com<br>Phone: +880 1234 567890</p>',
        status: 'published',
      },
      {
        key: 'support_info',
        title: 'Support Information',
        content: '<h2>Support</h2><p>Need help? Contact our support team for assistance.</p>',
        status: 'published',
      },
    ];

    for (const item of defaultContents) {
      await AppContent.findOneAndUpdate(
        { key: item.key },
        item,
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      message: 'Default content initialized successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to initialize content',
      error: error.message,
    });
  }
};
