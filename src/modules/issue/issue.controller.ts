import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const createIssue = async (req: Request, res: Response): Promise<void> => {
    // const body = req.body;
    // const { title, description, type } = body;
    // const reporter_id = 1;
    const reporter_id = req.user?.id;
    try {
        const result = await issueService.createIssueIntoDB(reporter_id, req.body);
        if (!reporter_id) {
            res.status(401).json({ success: false, message: "Unauthorized", errors: "User ID missing" });
            return;
        }
        res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: result
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: "Failed to create issue",
            errors: error.message
        });
    };
};

const getAllIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await issueService.getAllIssueFromDB(req.query);
        res.status(200).json({
            success: true,
            message: "Issues retrieved successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: error.message
        });
    };
};

const getSingleIssue = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const result = await issueService.getSingleIssueFromDB(id as string);
        if (!result) {
            res.status(404).json({
                success: false,
                message: "Issue not found",
                errors: `No issue exists with id ${id}`
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Issue retrieved successfully",
            // FIX 2: Just send 'result' directly instead of 'result.rows[0]'
            data: result
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: error.message
        });
    };
};

const updateIssue = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    // const { title, description, type } = req.body
    const user = req.user;
    try {
        const result = await issueService.updateIssueIntoDB(id as string, user, req.body);
        res.status(200).json({
            success: true,
            message: "Issue updated successfully",
            data: result
        });
    } catch (error: any) {
        if (error.message === 'Forbidden Ownership') {
            res.status(403).json({
                success: false,
                message: "Forbidden",
                errors: "You are only allowed to update issues that you created."
            });
            return;
        }

        // Handle if the ID doesn't exist at all
        if (error.message === 'Not Found') {
            res.status(404).json({
                success: false,
                message: "Not Found",
                errors: `No issue exists with id ${id}`
            });
            return;
        }

        // Standard server crash fallback
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: error.message
        });
    };
};

const deleteIssue = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await issueService.deleteIssueFromDB(id as string);
        if (result.rowCount === 0) {
            res.status(404).json({
                success: false,
                message: "Issue not found",
                errors: `No issue exists with id ${id}`
            });
            return;
        };
        res.status(200).json({
            success: true,
            message: "Issue deleted successfully"
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: error.message
        });
    };
};

export const issueControl = {
    createIssue,
    getAllIssue,
    getSingleIssue,
    updateIssue,
    deleteIssue
}