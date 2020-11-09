import * as multer from 'multer';
import { RequestHandler } from 'express';
import CONFIG from '@/config';

export function upload(dest: string, name: string): RequestHandler {
    const multerInstance = multer({ dest, limits: { fileSize: CONFIG.UPLOAD.LIMITS.FILE_SIZE } });
    return multerInstance.single(name);
}