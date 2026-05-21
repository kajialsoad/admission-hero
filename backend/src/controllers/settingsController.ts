import { Request, Response } from 'express';
import Settings from '../models/Settings';

// Get all public settings (contact info, FAQs, etc.)
export const getPublicSettings = async (req: Request, res: Response) => {
  try {
    const settings = await Settings.find({ category: 'public' });
    
    // Transform to key-value object
    const settingsObj: any = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    res.json({
      success: true,
      data: settingsObj,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message,
    });
  }
};

// Get contact information specifically
export const getContactInfo = async (req: Request, res: Response) => {
  try {
    const contactInfo = await Settings.findOne({ key: 'contact_info', category: 'public' });
    
    if (!contactInfo) {
      // Return default values if not set
      return res.json({
        success: true,
        data: {
          email: 'support.admissionhero@gmail.com',
          phone: '+880 1575804161',
          workingHours: 'Available from 10:00 AM to 10:00 PM',
        },
      });
    }

    res.json({
      success: true,
      data: contactInfo.value,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact information',
      error: error.message,
    });
  }
};

// Admin: Update settings
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { key, value, category } = req.body;

    const setting = await Settings.findOneAndUpdate(
      { key },
      { key, value, category: category || 'public' },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: setting,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message,
    });
  }
};
