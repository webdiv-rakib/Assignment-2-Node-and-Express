import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import type { AuthUser, UpdateIssuePayload } from "./issue.interface";
import { sendResponse, sendServerError } from "../../utility/sendResponse";

const createIssue = async (req: Request, res: Response): Promise<void> => {
    // const body = req.body;
    // const { title, description, type } = body;
    // const reporter_id = 1;
    const reporter_id = req.user?.id;
    try {
        const result = await issueService.createIssueIntoDB(reporter_id, req.body);
        if (!reporter_id) {
            sendResponse(res, {
                success: false,
                statusCode: 401,
                message: "Unauthorized",
                error: "User ID missing"
            });
            // res.status(401).json({ success: false, message: "Unauthorized", errors: "User ID missing" });
            return;
        }
        sendResponse(res, {
            success: true,
            statusCode: 201,
            message: "Issue Created Successfully",
            data: result
        });
    } catch (error: any) {
        sendResponse(res, {
            success: false,
            statusCode: 400,
            message: "Failed to create issue",
            error: error.message
        });
    };
};

const getAllIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await issueService.getAllIssueFromDB(req.query);
        sendResponse(res, {
            success: true,
            statusCode: 200,
            message: "Issues Retrieved Successfully",
            data: result
        });
    } catch (error: any) {
        sendServerError(res, error);
    };
};

const getSingleIssue = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const result = await issueService.getSingleIssueFromDB(id as string);
        if (!result) {
            sendResponse(res, {
                success: false,
                statusCode: 404,
                message: "Issue not found",
                error: `No issue exists with ID: ${id}`
            });
            return;
        };
        sendResponse(res, {
            success: true,
            statusCode: 200,
            message: "Issue retrieved successfully",
            data: result
        });
    } catch (error: any) {
        sendServerError(res, error)
    };
};

const updateIssue = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    // const { title, description, type } = req.body
    const user = req.user as AuthUser;
    const payload = req.body as UpdateIssuePayload
    try {
        const result = await issueService.updateIssueIntoDB(id as string, user, payload);
        sendResponse(res, {
            success: true,
            statusCode: 200,
            message: "Issue updated successfully",
            data: result
        });
    } catch (error: any) {
        if (error.message === 'Forbidden Ownership') {
            sendResponse(res, {
                success: false,
                statusCode: 403,
                message: "Forbidden",
                error: "You are only allowed to update issues that you created."
            });
            return;
        }
        if (error.message === 'Not Found') {
            sendResponse(res, {
                success: false,
                statusCode: 404,
                message: "Not Found",
                error: `No issue exists with ID: ${id}`
            });
            return;
        };
        sendServerError(res, error)
    };
};

const deleteIssue = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await issueService.deleteIssueFromDB(id as string);
        if (result.rowCount === 0) {
            sendResponse(res, {
                success: false,
                statusCode: 404,
                message: "Issue not found",
                error: `No issue exists with ID: ${id}`
            });
            return;
        };
        sendResponse(res, {
            success: true,
            statusCode: 200,
            message: "Issue Deleted Successfully"
        });
    } catch (error: any) {
        sendServerError(res, error)
    };
};

export const issueControl = {
    createIssue,
    getAllIssue,
    getSingleIssue,
    updateIssue,
    deleteIssue
}