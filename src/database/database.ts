import pool from "../app";

const initDB = async () => {
    try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(20) NOT NULL,
        email VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(20) NOT NULL,
        role VARCHAR(20),

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `)
        console.log("✅ Users table created or verified successfully!");
    } catch (error: any) {
        console.error("❌ Database initialization failed:");
        console.error(error.message);
    };
};
export default initDB;