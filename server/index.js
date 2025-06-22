import express from 'express'
import cors from 'cors'
import formidable from 'formidable'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'
import mariadb from 'mariadb'
import axios from 'axios'
import {v4 as uuidv4} from 'uuid'
import dcmjs, { utilities } from 'dcmjs'
import dotenv from 'dotenv'
import {format} from 'date-fns'
import child_process from 'child_process'
import util from 'util'

// const express = require('express')
// const cors = require('cors')
// const formidable = require('formidable')
// const bodyParser = require('body-parser')
// const fs = require('fs')
// const path = require('path')
// const mariadb = require('mariadb')
// const axios = require('axios')
// const {v4:uuidv4} = require('uuid')
// const {DicomMetaDictionary, DicomMessage} = require('dcmjs')
dotenv.config({path:['.env.local']})
//require('@dotenvx/dotenvx').config({path: ['.env.local']})
//const getConnection = require('./db')

//main setup
//__filename, __dirname
const __filename = fileURLToPath(import.meta.url) ;
const __dirname = path.dirname(__filename)
const app = express()
//cors setup
app.use(cors())
//serve static files
app.use('/documents',express.static(path.join(__dirname,'fileuploads')))
//orthanc setup
const ORTHANC_URL = 'http://localhost:8042'
const ORTHANC_AUTH = {username:'orthanc', password:'orthanc'}
const ORTHANC_WORKLIST_PATH = 'C:/Orthanc/worklistmanager'
//dcmjs setup
const {DicomMetaDictionary, DicomDict, DicomMessage, WriteBufferStream} =dcmjs.data
const IMPLEMENTATIONCLASSUID = '2.25.245209499699657654870212694517754631679' //should be replaced with official UID

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

class OrthancError extends Error {
    constructor(msg){
        super(msg)
        this.name = "OrthancError"
    }
}
function createFileFolder(filepath,content){
    const folderpath = path.dirname(filepath)
    if(!fs.existsSync(folderpath)){
        fs.mkdirSync(folderpath,{recursive:true})
    }
    fs.writeFileSync(filepath,content,{encoding:'ascii',flag:'w'})
}
function formatValueByVr(key, vr, value){
    //string types and Unique identifiers
    if(['UI','PN','LO','SH','ST','LT','UT','AE','CS','DT','DA','TM'].includes(vr)){
        return `[${value}]`
    }
    //Binary/byte string
    if(['OB','OW','OF'].includes(vr)){
        if(key==='0002,0001') return `01\\00`
        return '<binary data not shown>' //if file meta (0002,0001), write it as 01\00
    }
    //integer types //no change
    return value
}
function createMWLDataForText(mwlDataDN,recur=false){
    let strtext = ''
    for(let[key,val] of Object.entries(mwlDataDN)){
        key = key.slice(0,4) + ',' + key.slice(4)
        if(val.vr === 'SQ'){
            const sqstrtext = createMWLDataForText(val.Value[0],true)
            const temp = `(${key}) ${val.vr} ` + '\n' + ' (fffe,e000)' + '\n' + sqstrtext + ' (fffe,e00d)' +'\n'
            strtext = strtext + temp
        }else{
            let spacer = ''
            if(recur)spacer='  '
            strtext = strtext + spacer +`(${key}) ${val.vr} ${formatValueByVr(key,val.vr,val.Value)}` + '\n'
        }
    }
    if(!recur){strtext+='(fffe,e0dd)'}
    return strtext
}

function createMWLMeta(SOPInstanceUID,ImplementationClassUID) {
    return {
      // File Meta Information Group (0002,xxxx)
      '00020000': { vr: 'UL', Value: [0] }, // Group Length (value auto-calculated normally)
      '00020001': { vr: 'OB', Value: [0x00, 0x01] }, // File Meta Information Version
      '00020002': { vr: 'UI', Value: ['1.2.840.10008.5.1.4.31'] }, // SOP Class UID for Modality Worklist
      '00020003': { vr: 'UI', Value: [SOPInstanceUID] }, // SOP Instance UID
      '00020010': { vr: 'UI', Value: ['1.2.840.10008.1.2'] }, // Transfer Syntax UID (Implicit VR Little Endian)
      '00020012': { vr: 'UI', Value: [ImplementationClassUID] }, // Implementation Class UID
      '00020013': { vr: 'SH', Value: ['Vicky_system_0.1.0'] }, // Implementation Version Name
    };
}

function generateDicomUids(){
    //study instance UID needs to be global unique
    const uuid = uuidv4()
    const decimaluuid = BigInt('0x'+uuid.replace(/-/g,'').toString())
    const studyInstanceUID = `2.25.${decimaluuid}`
    
    const rootOID = '1.2.826.0.1.3680043.2.1125'; // Replace with your organization's OID
    const timestamp = Date.now(); // Unix time in ms
    const randomSuffix = Math.floor(Math.random() * 1000000); // Random 6-digit number
    const uid = `${rootOID}.${timestamp}.${randomSuffix}`;
    const SOPInstanceUID = uid.length > 64 ? uid.substring(0, 64) : uid;
      

    //need not to be UID; just for unique for the procedure; have character limit of 16
    const scheduledProcedureStepID = `SP${new Date().toISOString().replace(/[-:.TZ]/g,'').slice(2,14)}` //14char
    return {studyInstanceUID, scheduledProcedureStepID, SOPInstanceUID}
}
function formatDateTime(dt){
    const [fd,ft] = `${dt}`.trim().split(" ")
    return {
        fdate: `${fd}`.replace(/-/g,''),
        ftime: `${ft}`.replace(/:/g,'')
    }
}
async function insertupdateworklistorthanc(fields, isDelete=false){
    //fields: object
    //include: firstname, lastname, sched_start, dob, sex, patientid, isupdate, vslid
    return new Promise(async(resol,rejec)=>{
        try {
            const wlpath = path.join(ORTHANC_WORKLIST_PATH,`MWL_${fields.vslid}.wl`)
            if(!fields){throw new OrthancError("invalid body")}
            if(!fields.patientid||!fields.vslid){throw new OrthancError("invalid body")}
            if(isDelete){
                fs.rmSync(wlpath,{force:true})
                resol()
                return
            }
            if(fields.isupdate){
                fs.rmSync(wlpath,{force:true})
                await postworklistorthanc(fields.patientid,fields,[fields.vslid])// process intensive    
            }else if(!fs.existsSync(wlpath)){
                //not update and file doesn't exist
                await postworklistorthanc(fields.patientid,fields,[fields.vslid])// process intensive
            }
            // if(fields.isupdate){
            //     fs.rmSync(wlpath,{force:true})
            //     await postworklistorthanc(fields.patientid,fields,[fields.vslid])
            // }else{
            //     //create or update the mwl file even if it exists
            //     //above code is just useless
            //     await postworklistorthanc(fields.patientid,fields,[fields.vslid])
            // }
            // await postworklistorthanc(fields.patientid,fields,[fields.vslid])
            resol()
        }catch(err){
            console.error(err.message)
            rejec(err)
        }
    })
}
async function postworklistorthanc(patientId, fields, vslids){
    //fields: object
    //include: firstname, lastname, sched_start, dob, sex
    return new Promise(async(resol,rejec)=>{
        let conn;
        try{
            conn = await pool.getConnection()
            for(const vslid of vslids){
                const vsldetail = await conn.query(
                    `SELECT s.servicename, s.category
                    FROM visit_service_line AS vsl INNER JOIN services AS s ON vsl.serviceid = s.serviceid
                    WHERE vsl.visitserviceid = ?`,[vslid])
                const modality = vsldetail[0].category
                const procedureStepDescription = vsldetail[0].servicename
                const {studyInstanceUID, scheduledProcedureStepID,SOPInstanceUID} = generateDicomUids()
                fields.sched_start = fields.sched_start?fields.sched_start:format(Date.now(),'yyyy-MM-dd HH:mm:ss')
                const mwlData2 ={
                    PatientID: patientId,
                    PatientName: `${fields.firstname}^${fields.lastname}`,
                    PatientBirthDate: `${formatDateTime(fields.dob).fdate}`,
                    PatientSex: fields.sex==='Male'?'M':fields.sex==='Female'?'F':'O',
                    AccessionNumber: `${vslid}`,
                    StudyInstanceUID: studyInstanceUID,
                    ScheduledProcedureStepSequence: [{
                        ScheduledProcedureStepID: scheduledProcedureStepID,
                        ScheduledProcedureStepStartDate: `${formatDateTime(fields.sched_start).fdate}`,
                        ScheduledProcedureStepStartTime: `${formatDateTime(fields.sched_start).ftime}`,
                        ScheduledProcedureStepDescription: procedureStepDescription,
                        ScheduledStationAETitle: `${modality}_1`,
                        RequestedProcedureID: `REQ_${vslid}`,
                        Modality: modality
                    }]
                }
                // const mwlData = {
                //     '00100020': { vr: 'LO', Value: [`${patientId}`] },//,PatiendID : ,
                //     '00100010': { vr: 'PN', Value: [{Alphabetic: `${fields.firstname}^${fields.lastname}` }] },//PatientName
                //     '00100030': { vr: 'DA', Value: [`${formatDateTime(fields.dob).fdate}`]},//PatientBirthDate : ,
                //     '00100040': { vr: 'CS', Value: [`${fields.sex}`] },//PatientSex
                //     '00080050': { vr: 'SH', Value: [`${vslid}`] },//AccessionNumber
                //     '0020000D': { vr: 'UI', Value: [studyInstanceUID] },//StudyInstanceUID
                //     '00080060': { vr: 'CS', Value: [modality] },//modality
                //     '00400100': {
                //         vr: 'SQ',
                //         Value: [{
                //             '00400009': { vr: 'SH', Value: [scheduledProcedureStepID] }, // Scheduled Step ID
                //             '00400002': { vr: 'DA', Value: [`${formatDateTime(fields.sched_start).fdate}`] },// Scheduled Date
                //             '00400003': { vr: 'TM', Value: [`${formatDateTime(fields.sched_start).ftime}`] },// Scheduled Time
                //             '00400007': { vr: 'LO', Value: [procedureStepDescription] },// procedure step description
                //             //"00400006": { vr: "PN", Value: [{ Alphabetic: "Dr^Default" }] }, // Scheduled Performer
                //             '00080060': { vr: 'CS', Value: [modality] },
                //             '00400001': { vr: 'AE', Value: [`${modality}_1`] }, //ScheduledStationAETitle to be encoded to have many station; temp measure 
                //     }]}
                // }
                const dicomDictFromDatasetDN = DicomMetaDictionary.denaturalizeDataset(mwlData2)
                const dicomMeta = createMWLMeta(SOPInstanceUID,IMPLEMENTATIONCLASSUID)
                const dicomMetaN = DicomMetaDictionary.naturalizeDataset(dicomMeta)
                const dicomMetaDN = DicomMetaDictionary.denaturalizeDataset(dicomMetaN)
                console.log("ddd" + JSON.stringify(dicomDictFromDatasetDN))
                const dicomtext = createMWLDataForText({...dicomMetaDN,...dicomDictFromDatasetDN})
                console.log(dicomtext)
                const temptextpath = path.join(__dirname,'temp_wl',`${vslid}_wl_text.txt`)
                const outputwlpath = path.join(ORTHANC_WORKLIST_PATH,`MWL_${vslid}.wl`)                
                createFileFolder(temptextpath,`${dicomtext}`.trim())
                const exec = util.promisify(child_process.exec)
                const {stdout, stderr} = await exec(`dump2dcm -v +F "${temptextpath}" "${outputwlpath}"`)
                console.log('stdout:',stdout);
                console.log('stderr:',stderr);
                await conn.query(
                    `UPDATE visit_service_line SET wlsend = CAST(1 AS INTEGER)
                    WHERE visitserviceid = ?`,[vslid]
                )
            }
            resol()
        }catch(err){
            console.error("Error in MWL creation: ",err.message)
            rejec(err)
        }finally{
            if(conn) conn.release()
        }
    })
}

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
                `SELECT p.firstname, p.lastname, p.dob, p.phonenumber, p.sex, p.patientid,
                    v.scheduledatetime_start, v.scheduledatetime_end, v.visitid, v.fileuploads, v.createdat, v.scanstatus,
                    JSON_ARRAYAGG(vsl.reportstatus) AS reportstatuses, JSON_ARRAYAGG(s.serviceid) as serviceids, JSON_ARRAYAGG(s.servicename) as servicenames   
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
                `SELECT vsl.visitid, vsl.serviceid, s.servicename, vsl.reportstatus, vsl.assignedto,vsl.reportdelta
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
                let searchResult = await conn.query(
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
                let searchResult = await conn.query(
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
                let searchTotalRows = await conn.query(
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
                let searchResult = await conn.query(
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



//select and make queries to get archives from PACS using the query (patientname, visitid, patientid)
async function getarchivesfromquery(searchQuery, withResult = false){
    async function findStudiesByCriteria({criteria, withResult,conn, pageValue = null,rppl=null}){
        const query = {}
        console.log(criteria)
        if(criteria.patientIdQuery){
            query.PatientID = criteria.patientIdQuery
        } else if (criteria.patientNameQuery){
            query.PatientName = `*${criteria.patientNameQuery}*`
        } 
        if (criteria.vslIdQuery){
            query.AccessionNumber = criteria.vslIdQuery
        }
        if(criteria.startDate){
            let dateQuery = `${formatDateTime(criteria.startDate).fdate}-${format(Date.now(),'yyyyMMdd')}`
            if(criteria.endDate){
                dateQuery = `${formatDateTime(criteria.startDate).fdate}-${formatDateTime(criteria.endDate).fdate}`
            }
            query.StudyDate = dateQuery
        }
        console.log('qf',query)
        //param criteria = accession number or patient name or patient id; retun list of studies
        //list of orthanc ids
        const responseListOrthancIds = await axios.post(`${ORTHANC_URL}/tools/find`,{
            Level:'Study',
            Query:{...query}
        })
        let selOids = []
        if(pageValue && rppl){
            //to do pagination
            const start = (pageValue-1)*rppl
            const end = start + rppl
            selOids = responseListOrthancIds.data.splice(start,end)
        }else{
            //no pagination
            selOids = responseListOrthancIds.data
        }
        console.log(selOids)
        let listOfStudies = []
        for(const oid of selOids){
            const study = await getStudyDetailFromOrthancId(oid, withResult,conn)
            listOfStudies.push(study)
        }
        console.log(listOfStudies)
        return listOfStudies
    }
    async function getStudyDetailFromOrthancId(oid, withResult, conn){
        const resStudy = await axios.get(`${ORTHANC_URL}/studies/${oid}`)
        const studyTag = resStudy.data.MainDicomTags || {}
        const patientTag = resStudy.data.PatientMainDicomTags || {}
        const vslid = studyTag.AccessionNumber
        let result = {
            orthancId: oid,
            patientId: patientTag.PatientID || studyTag.PatientID,
            patientName: patientTag.PatientName || studyTag.PatientName,
            patientSex: patientTag.PatientSex || null,
            patientDOB: patientTag.PatientBirthDate || null,
            accessionNumber: studyTag.AccessionNumber,
            studyId: studyTag.StudyID,
            studyDate: studyTag.StudyDate,
            studyTime: studyTag.StudyTime,
            studyDescription: studyTag.StudyDescription,
            studyInstanceUID: studyTag.StudyInstanceUID,
            refPhyName: studyTag.ReferringPhysicianName,
            series: studyTag.Series || []
        }
        if(withResult && vslid){
            //display results
            //get accession number (visit_service_line_id)
            const detailByVslid = await conn.query(
                `SELECT vsl.visitserviceid, vsl.reportstatus, vsl.assignedto, vsl.reportdelta, 
                vsl.serviceid, v.visitid, v.fileuploads, v.scanstatus
                FROM visit_service_line AS vsl INNER JOIN visits AS v ON vsl.visitid=v.visitid
                WHERE vsl.visitserviceid = ?`,[vslid])
            //add it final json
            // result.visitserviceid = detailByVslid[0].visitserviceid
            // result.reportstatus = detailByVslid[0].reportstatus
            // result.assignedto = detailByVslid[0].assignedto
            // result.reportdelta = detailByVslid[0].reportdelta
            // result.serviceid = detailByVslid[0].serviceid
            // result.visitid = detailByVslid[0].visitid
            // result.fileuploads = detailByVslid[0].fileuploads
            // result.scanstatus = detailByVslid[0].scanstatus
            if(detailByVslid && detailByVslid.length !==0){
                result =  {...result, ...detailByVslid[0]}
            }
        }
        return result
    }
    return new Promise(async (resol,rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            let result = {}
            const resultPerPageLimit = parseInt('10')
            result.resultPerPageLimit = `${resultPerPageLimit}`
            if(!searchQuery){throw new Error("Empty Search Query")}
            //visitid used
            //loop is required 
            if(searchQuery.visitIdQuery){
                let listVslIds = await conn.query(
                    `SELECT vsl.visitserviceid
                    FROM visits AS v INNER JOIN visit_service_line AS vsl ON v.visitid = vsl.visitid
                    WHERE v.visitid = ?
                    `,[searchQuery.visitIdQuery] 
                )
                let searchResult = []
                for(vslid in listVslIds){
                    const res = await findStudiesByCriteria({
                        criteria:{visitIdQuery:searchQuery.visitIdQuery},
                        withResult,
                        conn})
                    searchResult = [...searchResult, ...res]
                }
                result.searchResult = searchResult
                result.totalRow = searchResult.length
            }else {
                //loop is not required
                let criteria={}
                //patientid used
                if(searchQuery.patientIdQuery){
                    criteria.patientIdQuery= searchQuery.patientIdQuery
                }else if(searchQuery.patientNameQuery && searchQuery.pageValue){
                    //patient name used
                    criteria.patientNameQuery=searchQuery.patientNameQuery
                }
                if(searchQuery.startDate){
                    const endDate = searchQuery.endDate?searchQuery.endDate:null
                    criteria.startDate= searchQuery.startDate
                    criteria.endDate= endDate
                }
                const searchResult = await findStudiesByCriteria({
                    criteria:criteria,
                    withResult,
                    conn})
                result.searchResult = searchResult
                result.totalRow = searchResult.length
            }
            //patientid used
            // if(searchQuery.patientIdQuery){
            //     let searchResult = await findStudiesByCriteria({
            //         criteria:{patientIdQuery:searchQuery.patientIdQuery},
            //         withResult,
            //         conn})
            //     result.searchResult = searchResult
            //     result.totalRow = searchResult.length
            // }
            // //patient name used
            // if(searchQuery.patientNameQuery && searchQuery.pageValue){
            //     let searchResult = await findStudiesByCriteria({
            //         criteria:{patientNameQuery:searchQuery.patientNameQuery},
            //         //pageValue:searchQuery.pageValue,
            //         //resultPerPageLimit,
            //         withResult,
            //         conn})
            //     result.searchResult = searchResult
            //     result.totalRow = searchResult.length
            //     //result.totalRow = searchTotalRows[0].total_number_rows 
            // }
            // //if only date is used
            // if(searchQuery.startDate){
            //     const endDate = searchQuery.endDate?searchQuery.endDate:null
            //     let searchResult  = await findStudiesByCriteria({
            //         criteria:{startDate: searchQuery.startDate, endDate: searchQuery.endDate},
            //         withResult,
            //         conn})
            //     result.searchResult = searchResult
            // }
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
                `SELECT p.firstname, p.lastname, p.dob, p.phonenumber, p.sex, p.patientid,
                    v.scheduledatetime_start, v.scheduledatetime_end, v.visitid, v.fileuploads, v.scanstatus,
                    JSON_ARRAYAGG(s.serviceid) as serviceids, JSON_ARRAYAGG(s.servicename) as servicenames   
                FROM patients AS p INNER JOIN visits AS v ON p.patientid = v.patientid
                INNER JOIN visit_service_line AS vsl ON v.visitid = vsl.visitid
                INNER JOIN services as s ON vsl.serviceid = s.serviceid
                WHERE v.visitid = ?
                GROUP BY v.visitid
                `,
                [visitid] 
            )
            var reportStatus = await conn.query(
                `SELECT vsl.visitid, vsl.serviceid, s.servicename, vsl.reportstatus, vsl.assignedto, vsl.reportdelta, vsl.wlsend, vsl.visitserviceid
                 FROM visit_service_line AS vsl INNER JOIN services as s ON vsl.serviceid = s.serviceid
                 WHERE vsl.visitid=?
                `,[visitid]
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
            result[0].reportStatus = reportStatus
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
            const vslIds = [] //visit_service_line ids for modality worklist creation
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
                    const {insertId:vslid} = await conn.query(
                        'INSERT INTO visit_service_line (visitid, serviceid) VALUES (CAST(? AS UNSIGNED INTEGER), CAST(? AS UNSIGNED INTEGER))',
                        [visitId,selectedserviceid]
                    )
                    //add to vslIds
                    vslIds.push(vslid)
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
                await postworklistorthanc(patientId,fields, vslIds).catch((err)=>{
                    throw new OrthancError("Error in MWL creation: "+err.message)
                })
                resol(visitId)
            }catch(err){
                //can elect to not roll back
                // if(!(err instanceof OrthancError)){ await conn.rollback()}
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
//update appointments
async function updateappointment(fields = null) {
    return new Promise(async (resol, rejec)=>{
        var conn;
        try {
            conn = await pool.getConnection()
            await conn.beginTransaction() //starts transaction
            try{//update patient and visit table details
                const {affectedRows:patientUpdatedRows} = await conn.query(
                    `UPDATE patients SET firstname=?, lastname=?, dob=?, sex=?, phonenumber=?
                     WHERE patientid = ? AND (
                        firstname<>? OR lastname<>? OR dob<>? OR sex<>? OR phonenumber<>?
                     )`,
                     [
                        fields.firstname, fields.lastname, fields.dob, fields.sex, fields.mobileno,
                        fields.patientid,
                        fields.firstname, fields.lastname, fields.dob, fields.sex, fields.mobileno
                    ]
                )
                const {affectedRows:visitUpdatedRows}= await conn.query(
                    `UPDATE visits SET scheduledatetime_start=?, scheduledatetime_end=?
                     WHERE visitid=? AND (
                        scheduledatetime_start<>? OR scheduledatetime_end<>?
                     )`,
                    [
                        fields.sched_start, fields.sched_end, 
                        fields.visitid,
                        fields.sched_start, fields.sched_end
                    ]
                )
                const invoiceids= await conn.query(`SELECT invoiceid FROM invoices WHERE visitid = ?`,[fields.visitid])
                //trying it with temporary table
                await conn.query(
                    `CREATE TEMPORARY TABLE selected_services 
                    (sel_service_id INT(11) UNSIGNED NOT NULL, 
                    sel_visit_id INT(11) UNSIGNED NOT NULL,
                    sel_invoice_id INT(11) UNSIGNED NOT NULL)`)
                let insertQueryToTempTable = `INSERT INTO selected_services (sel_service_id,sel_visit_id,sel_invoice_id) VALUES `
                for(const selserviceid of fields.services){
                    insertQueryToTempTable = insertQueryToTempTable + `(${selserviceid},${fields.visitid},${invoiceids[0].invoiceid}),`
                }
                //populate the temporary table with service ids
                await conn.query(insertQueryToTempTable.slice(0,-1))
                console.log(insertQueryToTempTable)
                //insert the missing
                const {affectedRows:vslInsertedRows}= await conn.query(
                    `INSERT INTO visit_service_line (visitid, serviceid)
                    SELECT ss.sel_visit_id, ss.sel_service_id
                    FROM selected_services AS ss LEFT JOIN visit_service_line AS vsl 
                    ON ss.sel_service_id = vsl.serviceid AND ss.sel_visit_id = vsl.visitid
                    WHERE vsl.serviceid IS NULL`)
                if(Boolean(Number(vslInsertedRows))){
                    await conn.query(
                        `INSERT INTO invoice_service_line (invoiceid, serviceid)
                        SELECT ss.sel_invoice_id, ss.sel_service_id
                        FROM selected_services AS ss LEFT JOIN invoice_service_line AS isl 
                        ON ss.sel_service_id = isl.serviceid AND ss.sel_invoice_id = isl.invoiceid
                        WHERE isl.serviceid IS NULL`)
                }
                //delete the extras
                const {affectedRows:vslDeletedRows}= await conn.query(
                    `DELETE FROM visit_service_line
                    WHERE visitid = ? AND serviceid NOT IN (SELECT sel_service_id FROM selected_services)`,
                    [fields.visitid]
                )
                console.log("deletedrow",vslDeletedRows,"insertedrows",vslInsertedRows, "visti and patient",visitUpdatedRows,patientUpdatedRows)
                if(Boolean(Number(vslDeletedRows))){
                    await conn.query(
                        `DELETE FROM invoice_service_line
                        WHERE invoiceid = ? AND serviceid NOT IN (SELECT sel_service_id FROM selected_services)`,
                        [invoiceids[0].invoiceid])
                }
                await conn.commit() //final commit
                //fields include: firstname, lastname, sched_start, dob, sex, patientid, isupdate, vslid
                //delete old mwl
                if(Boolean(Number(vslDeletedRows))){
                    let deletedVslids = await conn.query(
                        `SELECT visitserviceid FROM visit_service_line
                        WHERE visitid = ? AND serviceid NOT IN (SELECT sel_service_id FROM selected_services)`,
                        [fields.visitid])
                    deletedVslids = deletedVslids.map((row)=>(row.visitserviceid))
                    for(const dvslid of deletedVslids){
                        const tempfield = {...fields}
                        tempfield.vslid = dvslid
                        await insertupdateworklistorthanc(tempfield,true).catch((err)=>{
                            throw new OrthancError("Error in insertupdate: "+err.message)
                        })//low intensive //async //to delete 
                    }
                }
                //check if there is any update
                const vslUpdaterStatus = Boolean(Number(patientUpdatedRows)) || Boolean(Number(visitUpdatedRows))
                if(vslUpdaterStatus||Boolean(Number(vslInsertedRows))){
                    //loop for each services
                    let newvslids = await conn.query(
                        `SELECT visitserviceid FROM visit_service_line
                        WHERE visitid = ?`,[fields.visitid]
                    )
                    newvslids = newvslids.map((row)=>(row.visitserviceid))
                    for(const newvslid of newvslids){
                        const tempfield = {...fields}
                        tempfield.vslid = newvslid
                        tempfield.isupdate = vslUpdaterStatus
                        await insertupdateworklistorthanc(tempfield).catch((err)=>{
                            throw new OrthancError("Error in insertupdate: "+err.message)
                        })//low intensive //async //to delete 
                    }
                    //if vslUpdaterStatus is true, update all
                    //if vslUpdaterStatus if false, update (or create new) vsl
                }
                await conn.query(`DROP TEMPORARY TABLE IF EXISTS selected_services`)
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
                if(fields.reportdeltaops && fields.reportdeltaops.length !== 0){
                    //recieved valid ops for delta object
                    const reportdelta = {ops:[...fields.reportdeltaops]}
                    await conn.query(
                        `UPDATE visit_service_line SET reportstatus = ?, reportdelta = ? 
                        WHERE visitid = ? AND serviceid = ?`,
                        [fields.reportstatus, JSON.stringify(reportdelta), fields.visitid, fields.serviceid]
                    )
                }else{
                    //for invalid ops
                    //used to not damage already correctly recorded delta
                    await conn.query(
                        `UPDATE visit_service_line SET reportstatus = ? 
                        WHERE visitid = ? AND serviceid = ?`,
                        [fields.reportstatus, fields.visitid, fields.serviceid]
                    )
                }
                if(fields.reportstatus === 'report_verified'){
                    var resultStatusesForVisitid = await conn.query(
                        `SELECT reportstatus FROM visit_service_line 
                        WHERE visitid = ?`,[fields.visitid]
                    )
                    //all result status for the visit id are 'report_verified' or not
                    var allTrue = true
                    for (var res of resultStatusesForVisitid){
                        if(res.reportstatus !== 'report_verified'){
                            allTrue = false
                            break
                        }
                    }
                    //if all are report verified; make the visit scan completed
                    if(allTrue){
                        await conn.query(
                            `UPDATE visits SET scanstatus=? WHERE visitid=?`,
                            ['scan_completed', fields.visitid]
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

app.get('/getarchivesfromquery',(req,res,next)=>{
    console.log(req.query)
    getarchivesfromquery(req.query).then((result)=>{
        res.status(200).json(result).end()
    }).catch((err)=>{
        res.status(505).end(err.message)
    })
})

app.get('/getarchivesforreporting',(req,res,next)=>{
    console.log(req.query)
    getarchivesfromquery(req.query,true).then((result)=>{
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
        res.status(200).send({'visitid':visitId,'wlsend':true}).end()
    }).catch((err)=>{
        if((err instanceof OrthancError)){
            res.status(200).send({'visitid':visitId,'wlsend':false}).end()
        }else{
            res.sendStatus(505).end()
        }
    })
})

app.post('/updateappointment', bodyParser.urlencoded({extended:true}), (req,res,next)=>{
    console.log(req.body)
    updateappointment(req.body).then(()=>{
        res.sendStatus(200).end()
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

app.post('/insertupdateworklistorthanc', bodyParser.urlencoded({extended:true}), (req,res,next)=>{
    console.log(req.body)
    insertupdateworklistorthanc(req.body).then(()=>{
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
TODO: change report to reportdelta - longtext
*/