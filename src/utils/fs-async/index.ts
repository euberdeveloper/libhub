import * as fs from 'fs';
import * as util from 'util';

export const rename = util.promisify(fs.rename);
export const unlink = util.promisify(fs.unlink);
export const exists = util.promisify(fs.exists);
export const mkdir = util.promisify(fs.mkdir);
export const copyFile = util.promisify(fs.copyFile);