const express = require('express')
const cors = require('cors')
const formidable = require('formidable')
const fs = require('fs')
const path = require('path')
const mariadb = require('mariadb')
require('dotenv').config({path:['.env.local']})
//require('@dotenvx/dotenvx').config({path: ['.env.local']})
//const getConnection = require('./db')

//main setup
const app = express()
//cors setup
app.use(cors())

//create a pool of connections
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    supportBigNumbers: true,
    bigNumberStrings: true
})

async function getservicesdata(){
    return new Promise(async (resol,rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            var result = await conn.query('SELECT * FROM services')
            resol(result)
        } catch (err) {
            rejec(err)
        } finally {
            if(conn) conn.release()
        }
    })
}

async function makeappointment(fields = null, files=null) {
    return new Promise(async (resol, rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            await conn.beginTransaction() //starts transaction
            //insert into patients table and get patient id
            var {insertId: patientId} = await conn.query(
                'INSERT INTO patients(firstname, lastname, dob, phonenumber) VALUES (?,?,?,?)',
                [fields.firstname, fields.lastname, fields.dob, fields.mobileno])
            //todo insert into visits and visit_service_lines
            await conn.commit() //final commit
            resol()
        } catch (err) {
            conn.rollback()
            rejec(err)
        } finally{
            if(conn) conn.release()
        }
    })
}

//TODO get : services lists and link with patient registration form
//Use react query for get response
app.get('/getservicesdata',(req,res,next)=>{
    getservicesdata().then((result)=>{
        res.status(200).send(result).end()
    }).catch((err)=>{
        res.status(505).end(err.message)
    })
})

app.post('/makeappointment',(req,res,next)=>{
    const form = new formidable.IncomingForm()
    form.parse(req,(err,fields,files)=>{
        if(err){
            next(err)
            return
        }
        makeappointment(fields, files).then(()=>{
            res.sendStatus(200)
            res.end()
        }).catch((err)=>{
            res.sendStatus(505)
            res.end()
        })
    })
})
//trigerring a listen
app.listen(8080,()=>{
    console.log('Server is listening at 8080...')
})
