import { DBBookDocument } from '@/types/database';

export type ApiGetLibrariesLidBooks = DBBookDocument[];

export type ApiGetLibrariesLidBooksBid = DBBookDocument;

export type ApiPostLibrariesLidBooksBody = Omit<DBBookDocument, '_id' | 'userId' | 'libraryId'>;
export type ApiPostLibrariesLidBooksResult = string;

export type ApiPostLibrariesLidBooksPicturesBody = FormData;
export type ApiPostLibrariesLidBooksPicturesResult = string;

export type ApiPutLibrariesLidBooksBidBody = Omit<DBBookDocument, '_id' | 'userId' | 'libraryId' | 'pictures' | 'reviews'>;

export type ApiPatchLibrariesLidBooksBidBody = Partial<Omit<DBBookDocument, '_id' | 'userId' | 'libraryId' | 'pictures' | 'reviews'>>;