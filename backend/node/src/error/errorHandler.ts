import { Request, Response, NextFunction } from 'express';
import customError from './customError';
import { ErrorRequestHandler } from 'express';

const errorHandler : ErrorRequestHandler = async (err: customError, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        // Nếu headers đã được gửi, chuyển lỗi tới middleware mặc định của Express
        return next(err);
    }
    if (err.statusCode || err.message) {
        const { statusCode, message } = err;
        res.status(statusCode || 400).json({ message: message || 'Bad request' });
    } else {
        res.status(500).send({ message: 'Internal server error' });
    }
};

export default errorHandler;


