import type { Request, Response } from "express";
import { authService } from "./auth.service";

const loginUser = async (req: Request, res: Response) => {
    try {
        const result = await authService.loginUserIntoDB(req.body);
        res.status(200).json({
            success: true,
            message: "Login Successfull",
            data: result
        });
    } catch (error: any) {
        if (error.message === 'Invalid Credential') {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
                errors: error.message
            });
            return;
        };
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: error.message
        });
    };
};
export const authControl = {
    loginUser
};