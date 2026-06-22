import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
import config from "../config/config";
import { pool } from "../database/database";
import type { ROLES } from "../types";
const auth = (...roles: ROLES[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('This is protected route')
            // 1.check if the token exists
            const token = req.headers.authorization;
            if (!token) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized Access!',
                    errors: 'No token provided'
                });
                return;
            }

            // 2.verify the token
            const decoded = jwt.verify(token as string, config.secret as string) as JwtPayload;
            // console.log(decoded);
            const userData = await pool.query(`
                SELECT * FROM users WHERE email =$1
                `, [decoded.email]);
            // console.log(userData);
            if (userData.rows.length === 0) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized Access!',
                    errors: 'The user belonging to this token no longer exists.'
                });
                return;
            }
            const user = userData.rows[0];
            // console.log(user.role)
            if (roles.length && !roles.includes(user.role)) {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden!, This role has no access',
                });
                return;
            }
            req.user = decoded;
            next();
        } catch (error: any) {
            res.status(401).json({
                success: false,
                message: "Unauthorized Access!",
                errors: "Invalid or expired token"
            });
        };
    };
};
export default auth;