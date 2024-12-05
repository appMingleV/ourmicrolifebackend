import express from 'express';
import dotenv from 'dotenv';
import pool  from './config/db.js';
import route from './routes/index.js'


dotenv.config();

const app=express();

app.use('/api',route);


app.listen(process.env.PORT,(err)=>{
    if(err) console.log(err);
    console.log('listening on port '+process.env.PORT);
})