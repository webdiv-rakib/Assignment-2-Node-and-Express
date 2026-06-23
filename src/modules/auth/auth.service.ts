import bcrypt from "bcryptjs";
import { pool } from "../../database/database";
import jwt from "jsonwebtoken"
import config from "../../config/config";
import type { IUser } from "../user/user.interface";

const signUpUserIntoDB = async (payload: IUser) => {
    const { name, email, password, role = 'contributor' } = payload;
    const hashPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(`
         INSERT INTO users(name,email,password,role) VALUES ($1,$2,$3,$4)   
         RETURNING  id,name,email,role,created_at,updated_at`, [name, email, hashPassword, role]);
    return result;
};

const loginUserIntoDB = async (payload: { email: string, password: string }) => {
    const { email, password } = payload;

    // 1. check if user exists.
    const userData = await pool.query(`
       SELECT * FROM users WHERE email=$1 
        `, [email]);
    if (userData.rows.length === 0) {
        throw new Error('Invalid Credential');
    };
    const user = userData.rows[0];
    // console.log(user)

    //  2. compare password.
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
        throw new Error('Invalid Credential');
    };

    // 3. generate token
    const jwtpayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
    const accessToken = jwt.sign(jwtpayload, config.secret as string, { expiresIn: config.expiresIn as any });
    const { password: _, ...userWithoutPassword } = user;
    return {
        token: accessToken,
        user: userWithoutPassword
    };
};
export const authService = {
    loginUserIntoDB,
    signUpUserIntoDB
};