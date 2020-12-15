/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from 'express';
import { scan } from 'dree';
import * as path from 'path';

export default function(): Router {
    const router = Router();

    scan(path.join(__dirname, 'routes'), { extensions: ['js'] }, file => {
        if (file.name.includes('.route')) {
            require(file.path).route(router);
        }
    });

    return router;
}