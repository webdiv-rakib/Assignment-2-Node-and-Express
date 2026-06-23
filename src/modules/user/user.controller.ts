import type { Request, Response } from "express";
import { userService } from "./user.service";

// const createUser = async (req: Request, res: Response) => {
//     try {
//         const result = await userService.createUserIntoDB(req.body);
//         res.status(201).json({
//             success: true,
//             message: "User registered successfully",
//             data: result.rows[0]
//         });
//     } catch (error: any) {
//         if (error.code === '23505') {
//             res.status(400).json({
//                 success: false,
//                 message: "User Already Exists",
//                 errors: "Email is already registered"
//             });
//             return;
//         };
//         res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             errors: error.message
//         });
//     };
// };

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await userService.getAllUsersFromDB();
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: result.rows
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: error.message
        });
    };
}

const getSingleUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await userService.getSingleUserFromDB(id as string);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "User not found",
                errors: `No user exists with id ${id}`
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: result.rows[0]
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: error.message
        });
    };
};

const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params
    // const { name, email, password, role } = req.body
    try {
        const result = await userService.updateUserIntoDB(req.body, id as string)
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "User not found",
                errors: `Cannot update. No user exists with id ${id}`
            });
            return;

        };
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: result.rows[0]
        });
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(400).json({
                success: false,
                message: "Email already in use",
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
}

const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await userService.deleteUserFromDB(id as string);
        if (result.rowCount === 0) {
            res.status(404).json({
                success: false,
                message: "User not found",
                errors: `Cannot delete. No user exists with id ${id}`
            });
            return; // Stop execution here!
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: error.message
        });
    }
}

export const userControl = {
    //createUser,
    getAllUsers,
    getSingleUser,
    updateUser,
    deleteUser
}