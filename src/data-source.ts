import "reflect-metadata";
import { DataSource } from "typeorm";
import { CreateUsers1690416692582 } from "./database/migrations/1690416692582-CreateUsers";
import User from "./models/user.model";
import 'dotenv/config';
import { config } from "dotenv";

if (process.env.NODE_ENV === 'test') {
    config({ path: './.env.test' });
} else {
    config();
}

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT as string, 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: "postgres",
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
