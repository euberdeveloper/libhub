import { DBLabelDocument } from '@/types/database';

export type ApiGetLabels = DBLabelDocument[];

export type ApiGetLabelsLid = DBLabelDocument;

export type ApiPostLabelsBody = Omit<DBLabelDocument, '_id' | 'libraryId'>;
export type ApiPostLabelsResult = string;

export type ApiPutLabelsLidBody = Omit<DBLabelDocument, 'libraryId' | 'children' | 'parent' | '_id'>;

export type ApiPatchLabelsLidBody = Partial<Omit<DBLabelDocument, 'libraryId' | 'children' | 'parent' | '_id'>>;