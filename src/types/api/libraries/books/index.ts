import { DBBookDocument } from '@/types/database';

export type ApiGetLibrariesLidBooks = DBBookDocument[];

export type ApiGetLibrariesLidBooksBid = DBBookDocument;

export type ApiPostLibrariesLidBooksBody = Omit<DBBookDocument, '_id' | 'libraryId'>;
export type ApiPostLibrariesLidBooksResult = string;

export type ApiPostLibrariesLidBooksPicturesBody = FormData;
export type ApiPostLibrariesLidBooksPicturesResult = string;

export type ApiPutLibrariesLidBooksBidBody = Omit<DBBookDocument, '_id' | 'libraryId' | 'pictures'>;

export type ApiPatchLibrariesLidBooksBidBody = Partial<Omit<DBBookDocument, '_id' | 'libraryId' | 'pictures'>>;