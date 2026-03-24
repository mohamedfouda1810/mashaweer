import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { Public } from '../../common/decorators/public.decorator';
import { CloudinaryService } from './cloudinary.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Public()
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|webp|gif|pdf)$/i;
        if (!allowed.test(extname(file.originalname))) {
          cb(
            new BadRequestException(
              'Only image files (jpg, png, webp, gif) and PDFs are allowed',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const result = await this.cloudinaryService.uploadFile(file);
      // Return the public Cloudinary URL for the file
      return { url: result.secure_url, filename: result.public_id, size: file.size };
    } catch (error: any) {
      console.error('Upload Error:', error);
      throw new BadRequestException(
        error.message || 'Failed to upload file to Cloudinary'
      );
    }
  }
}
