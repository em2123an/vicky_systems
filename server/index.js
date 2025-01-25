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

//get list of services
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

//select and make quiries to get all the appointment
async function getappointments(){
    return new Promise(async (resol,rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            var result = await conn.query(
                `SELECT p.firstname, p.lastname, p.dob, p.phonenumber, p.sex,
                    v.scheduledatetime_start, v.scheduledatetime_end, v.visitid,
                    JSON_ARRAYAGG(s.serviceid) as serviceids, JSON_ARRAYAGG(s.servicename) as servicenames   
                FROM patients AS p INNER JOIN visits AS v ON p.patientid = v.patientid
                INNER JOIN visit_service_line AS vsl ON v.visitid = vsl.visitid
                INNER JOIN services as s ON vsl.serviceid = s.serviceid
                GROUP BY v.visitid
                ` 
            )
            //console.log(result)
            resol(result)
        } catch (err) {
            console.log(err.message)
            rejec(err)
        } finally {
            if(conn) conn.release()
        }
    })
}

//select and make quiries to get specific appointment by visitid
async function getapptdetails(visitid){
    return new Promise(async (resol,rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            var result = await conn.query(
                `SELECT p.firstname, p.lastname, p.dob, p.phonenumber, p.sex,
                    v.scheduledatetime_start, v.scheduledatetime_end, v.visitid,
                    JSON_ARRAYAGG(s.serviceid) as serviceids, JSON_ARRAYAGG(s.servicename) as servicenames   
                FROM patients AS p INNER JOIN visits AS v ON p.patientid = v.patientid
                INNER JOIN visit_service_line AS vsl ON v.visitid = vsl.visitid
                INNER JOIN services as s ON vsl.serviceid = s.serviceid
                WHERE v.visitid = ?
                GROUP BY v.visitid
                `,
                [visitid] 
            )
            resol(result)
        } catch (err) {
            console.log(err.message)
            rejec(err)
        } finally {
            if(conn) conn.release()
        }
    })
}

//to make appointment with patient info and service 
async function makeappointment(fields = null, files=null) {
    return new Promise(async (resol, rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            await conn.beginTransaction() //starts transaction
            //insert into patients table and get patient id
            var {insertId: patientId} = await conn.query(
                'INSERT INTO patients(firstname, lastname, dob, sex, phonenumber) VALUES (?,?,?,?,?)',
                [fields.firstname, fields.lastname, fields.dob, fields.sex, fields.mobileno])
            //insert into visits and visit_service_lines
            var {insertId: visitId} = await conn.query(
                'INSERT INTO visits(patientid, scheduledatetime_start, scheduledatetime_end) VALUES (CAST(? AS UNSIGNED INTEGER) ,?,?)',
                [patientId, fields.sched_start, fields.sched_end])
            fields['services[]'].forEach(async (selectedserviceid) => {
                var {insertId: visitservicelineid} = await conn.query(
                    'INSERT INTO visit_service_line (visitid, serviceid) VALUES (CAST(? AS UNSIGNED INTEGER), ?)',
                    [visitId,selectedserviceid]
                )
            }); 
            await conn.commit() //final commit
            resol()
        } catch (err) {
            conn.rollback()
            console.log(err.message)
            rejec(err)
        } finally{
            if(conn) conn.release()
        }
    })
}

//upload files
async function putfileuploads(fields = null, files=null) {
    return new Promise(async (resol, rejec)=>{
        var conn;
        try {
            const fileUploadData = {
                fields,
                'filepath' : `${__dirname}/fileuploads/${files.uploadedDocument[0].newFilename}`,
                'mimetype': files.uploadedDocument[0].mimetype,
                'uploadedat': Date.now(),
            }
            conn = await pool.getConnection()
            await conn.beginTransaction() //starts transaction
            
            await conn.commit() //final commit
            resol()
        } catch (err) {
            conn.rollback()
            console.log(err.message)
            rejec(err)
        } finally{
            if(conn) conn.release()
        }
    })
}

//list of APIs
app.get('/getservicesdata',(req,res,next)=>{
    getservicesdata().then((result)=>{
        res.status(200).send(result).end()
    }).catch((err)=>{
        res.status(505).end(err.message)
    })
})

app.get('/getappointments',(req,res,next)=>{
    getappointments().then((result)=>{
        res.status(200).send(result).end()
    }).catch((err)=>{
        res.status(505).end(err.message)
    })
})

app.get('/getapptdetails/:visitid',(req,res,next)=>{
    getapptdetails(req.params.visitid).then((result)=>{
        res.status(200).json(result).end()
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

app.post('/putfileuploads',(req,res,next)=>{
    const form = new formidable.IncomingForm({uploadDir:`${__dirname}/fileuploads/`, keepExtensions: true})
    form.parse(req,(err,fields,files)=>{
        if(err){
            next(err)
            return
        }
        try {
            const fileUploadData = {
                ...fields,
                'filePath' : `/fileuploads/${files.uploadedDocument[0].newFilename}`,
                'mimetype': files.uploadedDocument[0].mimetype,
                'uploadedAt': Date.now(),
            }
            console.log(JSON.stringify(fileUploadData))
            res.sendStatus(200).end()
        } catch (error) {
            res.sendStatus(505).end()
        }
        // putfileuploads(fields, files).then(()=>{
        //     res.sendStatus(200)
        //     res.end()
        // }).catch((err)=>{
        //     res.sendStatus(505)
        //     res.end()
        // })
    })
})

//trigerring a listen
app.listen(8080,()=>{
    console.log('Server is listening at 8080...')
})
