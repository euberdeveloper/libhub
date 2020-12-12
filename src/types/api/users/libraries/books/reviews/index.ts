import { DBBookReview } from '@/types/database';

export type ApiGetUsersUidLibrariesLidBooksBidReviews = DBBookReview[];
export type ApiGetUsersUidLibrariesLidBooksBidReviewsRid = DBBookReview;

export type ApiPostUsersUidLibrariesLidBooksBidReviewsBody = Omit<DBBookReview, '_id' | 'bookId' | 'author'>;
export type ApiPostUsersUidLibrariesLidBooksBidReviewsResult = string;