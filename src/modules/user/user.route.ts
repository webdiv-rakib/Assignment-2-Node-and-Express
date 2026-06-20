import { Router } from "express";
import { userControl } from "./user.controller";

const router = Router();

router.post('/', userControl.createUser);

router.get('/', userControl.getAllUsers);

router.get('/:id', userControl.getSingleUser);

export const userRoute = router;