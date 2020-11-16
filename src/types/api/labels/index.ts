import { DBLabelDocument } from '@/types/database';

export type ApiGetLabels = DBLabelDocument[];

export type ApiGetLabelsLid = DBLabelDocument;

export type ApiPostLabelsBody = Omit<DBLabelDocument, '_id'>;
export type ApiPostLabelsResult = string;

export type ApiPutLabelsLidBody = Omit<DBLabelDocument, 'children' | 'parent' | '_id'>;

export type ApiPatchLabelsLidBody = Partial<Omit<DBLabelDocument, 'children' | 'parent' | '_id'>>;