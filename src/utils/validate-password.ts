import AppError from "../errors/AppError";

const validatePassword = (password: string, confirmPassword: string) => {
    if (!password?.length || !confirmPassword?.length) return;
    if (password !== confirmPassword) throw new AppError('Password and password confirmation need to be equals.');
    const lengthPasswordMustBe = 8;
    const hasNumber = new RegExp(/\d/g).test(password);
    const hasLetter = new RegExp(/\D/g).test(password);
    const isLenghtEnougth = password.length >= lengthPasswordMustBe;
    if (!hasNumber || !hasLetter || !isLenghtEnougth) throw new AppError('Invalid password format');
}

export default validatePassword;
