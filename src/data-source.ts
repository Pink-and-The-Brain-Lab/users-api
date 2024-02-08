import "reflect-metadata";
import { DataSource } from "typeorm";
import { CreateUsers1690416692582 } from "./database/migrations/1690416692582-CreateUsers";
import User from "./models/user.model";
import 'dotenv/config';

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: "millez-users",
    synchronize: false,
    logging: false,
    entities: [
        User,
    ],
    migrations: [
        CreateUsers1690416692582,
    ],
    subscribers: [],
})
