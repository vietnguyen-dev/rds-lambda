import dotenv from 'dotenv'
import { Client } from 'pg'
import fs from 'fs'

dotenv.config();

const sslConfig = {
    ca: fs.readFileSync(process.env.AWS_RDS_SSL_CERT_PATH!),
  };

const client = new Client({
    user: process.env.AWS_RDS_USERNAME,
    host: process.env.AWS_RDS_HOST,
    database: process.env.AWS_RDS_DATABASE,
    password: process.env.AWS_RDS_PASSWORD,
    port: parseInt(process.env.AWS_RDS_PORT!),
    ssl: sslConfig,
});

async function connect() {
    try {
        await client.connect();
        const query = 'SELECT * FROM cats;';
        const result = await client.query(query);
        console.log(result.rows)
    } catch (error) {
        console.log(error)
    } finally {
        client.end();
    }
}

connect()
