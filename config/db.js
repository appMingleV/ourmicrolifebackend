import mysql from 'mysql'

const pool = mysql.createPool({
    host: 'srv1118.hstgr.io',
    user: 'u637715618_ourmicrolife',
    password: 'h+5JOJ7l6@UH',
    database: 'u637715618_ourmicrolife'
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database!');
    connection.release(); // Release the connection back to the pool
});
export default pool;
