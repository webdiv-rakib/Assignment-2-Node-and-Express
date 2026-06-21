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

export const issueService = {
    createIssueIntoDB
}