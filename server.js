import express from 'express';
import dotenv from 'dotenv';
import pool  from './config/db.js';
import route from './routes/index.js'
import cors from 'cors'
import {teamDistrubutionPayOut } from './service/refferralSystem/refferral.js'


dotenv.config();

const app=express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static('uploads'));
app.use('/api',route);
app.get('/testing',async (req,res)=>{
    try{
    await teamDistrubutionPayOut(670,500,100,"group","group purchase earing");
    return res.status(200).json({
        status:"success",
    })
    }catch(err){
        return  res.status(500).json({
            status:"failed",

        })
    }
})

app.listen(process.env.PORT,(err)=>{
    if(err) console.log(err);
    console.log('listening on port '+process.env.PORT);
})
