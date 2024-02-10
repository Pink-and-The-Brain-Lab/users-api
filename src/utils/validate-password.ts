import { AppError, ValidatePassword } from "millez-lib-api";

export const validatePassword = (password: string, confirmPassword: string) => {
    const validatePassword = new ValidatePassword(8).validate(password, confirmPassword);
    if (validatePassword.length) throw new AppError(validatePassword);
};
