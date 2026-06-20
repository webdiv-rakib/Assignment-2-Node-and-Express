import { Router } from "express";
import { userControl } from "./user.controller";

const router = Router();

router.post('/', userControl.createUser)

export const userRoute = router;