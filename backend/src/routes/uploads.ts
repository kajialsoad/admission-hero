import express, { Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protect, adminOnly } from '../middlewares/auth';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and common document types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type') as any, false);
    }
  },
});

// Upload single image
router.post('/image', [protect, upload.single('image')], async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'admission-hero/images',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file!.buffer);
    });

    const uploadResult = result as any;

    res.json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        size: uploadResult.bytes,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
    });
  }
});

// Upload multiple images
router.post('/images', [protect, upload.array('images', 5)], async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided',
      });
    }

    const uploadPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'admission-hero/images',
            transformation: [
              { width: 1200, height: 800, crop: 'limit' },
              { quality: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);

    const uploadedImages = results.map((result: any) => ({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    }));

    res.json({
      success: true,
      data: uploadedImages,
    });
  } catch (error) {
    console.error('Multiple images upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
    });
  }
});

// Upload document/file
router.post('/document', [protect, upload.single('document')], async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file provided',
      });
    }

    // Upload to Cloudinary as raw file
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'admission-hero/documents',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file!.buffer);
    });

    const uploadResult = result as any;

    res.json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        size: uploadResult.bytes,
        originalName: req.file.originalname,
      },
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
    });
  }
});

// Delete uploaded file
router.delete('/:publicId', protect, async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.query;

    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType as string,
    });

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
    });
  }
});

// Get upload signature for client-side uploads
router.post('/signature', protect, async (req: Request, res: Response) => {
  try {
    const { folder = 'admission-hero', resourceType = 'image' } = req.body;
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        resource_type: resourceType,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    res.json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder,
        resourceType,
      },
    });
  } catch (error) {
    console.error('Upload signature error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate upload signature',
    });
  }
});

export default router;


