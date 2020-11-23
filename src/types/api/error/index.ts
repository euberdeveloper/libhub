export enum ApiErrorCode {
    INTERNAL_SERVER_ERROR,
    INVALID_BODY,
    INVALID_BODY_DATE_VALUE,
    ERROR_WHILE_PURGING_BODY,
    PROVIDED_ID_NOT_FOUND,
    ISBN_NOT_FOUND,
    LABELS_PARENT_DISCENDANT_OF_CHILD
}

export interface ApiError {
    message: string;
    code: ApiErrorCode;
}