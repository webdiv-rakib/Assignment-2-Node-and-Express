import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendResponse, sendServerError } from "../../utility/sendResponse";

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
        sendServerError(res, error)
    };
};

const loginUser = async (req: Request, res: Response) => {
    try {
        const result = await authService.loginUserIntoDB(req.body);
        sendResponse(res, {
            success: true,
            statusCode: 200,
            message: "Login Successfull",
            data: result
        });
    } catch (error: any) {
        if (error.message === 'Invalid Credential') {
            sendResponse(res, {
                success: false,
                statusCode: 401,
                message: "Invalid Credentials",
                error: error.message
            });
            return;
        };
        sendServerError(res, error)
    };
};
export const authControl = {
    signUp,
    loginUser
};