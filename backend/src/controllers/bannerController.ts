import { Request, Response } from 'express';
import Banner from '../models/Banner';

// Get all banners (for admin)
export const getAllBanners = async (req: Request, res: Response) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json({
      success: true,
      data: banners,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
      error: error.message,
    });
  }
};

// Get active banners (for mobile app)
export const getActiveBanners = async (req: Request, res: Response) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({
      success: true,
      data: banners,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
      error: error.message,
    });
  }
};

// Create a banner (admin)
export const createBanner = async (req: Request, res: Response) => {
  try {
    const { title, imageUrl, link, isActive, order } = req.body;
    
    if (!title || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Title and imageUrl are required',
      });
    }

    const banner = await Banner.create({
      title,
      imageUrl,
      link,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create banner',
      error: error.message,
    });
  }
};

// Update a banner (admin)
export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, imageUrl, link, isActive, order } = req.body;

    const banner = await Banner.findByIdAndUpdate(
      id,
      { title, imageUrl, link, isActive, order },
      { new: true, runValidators: true }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    res.json({
      success: true,
      message: 'Banner updated successfully',
      data: banner,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update banner',
      error: error.message,
    });
  }
};

// Delete a banner (admin)
export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    res.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete banner',
      error: error.message,
    });
  }
};
