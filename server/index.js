const express = require('express')
const cors = require('cors')
const formidable = require('formidable')
const bodyParser = require('body-parser')
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
//serve static files
app.use('/documents',express.static(path.join(__dirname,'fileuploads')))

//request parsers
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({extended:false})

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

//get list of services
async function getdiscounters(){
    return new Promise(async (resol,rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            var result = await conn.query('SELECT * FROM discounters')
            resol(result)
        } catch (err) {
            rejec(err)
        } finally {
            if(conn) conn.release()
        }
    })
}

//select and make quiries to get all the appointment for the specified investigation
//TODO: limiting how much visits are returned based on schedule dates
async function getappointments(invQuery){
    return new Promise(async (resol,rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            var result = await conn.query(
                `SELECT p.firstname, p.lastname, p.dob, p.phonenumber, p.sex,
                    v.scheduledatetime_start, v.scheduledatetime_end, v.visitid, v.fileuploads, v.createdat, v.scanstatus,
                    JSON_ARRAYAGG(s.serviceid) as serviceids, JSON_ARRAYAGG(s.servicename) as servicenames   
                FROM patients AS p INNER JOIN visits AS v ON p.patientid = v.patientid
                INNER JOIN visit_service_line AS vsl ON v.visitid = vsl.visitid
                INNER JOIN services as s ON vsl.serviceid = s.serviceid
                WHERE s.category = ?
                GROUP BY v.visitid
                ORDER BY v.createdat ASC
                `,[invQuery.selInv]
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

//get results with status query
async function getresultswithstatus(invQuery){
    return new Promise(async (resol,rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            var result = await conn.query(
                `SELECT vsl.visitid, vsl.serviceid, s.servicename, vsl.reportstatus, vsl.assignedto,vsl.report
                 FROM visit_service_line AS vsl INNER JOIN services as s ON vsl.serviceid = s.serviceid
                 WHERE s.category = ?
                `,[invQuery.selInv]
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

//select and make queries to get visits from the query (patientname, visitid, patientid)
async function getvisitsfromquery(searchQuery){
    return new Promise(async (resol,rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            var result = {}
            if(searchQuery && searchQuery.visitIdQuery){
                searchResult = await conn.query(
                    `SELECT p.patientid, p.firstname, p.lastname, p.dob, p.phonenumber, p.sex,
                        v.scheduledatetime_start, v.scheduledatetime_end, v.visitid, v.fileuploads,
                        JSON_ARRAYAGG(s.serviceid) as serviceids, JSON_ARRAYAGG(s.servicename) as servicenames
                    FROM patients AS p INNER JOIN visits AS v ON p.patientid = v.patientid
                    INNER JOIN visit_service_line AS vsl ON v.visitid = vsl.visitid
                    INNER JOIN services as s ON vsl.serviceid = s.serviceid
                    WHERE v.visitid = ?
                    GROUP BY v.visitid
                    `,[searchQuery.visitIdQuery] 
                )
                result.searchResult = searchResult
                result.totalRow = searchResult.length
            }
            if(searchQuery && searchQuery.patientIdQuery){
                searchResult = await conn.query(
                    `SELECT p.patientid, p.firstname, p.lastname, p.dob, p.phonenumber, p.sex,
                        v.scheduledatetime_start, v.scheduledatetime_end, v.visitid, v.fileuploads,
                        JSON_ARRAYAGG(s.serviceid) as serviceids, JSON_ARRAYAGG(s.servicename) as servicenames
                    FROM patients AS p INNER JOIN visits AS v ON p.patientid = v.patientid
                    INNER JOIN visit_service_line AS vsl ON v.visitid = vsl.visitid
                    INNER JOIN services as s ON vsl.serviceid = s.serviceid
                    WHERE p.patientid = ?
                    GROUP BY v.visitid
                    `,[searchQuery.patientIdQuery] 
                )
                result.searchResult = searchResult
                result.totalRow = searchResult.length
            }
            if(searchQuery && searchQuery.patientNameQuery && searchQuery.pageValue){
                const resultPerPageLimit = parseInt('5')
                searchTotalRows = await conn.query(
                    `SELECT SUM(qs.count) AS total_number_rows
                    FROM
                    (SELECT COUNT(DISTINCT (v.visitid)) AS count
                    FROM patients AS p INNER JOIN visits AS v ON p.patientid = v.patientid
                    INNER JOIN visit_service_line AS vsl ON v.visitid = vsl.visitid
                    INNER JOIN services as s ON vsl.serviceid = s.serviceid
                    WHERE p.firstname LIKE ? OR p.lastname LIKE ?
                    GROUP BY v.visitid
                    ) AS qs
                    `,[`${searchQuery.patientNameQuery}%`,`${searchQuery.patientNameQuery}%`]
                )
                searchResult = await conn.query(
                    `SELECT p.firstname, p.lastname, p.dob, p.phonenumber, p.sex,
                        v.scheduledatetime_start, v.scheduledatetime_end, v.visitid, v.fileuploads,
                        JSON_ARRAYAGG(s.serviceid) as serviceids, JSON_ARRAYAGG(s.servicename) as servicenames
                    FROM patients AS p INNER JOIN visits AS v ON p.patientid = v.patientid
                    INNER JOIN visit_service_line AS vsl ON v.visitid = vsl.visitid
                    INNER JOIN services as s ON vsl.serviceid = s.serviceid
                    WHERE p.firstname LIKE ? OR p.lastname LIKE ?
                    GROUP BY v.visitid
                    ORDER BY v.createdat ASC
                    LIMIT ? OFFSET ?
                    `,[`${searchQuery.patientNameQuery}%`,`${searchQuery.patientNameQuery}%`,resultPerPageLimit,((parseInt(searchQuery.pageValue) - 1)*resultPerPageLimit) ] 
                )
                result.searchResult = searchResult
                result.totalRow = searchTotalRows[0].total_number_rows
                result.resultPerPageLimit = `${resultPerPageLimit}`
            }
            console.log(result)
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
                    v.scheduledatetime_start, v.scheduledatetime_end, v.visitid, v.fileuploads,
                    JSON_ARRAYAGG(s.serviceid) as serviceids, JSON_ARRAYAGG(s.servicename) as servicenames   
                FROM patients AS p INNER JOIN visits AS v ON p.patientid = v.patientid
                INNER JOIN visit_service_line AS vsl ON v.visitid = vsl.visitid
                INNER JOIN services as s ON vsl.serviceid = s.serviceid
                WHERE v.visitid = ?
                GROUP BY v.visitid
                `,
                [visitid] 
            )
            var discountDetail = await conn.query(
                `SELECT d.discounterid, isl.discountpercent, s.serviceid, i.createdat 
                FROM invoices AS i INNER JOIN invoice_service_line AS isl ON i.invoiceid = isl.invoiceid
                    INNER JOIN discounters AS d ON isl.discounterid = d.discounterid
                    INNER JOIN services AS s ON isl.serviceid = s.serviceid 
                WHERE i.visitid=?`,
                [visitid]
            )
            var paymentDetail = await conn.query(
                `SELECT p.paymenttype, p.paymentamount, p.remark, p.recievedat, i.invoiceid
                FROM invoices AS i INNER JOIN payments AS p ON i.invoiceid = p.invoiceid
                WHERE i.visitid=?`,
                [visitid]
            )
            result[0].discountDetail = discountDetail
            result[0].paymentDetail = paymentDetail
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
async function makeappointment(fields = null) {
    return new Promise(async (resol, rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            await conn.beginTransaction() //starts transaction
            try{//insert into patients table and get patient id
                var {insertId: patientId} = await conn.query(
                    'INSERT INTO patients(firstname, lastname, dob, sex, phonenumber) VALUES (?,?,?,?,?)',
                    [fields.firstname, fields.lastname, fields.dob, fields.sex, fields.mobileno])
                //insert into visits and visit_service_lines
                var {insertId: visitId} = await conn.query(
                    'INSERT INTO visits(patientid, scheduledatetime_start, scheduledatetime_end) VALUES (CAST(? AS UNSIGNED INTEGER) ,?,?)',
                    [patientId, fields.sched_start, fields.sched_end])
                //decide when to create an invoice
                var {insertId:invoiceid}= await conn.query(
                    'INSERT INTO invoices (visitid) VALUES (CAST(? AS UNSIGNED INTEGER))',
                    [visitId]
                )
                for(var selectedserviceid of fields.services){
                    //add service to visit_service_line
                    await conn.query(
                        'INSERT INTO visit_service_line (visitid, serviceid) VALUES (CAST(? AS UNSIGNED INTEGER), CAST(? AS UNSIGNED INTEGER))',
                        [visitId,selectedserviceid]
                    )
                    //add service to invoice_service_line
                    await conn.query(
                        'INSERT INTO invoice_service_line (invoiceid, serviceid) VALUES (CAST(? AS UNSIGNED INTEGER), CAST(? AS UNSIGNED INTEGER))',
                        [invoiceid,selectedserviceid]
                    )
                }
                //if discount exists
                if(fields.discountRecords){
                    //add services and discounts to invoice_service_line
                    for(var discountRecord of fields.discountRecords){
                        await conn.query(
                            `UPDATE invoice_service_line SET discounterid=CAST(? AS UNSIGNED INTEGER), discountpercent=CAST(? AS DECIMAL)
                            WHERE invoiceid = CAST(? AS UNSIGNED INTEGER) AND serviceid = CAST(? AS UNSIGNED INTEGER)`,
                            [discountRecord.discounterid,discountRecord.discountpercent,invoiceid,discountRecord.serviceid]
                        )
                    }
                }
                //if payment record exists
                if(fields.paymentRecords){
                    for(var paymentRecord of fields.paymentRecords){
                        await conn.query(
                            `INSERT INTO payments (invoiceid, paymenttype, paymentamount,remark) 
                                VALUES (CAST(? AS UNSIGNED INTEGER),?,CAST(? AS DECIMAL),?)`,
                            [invoiceid,paymentRecord.paymenttype, paymentRecord.paymentamount, paymentRecord.remark?paymentRecord.remark:null]
                        )
                    }
                }
                await conn.commit() //final commit
                resol(visitId)
            }catch(err){
                await conn.rollback()
                console.log(err.message)
                rejec(err)
            }
        } catch (err) {
            console.log(err.message)
            rejec(err)
        } finally{
            if(conn) conn.release()
        }
    })
}

//upload files
async function postfileuploads(fields = null, files=null) {
    return new Promise(async (resol, rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            await conn.beginTransaction() //starts transaction
            try{const visitid = fields.visitid[0]
                var fileUploadDatas = []
                for (const documentUploadType in files){
                    files[documentUploadType].forEach((spfile)=>{
                    const fileUploadData = [{
                            'documentUploadType':documentUploadType,
                            'filePath' : `/documents/${spfile.newFilename}`,
                            'mimetype': spfile.mimetype,
                            'uploadedAt': Date.now(),
                        }]
                    fileUploadDatas = [...fileUploadDatas, ...fileUploadData]
                    })}
                var prevFileDate = await conn.query('SELECT visits.fileuploads FROM visits WHERE visits.visitid = ?',[visitid])
                //if the column fileuploads is not null or fileuploads.files is not empty
                if(Boolean(prevFileDate[0].fileuploads) && Boolean(prevFileDate[0].fileuploads.files)){
                    //append on previous
                    await conn.query(
                        'UPDATE visits SET fileuploads = ? WHERE visits.visitid = ?',
                        [JSON.stringify({'files': [...prevFileDate[0].fileuploads.files,...fileUploadDatas]}),visitid]
                        )
                }else{
                    await conn.query(
                        'UPDATE visits SET fileuploads = ? WHERE visits.visitid = ?',
                        [JSON.stringify({'files': [...fileUploadDatas]}), visitid]
                    )  
                }
                await conn.commit() //final commit
                resol()
            }catch(err){
                await conn.rollback()
                console.log(err.message)
                rejec(err)    
            }
        } catch (err) {
            console.log(err.message)
            rejec(err)
        } finally{
            if(conn) conn.release()
        }
    })
}

//delete files
async function deleteuploadedfile(fields = null) {
    return new Promise(async (resol, rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            await conn.beginTransaction() //starts transaction
            try{const visitid = fields.visitid
                var prevFileDate = await conn.query(
                    'SELECT visits.fileuploads FROM visits WHERE visits.visitid = ?',
                    [visitid])
                //if the column fileuploads is not null or fileuploads.files is not empty
                if(Boolean(prevFileDate[0].fileuploads) && Boolean(prevFileDate[0].fileuploads.files)){
                    //find the specified file
                    var listOfFiles = prevFileDate[0].fileuploads.files
                    var newListOfFiles = listOfFiles.filter((dbfile)=>!(dbfile.filePath===fields.fileToBeDeleted.orgFilePath))
                    await conn.query(
                        'UPDATE visits SET fileuploads = ? WHERE visits.visitid = ?',
                        [JSON.stringify({'files': [...newListOfFiles]}),visitid]
                        )
                }else{
                    throw new Error('no files attached with the visit')  
                }
                await conn.commit() //final commit
                resol()
            }catch(err){
                await conn.rollback()
                console.log(err.message)
                rejec(err)    
            }
        } catch (err) {
            console.log(err.message)
            rejec(err)
        } finally{
            if(conn) conn.release()
        }
    })
}

//insert new payment record
async function insertpaymentrecord(fields = null) {
    return new Promise(async (resol, rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            await conn.beginTransaction() //starts transaction
            try{
                //const invoiceid = fields.invoiceid
                const invoiceidasarray = await conn.query(
                    `SELECT i.invoiceid 
                    FROM invoices AS i INNER JOIN visits AS v ON v.visitid = i.visitid
                    WHERE v.visitid=?`, fields.visitid)
                await conn.query(
                    `INSERT INTO payments (invoiceid, paymenttype, paymentamount,remark) 
                        VALUES (CAST(? AS UNSIGNED INTEGER),?,CAST(? AS DECIMAL),?)`,
                    [invoiceidasarray[0].invoiceid,fields.paymenttype, fields.paymentamount, fields.remark?fields.remark:null]
                )
                await conn.commit() //final commit
                resol()
            }catch(err){
                await conn.rollback()
                console.log(err.message)
                rejec(err)    
            }
        } catch (err) {
            console.log(err.message)
            rejec(err)
        } finally{
            if(conn) conn.release()
        }
    })
}

//update the discount records for given visitid
async function updatediscountrecords(fields = null) {
    return new Promise(async (resol, rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            await conn.beginTransaction() //starts transaction
            try{
                //const invoiceid = fields.invoiceid
                const invoiceidasarray = await conn.query(
                    `SELECT i.invoiceid 
                    FROM invoices AS i INNER JOIN visits AS v ON v.visitid = i.visitid
                    WHERE v.visitid=?`, fields.visitid)
                //if discount exists
                if(fields.discountRecords){
                    //add services and discounts to invoice_service_line
                    for(var discountRecord of fields.discountRecords){
                        await conn.query(
                            `UPDATE invoice_service_line SET discounterid=CAST(? AS UNSIGNED INTEGER), discountpercent=CAST(? AS DECIMAL)
                            WHERE invoiceid = CAST(? AS UNSIGNED INTEGER) AND serviceid = CAST(? AS UNSIGNED INTEGER)`,
                            [discountRecord.discounterid,discountRecord.discountpercent,invoiceidasarray[0].invoiceid,discountRecord.serviceid]
                        )
                    }
                }
                await conn.commit() //final commit
                resol()
            }catch(err){
                await conn.rollback()
                console.log(err.message)
                rejec(err)    
            }
        } catch (err) {
            console.log(err.message)
            rejec(err)
        } finally{
            if(conn) conn.release()
        }
    })
}

//update the scan status for given visitid
async function updatescanstatus(fields = null) {
    return new Promise(async (resol, rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            await conn.beginTransaction() //starts transaction
            try{
                //update the scan status in visits using visitid
                await conn.query(
                    `UPDATE visits SET scanstatus=? WHERE visitid=?`,
                    [fields.scanstatus, fields.visitid]
                )
                await conn.commit() //final commit
                resol()
            }catch(err){
                await conn.rollback()
                console.log(err.message)
                rejec(err)    
            }
        } catch (err) {
            console.log(err.message)
            rejec(err)
        } finally{
            if(conn) conn.release()
        }
    })
}

//update the scan status for given visitid
async function updatereportstatus(fields = null) {
    return new Promise(async (resol, rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            await conn.beginTransaction() //starts transaction
            try{
                //update the scan status in visits using visitid
                await conn.query(
                    `UPDATE visit_service_line SET reportstatus = ? 
                    WHERE visitid = ? AND serviceid = ?`,
                    [fields.reportstatus, fields.visitid, fields.serviceid]
                )
                await conn.commit() //final commit
                resol()
            }catch(err){
                await conn.rollback()
                console.log(err.message)
                rejec(err)    
            }
        } catch (err) {
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

app.get('/getdiscounters',(req,res,next)=>{
    getdiscounters().then((result)=>{
        res.status(200).send(result).end()
    }).catch((err)=>{
        res.status(505).end(err.message)
    })
})

app.get('/getappointments',(req,res,next)=>{
    getappointments(req.query).then((result)=>{
        res.status(200).send(result).end()
    }).catch((err)=>{
        res.status(505).end(err.message)
    })
})

app.get('/getresultswithstatus',(req,res,next)=>{
    getresultswithstatus(req.query).then((result)=>{
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

app.get('/getvisitsfromquery',(req,res,next)=>{
    console.log(req.query)
    getvisitsfromquery(req.query).then((result)=>{
        res.status(200).json(result).end()
    }).catch((err)=>{
        res.status(505).end(err.message)
    })
})


app.get('/getscreeningformat',(req,res,next)=>{
    fs.readFile(path.join(__dirname,'filestandards','ScreeningChecklistData.json'),'utf-8',
        (err, data)=>{
            if(err){
                next(err)
                return
            }
            const screeningdata = JSON.parse(data)
            console.log(screeningdata)
            res.status(200).json(screeningdata).end()
        }
    )
})

app.post('/makeappointment', bodyParser.urlencoded({extended:true}), (req,res,next)=>{
    console.log(req.body)
    makeappointment(req.body).then((visitId)=>{
        res.status(200).send({'visitid':visitId}).end()
    }).catch((err)=>{
        res.sendStatus(505)
        res.end()
    })
})

app.post('/postfileuploads',(req,res,next)=>{
    const form = new formidable.IncomingForm({uploadDir:`${__dirname}/fileuploads/`, keepExtensions: true})
    form.parse(req,(err,fields,files)=>{
        //callback after the file is uploaded
        if(err){
            //if error occurred while uploading the file
            next(err)
            return
        }
        postfileuploads(fields, files).then(()=>{
            res.sendStatus(200).end()
        }).catch((err)=>{
            console.log(err)
            res.sendStatus(505).end()
        })
    })
})

app.post('/deleteuploadedfile', bodyParser.urlencoded({extended:true}), (req,res,next)=>{
    console.log(req.body)
    deleteuploadedfile(req.body).then(()=>{
        res.sendStatus(200).end()
    }).catch((err)=>{
        console.error(err)
        res.sendStatus(505)
        res.end()
    })
})

app.post('/insertpaymentrecord', bodyParser.urlencoded({extended:true}), (req,res,next)=>{
    console.log(req.body)
    insertpaymentrecord(req.body).then(()=>{
        res.sendStatus(200).end()
    }).catch((err)=>{
        console.error(err)
        res.sendStatus(505)
        res.end()
    })
})

app.post('/updatediscountrecords', bodyParser.urlencoded({extended:true}), (req,res,next)=>{
    console.log(req.body)
    updatediscountrecords(req.body).then(()=>{
        res.sendStatus(200).end()
    }).catch((err)=>{
        console.error(err)
        res.sendStatus(505)
        res.end()
    })
})

app.post('/updatescanstatus', bodyParser.urlencoded({extended:true}), (req,res,next)=>{
    console.log(req.body)
    updatescanstatus(req.body).then(()=>{
        res.sendStatus(200).end()
    }).catch((err)=>{
        console.error(err)
        res.sendStatus(505)
        res.end()
    })
})

app.post('/updatereportstatus', bodyParser.urlencoded({extended:true}), (req,res,next)=>{
    console.log(req.body)
    updatereportstatus(req.body).then(()=>{
        res.sendStatus(200).end()
    }).catch((err)=>{
        console.error(err)
        res.sendStatus(505)
        res.end()
    })
})

//trigerring a listen
app.listen(8080,()=>{
    console.log('Server is listening at 8080...')
})

/* 
TODO: create visits.scanstatus - varchar - default - scan_pending
index- visits.createdat
*/