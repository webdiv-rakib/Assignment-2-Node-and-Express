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

export const issueControl = {
    createIssue
}