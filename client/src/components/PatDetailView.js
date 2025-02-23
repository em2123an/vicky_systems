import { useState } from "react"
import PatientRegUploader from "./registeration/PatientRegUploader"
import PatientRegPayment from "./registeration/PatientRegPayment"
import {differenceInCalendarYears, differenceInCalendarMonths, differenceInCalendarDays, format} from 'date-fns'
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Backdrop, CircularProgress, IconButton, List, ListItem, ListItemText, TextField, Toolbar, Typography } from "@mui/material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteIcon from '@mui/icons-material/Delete'
import { useQuery, useMutation, useQueryClient} from "@tanstack/react-query"
import axios from "axios"

export default function PatDetailView({oldPatDetail, setIsDetailViewing, serviceList, discounters}){
    const [expanded, setExpanded] = useState('documentAcc')
    const queryClient = useQueryClient()

    const handleAccChange = (panel) =>(event, isExpanded) =>{
        setExpanded(isExpanded?panel:false);
    }
    //check for files or null
    function checkForFile(fileuploads){
        if(Boolean(fileuploads) && Boolean(fileuploads.files)){
            return fileuploads.files.map((file)=>({
                ...file,
                orgFilePath: file.filePath,
                filePath : `http://localhost:8080${file.filePath}`, 
                isLocalLoad:false}))
        }else{return []}
    }
    //get age out of dob
    function getAge(dob){
        const year = differenceInCalendarYears(Date.now(),Date.parse(dob))
        if (year >= 5) return `${year} Y`
        const month = differenceInCalendarMonths(Date.now(), Date.parse(dob))
        if (month >= 12){
            return `${Math.floor(month/12)} Y ${month%12} M`  
        } 
        if (month<12 && month>=1) return `${month} M`
        const day = differenceInCalendarDays(Date.now(), Date.parse(dob)) 
        if (month <1) return `${day} D`
    }
    //get appointment start and end time out scheduledatetime
    function getAppointment(startDT, endDT){
        const start = format(Date.parse(startDT), 'hh:mm aa')
        const end = format(Date.parse(endDT), 'hh:mm aa @ ccc, do MMM yyyy')
        return `${start} - ${end}`
    }
    //get selected services
    function selServiceGen(fullservices,selectedToBeIncluded){
        if(selectedToBeIncluded.length === 0){return []}
        else{
            return fullservices.filter((service)=>{
                var filt = false
                selectedToBeIncluded.forEach(selectedid => {
                    if(service.serviceid === selectedid){filt = true}
                });
                return filt
            })
        }
    }
    //get discounter object from discounter id
    function selDiscounterGen(fulldiscounters, selDiscounterid){
        for(let discounter of fulldiscounters){
            if(discounter.discounterid === selDiscounterid){return discounter}
        }
    }
    //get discountRecords from discountDetails(from db)
    function getDiscountRecordsFromDetail(fulldiscounters, fullservices, discountDetails){
        return discountDetails.map((discountDetail)=>{
            return {
                discounter: selDiscounterGen(fulldiscounters, discountDetail.discounterid),
                service: selServiceGen(fullservices,[discountDetail.serviceid])[0],
                discountPercent: discountDetail.discountpercent
            }
        })
    }
    //Get detail visit description; in mean time, use the old data
    //TODO: figure out how to use isError 
    const {isRefetching:isPatDetailLoading, isPending:isPatDetailLoadingFirst, isPlaceholderData, 
            isError:isPatDetailError, isSuccess:isPatDetailSuccess, 
            data:patDetail} = useQuery({
        queryKey: ['patDetail', oldPatDetail.visitid],
        queryFn: ()=>(axios.get(`http://localhost:8080/getapptdetails/${oldPatDetail.visitid}`)),
        select: (response)=>({
            ...response.data[0],
            services: selServiceGen(serviceList,response.data[0].serviceids),
            paymentRecords: response.data[0].paymentDetail?response.data[0].paymentDetail:[],
            discountRecords: response.data[0].discountDetail?getDiscountRecordsFromDetail(discounters, serviceList, response.data[0].discountDetail):[]
        }),
        placeholderData: (response)=>({data:[{
            ...oldPatDetail,
        }]}) 
    })
    //mutation call to upload files
    const mutupload = useMutation({
        mutationKey:['document_uploads',oldPatDetail.visitid],
        mutationFn: (newUpload)=>(
            axios.post('http://localhost:8080/postfileuploads',newUpload,
                {headers:{"Content-Type":"multipart/form-data"}})
            ),
        onSuccess: ()=>{
            queryClient.invalidateQueries({queryKey:['patDetail', oldPatDetail.visitid]})
        }
    })
    
    //mutation call to delete files
    const mutdeleteupload = useMutation({
        mutationKey:['document_delete_uploadedfile', oldPatDetail.visitid],
        mutationFn: (tobedeletedfile)=>(
            axios.post('http://localhost:8080/deleteuploadedfile',tobedeletedfile,
                {headers:{"Content-Type":"application/x-www-form-urlencoded"}})
            ),
        onSuccess: ()=>{
            queryClient.invalidateQueries({queryKey:['patDetail', oldPatDetail.visitid]})
        }
    })
    
    //mutation call to insert payment records
    const mutinsertpaymentrecord = useMutation({
        mutationKey:['insert_payment_records', oldPatDetail.visitid],
        mutationFn: (paymentRecords)=>(
            axios.post('http://localhost:8080/insertpaymentrecord',paymentRecords,
                {headers:{"Content-Type":"application/x-www-form-urlencoded"}})
            ),
        onSuccess: ()=>{
            queryClient.invalidateQueries({queryKey:['patDetail', oldPatDetail.visitid]})
        }
    })
    
    //mutation call to update discount records
    const mutupdatediscountrecords = useMutation({
        mutationKey:['update_discount_records', oldPatDetail.visitid],
        mutationFn: (discountRecords)=>(
            axios.post('http://localhost:8080/updatediscountrecords',discountRecords,
                {headers:{"Content-Type":"application/x-www-form-urlencoded"}})
            ),
        onSuccess: ()=>{
            queryClient.invalidateQueries({queryKey:['patDetail', oldPatDetail.visitid]})
        }
    })

    //handle upload click on patientRegUploader
    function handleUploadClick(documentUploadType, event){
        //file list object used to upload files on server
        const formData = new FormData()
        formData.append('visitid', patDetail.visitid)
        //formData.append('documentUploadType', documentUploadType)
        formData.append(documentUploadType, event.target.files[0])
        mutupload.mutate(formData)            
    }
    //handle delete file click on patientRegUploader
    //TODO:delete request to server
    function handleFileDeleteClick(fileindex){
        const listOfFiles = checkForFile(patDetail.fileuploads)
        //check listOfFiles is not empty and it is not out of index
        if(Boolean(listOfFiles)&&Boolean(fileindex<=(listOfFiles.length-1))){
            mutdeleteupload.mutate({
                visitid: patDetail.visitid,
                fileToBeDeleted: listOfFiles[fileindex]
            })
        }
    }
    //handle payment records
    //TODO: add new payment records
    function handlePaymentRecords(paymentOption, amount, remark){
        mutinsertpaymentrecord.mutate({
            visitid: patDetail.visitid,
            paymenttype: paymentOption,
            paymentamount: amount,
            remark: remark
        })
    }
    //handle discount records
    //TODO: to get the combination of new and old discounts and update them
    function handleDiscountRecords(discountRecords){
        mutupdatediscountrecords.mutate({
            visitid: patDetail.visitid,
            discountRecords: discountRecords.map((discountRecord)=>({
                    discounterid: discountRecord.discounter.discounterid,
                    discountpercent: discountRecord.discountPercent,
                    serviceid: discountRecord.service.serviceid 
                })),
        })
    }
    //list of file uploaded to be displayed
    //TODO: query to get files or with optimistic updata
    return <Box sx={{paddingX:2, paddingY:2}}>
        <Toolbar>
            <Button sx={{justifyContent:'start'}} variant="contained" onClick={()=>(setIsDetailViewing(false))}>Back</Button>
        </Toolbar>
        <Box marginX={3} marginY={1}  display={'flex'} flexWrap={'wrap'} justifyContent={'space-between'}>
            <TextField label='Patient Name' variant="standard" 
                slotProps={{input:{readOnly:true}}}
                value={`${patDetail.firstname} ${patDetail.lastname}`} />
            <TextField label='Age' variant="standard" 
                slotProps={{input:{readOnly:true}}}
                value={getAge(patDetail.dob)} />
            <TextField label='Sex' variant="standard" 
                slotProps={{input:{readOnly:true}}}
                value={`${patDetail.sex}`} />
            {(patDetail.scheduledatetime_end && patDetail.scheduledatetime_start) &&
                <TextField label='Appointment Date' variant="standard" 
                    slotProps={{input:{readOnly:true}}}
                    sx={{flexGrow:2}}
                    value={getAppointment(patDetail.scheduledatetime_start, patDetail.scheduledatetime_end)}/>
            }
        </Box>
        <Box>
            {/* Accordion for service lists */}
            <Accordion expanded={expanded === 'serviceList'} onChange={handleAccChange('serviceList')} sx={{m:2}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="serviceList">
                    <Typography component='span'>Service Status</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {patDetail.services.length!==0
                        ?<List>
                            {patDetail.services.map((service,index)=>(
                                <ListItem key={index} secondaryAction={
                                        <IconButton edge='end'><DeleteIcon/></IconButton>
                                    }>
                                    <ListItemText primary={service.servicename}/>
                                    <Typography component={'span'} sx={{marginRight:8}}>Price : {service.price}</Typography>
                                </ListItem>
                            ))}
                        </List>
                        :<Typography component={'span'}>No Services Selected</Typography>}
                </AccordionDetails>
            </Accordion>
            {/* Accordion for uploaded documents */}
            <Accordion sx={{m:2}} expanded={expanded === 'documentAcc'} onChange={handleAccChange('documentAcc')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="documents">
                    <Typography component='span'>Documents</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{marginRight:2}}>
                    {/* to see documents */}
                    <Backdrop
                            sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                            open={
                                mutupload.isPending||(mutupload.isSuccess&&isPatDetailLoading) //for uploading
                                || mutdeleteupload.isPending || (mutdeleteupload.isSuccess&&isPatDetailLoading) //for deleting
                            }
                            onClick={()=>{}}>
                        <CircularProgress/>
                    </Backdrop>
                    <PatientRegUploader fullwidth={true} handleUploadClick={handleUploadClick} 
                        handleFileDeleteClick={handleFileDeleteClick} fileUploaded={checkForFile(patDetail.fileuploads)}/>
                </AccordionDetails>
            </Accordion>
            {/* Accordion for payment details */}
            <Accordion sx={{m:2}} expanded={expanded === 'paymentAcc'} onChange={handleAccChange('paymentAcc')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="paymentAcc">
                    <Typography component='span'>Payment Details</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{marginRight:2}}>
                    {/* to handle payment from detail view */}
                    {isPatDetailLoadingFirst ||
                        mutupdatediscountrecords.isPending || (mutupdatediscountrecords.isSuccess&&isPatDetailLoading)||
                        mutinsertpaymentrecord.isPending || (mutinsertpaymentrecord.isSuccess&&isPatDetailLoading)
                        ?
                        <CircularProgress/>    
                    : isPatDetailSuccess ?
                    <PatientRegPayment 
                        discounters={discounters} listSelectedServices={patDetail.services} 
                        paymentRecords={patDetail.paymentRecords} discountRecords={patDetail.discountRecords}
                        handlePaymentRecords={handlePaymentRecords} handleDiscountRecords={handleDiscountRecords}/>
                    : <Box>
                        {/* figure out how to send error messages */}
                        <PatientRegPayment listSelectedServices={patDetail.services} paymentRecords={[]} discountRecords={[]}/>
                    </Box> 
                    }
                </AccordionDetails>
            </Accordion>
        </Box>
    </Box>
}