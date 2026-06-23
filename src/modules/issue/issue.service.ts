import { pool } from "../../database/database";

const createIssueIntoDB = async (payload: any) => {
    const { title, description, type } = payload;
    const reporter_id = 1;
    const result = await pool.query(`
        INSERT INTO issues (title,description,type,reporter_id) VALUES($1,$2,$3,$4)    
        RETURNING *
            `, [title, description, type, reporter_id]);
    return result;
};

const getAllIssueFromDB = async () => {
    const result = await pool.query(`
           SELECT * FROM issues 
            `);
    return result;
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

const updateIssueIntoDB = async (payload: any, id: string) => {
    const { title, description, type } = payload;
    const result = await pool.query(`
            UPDATE issues SET
            title = COALESCE($1,title),
            description=COALESCE($2,description),
            type = COALESCE($3,type),
            updated_at = NOW()
            WHERE id=$4
            RETURNING *
            `, [title, description, type, id]);
    return result;
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