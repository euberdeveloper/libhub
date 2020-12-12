import { DBDocument } from '..';

export interface DBBookReview extends DBDocument {
    _id: string;
    bookId: string;
    author: string;
    craetedOn: Date;
    title: string;
    text: string;
    rate: number;
}