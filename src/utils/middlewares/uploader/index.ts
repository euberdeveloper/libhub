import * as multer from 'multer';
import { RequestHandler } from 'express';
import CONFIG from '@/config';

/**
 * A middleware that handles a file upload
 * @param dest The destination directory
 * @param name The name of the form data file
 */
export function upload(dest: string, name: string): RequestHandler {
    const multerInstance = multer({ dest, limits: { fileSize: CONFIG.UPLOAD.LIMITS.FILE_SIZE } });
    return multerInstance.single(name);
}