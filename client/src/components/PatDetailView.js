import { useState, useRef } from "react"
import PatientRegUploader from "./registeration/PatientRegUploader"
import PatientRegPayment from "./registeration/PatientRegPayment"
import {differenceInCalendarYears, differenceInCalendarMonths, differenceInCalendarDays, format, toDate} from 'date-fns'
import { DialogTitle, DialogActions, Card, CardContent, Accordion, AccordionDetails, AccordionSummary, Box, Button, Backdrop, CircularProgress, IconButton, List, ListItem, ListItemText, TextField, Toolbar, Typography, Modal, Dialog } from "@mui/material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import WordEditorQuill from "./editor/WordEditorQuill";
import { BasicGridAsTable,BasicGridBodyRow,BasicGridRowItem } from "./editor/BasicGridTable"
import ScanStatusListMenu from "./editor/ScanStatusListMenu";
import { useQuery, useMutation, useQueryClient} from "@tanstack/react-query"
import {useFormik} from 'formik'
import { array, number, object, string } from 'yup'
import axios from "axios"
import EditAppointmentCal from "./EditAppointmentCal"
import { purple } from "@mui/material/colors"

export default function PatDetailView({oldPatDetail, setIsDetailViewing, serviceList, discounters,
    selInv, setCurEvents, getAppts, setListSelectedServices
}){
    const [expanded, setExpanded] = useState('documentAcc')
    const [openEditAppointmentModal, setOpenEditAppointmentModal] = useState(false)
    const [openReportCreatorWordEditorModal, setOpenReportCreatorWordEditorModal] = useState(false)
    const [selResultForReporting, setSelResultForReporting] = useState({})
    const quillRef = useRef()
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
    //get age out of dob
    function getAgeAsObject(dob){
        var res = {age_yrs:'', age_mns:'',age_dys:''}
        const year = differenceInCalendarYears(Date.now(),Date.parse(dob))
        if (year >= 5) return {...res,age_yrs:`${year}`}
        const month = differenceInCalendarMonths(Date.now(), Date.parse(dob))
        if (month >= 12){
            return {...res,age_yrs:`${Math.floor(month/12)}`, age_mns:`${month%12}`}  
        } 
        if (month<12 && month>=1) return {...res, age_mns:`${month}`} 
        const day = differenceInCalendarDays(Date.now(), Date.parse(dob)) 
        if (month <1) return {...res,age_dys:`${day}`} 
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
    //mutation call to update the appointment
    const mutupdateappt = useMutation({
        mutationKey:['update_appointment'],
        mutationFn: (updatedapptdata)=>(
            axios.post('http://localhost:8080/updateappointment',updatedapptdata,{headers:{"Content-Type":"application/x-www-form-urlencoded"}})),
        onSuccess: ()=>{
            queryClient.invalidateQueries({queryKey:['patDetail', oldPatDetail.visitid]})
        }
    })

    //mutation call to change the status of the report
    const mutupdatereportstatus = useMutation({
        mutationKey:['update_report_status'],
        mutationFn: (updatereportstatus)=>(
            axios.post('http://localhost:8080/updatereportstatus',updatereportstatus,
                {headers:{"Content-Type":"application/x-www-form-urlencoded"}})
            ),
        onSuccess: (data,variables,context)=>{  
            queryClient.invalidateQueries({queryKey:['get_results_with_status']})
            if(variables.reportstatus==='report_verified'){
                queryClient.invalidateQueries({queryKey:['patDetail', oldPatDetail.visitid]})
            }
            },
        onSettled: ()=>{
            mutupdatereportstatus.reset()
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
    //handle Edit appointment modal opening and closing
    function handleOnCloseEditAppt(){
        setOpenEditAppointmentModal(false)
    }
    const ageAsObject = getAgeAsObject(patDetail.dob)
    const initialValues = {
        firstname:patDetail.firstname,
        lastname:patDetail.lastname,
        sex:patDetail.sex,
        //mobileno:patDetail.mobileno,
        age_yrs:ageAsObject.age_yrs,
        age_mns:ageAsObject.age_mns,
        age_dys:ageAsObject.age_dys,
        selservices : patDetail.services
    }
    //formik setup
    const formik = useFormik({
        initialValues :{...initialValues},
        validationSchema : object({
            firstname: string().required("Required"),
            lastname: string().required("Required"),
            sex: string().required("Required"),
            mobileno: string().matches(new RegExp('^[0-9]+$')).required("Required"),
            age_yrs: number().positive().integer().test((val, ctx)=>{
                var {age_dys, age_mns} = ctx.parent
                if(!(age_dys || age_mns)) return val!=null
                return true
            }),
            age_mns: number().positive().integer().test((val, ctx)=>{
                var {age_yrs, age_dys} = ctx.parent
                if(!(age_yrs || age_dys)) return val!=null
                return true
            }),
            age_dys: number().positive().integer().test((val, ctx)=>{
                var {age_yrs, age_mns} = ctx.parent
                if(!(age_yrs || age_mns)) return val!=null
                return true
            }),
            selservices : array().min(1)
        }),
        validateOnChange : true,
        })
    function EditAppointmentModal (){
        const invSchedTypeList = [
            {title:'MRI', type:'cal', scannerIsReporter:false, reporttype:'duration'},
            {title:'CT', type:'flow', scannerIsReporter:false, reporttype:'duration'},
            {title:'X-RAY', type:'flow', scannerIsReporter:false, reporttype:'duration'},
            {title:'ULTRASOUND', type:'flow', scannerIsReporter:true, reporttype:'point'},
            {title:'ECHO', type:'flow', scannerIsReporter:true, reporttype:'point'},
        ]
        var localSelInv = {}
        for (var inv of invSchedTypeList){
            if(inv.title===patDetail.services[0].category){
                localSelInv = inv
                break
            }
        }
        const localCurEvents = {
            start: toDate(patDetail.scheduledatetime_start),
            end : toDate(patDetail.scheduledatetime_end),
            editable : true,
            backgroundColor: purple[800],
            borderColor: purple[800],
            extendedProps: {
                calView: localSelInv.type === 'cal'
            },
        }
        return <><Modal open={openEditAppointmentModal} onClose={()=>{setOpenEditAppointmentModal(false)}}>
            <Box sx={{p:2,boxShadow:24,bgcolor:'background.paper',position:'absolute', top:'2%', left:'5%'}}>
                <EditAppointmentCal mutupdateappt={mutupdateappt} formik={formik} handleOnCloseEditAppt={handleOnCloseEditAppt}
                    selInv={localSelInv} serviceList={serviceList} curEvents={localCurEvents} setCurEvents={setCurEvents}
                    getAppts={getAppts} listSelectedServices={patDetail.services} visitId={patDetail.visitid} patientId={patDetail.patientid} 
                    setListSelectedServices={setListSelectedServices}/>
            </Box>
        </Modal></>
    }
    const ReportCreatorWordEditorModal = ({handleSaveClick, result})=>{
        const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

        function handleYesNoClick(status){
            if(status){
                handleSaveClick('verify', result)
                setSelResultForReporting({})
                setOpenReportCreatorWordEditorModal(false)
            }
            setOpenConfirmDialog(false)
        }
        
        
        return <>
            <Modal
                    open={openReportCreatorWordEditorModal}
                    onClose={()=>{}}
            >
                <Box sx={{p:2,boxShadow:24,bgcolor:'background.paper',position:'absolute', top:'2%', left:'20%', width:'55%', maxWidth:'60%'}}>
                    <Box sx={{display:'flex', flexDirection:'column',justifyContent:'start'}}
                    >
                        <WordEditorQuill outerRef={quillRef} height={500} defaultValue={result.reportdelta?JSON.parse(result.reportdelta):{}}/>
                        <Box sx={{display:'flex', justifyContent:'space-between', p:2}}>
                            <Button color="success" variant="contained" onClick={()=>{
                                setOpenConfirmDialog(true)
                            }}>Save and Verify</Button>
                            <Button color="secondary" variant="contained" onClick={()=>{
                                handleSaveClick('draft', result)
                                setSelResultForReporting({})
                                setOpenReportCreatorWordEditorModal(false)
                            }}>Save as Draft</Button>
                            <Button color="error" variant="contained" onClick={()=>{
                                setSelResultForReporting({})
                                setOpenReportCreatorWordEditorModal(false)
                            }}>Cancel</Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
                <Dialog open={openConfirmDialog} onClose={()=>{setOpenConfirmDialog(false)}}>
                    <DialogTitle sx={{padding:4}}>Are you sure you want to continue?</DialogTitle>
                    <DialogActions>
                        <Button autoFocus variant='contained' color={'success'} 
                            onClick={()=>{handleYesNoClick(true)}}
                        >Yes</Button>
                        <Button variant='contained' color={'error'} 
                            onClick={()=>{handleYesNoClick(false)}}
                        >No</Button>
                    </DialogActions>
                </Dialog>
        </> 
    }

    const ReportWithStatusButtonModal = ({apptDetail, resultWithStatus})=>{
        function handleSaveClick(type,result){
            if(type==='verify'){
                mutupdatereportstatus.mutate({
                    visitid:result.visitid,
                    serviceid:result.serviceid,
                    reportstatus:'report_verified',
                    reportdeltaops: (quillRef.current.getContents()&&quillRef.current.getContents().ops) ? quillRef.current.getContents().ops : []
                })
            }else if(type==='draft'){
                console.log(quillRef.current.getContents().ops)
                mutupdatereportstatus.mutate({
                    visitid:result.visitid,
                    serviceid:result.serviceid,
                    reportstatus:'report_drafted',
                    reportdeltaops: (quillRef.current.getContents()&&quillRef.current.getContents().ops) ? quillRef.current.getContents().ops : []
                })
            }
        }
        return <>
            {apptDetail.serviceids.map((selServiceid)=>{
            for(var result of resultWithStatus){
                if(result.serviceid===selServiceid && result.visitid===apptDetail.visitid){
                    var reportApplier = ''
                    switch (result.reportstatus) {
                        case 'report_pending':
                            reportApplier = 'Create'
                            break;
                        case 'report_drafted':
                            reportApplier = 'Edit'
                            break;
                        case 'report_verified':
                            reportApplier = 'View'
                            break;
                        default:
                            break;
                    }
                    return <>
                        {(mutupdatereportstatus.isPending && 
                            mutupdatereportstatus.variables.serviceid === result.serviceid && 
                            mutupdatereportstatus.variables.visitid === result.visitid ) ?
                            <Box>
                                <CircularProgress size={20}/>
                                <Typography variant="body1" color="primary">Uploading... </Typography>
                                </Box> : 
                            <Button variant={'text'}
                            onClick={()=>{
                                setSelResultForReporting(result)
                                setOpenReportCreatorWordEditorModal(true)
                            }}
                            >{reportApplier} ({result.servicename})</Button> }
                        
                    </> 
                }
            }
        })}
        <ReportCreatorWordEditorModal result={selResultForReporting} handleSaveClick={handleSaveClick}/>
        </>
    }

    const GridShowScanReportStatus = ({apptDetail}) =>{
        var selHeader = ['Visit info','Scan Status','Report']
        return <BasicGridAsTable columnHeaderList={selHeader}>
                <BasicGridBodyRow>
                        <BasicGridRowItem><Card elevation={0}>
                            <CardContent>
                                {apptDetail.servicenames&&apptDetail.servicenames.map((servicename)=>{
                                    return <Typography variant='body1' align="center" sx={{p:1}}>{servicename}</Typography>
                                    })}
                            </CardContent>    
                            </Card></BasicGridRowItem>
                        <BasicGridRowItem>
                            <ScanStatusListMenu initialSelectedOption={apptDetail.scanstatus} selVisitid={apptDetail.visitid}/>
                        </BasicGridRowItem> 
                            <BasicGridRowItem>
                            <ReportWithStatusButtonModal apptDetail={apptDetail} resultWithStatus={apptDetail.reportStatus?apptDetail.reportStatus:[]}/>
                            </BasicGridRowItem>
                    </BasicGridBodyRow>
            </BasicGridAsTable>
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
            <Button variant="contained" onClick={()=>{setOpenEditAppointmentModal(true)}}>Edit Appointment</Button>
        </Box>
        <Box>
            {/* Accordion for service lists */}
            <Accordion expanded={expanded === 'serviceList'} onChange={handleAccChange('serviceList')} sx={{m:2}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="serviceList">
                    <Typography component='span'>Service Status</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {patDetail.services.length!==0
                        ?<GridShowScanReportStatus apptDetail={patDetail}/>
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
        <EditAppointmentModal/>
    </Box>
}