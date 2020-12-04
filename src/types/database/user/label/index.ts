import { DBDocument } from '../..';

export interface DBLabelDocument extends DBDocument {
    _id: string;
    name: string;
    description: string | null;
    colour: string | null;
    children: string[];
    parent: string | null;
}