import { pool } from "../../database/database";
import type { IUser } from "../user/user.interface";
import type { IIssue, QueryIssue } from "./issue.interface";

const createIssueIntoDB = async (reporterId: number, payload: IIssue) => {
    const { title, description, type } = payload;
    const result = await pool.query(`
        INSERT INTO issues (reporter_id,title,description,type) VALUES($1,$2,$3,$4)    
        RETURNING *
            `, [reporterId, title, description, type]);
    return result.rows[0];
};

// const getAllIssueFromDB = async () => {
//     const result = await pool.query(`
//            SELECT * FROM issues 
//             `);
//     return result;
// };
const getAllIssueFromDB = async (query: QueryIssue) => {
    const { sort, type, status } = query;
    let queryStr = `SELECT * FROM issues`;
    const queryParams: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (type) {
        conditions.push(`type = $${paramIndex}`);
        queryParams.push(type);
        paramIndex++;
    };

    if (status) {
        conditions.push(`status = $${paramIndex}`);
        queryParams.push(status);
        paramIndex++;
    };

    if (conditions.length > 0) {
        queryStr += ` WHERE ` + conditions.join(' AND ');
    };

    if (sort === 'oldest') {
        queryStr += ` ORDER BY created_at ASC`;
    } else {
        queryStr += ` ORDER BY created_at DESC`;
    };

    const issuesResult = await pool.query(queryStr, queryParams);
    const issues = issuesResult.rows;
    if (issues.length === 0) {
        return [];
    }

    const reporterIds = [...new Set(issues.map(issue => issue.reporter_id))];

    const usersResult = await pool.query(`
        SELECT id, name, role FROM users WHERE id = ANY($1::int[])
    `, [reporterIds]);

    const reporters = usersResult.rows;
    return issues.map(issue => {
        // Find the reporter that matches this specific issue
        const reporter = reporters.find(r => r.id === issue.reporter_id);

        // Destructure to strictly control the JSON order
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

const getSingleIssueFromDB = async (id: string) => {
    const result = await pool.query(`
        SELECT * FROM issues WHERE id=$1    
            `, [id]);
    if (result.rows.length === 0) {
        return null;
    };
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

// const updateIssueIntoDB = async (payload: any, id: string) => {
//     const { title, description, type } = payload;
//     const result = await pool.query(`
//             UPDATE issues SET
//             title = COALESCE($1,title),
//             description=COALESCE($2,description),
//             type = COALESCE($3,type),
//             updated_at = NOW()
//             WHERE id=$4
//             RETURNING *
//             `, [title, description, type, id]);
//     return result;
// };
const updateIssueIntoDB = async (id: string, user: IUser, payload: IIssue) => {
    // 1. Fetch the issue to see who created it
    const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);

    if (issueResult.rows.length === 0) {
        throw new Error('Not Found');
    }

    const issue = issueResult.rows[0];

    // 2. RESOURCE-LEVEL AUTHORIZATION CHECK
    // If they are a contributor, they must own the issue to update it.
    if (user.role === 'contributor') {
        // Check 1: Do they own the issue?
        if (issue.reporter_id !== user.id) {
            throw new Error('Forbidden Ownership');
        }

        // Check 2: Is the issue still open?
        if (issue.status !== 'open') {
            throw new Error('Forbidden Status');
        }
    }

    // 3. Build the dynamic update query
    // This allows patching just the title, or just the status, etc.
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(payload)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
    }

    // If no valid fields were provided, just return the existing issue
    if (fields.length === 0) return issue;

    // Automatically update the updated_at timestamp
    fields.push(`updated_at = NOW()`);

    // Add the ID to the end of the values array for the WHERE clause
    values.push(id);

    const queryStr = `
        UPDATE issues 
        SET ${fields.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING *
    `;

    const updateResult = await pool.query(queryStr, values);
    return updateResult.rows[0];
};

const deleteIssueFromDB = async (id: string) => {
    const result = await pool.query(`
           DELETE FROM issues WHERE id=$1 
            `, [id]);
    return result;
};

export const issueService = {
    createIssueIntoDB,
    getAllIssueFromDB,
    getSingleIssueFromDB,
    updateIssueIntoDB,
    deleteIssueFromDB
}