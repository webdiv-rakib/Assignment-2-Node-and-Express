import { Router, type NextFunction, type Request, type Response } from "express";
import { userControl } from "./user.controller";
import auth from "../../middleware/auth";

const router = Router();


router.post('/', userControl.createUser);

router.get('/', auth(), userControl.getAllUsers);

router.get('/:id', userControl.getSingleUser);

router.put('/:id', userControl.updateUser);

router.delete('/:id', userControl.deleteUser)

export const userRoute = router;