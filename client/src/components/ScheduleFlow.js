import { Typography, Paper, Card, Button, IconButton, CardContent, CardActions, Drawer, List, ListItemButton, ListItemText, Toolbar, ListItem, Box, Accordion, AccordionSummary, AccordionDetails, Link, Modal, Dialog, DialogTitle, DialogActions, CircularProgress } from "@mui/material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Grid from "@mui/material/Grid2";
import { styled } from '@mui/material/styles';
import { useState, useCallback, useRef, useEffect } from "react";
import {differenceInCalendarYears, differenceInCalendarMonths, differenceInCalendarDays, format, toDate, isSameDay} from 'date-fns'
import ImageViewerModal from "./editor/ImageViewerModal";
import ScanStatusListMenu from "./editor/ScanStatusListMenu";
import {LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFnsV3'
import WordEditorQuill from "./editor/WordEditorQuill";
import {useQuery, useQueryClient, useMutation} from '@tanstack/react-query'
import axios from 'axios'


function BasicGridAsTable({columnHeaderList, children}) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container >
        {/* Table headers */}
        <Grid container size={12} 
            sx={{ '--Grid-borderWidth': '1px',
                borderBottom: 'var(--Grid-borderWidth) solid',
                borderColor: 'divider'}}
        >
            {columnHeaderList.map((column)=>{
                return <Grid size='grow'>
                    <Typography sx={{width:'1',textAlign:'center'}} variant="body1">{column}</Typography>
                </Grid>
            })}
        </Grid>
        {/* Table body */}
        <Grid container size={12}>
            {/* Each Table Row */}
            {children}
        </Grid>
      </Grid>
    </Box>
  );
}

function BasicGridBodyRow({children}){
    return <Grid container size={12} justifyContent={'center'} 
            alignItems={'center'}
            sx={{ '--Grid-borderWidth': '1px',
                borderBottom: 'var(--Grid-borderWidth) solid',
                borderColor: 'divider'}}>
        {children}
    </Grid>
}

function BasicGridRowItem({children}){
    return <Grid size={'grow'}>
        {children}
    </Grid>
}


export default function ScheduleFlow({selInv, setCurEvents=()=>{}, setIsRegistering=()=>{}, setIsDetailViewing=()=>{}, appts_unfiltered=[]}) {
    const [expanded, setExpanded] = useState('scan_pending')
    const [selSchedDate, setSelSchedDate] = useState(toDate(Date.now()))
    const [openReportCreatorWordEditorModal, setOpenReportCreatorWordEditorModal] = useState(false)
    const [selResultForReporting, setSelResultForReporting] = useState({})
    const quillRef = useRef()
    const handleOpenImageRefer = useRef()
    const queryClient = useQueryClient()

    //get reports and status of report
    const {isPending: isResultWithStatusLoading, isError: isResultWithStatusError, 
        isSuccess: isResultWithStatusSuccess, data:resultWithStatus} = useQuery(
        {queryKey:['get_results_with_status', selInv.title], 
        queryFn: ()=>(axios.get('http://localhost:8080/getresultswithstatus',{
            params:{
                selInv: selInv.title,
            }
        })),
        select : (response)=>(response.data),
        })
    
    //filtering for the selected date without requiring a network
    //TODO: check if it is better to make a API Call
    var appts_pending = []
    var appts_cancelled = []
    var appts_incomplete = []
    var appts_completed = []
    appts_unfiltered.forEach((appts_unf)=>{
        const appt = appts_unf.extendedProps
        if(isSameDay(Date.parse(appt.createdat), selSchedDate)){
            switch (appt.scanstatus) {
                case 'scan_pending':
                    appts_pending = [...appts_pending, appt]
                    break;
                case 'scan_completed':
                    appts_completed = [...appts_completed, appt]
                    break;
                case 'scan_incomplete':
                    appts_incomplete = [...appts_incomplete, appt]
                    break;
                case 'scan_cancelled':
                    appts_cancelled = [...appts_cancelled, appt]
                    break;
                default:
                    break;
            }
            
        }
    })

    
    // const appts = appts_unfiltered.map((appts_unf)=>{
    //     const appt = appts_unf.extendedProps
    //     if(isSameDay(Date.parse(appt.createdat), selSchedDate)){
    //         return appt
    //     }
    // })
    //const appts = appts_date_unfiltered.filter((appt)=>(isSameDay(Date.parse(appt.createdat), selSchedDate)))

    const handleAccChange = (panel) =>(event, isExpanded) =>{
        setExpanded(isExpanded?panel:false);
    }

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
                queryClient.invalidateQueries({queryKey:['get_appointments', selInv.title]})
            }
            },
        onSettled: ()=>{
            mutupdatereportstatus.reset()
        }
    })

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
    function openNewPDFTab(isLocalLoad, filePath, file){
        try {
            if(!isLocalLoad){
                //filePath is base64encoded
                if(!window.open(filePath,'_blank','noopener noreferrer')){throw new Error()}
            }
            else{
                //using file
                const urlForFile = window.URL.createObjectURL(file)
                if(!window.open(urlForFile,'_blank','noopener noreferrer')){
                    window.URL.revokeObjectURL(urlForFile)
                    throw new Error()
                }
                window.URL.revokeObjectURL(urlForFile)
            }
        } catch (error) {
            console.log(error)
            return
        }
    }
    //for detail viewing if needed
    function handleDetailClick(info){
        //click on events - to - see detail views
        setIsDetailViewing(true)
        setIsRegistering(false)
        setCurEvents({...info.event.extendedProps})
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

    const GridShowAppts = ({appts}) =>{
        var selHeader = []
        const header = ['Patient info', 'Visit info', 'Documents','Scan Status']
        const headerForScannerIsReporter = [...header, 'Report']
        if(selInv && selInv.scannerIsReporter){
            selHeader = headerForScannerIsReporter
        }else{
            selHeader = header
        }
        return <BasicGridAsTable columnHeaderList={selHeader}>
                {appts.map((apptDetail)=>{
                    return <BasicGridBodyRow>
                        <BasicGridRowItem><Card elevation={0} >
                                <CardContent>
                                    <Typography variant="h6" >{apptDetail.firstname} {apptDetail.lastname}</Typography>
                                    <Typography variant="body2" sx={{color:'text.secondary', ml:1}}>Age: {getAge(apptDetail.dob)}</Typography>
                                    <Typography variant="body2" sx={{color:'text.secondary', ml:1}}>Sex: {apptDetail.sex}</Typography>
                                </CardContent>
                            </Card></BasicGridRowItem>
                        <BasicGridRowItem><Card elevation={0}>
                                <CardContent>
                                        {apptDetail.servicenames&&apptDetail.servicenames.map((servicename)=>{
                                            return <Typography variant='body1'>{servicename}</Typography>
                                        })}
                                        <Box sx={{display:'flex', flexDirection:'row', justifyContent:'center'}}>
                                            <Button size="small" onClick={()=>{
                                                    setIsRegistering(false)
                                                    setIsDetailViewing(true)
                                                    setCurEvents({...apptDetail})
                                                }}>View Detail</Button>
                                        </Box>
                                </CardContent>    
                            </Card></BasicGridRowItem>
                        <BasicGridRowItem>{checkForFile(apptDetail.fileuploads).length!==0 && 
                            <>
                            {checkForFile(apptDetail.fileuploads).map((value,index)=>{
                                var imagePDFSrc = value.filePath?value.filePath:''
                                return <>
                                    {value.mimetype.includes('application/pdf')?
                                        <Link component={'button'} onClick={()=>{openNewPDFTab(false,value.filePath, value.file)}} rel='noopener noreferrer' target='_blank'>
                                            View {value.documentUploadType}
                                        </Link>
                                        : value.mimetype.includes('image')?
                                        <>
                                            <Button variant="text" 
                                                onClick={()=>{
                                                    const handle =handleOpenImageRefer.current
                                                    handle(imagePDFSrc)
                                                }}>
                                                View {value.documentUploadType}</Button>
                                        </>:
                                        <Link rel='noopener noreferrer' target='_blank' href={''}>
                                        </Link>
                                    }
                                </>
                            })}</>}
                        </BasicGridRowItem>
                        <BasicGridRowItem>
                            <ScanStatusListMenu initialSelectedOption={apptDetail.scanstatus} selVisitid={apptDetail.visitid}/>
                        </BasicGridRowItem>
                        {(selInv && selInv.scannerIsReporter) && 
                            <BasicGridRowItem>
                                {(apptDetail.serviceids && isResultWithStatusSuccess) && 
                                    <ReportWithStatusButtonModal apptDetail={apptDetail} resultWithStatus={resultWithStatus?resultWithStatus:[]}/>
                                }
                            </BasicGridRowItem>}
                    </BasicGridBodyRow>
                })}
            </BasicGridAsTable>
    }

    return <Box>
        <Box display={'flex'} flexDirection={'row'} justifyContent={'space-around'} m={2}>
            <Button variant="contained" onClick={()=>{
                    setIsRegistering(true)
                    setIsDetailViewing(false)
                    setCurEvents({
                        extendedProps: {
                            calView: false
                        },
                    })
                }}>Make New Appointment</Button>
                <Box display={'flex'} flexDirection={'row'}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker value={selSchedDate} onChange={(newValue)=>{setSelSchedDate(newValue)}}/>
                    </LocalizationProvider>
                    <Button variant="outlined" onClick={()=>{setSelSchedDate(toDate(Date.now()))}}>Today</Button>
                </Box>
        </Box>
        {/* accordions for scan pending, scan complete, scan cancelled; possilbly emergency */}
        <Accordion expanded={expanded === 'scan_pending'} onChange={handleAccChange('scan_pending')} sx={{m:2}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="scan_pending">
                    <Typography component='span'>Scan Pending {(appts_pending && appts_pending.length>0)&&`(${appts_pending.length})`}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {appts_pending!==0
                        ?<>
                            <GridShowAppts appts={appts_pending}/>
                        </>
                        :<Typography component={'span'}>No Scan Pending</Typography>}
                </AccordionDetails>
        </Accordion>
        {/* For Scan Completed visits */}
        <Accordion expanded={expanded === 'scan_complete'} onChange={handleAccChange('scan_complete')} sx={{m:2}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="scan_complete">
                    <Typography component='span'>Scan Completed {(appts_completed && appts_completed.length>0)&&`(${appts_completed.length})`}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {appts_completed!==0
                        ? <>
                            <GridShowAppts appts={appts_completed} />
                        </>
                        :<Typography component={'span'}>No Complete Scans</Typography>}
                </AccordionDetails>
        </Accordion>
        {/* For Scan Incompleted visits */}
        <Accordion expanded={expanded === 'scan_incomplete'} onChange={handleAccChange('scan_incomplete')} sx={{m:2}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="scan_incomplete">
                    <Typography component='span'>Scan Incomplete {(appts_incomplete && appts_incomplete.length>0)&&`(${appts_incomplete.length})`}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {appts_incomplete!==0
                        ? <>
                            <GridShowAppts appts={appts_incomplete}/>
                        </>
                        :<Typography component={'span'}>No Complete Scans</Typography>}
                </AccordionDetails>
        </Accordion>
        {/* For Scan Cancelled visits */}
        <Accordion expanded={expanded === 'scan_cancelled'} onChange={handleAccChange('scan_cancelled')} sx={{m:2}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="scan_cancelled">
                    <Typography component='span'>Scan Cancelled {(appts_cancelled && appts_cancelled.length>0)&&`(${appts_cancelled.length})`}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {appts_cancelled!==0
                        ?<>
                            <GridShowAppts appts={appts_cancelled}/>
                        </>
                        :<Typography component={'span'}>No Cancelled Scans</Typography>}
                </AccordionDetails>
        </Accordion>
        {/* Image viewing modal */}
        {/*<ImageViewerModal/>*/}
        <ImageViewerModal handleOpenImageRef={handleOpenImageRefer} />
  </Box>
}
