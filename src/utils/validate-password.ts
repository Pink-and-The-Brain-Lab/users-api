import AppError from "../errors/AppError";

const validatePassword = (password: string, confirmPassword: string) => {
    if (!password?.length || !confirmPassword?.length) return;
    if (password !== confirmPassword) throw new AppError('API_ERRORS.PASSWORD_AND_PASSWORD_CONFIRMATION_NEED_TO_BE_EQUALS');
    const lengthPasswordMustBe = 8;
    const hasNumber = new RegExp(/\d/g).test(password);
    const hasLetter = new RegExp(/\D/g).test(password);
    const isLenghtEnougth = password.length >= lengthPasswordMustBe;
    if (!hasNumber || !hasLetter || !isLenghtEnougth) throw new AppError('API_ERRORS.INVALID_PASSWORD_FORMAT');
}

export default validatePassword;
