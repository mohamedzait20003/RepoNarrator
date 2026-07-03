export interface BaseRequest {}

/** Success envelope: a human message + optional data payload (null when none). */
export interface ApiResponse<T = null> {
    Message: string;
    Data: T | null;
}

/** Success envelope for endpoints that return no data payload. */
export type BaseResponse = ApiResponse<null>;

/** Structured error detail returned inside an error envelope. */
export interface ApiError {
    Code: string;
    Type: string;
}

/** Error envelope: a human message + structured error. */
export interface ApiErrorResponse {
    Message: string;
    Error: ApiError;
}
