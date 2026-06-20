import { Pool } from "pg"
import config from "../config/config";
export const pool = new Pool({
    connectionString: config.connection_string
});

const initDB = async () => {
    try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(20) NOT NULL,
        email VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(20) NOT NULL,
        role VARCHAR(20) DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `)
        console.log("Database Created Successfully");
    } catch (error: any) {
        console.error("❌ Database initialization failed:");
        console.error(error.message);
    };
};
export default initDB;