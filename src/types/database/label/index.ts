import { DBDocument } from '..';

export interface DBLabelDocument extends DBDocument {
    libraryId: string;
    name: string;
    description: string | null;
    color: string | null;
    children: string[];
    parent: string | null;
}