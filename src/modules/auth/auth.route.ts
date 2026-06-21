import { Router } from "express";
import { authControl } from "./auth.controller";

const router = Router();
router.post('/login', authControl.loginUser);

export const authRoute = router;