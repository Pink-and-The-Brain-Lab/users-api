import { AppError, ValidateEmail } from "millez-lib-api";

export const validateEmail = (email: string) => {
    const validateEmail = new ValidateEmail().validate(email);
    if (!validateEmail) throw new AppError('API_ERRORS.INVALID_EMAIL');
};
