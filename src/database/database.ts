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
            `)
        console.log("Database Created Successfully");
    } catch (error: any) {
        console.error("Database initialization failed:");
        console.error(error.message);
    };
};
export default initDB;