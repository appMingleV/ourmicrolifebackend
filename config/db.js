import mysql from 'mysql'

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ourmicrolife'
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
