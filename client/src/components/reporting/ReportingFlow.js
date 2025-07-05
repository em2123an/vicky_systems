import { Typography, Card, Button, CardContent,
    Box, Accordion, AccordionSummary, AccordionDetails, Link, 
    Modal, Dialog, DialogTitle, DialogActions, CircularProgress } from "@mui/material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { BasicGridAsTable, BasicGridBodyRow, BasicGridRowItem } from "../minicomponents/BasicGridTable";
import { useState, useRef, useCallback, useMemo} from "react";
import {differenceInCalendarYears, differenceInCalendarMonths, differenceInCalendarDays, 
    format, isSameDay, isAfter, startOfYesterday, subWeeks, subMonths, subYears, startOfToday, isEqual} from 'date-fns'
import ImageViewerModal from "../minicomponents/ImageViewerModal";
import ScanStatusListMenu from "../minicomponents/ScanStatusListMenu";
import {LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFnsV3'
import WordEditorQuill from "../minicomponents/WordEditorQuill";
import {useQuery, useQueryClient, useMutation} from '@tanstack/react-query'
import axios from 'axios'

export default function ReportingFlow({selInv, setCurEvents=()=>{}, setIsRegistering=()=>{}, setIsDetailViewing=()=>{}, appts_unfiltered=[]}) {
    const [expanded, setExpanded] = useState('report_pending')
    const [selSchedDate, setSelSchedDate] = useState(startOfToday()) 
    const [openReportCreatorWordEditorModal, setOpenReportCreatorWordEditorModal] = useState(false)
    const [selResultForReporting, setSelResultForReporting] = useState({})
    const quillRef = useRef()
    const handleOpenImageRefer = useRef()
    const queryClient = useQueryClient()

    const simpleSelectTransform = useCallback((response)=>(response.data),[])
    //get reports and status of report
    const {isPending: isResultWithStatusLoading, isError: isResultWithStatusError, 
        isSuccess: isResultWithStatusSuccess, data:resultWithStatus} = useQuery(
        {queryKey:['get_results_with_status', selInv.title], 
        queryFn: ()=>(axios.get('http://localhost:8080/getresultswithstatus',{
            params:{
                selInv: selInv.title,
            }
        })),
        select : simpleSelectTransform,
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
                queryClient.invalidateQueries({queryKey:['get_appointments', selInv.title]})
            }
            },
        onSettled: ()=>{
            mutupdatereportstatus.reset()
        }
    })

    const [appts_pending,appts_drafted,appts_verified] = useMemo(()=>{
        //filtering for the selected date without requiring a network
        //TODO: check if it is better to make a API Call
        let appts_pending = []
        let appts_drafted = [] 
        let appts_verified = []
        console.log(appts_unfiltered)
        appts_unfiltered.forEach((appts_unf)=>{
            const appt = appts_unf.extendedProps
            //if(isSameWeek(Date.parse(appt.createdat, selSchedDate))){}
            //uses specified date including today
            //works for Ultrasound and echo
            if(selInv.reporttype === 'point'){
                if(isSameDay(Date.parse(appt.createdat), selSchedDate)){
                    let allDraftTrue = true
                    let allVerifiedTrue = true
                    for(let rep of appt.reportstatuses){
                        if(rep === 'report_pending'){
                            //if pending, go to pending list 
                            //appts_pending = [...appts_pending, appt]
                            appts_pending.push(appt)
                            allDraftTrue = false
                            allVerifiedTrue = false
                            break;
                        }
                        if(rep ==='report_drafted'){
                            allVerifiedTrue = false
                        }
                    }
                    if(allVerifiedTrue) {allDraftTrue = false}
                    if(allDraftTrue){allVerifiedTrue=false}
                    if(allDraftTrue){
                        //appts_drafted = [...appts_drafted, appt]
                        appts_drafted.push(appt)
                    }
                    if(allVerifiedTrue){
                        //appts_verified = [...appts_verified, appt]
                        appts_verified.push(appt)
                    }
                }
            } else if (selInv.reporttype === 'duration'){
                //start running from the selSchedDate
                if(isAfter(Date.parse(appt.createdat), selSchedDate)){
                    var allDraftTrue = true
                    var allVerifiedTrue = true
                    for(var rep of appt.reportstatuses){
                        if(rep === 'report_pending'){
                            //if pending, go to pending list 
                            //appts_pending = [...appts_pending, appt]
                            appts_pending.push(appt)
                            allDraftTrue = false
                            allVerifiedTrue = false
                            break;
                        }
                        if(rep ==='report_drafted'){
                            allVerifiedTrue = false
                        }
                    }
                    if(allVerifiedTrue) {allDraftTrue = false}
                    if(allDraftTrue){allVerifiedTrue=false}
                    if(allDraftTrue){
                        appts_drafted.push(appt)
                    }
                    if(allVerifiedTrue){
                        appts_verified.push(appt)
                    }
                }
            }
        })
        return [appts_pending,appts_drafted,appts_verified]
    },[appts_unfiltered,selInv,selSchedDate])
    
    //view for today and specified date
    function ViewForTodaySpecifiedDate({selSchedDate,setSelSchedDate}){
        return <Box display={'flex'} flexDirection={'row'}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker value={selSchedDate} onChange={(newValue)=>{setSelSchedDate(newValue)}}/>
                    </LocalizationProvider>
                    <Button variant="outlined" onClick={()=>{setSelSchedDate(startOfToday())}}>Today</Button>
                </Box>
    }

    //view for duration
    function ViewForDurationTodayYesterday({selSchedDate,setSelSchedDate}){
        const strOfTdy = startOfToday()
        const strOfYest = startOfYesterday()
        const subweekone = subWeeks(format(Date.now(),'yyyy-MM-dd'),1)
        const submonthone = subMonths(format(Date.now(),'yyyy-MM-dd'),1)
        const subyearone = subYears(format(Date.now(),'yyyy-MM-dd'),1)
        return <Box width={1} display={'flex'} flexDirection={'row'} justifyContent={'end'} >
                    {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Typography variant="body1">From</Typography>
                        <DatePicker value={selSchedDate} onChange={(newValue)=>{setSelSchedDate(newValue)}}/>
                        <Typography variant="body1">To</Typography>
                        <DatePicker value={selSchedDate} onChange={(newValue)=>{setSelSchedDate(newValue)}}/>
                    </LocalizationProvider> */}
                    <Button variant={isEqual(selSchedDate,strOfTdy)?'contained':'outlined'} onClick={()=>{setSelSchedDate(strOfTdy)}}
                        >Today</Button>
                    <Button variant={isEqual(selSchedDate,strOfYest)?'contained':'outlined'} onClick={()=>{setSelSchedDate(strOfYest)}}
                        >Yesterday</Button>
                    <Button variant={isEqual(selSchedDate,subweekone)?'contained':'outlined'} onClick={()=>{setSelSchedDate(subweekone)}}
                        >Week</Button>
                    <Button variant={isEqual(selSchedDate,submonthone)?'contained':'outlined'} onClick={()=>{setSelSchedDate(submonthone)}}
                        >Month</Button>
                    <Button variant={isEqual(selSchedDate,subyearone)?'contained':'outlined'} onClick={()=>{setSelSchedDate(subyearone)}}
                        >Year</Button>
                </Box>
    }

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
    //to open the pdf in a new tab
    const openNewPDFTab = useCallback((isLocalLoad, filePath, file)=>{
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
    },[])

    const handleImageClick = useCallback((e)=>{
        const imagePDFSrc = e.currentTarget.dataset.imagepdfsrc;
        const handle =handleOpenImageRefer.current
        handle(imagePDFSrc)
    },[handleOpenImageRefer])

    const handlePDFClick = useCallback((value)=>()=>{
        openNewPDFTab(false,value.filePath, value.file)
    },[openNewPDFTab])

    const handlViewDetailClick = useCallback((apptDetail)=>()=>{
        setIsRegistering(false)
        setIsDetailViewing(true)
        setCurEvents({...apptDetail})
    },[setIsRegistering, setIsDetailViewing, setCurEvents])

    //Report creating word editor
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
        const selHeader = ['Patient info', 'Visit info', 'Documents','Scan Status','Report']
        
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
                                            <Button size="small" onClick={handlViewDetailClick(apptDetail)}>View Detail</Button>
                                        </Box>
                                </CardContent>    
                            </Card></BasicGridRowItem>
                        <BasicGridRowItem>{checkForFile(apptDetail.fileuploads).length!==0 && 
                            <>
                            {checkForFile(apptDetail.fileuploads).map((value,index)=>{
                                var imagePDFSrc = value.filePath?value.filePath:''
                                return <>
                                    {value.mimetype.includes('application/pdf')?
                                        <Link component={'button'}  rel='noopener noreferrer' target='_blank'
                                            onClick={handlePDFClick(value)}>
                                            View {value.documentUploadType}
                                        </Link>
                                        : value.mimetype.includes('image')?
                                        <>
                                            <Button variant="text" data-imagepdfsrc={imagePDFSrc}
                                                onClick={handleImageClick}>
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
                        <BasicGridRowItem>
                                {(apptDetail.serviceids && isResultWithStatusSuccess) && 
                                    <ReportWithStatusButtonModal apptDetail={apptDetail} resultWithStatus={resultWithStatus?resultWithStatus:[]}/>
                                }
                            </BasicGridRowItem>
                    </BasicGridBodyRow>
                })}
            </BasicGridAsTable>
    }

    return <Box>
        <Box display={'flex'} flexDirection={'row'} justifyContent={'space-around'} m={2}>
                {selInv.reporttype ==='point' ?
                    <ViewForTodaySpecifiedDate selSchedDate={selSchedDate} setSelSchedDate={setSelSchedDate}/>
                : selInv.reporttype ==='duration' &&
                    <ViewForDurationTodayYesterday selSchedDate={selSchedDate} setSelSchedDate={setSelSchedDate}/>
                }
        </Box>
        {/* accordions for report pending, report drafted, report verified; possilbly emergency */}
        <Accordion expanded={expanded === 'report_pending'} onChange={handleAccChange('report_pending')} sx={{m:2}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="report_pending">
                    <Typography component='span'>Report Pending {(appts_pending && appts_pending.length>0)&&`(${appts_pending.length})`}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {appts_pending && appts_pending.length!==0
                        ?<>
                            <GridShowAppts appts={appts_pending}/>
                        </>
                        :<Typography component={'span'}>No Report Pending</Typography>}
                </AccordionDetails>
        </Accordion>
        {/* For drafted reports */}
        <Accordion expanded={expanded === 'report_drafted'} onChange={handleAccChange('report_drafted')} sx={{m:2}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="report_drafted">
                    <Typography component='span'>Report Drafted {(appts_drafted && appts_drafted.length>0)&&`(${appts_drafted.length})`}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {appts_drafted && appts_drafted.length!==0
                        ? <>
                            <GridShowAppts appts={appts_drafted} />
                        </>
                        :<Typography component={'span'}>No Drafted Reports</Typography>}
                </AccordionDetails>
        </Accordion>
        {/* For verified reports */}
        <Accordion expanded={expanded === 'report_verified'} onChange={handleAccChange('report_verified')} sx={{m:2}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="report_verified">
                    <Typography component='span'>Verified Reports {(appts_verified && appts_verified.length>0)&&`(${appts_verified.length})`}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {appts_verified && appts_verified.length!==0
                        ? <>
                            <GridShowAppts appts={appts_verified}/>
                        </>
                        :<Typography component={'span'}>No Verified Reports</Typography>}
                </AccordionDetails>
        </Accordion>
        {/* Image viewing modal */}
        <ImageViewerModal handleOpenImageRef={handleOpenImageRefer} />
  </Box>
}
