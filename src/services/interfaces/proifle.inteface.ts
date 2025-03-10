export interface IProfile {
    id: string;
    userId?: string;
    email?: string;
    color?: string;
    image?: string;
    chosenName?: string;
    profileName?: string;
    profileVisibility?: string;
    profileTheme?: string;
    logoutTime?: string;
    dateFormat?: string;
    phoneNumber?: string;
    validated?: boolean;
    language?: string;
    createdat?: number;
    status?: string;
    message?: string;
    statusCode?: number;
}
