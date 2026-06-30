import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendResponse } from "../../utility/sendResponse";

const signUp = async (req: Request, res: Response) => {
    try {
        const result = await authService.signUpUserIntoDB(req.body);
        sendResponse(res, {
            success: true,
            statusCode: 201,
            message: "User registered successfully",
            data: result.rows[0]
        });
    } catch (error: any) {
        if (error.code === '23505') {
            sendResponse(res, {
                success: false,
                statusCode: 400,
                message: "User Already Exists",
                error: "Email is already registered"
            });
            return;
        };
        sendResponse(res, {
            success: false,
            statusCode: 500,
            message: "Internal Sever Error",
            error: error.message
        });
    };
};

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
    signUp,
    loginUser
};