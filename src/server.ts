import express, { type Application, type Request, type Response } from "express"
import config from "./config/config";
import initDB from "./database/database";
import pool from "./app";

const app: Application = express()
const port = config.port

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

initDB();

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        sever: "Assignment Server Running",
        message: "Assignment-2",
        author: "webdiv-rakib"
    });
});

app.post('/', async (req: Request, res: Response) => {
    const body = req.body
    const { name, email, password, role = 'contributor' } = body
    try {
        const result = await pool.query(`
         INSERT INTO users(name,email,password,role) VALUES ($1,$2,$3,$4)   
         RETURNING  id,name,email,role,created_at,updated_at`, [name, email, password, role])

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows[0]
        });
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(400).json({
                success: false,
                message: "User Already Exists",
                errors: "Email is already registered"
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: error.message
        });
    }
})

app.listen(port, () => {
    console.log(`The Server is running on: ${port}`)
})