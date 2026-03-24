import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor() {
    if (process.env.CLOUDINARY_URL) {
      cloudinary.config({
        url: process.env.CLOUDINARY_URL,
      });
    }
  }

  uploadFile(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'mashaweer/uploads' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary internal error:', error);
            return reject(error);
          }
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
