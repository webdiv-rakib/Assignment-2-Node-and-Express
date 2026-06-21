import express, { type Application, type Request, type Response } from "express"
import initDB, { pool } from "./database/database";
import { userRoute } from "./modules/user/user.route";

const app: Application = express();
// middleware
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoute);

initDB();

// =======User Table IN Database==========

// get all users using GET method
// app.get('/api/users', async (req: Request, res: Response) => {
//     try {
//         const result = await pool.query(`
//            SELECT id,name,email,role,created_at,updated_at FROM users
//             `);
//         res.status(200).json({
//             success: true,
//             message: "Users retrieved successfully",
//             data: result.rows
//         });
//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             errors: error.message
//         });
//     };
// });

// get single user using GET method
// app.get('/api/users/:id', async (req: Request, res: Response) => {
//     const { id } = req.params
//     try {
//         const result = await pool.query(`
//            SELECT id,name,email,role,created_at,updated_at FROM users WHERE id=$1 
//             `, [id]);
//         if (result.rows.length === 0) {
//             res.status(404).json({
//                 success: false,
//                 message: "User not found",
//                 errors: `No user exists with id ${id}`
//             });
//             return;
//         }
//         res.status(200).json({
//             success: true,
//             message: "User retrieved successfully",
//             data: result.rows[0]
//         });
//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             errors: error.message
//         });
//     };
// });

// update single user using PUT method
// app.put('/api/users/:id', async (req: Request, res: Response) => {
//     const { id } = req.params
//     const { name, email, passowrd, role } = req.body
//     try {
//         const result = await pool.query(`
//            UPDATE users SET
//            name=COALESCE($1,name),
//            email=COALESCE($2,email),
//            password=COALESCE($3,password),
//            role=COALESCE($4,role),
//            updated_at = NOW()
//            WHERE id=$5 
//            RETURNING *
//             `, [name, email, passowrd, role, id]);
//         if (result.rows.length === 0) {
//             res.status(404).json({
//                 success: false,
//                 message: "User not found",
//                 errors: `Cannot update. No user exists with id ${id}`
//             });
//             return;

//         };
//         res.status(200).json({
//             success: true,
//             message: "User updated successfully",
//             data: result.rows[0]
//         });
//     } catch (error: any) {
//         if (error.code === '23505') {
//             res.status(400).json({
//                 success: false,
//                 message: "Email already in use",
//                 errors: error.message
//             });
//             return;
//         };
//         res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             errors: error.message
//         });
//     };
// });

// delete single user using
// app.delete('/api/users/:id', async (req: Request, res: Response) => {
//     const { id } = req.params;
//     try {
//         const result = await pool.query(`
//             DELETE FROM users WHERE id=$1
//             `, [id]);
//         if (result.rowCount === 0) {
//             res.status(404).json({
//                 success: false,
//                 message: "User not found",
//                 errors: `Cannot delete. No user exists with id ${id}`
//             });
//             return; // Stop execution here!
//         }
//         res.status(200).json({
//             success: true,
//             message: "User deleted successfully"
//         });
//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             errors: error.message
//         });
//     }
// })

// create single user using POST method
// app.post('/api/users', async (req: Request, res: Response) => {
//     const body = req.body
//     const { name, email, password, role = 'contributor' } = body
//     try {
//         const result = await pool.query(`
//          INSERT INTO users(name,email,password,role) VALUES ($1,$2,$3,$4)   
//          RETURNING  id,name,email,role,created_at,updated_at`, [name, email, password, role])

//         res.status(201).json({
//             success: true,
//             message: "User registered successfully",
//             data: result.rows[0]
//         });
//     } catch (error: any) {
//         if (error.code === '23505') {
//             res.status(400).json({
//                 success: false,
//                 message: "User Already Exists",
//                 errors: "Email is already registered"
//             });
//             return;
//         };
//         res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             errors: error.message
//         });
//     };
// })

// ==========Issues Table IN Database==========
// create issues using POST method
app.post('/api/issues', async (req: Request, res: Response) => {
    const body = req.body
    const { title, description, type } = body;
    const reporter_id = 1
    try {
        const result = await pool.query(`
        INSERT INTO issues (title,description,type,reporter_id) VALUES($1,$2,$3,$4)    
        RETURNING *
            `, [title, description, type, reporter_id]);
        res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: result.rows[0]
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: "Failed to create issue",
            errors: error.message
        });
    }
});

// get all issues using GET method
app.get('/api/issues', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
           SELECT * FROM issues 
            `);
        if (result.rows.length === 0) {
            res.status(200).json({
                success: true,
                message: "Issues retrieved successfully",
                data: []
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Issues retrieved successfully",
            data: result.rows
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: error.message
        });
    }
});

// get single issue using GET method
app.get('/api/issues/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
        SELECT * FROM issues WHERE id=$1    
            `, [id]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Issue not found",
                errors: `No issue exists with id ${id}`
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Issue retrieved successfully",
            data: result.rows[0]
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: error.message
        });
    }
});

// update issue using PUT method
app.patch('/api/issues/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, type } = req.body
    try {
        const result = await pool.query(`
            UPDATE issues SET
            title = COALESCE($1,title),
            description=COALESCE($2,description),
            type = COALESCE($3,type),
            updated_at = NOW()
            WHERE id=$4
            RETURNING *
            `, [title, description, type, id]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Issue not found",
                errors: `No issue exists with id ${id}`
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Issue updated successfully",
            data: result.rows[0]
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: "Failed to update issue",
            errors: error.message
        });
    }
})

// get main server
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        sever: "Assignment Server Running",
        message: "Assignment-2",
        author: "webdiv-rakib"
    });
});

export default app;