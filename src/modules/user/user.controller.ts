import type { Request, Response } from "express";
import { userService } from "./user.service";

const createUser = async (req: Request, res: Response) => {
    try {
        const result = await userService.createUserIntoDB(req.body);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows[0]
        });
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(400).json({
                success: false,
                message: "User Already Exists",
                errors: "Email is already registered"
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

export const userControl = {
    createUser
}