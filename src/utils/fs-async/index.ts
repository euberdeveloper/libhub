import * as fs from 'fs';
import * as util from 'util';

export const exists = util.promisify(fs.exists);
export const writeFile = util.promisify(fs.writeFile);
export const rename = util.promisify(fs.rename);
export const mkdir = util.promisify(fs.mkdir);
export const copyFile = util.promisify(fs.copyFile);
export const unlink = util.promisify(fs.unlink);