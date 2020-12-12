import { DBDocument } from '..';
import { DBLibrarySchema } from './schema';

export * from './schema';

export interface DBLibraryDocument extends DBDocument {
    name: string;
    owners: string[];
    schema: DBLibrarySchema;
}