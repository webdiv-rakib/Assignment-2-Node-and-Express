import { Router } from "express";
import { issueControl } from "./issue.controller";

const router = Router();
router.post('/', issueControl.createIssue);
export const issueRoute = router;