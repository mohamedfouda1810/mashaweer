import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { Public } from '../../common/decorators/public.decorator';

const UPLOAD_DIR = process.env.VERCEL ? '/tmp' : join(process.cwd(), 'uploads');

// Ensure the upload directory exists
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

@Controller('upload')
export class UploadController {
  @Public()
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
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
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Return the public URL for the file
    // In production, you'd use a CDN or cloud storage URL
    const url = `/uploads/${file.filename}`;

    return { url, filename: file.filename, size: file.size };
  }
}
