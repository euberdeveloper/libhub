import { DBLibraryDocument } from '@/types/database';

export type ApiGetLibraries = DBLibraryDocument[];

export type ApiGetLibrariesLid = DBLibraryDocument;

export type ApiPostLibrariesBody = Omit<DBLibraryDocument, '_id'>;
export type ApiPostLibrariesResult = string;

export type ApiPutLibrariesLidBody = Omit<DBLibraryDocument, '_id' | 'owners' | 'schema'>;

export type ApiPatchLibrariesLidBody = Partial<Omit<DBLibraryDocument, '_id' | 'owners' | 'schema'>>;