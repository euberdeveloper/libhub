import { Router } from "express";

import { ApiError, ApiErrorCode } from "@/types/api/error";
import { getIsbnInfo } from '@/utils/isbn-scratcher';
import { aceInTheHole } from '@/utils/various';


export function route(router: Router): void {

    router.get('/isbn/:isbn', async (req, res) => {
        await aceInTheHole(res, async () => {
            const isbn = req.params.isbn;
            const bookInfo = await getIsbnInfo(isbn);

            if (!bookInfo) {
                const err: ApiError = {
                    message: 'ISBN not found',
                    code: ApiErrorCode.ISBN_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            res.send(bookInfo);
        });
    });

}