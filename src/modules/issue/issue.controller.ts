import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const createIssue = async (req: Request, res: Response) => {
    // const body = req.body;
    // const { title, description, type } = body;
    // const reporter_id = 1;
    try {
        const result = await issueService.createIssueIntoDB(req.body);
        res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: result.rows[0]
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: "Failed to create issue",
            errors: error.message
        });
    };
};

const getAllIssue = async (req: Request, res: Response) => {
    try {
        const result = await issueService.getAllIssueFromDB();
        if (result.rows.length === 0) {
            res.status(200).json({
                success: true,
                message: "Issues retrieved successfully",
                data: []
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Issues retrieved successfully",
            data: result.rows
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: error.message
        });
    };
};

const getSingleIssue = async (req: Request, res: Response):Promise<void> => {
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

const updateIssue = async (req: Request, res: Response) => {
    const { id } = req.params;
    // const { title, description, type } = req.body
    try {
        const result = await issueService.updateIssueIntoDB(req.body, id as string);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Issue not found",
                errors: `No issue exists with id ${id}`
            });
            return;
        };
        res.status(200).json({
            success: true,
            message: "Issue updated successfully",
            data: result.rows[0]
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: "Failed to update issue",
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