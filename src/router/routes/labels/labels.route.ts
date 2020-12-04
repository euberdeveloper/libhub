import { Router, Request } from "express";
import { DBLabelDocument } from "@/types";

import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ApiGetLabels, ApiGetLabelsLid, ApiPatchLabelsLidBody, ApiPostLabelsBody, ApiPostLabelsResult, ApiPutLabelsLidBody } from '@/types/api/labels';
import { DBCollections } from '@/types/database/collections';
import { ReqIdParams } from '@/types/routes';

import { dbId, dbQuery, dbTransaction } from '@/utils/database';
import { validate, purge, validateDbId } from "@/utils/middlewares";
import { aceInTheHole } from '@/utils/various';

import { validatePostOrPutLabels, purgePostLabels, purgePutLabels, validatePatchLabels, purgePatchLabels } from "./utils";

export function route(router: Router): void {

    router.get('/labels', async (_req, res) => {
        await aceInTheHole(res, async () => {
            const labels = await dbQuery<ApiGetLabels>(async db => {
                return db.collection(DBCollections.LABELS).find().toArray();
            });
            res.send(labels);
        });
    });

    router.get('/labels/:lid', validateDbId('lid'), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const lid = req.idParams.lid;
            const label = await dbQuery<ApiGetLabelsLid>(async db => {
                return db.collection(DBCollections.LABELS).findOne({ _id: lid });
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

    router.post('/labels', validate(validatePostOrPutLabels), purge(purgePostLabels), async (req, res) => {
        await aceInTheHole(res, async () => {
            const body: ApiPostLabelsBody = req.body;
            const lid = await dbQuery<ApiPostLabelsResult>(async db => {
                const queryResult = await db.collection(DBCollections.LABELS).insertOne(body);
                return queryResult?.insertedId?.toHexString();
            });

            if (!lid) {
                throw new Error('Error in database insert');
            }

            res.send(lid);
        });
    });

    router.put('/labels/:lid', validateDbId('lid'), validate(validatePostOrPutLabels), purge(purgePutLabels), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const lid = req.idParams.lid;
            const body: ApiPutLabelsLidBody = req.body;

            await dbQuery<void>(async db => {
                const oldLabel: DBLabelDocument = await db.collection(DBCollections.LABELS).findOne({ _id: lid });
                const newLabel = { ...body, children: oldLabel.children ?? [], parent: oldLabel.parent ?? null };
                await db.collection(DBCollections.LABELS).replaceOne({ _id: lid }, newLabel, { upsert: true });
            });

            res.send();
        });
    });

    router.patch('/labels/:lid', validateDbId('lid'), validate(validatePatchLabels), purge(purgePatchLabels), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const lid = req.idParams.lid;
            const body: ApiPatchLabelsLidBody = req.body;

            const updated = await dbQuery<boolean>(async db => {
                const result = await db.collection(DBCollections.LABELS).updateOne({ _id: lid }, { $set: body }, { upsert: false });
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

    router.post('/labels/parent/:parent/child/:child', validateDbId(['parent', 'child'], 'parent'), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const parentId = req.idParams.parent;
            const childId = req.idParams.child;
            const parentIsRoot = (parentId as unknown as string) === 'root';

            const { parentDiscendantOfChild, childNotFound, parentNotFound } = await dbTransaction<any>(async (db, session) => {
                const child: DBLabelDocument = await db.collection(DBCollections.LABELS).findOne({ _id: childId }, { session });

                if (!child) {
                    return { childNotFound: true };
                }

                async function isNewParentADescendantOfChild(currentLabel: DBLabelDocument): Promise<boolean> {
                    const children: string[]  = currentLabel.children;

                    for (const child of children) {
                        if (child === parentId.toHexString()) {
                            return true;
                        }

                        const childLabel = await db.collection(DBCollections.LABELS).findOne({ _id: child }, { session });

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
                    : await db.collection(DBCollections.LABELS).findOne({ _id: parentId }, { session });

                if (!parentIsRoot && !parent) {
                    return { parentNotFound: true };
                }

                if (child.parent) {
                    const queryResult = await db.collection(DBCollections.LABELS).updateOne({ _id: dbId(child.parent) }, { $pull: { children: childId } }, { session });
                    if (queryResult.modifiedCount < 1) {
                        throw new Error('Cannot find old parent of child');
                    }
                }

                if (!parentIsRoot) {
                    const queryResult = await db.collection(DBCollections.LABELS).updateOne({ _id: parentId }, { $push: { children: childId } }, { session });
                    if (queryResult.modifiedCount < 1) {
                        throw new Error('Error in updating the parent label');
                    }
                }

                const queryResult = await db.collection(DBCollections.LABELS).updateOne({ _id: childId }, { $set: { parent: parentIsRoot ? null : parentId } }, { session });
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

    router.delete('/labels/:lid', validateDbId('lid'), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const lid = req.idParams.lid;
            const deleted = await dbTransaction<boolean>(async (db, session) => {
                const queryResult = await db.collection(DBCollections.LABELS).deleteOne({ _id: lid }, { session });
                return queryResult.deletedCount > 0;
            });

            if (!deleted) {
                const err: ApiError = {
                    message: 'Label not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND,
                };
                res.status(404).send(err);
                return;
            }

            res.send();
        });
    });
}