import { Router } from "express";
import { userControl } from "./user.controller";

const router = Router();

router.post('/', userControl.createUser);

router.get('/', userControl.getAllUsers);

export const userRoute = router;