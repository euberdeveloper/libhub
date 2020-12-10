import { Router, Request } from 'express';
import { DBLabelDocument } from '@/types';

import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ApiGetLabels, ApiGetLabelsLid, ApiPatchLabelsLidBody, ApiPostLabelsBody, ApiPostLabelsResult, ApiPutLabelsLidBody } from '@/types/api/users/libraries/labels';
import { DBCollections } from '@/types/database/collections';
import { ReqIdParams, ReqAuthenticated } from '@/types/routes';

import { dbId, dbQuery, dbTransaction } from '@/utils/database';
import { validate, purge, validateDbId, auth } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';

import { validatePostOrPutLabels, purgePostLabels, purgePutLabels, validatePatchLabels, purgePatchLabels } from './utils';

export function route(router: Router): void {

    router.get('/user/:uid/libraries/:lid/labels', auth('uid'), validateDbId('uid'), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const lid = req.idParams;

            const found = await dbQuery<boolean>(async db => {
                const library = await db.collection(DBCollections.LIBRARIES).countDocuments({ _id: lid, owners: user._id });
                return library > 0;
            });
            if (!found) {
                const err: ApiError = {
                    message: 'Library not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            const labels = await dbQuery<ApiGetLabels>(async db => {
                return db.collection(DBCollections.LABELS).find({ libraryId: lid }).toArray();
            });
            res.send(labels);
        });
    });

    router.get('/user/:uid/libraries/:lid/labels/:id', auth('uid'), validateDbId('lid'), async (req: Request & ReqIdParams & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const { lid, id } = req.idParams;

            const found = await dbQuery<boolean>(async db => {
                const library = await db.collection(DBCollections.LIBRARIES).countDocuments({ _id: lid, owners: user._id });
                return library > 0;
            });
            if (!found) {
                const err: ApiError = {
                    message: 'Library not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            const label = await dbQuery<ApiGetLabelsLid>(async db => {
                return db.collection(DBCollections.LABELS).findOne({ _id: id, libraryId: lid });
            });

            if (!label) {
                const err: ApiError = {
                    message: 'Label not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            res.send(label);
        });
    });

    router.post('/user/:uid/libraries/:lid/labels', auth('uid'), validate(validatePostOrPutLabels), purge(purgePostLabels), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const lid = req.idParams.lid;
            const body: ApiPostLabelsBody = req.body;
            
            const found = await dbQuery<boolean>(async db => {
                const library = await db.collection(DBCollections.LIBRARIES).countDocuments({ _id: lid, owners: user._id });
                return library > 0;
            });
            if (!found) {
                const err: ApiError = {
                    message: 'Library not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            const id = await dbQuery<ApiPostLabelsResult>(async db => {
                const queryResult = await db.collection(DBCollections.LABELS).insertOne({...body, libraryId: lid});
                return queryResult?.insertedId?.toHexString();
            });

            if (!id) {
                throw new Error('Error in database insert');
            }

            res.send(id);
        });
    });

    router.put('/user/:uid/libraries/:lid/labels/:id', auth('uid'), validateDbId('lid'), validate(validatePostOrPutLabels), purge(purgePutLabels), async (req: Request & ReqIdParams & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const { lid, id } = req.idParams;
            const body: ApiPutLabelsLidBody = req.body;

            const found = await dbQuery<boolean>(async db => {
                const library = await db.collection(DBCollections.LIBRARIES).countDocuments({ _id: lid, owners: user._id });
                return library > 0;
            });
            if (!found) {
                const err: ApiError = {
                    message: 'Library not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            await dbQuery<unknown>(async db => {
                const oldLabel: DBLabelDocument = await db.collection(DBCollections.LABELS).findOne({ _id: id, libraryId: lid });
                const newLabel = { ...body, children: oldLabel.children ?? [], parent: oldLabel.parent ?? null };
                await db.collection(DBCollections.LABELS).replaceOne({ _id: id, libraryId: lid }, newLabel, { upsert: true });
            });

            res.send();
        });
    });

    router.patch('/user/:uid/libraries/:lid/labels/:id', auth('uid'), validateDbId('lid'), validate(validatePatchLabels), purge(purgePatchLabels), async (req: Request & ReqIdParams & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const { lid, id } = req.idParams;
            const user = req.user;
            const body: ApiPatchLabelsLidBody = req.body;

            const found = await dbQuery<boolean>(async db => {
                const library = await db.collection(DBCollections.LIBRARIES).countDocuments({ _id: lid, owners: user._id });
                return library > 0;
            });
            if (!found) {
                const err: ApiError = {
                    message: 'Library not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            const updated = await dbQuery<boolean>(async db => {
                const result = await db.collection(DBCollections.LABELS).updateOne({ _id: id, libraryId: id }, { $set: body }, { upsert: false });
                return result.matchedCount > 0;
            });

            if (!updated) {
                const err: ApiError = {
                    message: 'Label not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            res.send();
        });
    });

    router.post('/user/:uid/libraries/:lid/labels/parent/:parent/child/:child', auth('uid'), validateDbId(['parent', 'child'], 'parent'), async (req: Request & ReqIdParams & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const lid = req.idParams.lid;
            const parentId = req.idParams.parent;
            const childId = req.idParams.child;
            const parentIsRoot = (parentId as unknown as string) === 'root';

            const found = await dbQuery<boolean>(async db => {
                const library = await db.collection(DBCollections.LIBRARIES).countDocuments({ _id: lid, owners: user._id });
                return library > 0;
            });
            if (!found) {
                const err: ApiError = {
                    message: 'Library not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            const { parentDiscendantOfChild, childNotFound, parentNotFound } = await dbTransaction<any>(async (db, session) => {
                const child: DBLabelDocument = await db.collection(DBCollections.LABELS).findOne({ _id: childId, libraryId: lid }, { session });

                if (!child) {
                    return { childNotFound: true };
                }

                async function isNewParentADescendantOfChild(currentLabel: DBLabelDocument): Promise<boolean> {
                    const children: string[]  = currentLabel.children;

                    for (const child of children) {
                        if (child === parentId.toHexString()) {
                            return true;
                        }

                        const childLabel = await db.collection(DBCollections.LABELS).findOne({ _id: child, libraryId: lid }, { session });

                        if (!childLabel) {
                            throw new Error('Error in checking if parent is a descendant of child');
                        }

                        if (await isNewParentADescendantOfChild(childLabel)) {
                            return true;
                        }
                    }

                    return false;
                }
                if (!parentIsRoot && await isNewParentADescendantOfChild(child)) {
                    return { parentDiscendantOfChild: true };
                }

                const parent: DBLabelDocument | null = parentIsRoot
                    ? null
                    : await db.collection(DBCollections.LABELS).findOne({ _id: parentId, libraryId: lid }, { session });

                if (!parentIsRoot && !parent) {
                    return { parentNotFound: true };
                }

                if (child.parent) {
                    const queryResult = await db.collection(DBCollections.LABELS).updateOne({ _id: dbId(child.parent), libraryId: lid }, { $pull: { children: childId } }, { session });
                    if (queryResult.modifiedCount < 1) {
                        throw new Error('Cannot find old parent of child');
                    }
                }

                if (!parentIsRoot) {
                    const queryResult = await db.collection(DBCollections.LABELS).updateOne({ _id: parentId, libraryId: lid }, { $push: { children: childId } }, { session });
                    if (queryResult.modifiedCount < 1) {
                        throw new Error('Error in updating the parent label');
                    }
                }

                const queryResult = await db.collection(DBCollections.LABELS).updateOne({ _id: childId, libraryId: lid }, { $set: { parent: parentIsRoot ? null : parentId } }, { session });
                if (queryResult.modifiedCount < 1) {
                    throw new Error('Error in updating the child label');
                }

            });

            if (!parentDiscendantOfChild) {
                const err: ApiError = {
                    message: 'Parent can not be discendant of the child',
                    code: ApiErrorCode.LABELS_PARENT_DISCENDANT_OF_CHILD
                };
                res.status(400).send(err);
                return;
            }

            if (!childNotFound) {
                const err: ApiError = {
                    message: 'Child label not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            if (!parentNotFound) {
                const err: ApiError = {
                    message: 'Parent label not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            res.send();
        });
    });
}