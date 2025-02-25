import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'
import { env } from '../config'

export async function setupTriggers() {
    const pool = new Pool({
        connectionString: env.DATABASE_URL,
    })

    try {
        console.log('Setting up database triggers...')

        const sqlPath = path.join(__dirname, 'triggers.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')

        await pool.query(sql)

        console.log('Triggers setup complete!')
    } catch (error) {
        console.error('Error setting up triggers:', error)
        throw error
    } finally {
        await pool.end()
    }
}