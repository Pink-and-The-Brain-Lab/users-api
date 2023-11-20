import "reflect-metadata";
import { DataSource } from "typeorm";
import { CreateUsers1690416692582 } from "./database/migrations/1690416692582-CreateUsers";
import User from "./models/user.model";
import ValidationToken from "./models/validation-token.model";
import { CreateValidationToken1690497979962 } from "./database/migrations/1690497979962-CreateValidationToken";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "123456",
    database: "postgres",
    synchronize: true,
    logging: false,
    entities: [
        User,
        ValidationToken,
    ],
    migrations: [
        CreateUsers1690416692582,
        CreateValidationToken1690497979962,
    ],
    subscribers: [],
})
