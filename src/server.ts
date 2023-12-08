import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import AppError from './errors/AppError';
import routes from "./routes";
import './database';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());
app.use(routes);
app.use(clientErrorHandle);

app.listen(3000, () => console.log('users API started on port 3000!'));

function clientErrorHandle(error: Error, request: Request, response: Response, next: NextFunction) {
    if (error instanceof AppError) {
        return response.status(error.statusCode).json({
            staus: 'Error',
            message: error.message
        });
    }

    console.log(error)
    return response.status(500).json({
        status: 'Error',
        message: error.message || 'API_ERRORS.INTERNAL_SERVER_ERROR'
    });
}
