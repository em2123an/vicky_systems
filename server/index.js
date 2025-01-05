const express = require('express')
const cors = require('cors')
const formidable = require('formidable')
const fs = require('fs')
const path = require('path')
const app = express()
//cors setup
app.use(cors())

app.post('/makeappointment',(req,res,next)=>{
    const form = new formidable.IncomingForm()
    form.parse(req,(err,fields,files)=>{
        if(err){
            next(err)
            return
        }
        fs.appendFile(path.join(__dirname,'/fileuploads/savedappointment.txt'),JSON.stringify(fields),(writeerr)=>next(writeerr))
        res.end()
    })
})
//trigerring a listen
app.listen(8080,()=>{
    console.log('Server is listening at 8080...')
})
