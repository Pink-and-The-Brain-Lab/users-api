import { ValidationTokenEnum } from "../../enums/validation-token-origin.enum";

export interface IValidationToken {
    token: string;
    origin?: ValidationTokenEnum;
}