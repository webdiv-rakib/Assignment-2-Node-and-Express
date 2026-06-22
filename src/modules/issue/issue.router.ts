import { Router } from "express";
import { issueControl } from "./issue.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const router = Router();
router.post('/', auth(USER_ROLE.contributor), issueControl.createIssue);

router.get('/', issueControl.getAllIssue);

router.get('/:id', issueControl.getSingleIssue);

router.patch('/:id', auth(USER_ROLE.maintainer), issueControl.updateIssue);

router.delete('/:id', auth(USER_ROLE.maintainer), issueControl.deleteIssue);

export const issueRoute = router;