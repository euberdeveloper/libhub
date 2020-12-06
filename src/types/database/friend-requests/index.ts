export interface DBFriendRequest {
    _id: string;
    requestBy: string;
    requestTo: string;
    createdOn: Date;
    message: string | null;
}