import AppError from "../errors/AppError";

const validateEmail = (email: string) => {
    const regexp = new RegExp('^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$');
    const isValidEmail = regexp.test(email);
    if (!isValidEmail) throw new AppError('Invalid email');
}

export default validateEmail;
