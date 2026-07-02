
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  

// src/app.ts
import express from "express";

// src/database/database.ts
import { Pool } from "pg";

// src/config/config.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  secret: process.env.SECRET,
  expiresIn: process.env.EXPIRES_IN
};
var config_default = config;

// src/database/database.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
        `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            reporter_id INT NOT NULL,
            title VARCHAR(150) NOT NULL,
            description TEXT NOT NULL CHECK (LENGTH(TRIM(description)) >= 20),
            type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')) ,
            status VARCHAR(20) DEFAULT 'open' CHECK(status IN('open','in_progress','resolved')),

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )   
            `);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("Database initialization failed:");
    console.error(error.message);
  }
  ;
};
var database_default = initDB;

// src/modules/user/user.route.ts
import { Router } from "express";

// src/modules/user/user.service.ts
var getAllUsersFromDB = async () => {
  const result = await pool.query(`
           SELECT id,name,email,role,created_at,updated_at FROM users
            `);
  return result;
};
var getSingleUserFromDB = async (id) => {
  const result = await pool.query(`
           SELECT id,name,email,role,created_at,updated_at FROM users WHERE id=$1 
            `, [id]);
  return result;
};
var updateUserIntoDB = async (payload, id) => {
  const { name, email, password, role } = payload;
  const result = await pool.query(`
           UPDATE users SET
           name=COALESCE($1,name),
           email=COALESCE($2,email),
           password=COALESCE($3,password),
           role=COALESCE($4,role),
           updated_at = NOW()
           WHERE id=$5 
           RETURNING *
            `, [name, email, password, role, id]);
  return result;
};
var deleteUserFromDB = async (id) => {
  const result = await pool.query(`
            DELETE FROM users WHERE id=$1
            `, [id]);
  return result;
};
var userService = {
  //createUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserIntoDB,
  deleteUserFromDB
};

// src/modules/user/user.controller.ts
var getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsersFromDB();
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: error.message
    });
  }
  ;
};
var getSingleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.getSingleUserFromDB(id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
        errors: `No user exists with id ${id}`
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: error.message
    });
  }
  ;
};
var updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.updateUserIntoDB(req.body, id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
        errors: `Cannot update. No user exists with id ${id}`
      });
      return;
    }
    ;
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      res.status(400).json({
        success: false,
        message: "Email already in use",
        errors: error.message
      });
      return;
    }
    ;
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: error.message
    });
  }
  ;
};
var deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.deleteUserFromDB(id);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
        errors: `Cannot delete. No user exists with id ${id}`
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: error.message
    });
  }
};
var userControl = {
  //createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser
};

// src/modules/user/user.route.ts
var router = Router();
router.get("/", userControl.getAllUsers);
router.get("/:id", userControl.getSingleUser);
router.put("/:id", userControl.updateUser);
router.delete("/:id", userControl.deleteUser);
var userRoute = router;

// src/modules/issue/issue.router.ts
import { Router as Router2 } from "express";

// src/modules/issue/issue.service.ts
var createIssueIntoDB = async (reporterId, payload) => {
  const { title, description, type } = payload;
  const result = await pool.query(`
        INSERT INTO issues (reporter_id,title,description,type) VALUES($1,$2,$3,$4)    
        RETURNING *
            `, [reporterId, title, description, type]);
  return result.rows[0];
};
var getAllIssueFromDB = async (query) => {
  const { sort, type, status } = query;
  let queryStr = `SELECT * FROM issues`;
  const queryParams = [];
  const conditions = [];
  let paramIndex = 1;
  if (type) {
    conditions.push(`type = $${paramIndex}`);
    queryParams.push(type);
    paramIndex++;
  }
  ;
  if (status) {
    conditions.push(`status = $${paramIndex}`);
    queryParams.push(status);
    paramIndex++;
  }
  ;
  if (conditions.length > 0) {
    queryStr += ` WHERE ` + conditions.join(" AND ");
  }
  ;
  if (sort === "oldest") {
    queryStr += ` ORDER BY created_at ASC`;
  } else {
    queryStr += ` ORDER BY created_at DESC`;
  }
  ;
  const issuesResult = await pool.query(queryStr, queryParams);
  const issues = issuesResult.rows;
  if (issues.length === 0) {
    return [];
  }
  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];
  const usersResult = await pool.query(`
        SELECT id, name, role FROM users WHERE id = ANY($1::int[])
    `, [reporterIds]);
  const reporters = usersResult.rows;
  return issues.map((issue) => {
    const reporter = reporters.find((r) => r.id === issue.reporter_id);
    const { reporter_id, created_at, updated_at, ...issueData } = issue;
    return {
      ...issueData,
      reporter: reporter ? {
        id: reporter.id,
        name: reporter.name,
        role: reporter.role
      } : null,
      created_at,
      updated_at
    };
  });
};
var getSingleIssueFromDB = async (id) => {
  const result = await pool.query(`
        SELECT * FROM issues WHERE id=$1    
            `, [id]);
  if (result.rows.length === 0) {
    return null;
  }
  ;
  const issue = result.rows[0];
  const userResult = await pool.query(`
       SELECT id,name,role FROM users WHERE id = $1 
        `, [issue.reporter_id]);
  const reporter = userResult.rows[0];
  const { reporter_id, created_at, updated_at, ...issueData } = issue;
  return {
    ...issueData,
    reporter: reporter ? {
      id: reporter.id,
      name: reporter.name,
      role: reporter.role
    } : null,
    created_at,
    updated_at
  };
};
var updateIssueIntoDB = async (id, user, payload) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
  if (issueResult.rows.length === 0) {
    throw new Error("Not Found");
  }
  const issue = issueResult.rows[0];
  if (user.role === "contributor") {
    if (issue.reporter_id !== user.id) {
      throw new Error("Forbidden Ownership");
    }
    if (issue.status !== "open") {
      throw new Error("Forbidden Status");
    }
  }
  const fields = [];
  const values = [];
  let paramIndex = 1;
  for (const [key, value] of Object.entries(payload)) {
    fields.push(`${key} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }
  if (fields.length === 0) return issue;
  fields.push(`updated_at = NOW()`);
  values.push(id);
  const queryStr = `
        UPDATE issues 
        SET ${fields.join(", ")} 
        WHERE id = $${paramIndex} 
        RETURNING *
    `;
  const updateResult = await pool.query(queryStr, values);
  return updateResult.rows[0];
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(`
           DELETE FROM issues WHERE id=$1 
            `, [id]);
  return result;
};
var issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendServerError = (res, error) => {
  const err = error;
  sendResponse(res, {
    success: false,
    statusCode: 500,
    message: "Internal Server Error",
    error: err.message
  });
};

// src/modules/issue/issue.controller.ts
var createIssue = async (req, res) => {
  const reporter_id = req.user?.id;
  try {
    const result = await issueService.createIssueIntoDB(reporter_id, req.body);
    if (!reporter_id) {
      sendResponse(res, {
        success: false,
        statusCode: 401,
        message: "Unauthorized",
        error: "User ID missing"
      });
      return;
    }
    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Issue Created Successfully",
      data: result
    });
  } catch (error) {
    sendResponse(res, {
      success: false,
      statusCode: 400,
      message: "Failed to create issue",
      error: error.message
    });
  }
  ;
};
var getAllIssue = async (req, res) => {
  try {
    const result = await issueService.getAllIssueFromDB(req.query);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Issues Retrieved Successfully",
      data: result
    });
  } catch (error) {
    sendServerError(res, error);
  }
  ;
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDB(id);
    if (!result) {
      sendResponse(res, {
        success: false,
        statusCode: 404,
        message: "Issue not found",
        error: `No issue exists with ID: ${id}`
      });
      return;
    }
    ;
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Issue retrieved successfully",
      data: result
    });
  } catch (error) {
    sendServerError(res, error);
  }
  ;
};
var updateIssue = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const payload = req.body;
  try {
    const result = await issueService.updateIssueIntoDB(id, user, payload);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    if (error.message === "Forbidden Ownership") {
      sendResponse(res, {
        success: false,
        statusCode: 403,
        message: "Forbidden",
        error: "You are only allowed to update issues that you created."
      });
      return;
    }
    if (error.message === "Not Found") {
      sendResponse(res, {
        success: false,
        statusCode: 404,
        message: "Not Found",
        error: `No issue exists with ID: ${id}`
      });
      return;
    }
    ;
    sendServerError(res, error);
  }
  ;
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueFromDB(id);
    if (result.rowCount === 0) {
      sendResponse(res, {
        success: false,
        statusCode: 404,
        message: "Issue not found",
        error: `No issue exists with ID: ${id}`
      });
      return;
    }
    ;
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Issue Deleted Successfully"
    });
  } catch (error) {
    sendServerError(res, error);
  }
  ;
};
var issueControl = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middleware/auth.ts
import jwt from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized Access!",
          errors: "No token provided"
        });
        return;
      }
      const decoded = jwt.verify(token, config_default.secret);
      const userData = await pool.query(`
                SELECT * FROM users WHERE email =$1
                `, [decoded.email]);
      if (userData.rows.length === 0) {
        res.status(401).json({
          success: false,
          message: "Unauthorized Access!",
          errors: "The user belonging to this token no longer exists."
        });
        return;
      }
      const user = userData.rows[0];
      if (roles.length && !roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden!, This role has no access"
        });
        return;
      }
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access!",
        errors: "Invalid or expired token"
      });
    }
    ;
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/modules/issue/issue.router.ts
var router2 = Router2();
router2.post("/", auth_default(USER_ROLE.contributor, USER_ROLE.maintainer), issueControl.createIssue);
router2.get("/", issueControl.getAllIssue);
router2.get("/:id", issueControl.getSingleIssue);
router2.patch("/:id", auth_default(USER_ROLE.maintainer, USER_ROLE.contributor), issueControl.updateIssue);
router2.delete("/:id", auth_default(USER_ROLE.maintainer), issueControl.deleteIssue);
var issueRoute = router2;

// src/modules/auth/auth.route.ts
import { Router as Router3 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt2 from "jsonwebtoken";
var signUpUserIntoDB = async (payload) => {
  const { name, email, password, role = "contributor" } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(`
         INSERT INTO users(name,email,password,role) VALUES ($1,$2,$3,$4)   
         RETURNING  id,name,email,role,created_at,updated_at`, [name, email, hashPassword, role]);
  return result;
};
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(`
       SELECT * FROM users WHERE email=$1 
        `, [email]);
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credential");
  }
  ;
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credential");
  }
  ;
  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwt2.sign(jwtpayload, config_default.secret, { expiresIn: config_default.expiresIn });
  const { password: _, ...userWithoutPassword } = user;
  return {
    token: accessToken,
    user: userWithoutPassword
  };
};
var authService = {
  loginUserIntoDB,
  signUpUserIntoDB
};

// src/modules/auth/auth.controller.ts
var signUp = async (req, res) => {
  try {
    const result = await authService.signUpUserIntoDB(req.body);
    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      sendResponse(res, {
        success: false,
        statusCode: 400,
        message: "User Already Exists",
        error: "Email is already registered"
      });
      return;
    }
    ;
    sendServerError(res, error);
  }
  ;
};
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Login Successfull",
      data: result
    });
  } catch (error) {
    if (error.message === "Invalid Credential") {
      sendResponse(res, {
        success: false,
        statusCode: 401,
        message: "Invalid Credentials",
        error: error.message
      });
      return;
    }
    ;
    sendServerError(res, error);
  }
  ;
};
var authControl = {
  signUp,
  loginUser
};

// src/modules/auth/auth.route.ts
var router3 = Router3();
router3.post("/signup", authControl.signUp);
router3.post("/login", authControl.loginUser);
var authRoute = router3;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  const currentTime = (/* @__PURE__ */ new Date()).toLocaleString();
  const log = `[${currentTime}] Method: ${req.method} | URL: ${req.url}
`;
  fs.appendFile("logger.txt", log, (error) => {
    if (error) {
      console.error("Failed to write to logger.txt:", error.message);
    }
  });
  next();
};
var logger_default = logger;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger_default);
app.use("/api/users", userRoute);
app.use("/api/issues", issueRoute);
app.use("/api/auth", authRoute);
database_default();
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    sever: "Assignment Server Running",
    message: "Assignment-2",
    author: "webdiv-rakib"
  });
});
var app_default = app;

// src/server.ts
var main = () => {
  app_default.listen(config_default.port, () => {
    console.log(`The Server is running on: ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map