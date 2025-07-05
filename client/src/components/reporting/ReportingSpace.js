import { Typography, Card, Button, CardContent, CardActions,
    Box, Accordion, AccordionSummary, AccordionDetails, Link, 
    Modal, Dialog, DialogTitle, DialogActions, CircularProgress } from "@mui/material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { BasicGridAsTable, BasicGridBodyRow, BasicGridRowItem } from "./minicomponents/BasicGridTable";
import { useState, useRef, useCallback, useMemo} from "react";
import {differenceInCalendarYears, differenceInCalendarMonths, differenceInCalendarDays, 
    format, isSameDay, isAfter, startOfYesterday, subWeeks, subMonths, subYears, startOfToday, isEqual} from 'date-fns'
import ImageViewerModal from "./minicomponents/ImageViewerModal";
import {LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFnsV3'
import WordEditorQuill from "./minicomponents/WordEditorQuill";
import {useQuery, useQueryClient, useMutation} from '@tanstack/react-query'
import axios from 'axios'

export default function ReportingSpace({selInv}) {
    const [expanded, setExpanded] = useState('report_pending')
    const [selSchedDate, setSelSchedDate] = useState(startOfToday()) 
    const [openReportCreatorWordEditorModal, setOpenReportCreatorWordEditorModal] = useState(false)
    const [selResultForReporting, setSelResultForReporting] = useState({})
    const quillRef = useRef()
    const handleOpenImageRefer = useRef()
    const queryClient = useQueryClient()

    const selectForSearchResults = useCallback((response)=>(response.data),[])
    
    const {isLoading: isSearchResultsLoading, isError: isSearchResultsError, 
        isSuccess: isSearchResultsSuccess, data:searchResults, refetch:getResults} = useQuery(
        {queryKey:['get_archive_for_reporting', selSchedDate], 
        queryFn: ()=>(axios.get('http://localhost:8080/getarchivesforreporting',{
            params:{
                patientNameQuery:'',
                patientIdQuery:'',
                visitIdQuery:'',
                pageValue : '',
                startDate: format(selSchedDate,'yyyy-MM-dd'),//to set
                endDate: ''//not set
            }
        })),
        select : selectForSearchResults,
        })

    //mutation call to change the status of the report
    const mutupdatereportstatus = useMutation({
        mutationKey:['update_report_status'],
        mutationFn: (updatereportstatus)=>(
            axios.post('http://localhost:8080/updatereportstatus',updatereportstatus,
                {headers:{"Content-Type":"application/x-www-form-urlencoded"}})
            ),
        onSuccess: (data,variables,context)=>{  
            queryClient.invalidateQueries({queryKey:['get_archives_for_reporting']})
            if(variables.reportstatus==='report_verified'){
                queryClient.invalidateQueries({queryKey:['get_appointments', selInv.title]})
            }
            },
        onSettled: ()=>{
            mutupdatereportstatus.reset()
        }
    })

    function dicomdateToDate(dcmdate){
        const yyyy = `${dcmdate}`.slice(0,4)
        const mm = `${dcmdate}`.slice(4,6)
        const dd = `${dcmdate}`.slice(6)
        return Date.parse(`${yyyy}-${mm}-${dd}`)
    }

    const [appts_pending,appts_drafted,appts_verified] = useMemo(()=>{
        //filtering for the selected date without requiring a network
        //TODO: check if it is better to make a API Call
        let appts_pending = []
        let appts_drafted = [] 
        let appts_verified = []
        if(isSearchResultsSuccess && searchResults && searchResults.searchResult && searchResults.length !==0){
            searchResults.searchResult.forEach((appt)=>{
                //if(isSameWeek(Date.parse(appt.createdat, selSchedDate))){}
                //uses specified date including today
                //works for Ultrasound and echo
                //ratherthan created at; use studyDate
                //console.log('dtbt',dicomdateToDate(appt.studyDate))
                if(selInv.reporttype === 'point' && isSameDay(dicomdateToDate(appt.studyDate), selSchedDate)){
                    if(appt.reportstatuses){
                        let allDraftTrue = true
                        let allVerifiedTrue = true
                        for(let rep of appt.reportstatuses){
                            console.log(rep)
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
                    } else{
                        appts_pending.push(appt)
                    }
                } else if (selInv.reporttype === 'duration' && isAfter(dicomdateToDate(appt.studyDate), selSchedDate)){
                    //start running from the selSchedDate
                    if(appt.reportstatus){
                        switch (appt.reportstatus) {
                            case 'report_pending':
                                appts_pending.push(appt)
                                break;
                            case 'report_drafted':
                                appts_drafted.push(appt)
                                break;
                            case 'report_verified':
                                appts_verified.push(appt)
                                break;
                            default:
                                break;
                        }
                    } else {
                        appts_pending.push(appt)
                    }
                }
            })
        }
        return [appts_pending,appts_drafted,appts_verified]
    },[isSearchResultsSuccess,searchResults,selInv,selSchedDate])
    
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
    //dob in dicom string format yyyymmdd
    function getAge(dicomdob){
        if(!dicomdob) return ''
        const dob = dicomdob.replace(/^(\d{4})(\d{2})(\d{2})$/,'$1-$2-$3');
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
    //TODO: get study date and time
    //get appointment start and end time out scheduledatetime
    function getStudyDateTime(dicomdate, dicomtime){
        if(!dicomdate) return ''
        const fdate = dicomdate.replace(/^(\d{4})(\d{2})(\d{2})$/,'$1-$2-$3');
        let ftime = ''
        if(dicomtime){
            const [,hh,mm='00',ss='00',] = dicomtime.match(/^(\d{2})(\d{2})?(\d{2})?(?:\.(\d+))?$/)
            ftime = `T${hh}:${mm}:${ss}`
        }
        const fsdate = format(Date.parse(`${fdate}${ftime}`), 'ccc, do MMM yyyy @ hh:mm')
        return fsdate
    }
    //handle when view more is clicked for the visit
    function handleDicomImagePreview(e){
        const studyInstanceUID = e.currentTarget.dataset.studyinstanceuidsrc
        const DICOMWEB = "http://localhost:8042/dicom-web"
        //const authHeader = "Authorization: Basic" + btoa("orthanc:orthanc");
        const weasisCommand = `$dicom:rs --url "${DICOMWEB}" -r "studyUID=${studyInstanceUID}"`
        const weasisOpenURL = `weasis://?${encodeURIComponent(weasisCommand)}`
        //window.open(trialWeasis)
        window.location.href = weasisOpenURL;
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

    //Report creating word editor
    const ReportCreatorWordEditorModal = ({result})=>{
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

    const handleSaveClick = useCallback((type,result)=>{
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
    },[mutupdatereportstatus])

    const ReportWithStatusButtonModal = ({apptDetail})=>{
        let reportApplier = ''
        switch (apptDetail.reportstatus) {
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
        const result = {
            visitid: apptDetail.visitid, 
            serviceid: apptDetail.serviceid, 
            reportstatus: apptDetail.reportstatus, 
            assignedto: apptDetail.assignedto, 
            reportdelta: apptDetail.reportdelta
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
                    >{reportApplier} Report</Button> 
            }
            <ReportCreatorWordEditorModal result={selResultForReporting}/>
        </>
    }

    function scanStatusShower(scanstatus){
        switch (scanstatus) {
            case 'scan_pending':
                return 'Scan Pending';
            case 'scan_completed':
                return 'Scan Completed';
            case 'scan_incomplete':
                return 'Scan Incomplete';
            case 'scan_cancelled':
                return 'Scan Cancelled';
            default:
                return ''
            }
    }

    const GridShowAppts = ({appts}) =>{
        const selHeader = ['Patient info', 'Visit info', 'Documents','Scan Status','Report']
        
        return <BasicGridAsTable columnHeaderList={selHeader}>
                {appts.map((apptDetail)=>{
                    return <BasicGridBodyRow>
                        <BasicGridRowItem><Card elevation={0} >
                                <CardContent>
                                    <Typography variant="h6" >{apptDetail.patientName}</Typography>
                                    <Typography variant="body2" sx={{color:'text.secondary', ml:1}}>Age: {getAge(apptDetail.patientDOB)}</Typography>
                                    <Typography variant="body2" sx={{color:'text.secondary', ml:1}}>Sex: {apptDetail.patientSex}</Typography>
                                </CardContent>
                            </Card></BasicGridRowItem>
                        <BasicGridRowItem><Card elevation={0}>
                                <CardContent>
                                        <Box sx={{display:'flex', flexDirection:'row', justifyContent:'center'}}>
                                            <Typography variant='body1'>{apptDetail.studyDescription}</Typography>
                                            <Typography variant="body2" sx={{color:'text.secondary'}}>{getStudyDateTime(apptDetail.studyDate, apptDetail.studyTime)}</Typography>
                                        </Box>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" data-studyinstanceuidsrc={apptDetail.studyInstanceUID} onClick={handleDicomImagePreview}>View Image</Button>
                                </CardActions>    
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
                        <BasicGridRowItem><Card elevation={0} >
                                <CardContent>
                                    <Typography variant="body1" >{scanStatusShower(apptDetail.scanstatus)}</Typography>
                                </CardContent>
                            </Card></BasicGridRowItem>
                        <BasicGridRowItem>
                                <ReportWithStatusButtonModal apptDetail={apptDetail}/>
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
                    {isSearchResultsLoading && 
                        <Box>
                            <CircularProgress size={20}/>
                            <Typography variant="body1" color="primary">Loading... </Typography>
                        </Box>
                    }
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
                    {isSearchResultsLoading && 
                        <Box>
                            <CircularProgress size={20}/>
                            <Typography variant="body1" color="primary">Loading... </Typography>
                        </Box>
                    }
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
                    {isSearchResultsLoading && 
                        <Box>
                            <CircularProgress size={20}/>
                            <Typography variant="body1" color="primary">Loading... </Typography>
                        </Box>
                    }
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
