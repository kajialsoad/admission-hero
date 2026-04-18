import { Request, Response } from 'express';
import University from '../models/University';

// Get all universities with pagination and search
export const getUniversities = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';

    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortName: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await University.countDocuments(query);
    const universities = await University.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: universities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      message: 'Universities retrieved successfully',
    });
  } catch (error: any) {
    console.error('Get universities error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to retrieve universities' 
    });
  }
};

// Get single university by ID
export const getUniversity = async (req: Request, res: Response) => {
  try {
    const university = await University.findById(req.params.id);

    if (!university) {
      return res.status(404).json({ 
        success: false, 
        message: 'University not found' 
      });
    }

    res.json({
      success: true,
      data: university,
      message: 'University retrieved successfully',
    });
  } catch (error: any) {
    console.error('Get university error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to retrieve university' 
    });
  }
};

// Create new university
export const createUniversity = async (req: Request, res: Response) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request body type:', typeof req.body);
    console.log('Request body keys:', Object.keys(req.body));
    
    const { name, shortName, logo, units } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'University name is required' 
      });
    }

    // Check if university already exists
    const existingUniversity = await University.findOne({ name });
    if (existingUniversity) {
      return res.status(400).json({ 
        success: false, 
        message: 'University with this name already exists' 
      });
    }

    // Parse units if it's a string (from FormData)
    let parsedUnits: string[] = [];
    if (units) {
      try {
        parsedUnits = typeof units === 'string' ? JSON.parse(units) : units;
      } catch (error) {
        console.error('Error parsing units:', error);
        parsedUnits = [];
      }
    }

    const university = await University.create({
      name: name.trim(),
      shortName: shortName ? shortName.trim() : undefined,
      logo: logo || undefined,
      units: parsedUnits,
    });

    res.status(201).json({
      success: true,
      data: university,
      message: 'University created successfully',
    });
  } catch (error: any) {
    console.error('Create university error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create university' 
    });
  }
};

// Update university
export const updateUniversity = async (req: Request, res: Response) => {
  try {
    console.log('Update request body:', req.body);
    
    const { name, shortName, logo, units } = req.body;

    // Check if another university has the same name
    if (name) {
      const existingUniversity = await University.findOne({ 
        name, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingUniversity) {
        return res.status(400).json({ 
          success: false, 
          message: 'Another university with this name already exists' 
        });
      }
    }

    // Parse units if it's a string (from FormData)
    let parsedUnits = units;
    if (units && typeof units === 'string') {
      try {
        parsedUnits = JSON.parse(units);
      } catch (error) {
        console.error('Error parsing units:', error);
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (shortName !== undefined) updateData.shortName = shortName ? shortName.trim() : '';
    if (logo !== undefined) updateData.logo = logo;
    if (parsedUnits !== undefined) updateData.units = parsedUnits;

    const university = await University.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!university) {
      return res.status(404).json({ 
        success: false, 
        message: 'University not found' 
      });
    }

    res.json({
      success: true,
      data: university,
      message: 'University updated successfully',
    });
  } catch (error: any) {
    console.error('Update university error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update university' 
    });
  }
};

// Delete university
export const deleteUniversity = async (req: Request, res: Response) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);

    if (!university) {
      return res.status(404).json({ 
        success: false, 
        message: 'University not found' 
      });
    }

    res.json({
      success: true,
      message: 'University deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete university error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to delete university' 
    });
  }
};