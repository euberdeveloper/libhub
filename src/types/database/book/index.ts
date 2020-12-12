import { DBDocument } from '..';

export interface Reviews {
    nOfReviews: number;
    totalRating: number;
}

export interface DBBookDocument extends DBDocument {
    libraryId: string;
    isbn: string | null;
    title: string;
    authors: string[];
    publisher: string | null;
    publicationYear: Date | null;
    edition: string | null;
    condition: string | null;
    ubication: string;
    labels: string[];
    pictures: string[];
    notes: string | null;
    reviews: Reviews;
}