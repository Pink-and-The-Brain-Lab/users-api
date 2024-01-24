export interface IValidationTokenData {
    id?: string;
    token?: string;
    email?: string;
    validateTokenTime?: Date;
    createdAt?: Date;
    validated?: boolean;
    status?: string;
    message?: string;
    statusCode?: number;
}
