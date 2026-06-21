import { Router } from "express";
import { issueControl } from "./issue.controller";

const router = Router();
router.post('/', issueControl.createIssue);

router.get('/', issueControl.getAllIssue);

router.get('/:id', issueControl.getSingleIssue);

router.patch('/:id', issueControl.updateIssue);

router.delete('/:id', issueControl.deleteIssue);

export const issueRoute = router;