import type { NextFunction, Request, Response } from "express";
import fs from "fs";
const logger = (req: Request, res: Response, next: NextFunction) => {
    const currentTime = new Date().toLocaleString();
    const log = `[${currentTime}] Method: ${req.method} | URL: ${req.url}\n`;

    fs.appendFile('logger.txt', log, (error) => {
        if (error) {
            console.error("Failed to write to logger.txt:", error.message);
        }
    });
    next();
};
export default logger;