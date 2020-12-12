import { Router, Request } from 'express';

import { DBBookReview } from '@/types';

import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ApiGetUsersUidLibrariesLidBooksBidReviews, ApiPostUsersUidLibrariesLidBooksBidReviewsBody, ApiGetUsersUidLibrariesLidBooksBidReviewsRid, ApiPostUsersUidLibrariesLidBooksBidReviewsResult } from '@/types/api/users/libraries/books/reviews';
import { DBCollections } from '@/types/database/collections';
import { ReqAuthenticated, ReqIdParams } from '@/types/routes';

import { dbQuery, dbTransaction } from '@/utils/database';
import { validate, purge, validateDbId, auth } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';

import { purgeCreateReview, validateCreateReview } from './utils';

export function route(router: Router): void {

    router.get('/users/:uid/libraries/:lid/books/:bid/reviews', auth('uid'), validateDbId(['lid', 'bid']), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const {lid, bid} = req.idParams;

            const found = await dbQuery<boolean>(async db => {
                const library = await db.collection(DBCollections.LIBRARIES).countDocuments({ _id: lid, owners: user._id });
                const book = await db.collection(DBCollections.BOOKS).countDocuments({ _id: bid, libraryId: lid });
                return library > 0 && book > 0;
            });
            if (!found) {
                const err: ApiError = {
                    message: 'Library or book not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            const reviews = await dbQuery<ApiGetUsersUidLibrariesLidBooksBidReviews>(async db => {
                return db.collection(DBCollections.BOOK_REVIEWS).find({ bookId: bid }).toArray();
            });

            res.send(reviews);
        });
    });
 
    router.get('/users/:uid/libraries/:lid/books/:bid/reviews/:rid', auth('uid'), validateDbId(['lid', 'bid', 'rid']), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const {lid, bid, rid} = req.idParams;

            const found = await dbQuery<boolean>(async db => {
                const library = await db.collection(DBCollections.LIBRARIES).countDocuments({ _id: lid, owners: user._id });
                const book = await db.collection(DBCollections.BOOKS).countDocuments({ _id: bid, libraryId: lid });
                return library > 0 && book > 0;
            });
            if (!found) {
                const err: ApiError = {
                    message: 'Library or book not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            const review = await dbQuery<ApiGetUsersUidLibrariesLidBooksBidReviewsRid>(async db => {
                return db.collection(DBCollections.BOOK_REVIEWS).findOne({ _id: rid, bookId: bid });
            });
            if (!review) {
                const err: ApiError = {
                    message: 'Review not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            res.send(review);
        });
    });

    router.post('/users/:uid/libraries/:lid/books/:bid/reviews', auth('uid'), validateDbId(['uid', 'lid', 'bid']), validate(validateCreateReview), purge(purgeCreateReview), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const {uid, lid, bid} = req.idParams;
            const body: ApiPostUsersUidLibrariesLidBooksBidReviewsBody = req.body;

            const found = await dbQuery<boolean>(async db => {
                const library = await db.collection(DBCollections.LIBRARIES).countDocuments({ _id: lid, owners: user._id });
                const book = await db.collection(DBCollections.BOOKS).countDocuments({ _id: bid, libraryId: lid });
                return library > 0 && book > 0;
            });
            if (!found) {
                const err: ApiError = {
                    message: 'Library or book not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            const id = await dbTransaction<ApiPostUsersUidLibrariesLidBooksBidReviewsResult>(async (db, session) => {
                const review: Omit<DBBookReview, '_id'> = {
                    ...body,
                    bookId: bid as any,
                    author: uid as any
                };
                const queryResult = await db.collection(DBCollections.BOOK_REVIEWS).insertOne(review, { session });
                const id = queryResult.insertedId;

                if (!id) {
                    throw new Error('Error in inserting review');
                }

                const updateResult = await db.collection(DBCollections.BOOK_REVIEWS).updateOne({ _id: bid, libraryId: lid }, { $inc: { nOfReviews: 1, totalRating: body.rate } }, { session });
                if (updateResult.modifiedCount < 1) {
                    throw new Error('Error in updating book');
                }

                return id;
            });
            

            res.send(id);
        });
    });

    router.delete('/users/:uid/libraries/:lid/books/:bid/reviews/:rid', auth('uid'), validateDbId(['lid', 'bid', 'rid']), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const {lid, bid, rid} = req.idParams;

            const found = await dbQuery<boolean>(async db => {
                const library = await db.collection(DBCollections.LIBRARIES).countDocuments({ _id: lid, owners: user._id });
                const book = await db.collection(DBCollections.BOOKS).countDocuments({ _id: bid, libraryId: lid });
                return library > 0 && book > 0;
            });
            if (!found) {
                const err: ApiError = {
                    message: 'Library or book not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            const deleted = await dbTransaction<boolean>(async (db, session) => {
                const deleteResult = await db.collection(DBCollections.BOOK_REVIEWS).findOneAndDelete({ _id: rid, bookId: bid }, { session });
                const review: DBBookReview = deleteResult.value;

                if (!review) {
                    return false;
                }
                
                const updateResult = await db.collection(DBCollections.BOOKS).updateOne({ _id: bid, libraryId: lid }, { $inc: { nOfReviews: -1, totalRating: -review.rate } }, { session });
                if (updateResult.modifiedCount < 1) {
                    throw new Error('Error in updating book');
                }

                return true;
            });
            if (!deleted) {
                const err: ApiError = {
                    message: 'Review not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            res.send();
        });
    });

}