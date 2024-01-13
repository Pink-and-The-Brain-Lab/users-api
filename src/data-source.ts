import "reflect-metadata";
import { DataSource } from "typeorm";
import { CreateUsers1690416692582 } from "./database/migrations/1690416692582-CreateUsers";
import User from "./models/user.model";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "123456",
    database: "millez-users",
    synchronize: true,
    logging: false,
    entities: [
        User,
    ],
    migrations: [
        CreateUsers1690416692582,
    ],
    subscribers: [],
})
