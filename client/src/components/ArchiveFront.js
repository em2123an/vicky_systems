import { useCallback, useState } from "react";
import { Box, Button, Card, CardActions, CardContent, CircularProgress, IconButton, InputAdornment, Stack, 
    Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import {differenceInCalendarYears, differenceInCalendarMonths, differenceInCalendarDays, format,
    isSameDay, isAfter, startOfYesterday, subWeeks, subMonths, subYears, startOfToday, isEqual} from 'date-fns'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFnsV3'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import {useQuery} from '@tanstack/react-query'
import axios from 'axios'



export default function ArchiveFront() {
    const [patientNameQuery, setPatientNameQuery] = useState('')
    const [patientIdQuery, setPatientIdQuery] = useState('')
    const [visitIdQuery, setVisitIdQuery] = useState('')
    const [allowSearch, setAllowSearch] = useState(false)
    const [lastRunKeyState, setLastRunKeyState] = useState([])
    const [curPage, setCurPage] = useState(1)
    const [selStartDate, setSelStartDate] = useState(null) 
    const [selEndDate, setSelEndDate] = useState(null) 
   

    //columns for handling when it is radiology report
    const radVisitColumnHeaders= [
        {label:'Patient Info',disablePadding:false,align:'left'}, 
        {label:'Study Info',disablePadding:false,align:'left'},
        {label:'Date and Time',disablePadding:false,align:'left'}, 
        {label:'Report Status',disablePadding:false,align:'left'}
    ]
    
    //get age out of dob
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

    const selectForSearchResults = useCallback((response)=>(response.data),[])
    
    const {isLoading: isSearchResultsLoading, isError: isSearchResultsError, 
        isSuccess: isSearchResultsSuccess, data:searchResults, refetch:getResults} = useQuery(
        {queryKey:['get_archive_results',...lastRunKeyState], 
        queryFn: ()=>(axios.get('http://localhost:8080/getarchivesfromquery',{
            params:{
                patientNameQuery,
                patientIdQuery,
                visitIdQuery,
                pageValue : curPage,
                startDate: selStartDate?format(selStartDate,'yyyy-MM-dd'):"",//start date for search
                endDate: selEndDate?format(selEndDate,'yyyy-MM-dd'):""//end date for search
            }
        })),
        enabled: allowSearch,
        select : selectForSearchResults,
        })
    //handle when search button is pressed
    function handleSearchAction (){
        setLastRunKeyState([patientNameQuery,patientIdQuery,visitIdQuery,curPage])
        if(!(allowSearch)){
            //first run
            setAllowSearch(true)
            return
        }
        getResults()
    }

    //handle when view more is clicked for the visit
    function handleImagePreview(e){
        const studyInstanceUID = e.currentTarget.dataset.studyinstanceuidsrc
        const DICOMWEB = "http://localhost:8042/dicom-web"
        //const authHeader = "Authorization: Basic" + btoa("orthanc:orthanc");
        const weasisCommand = `$dicom:rs --url "${DICOMWEB}" -r "studyUID=${studyInstanceUID}"`
        const weasisOpenURL = `weasis://?${encodeURIComponent(weasisCommand)}`
        //window.open(trialWeasis)
        window.location.href = weasisOpenURL;
    }

    //view for today and specified date
    function ViewForSpecifiedCalendarDate({selStartDate,setSelStartDate, selEndDate, setSelEndDate}){
        return <Box display={'flex'} flexDirection={'row'} sx={{px:2}}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker label="Start" value={selStartDate} onChange={(newValue)=>{setSelStartDate(newValue)}}/>
                        <DatePicker label="End" value={selEndDate} onChange={(newValue)=>{setSelEndDate(newValue)}}/>
                    </LocalizationProvider>
                </Box>
    }

    //view for duration
    function ViewForDurationTodayYesterday({selStartDate,setSelStartDate, selEndDate, setSelEndDate}){
        const strOfTdy = startOfToday()
        const strOfYest = startOfYesterday()
        const subweekone = subWeeks(format(Date.now(),'yyyy-MM-dd'),1)
        const submonthone = subMonths(format(Date.now(),'yyyy-MM-dd'),1)
        const subyearone = subYears(format(Date.now(),'yyyy-MM-dd'),1)
        return <Box display={'flex'} flexDirection={'row'}>
                    {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Typography variant="body1">From</Typography>
                        <DatePicker value={selSchedDate} onChange={(newValue)=>{setSelSchedDate(newValue)}}/>
                        <Typography variant="body1">To</Typography>
                        <DatePicker value={selSchedDate} onChange={(newValue)=>{setSelSchedDate(newValue)}}/>
                    </LocalizationProvider> */}
                    <Button variant={isSameDay(selStartDate,strOfTdy)&&isSameDay(selEndDate,strOfTdy)?'contained':'outlined'} onClick={()=>{
                        setSelStartDate(strOfTdy)
                        setSelEndDate(strOfTdy)
                    }}>Today</Button>
                    <Button variant={isSameDay(selStartDate,strOfYest) && isSameDay(selEndDate,strOfYest)?'contained':'outlined'} onClick={()=>{
                        setSelStartDate(strOfYest)
                        setSelEndDate(strOfYest)
                    }}>Yesterday</Button>
                    <Button variant={isSameDay(selStartDate,subweekone)?'contained':'outlined'} onClick={()=>{
                        setSelStartDate(subweekone)
                        setSelEndDate(strOfTdy)
                    }}>Week</Button>
                    <Button variant={isSameDay(selStartDate,submonthone)?'contained':'outlined'} onClick={()=>{
                        setSelStartDate(submonthone)
                        setSelEndDate(strOfTdy)
                    }}>Month</Button>
                    <Button variant={isSameDay(selStartDate,subyearone)?'contained':'outlined'} onClick={()=>{
                        setSelStartDate(subyearone)
                        setSelEndDate(strOfTdy)
                    }}>Year</Button>
                    <Button variant={!(selStartDate)&&!(selEndDate)?'contained':'outlined'} onClick={()=>{
                        setSelStartDate(null)
                        setSelEndDate(null)
                    }}>Any</Button>
                </Box>
    }
    

    return <Paper sx={{height:'100%', minHeight:'100vh'}}>
        <Box sx={{display:'flex',flexDirection:'column'}}>
            <Stack direction={'row'} spacing={2}>    
                <TextField variant="outlined" name="patientnamequery" label='Patient Name' value={patientNameQuery} 
                        onChange={(event)=>{
                                setPatientIdQuery('')
                                setVisitIdQuery('')
                                setCurPage(1)
                                setPatientNameQuery(event.target.value)
                            }} 
                        onKeyDown={(event)=>{
                            if(event.key ==='Enter'){
                                handleSearchAction()
                            }
                        }}
                        slotProps={{inputLabel:{shrink:true,},
                                    input:{
                                            autoComplete:'false',
                                            sx: {borderRadius:'16px'},
                                            startAdornment:<InputAdornment position="start"><IconButton onClick={handleSearchAction} edge={'end'}><SearchOutlinedIcon/></IconButton></InputAdornment>,
                                            endAdornment:<InputAdornment position="end"><IconButton onClick={()=>{setPatientNameQuery('')}}><CloseOutlinedIcon/></IconButton></InputAdornment>,
                                            }}}/>
                    <TextField variant="outlined" name="patientidquery" label='Patient Id' value={patientIdQuery} 
                        onChange={(event)=>{
                                setPatientNameQuery('')
                                setVisitIdQuery('')
                                setCurPage(1)
                                setPatientIdQuery(event.target.value)
                            }}
                        onKeyDown={(event)=>{
                                if(event.key ==='Enter'){
                                    handleSearchAction()
                                }
                            }} 
                        slotProps={{inputLabel:{shrink:true,},
                                    input:{
                                            autoComplete:'false',
                                            sx: {borderRadius:'16px'},
                                            startAdornment:<InputAdornment position="start"><IconButton onClick={handleSearchAction} edge={'end'}><SearchOutlinedIcon/></IconButton></InputAdornment>,
                                            endAdornment:<InputAdornment position="end"><IconButton onClick={()=>{setPatientIdQuery('')}}><CloseOutlinedIcon/></IconButton></InputAdornment>,
                                            }}}/>
                    <TextField variant="outlined" name="visitidquery" label='Visit Id' value={visitIdQuery} 
                        onChange={(event)=>{
                                setPatientNameQuery('')
                                setPatientIdQuery('')
                                setCurPage(1)
                                setVisitIdQuery(event.target.value)
                            }}
                        onKeyDown={(event)=>{
                                if(event.key ==='Enter'){
                                    handleSearchAction()
                                }
                            }} 
                        slotProps={{inputLabel:{shrink:true,},
                                    input:{
                                            autoComplete:'false',
                                            sx: {borderRadius:'16px'},
                                            startAdornment:<InputAdornment position="start"><IconButton onClick={handleSearchAction} edge={'end'}><SearchOutlinedIcon/></IconButton></InputAdornment>,
                                            endAdornment:<InputAdornment position="end"><IconButton onClick={()=>{setVisitIdQuery('')}}><CloseOutlinedIcon/></IconButton></InputAdornment>,
                                            }}}/>
            </Stack>
            {/* <Box sx={{display:'flex', flexDirection:'row', justifyContent:'space-evenly'}}>
                <TextField variant="outlined" name="patientnamequery" label='Patient Name' value={patientNameQuery} 
                    onChange={(event)=>{
                            setPatientIdQuery('')
                            setVisitIdQuery('')
                            setCurPage(1)
                            setPatientNameQuery(event.target.value)
                        }} 
                    onKeyDown={(event)=>{
                        if(event.key ==='Enter'){
                            handleSearchAction()
                        }
                    }}
                    slotProps={{inputLabel:{shrink:true,},
                                input:{
                                        autoComplete:'false',
                                        sx: {borderRadius:'16px'},
                                        startAdornment:<InputAdornment position="start"><IconButton onClick={handleSearchAction} edge={'end'}><SearchOutlinedIcon/></IconButton></InputAdornment>,
                                        endAdornment:<InputAdornment position="end"><IconButton onClick={()=>{setPatientNameQuery('')}}><CloseOutlinedIcon/></IconButton></InputAdornment>,
                                        }}}/>
                <TextField variant="outlined" name="patientidquery" label='Patient Id' value={patientIdQuery} 
                    onChange={(event)=>{
                            setPatientNameQuery('')
                            setVisitIdQuery('')
                            setCurPage(1)
                            setPatientIdQuery(event.target.value)
                        }}
                    onKeyDown={(event)=>{
                            if(event.key ==='Enter'){
                                handleSearchAction()
                            }
                        }} 
                    slotProps={{inputLabel:{shrink:true,},
                                input:{
                                        autoComplete:'false',
                                        sx: {borderRadius:'16px'},
                                        startAdornment:<InputAdornment position="start"><IconButton onClick={handleSearchAction} edge={'end'}><SearchOutlinedIcon/></IconButton></InputAdornment>,
                                        endAdornment:<InputAdornment position="end"><IconButton onClick={()=>{setPatientIdQuery('')}}><CloseOutlinedIcon/></IconButton></InputAdornment>,
                                        }}}/>
                <TextField variant="outlined" name="visitidquery" label='Visit Id' value={visitIdQuery} 
                    onChange={(event)=>{
                            setPatientNameQuery('')
                            setPatientIdQuery('')
                            setCurPage(1)
                            setVisitIdQuery(event.target.value)
                        }}
                    onKeyDown={(event)=>{
                            if(event.key ==='Enter'){
                                handleSearchAction()
                            }
                        }} 
                    slotProps={{inputLabel:{shrink:true,},
                                input:{
                                        autoComplete:'false',
                                        sx: {borderRadius:'16px'},
                                        startAdornment:<InputAdornment position="start"><IconButton onClick={handleSearchAction} edge={'end'}><SearchOutlinedIcon/></IconButton></InputAdornment>,
                                        endAdornment:<InputAdornment position="end"><IconButton onClick={()=>{setVisitIdQuery('')}}><CloseOutlinedIcon/></IconButton></InputAdornment>,
                                        }}}/>
            </Box> */}
            <Box sx={{display:'flex', justifyContent:'end',p:2}}>
                <ViewForSpecifiedCalendarDate selStartDate={selStartDate} setSelStartDate={setSelStartDate} 
                    selEndDate={selEndDate} setSelEndDate={setSelEndDate}/>
                <ViewForDurationTodayYesterday selStartDate={selStartDate} setSelStartDate={setSelStartDate} 
                    selEndDate={selEndDate} setSelEndDate={setSelEndDate}/>
            </Box>
        </Box>
        {isSearchResultsLoading&&<Box sx={{m:2}}><CircularProgress size={35}/></Box>}
            <Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {radVisitColumnHeaders.map((radColumn)=>{
                                    return <TableCell align={radColumn.align} padding={radColumn.disablePadding?'none':'normal'}>{radColumn.label}</TableCell>
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                searchResults&& searchResults.searchResult && searchResults.searchResult.map((searchResult,index)=>{
                                    return <TableRow key={index}>
                                        <TableCell padding="none" sx={{boxShadow:0.5}}>
                                            <Card elevation={0} >
                                                <CardContent>
                                                    <Typography variant="h6" component={'div'}>{searchResult.patientName}</Typography>
                                                    <Typography variant="body2" sx={{color:'text.secondary', ml:1}}>Age: {getAge(searchResult.patientDOB)}</Typography>
                                                    <Typography variant="body2" sx={{color:'text.secondary', ml:1}}>Sex: {searchResult.patientSex}</Typography>
                                                </CardContent>
                                            </Card></TableCell>
                                        <TableCell padding="none" sx={{boxShadow:1}}>
                                            <Card elevation={0}>
                                                <CardContent>
                                                    <Typography variant="body1" component={'div'}>{searchResult.studyDescription}</Typography>
                                                    <Typography variant="body2" sx={{color:'text.secondary'}}>Accession Number: {searchResult.accessionNumber}</Typography>
                                                </CardContent>
                                                <CardActions>
                                                    <Button size="small" data-studyinstanceuidsrc={searchResult.studyInstanceUID} onClick={handleImagePreview}>View Image</Button>
                                                </CardActions>
                                            </Card></TableCell>
                                        <TableCell padding="none" sx={{boxShadow:1}}>
                                            <Card elevation={0}>
                                                <CardContent>
                                                    <Typography variant="body1" component={'div'}>{getStudyDateTime(searchResult.studyDate, searchResult.studyTime)}</Typography>
                                                </CardContent>
                                            </Card></TableCell>
                                        <TableCell padding="none" sx={{boxShadow:1}}>
                                            {searchResult.reportstatus?searchResult.reportstatus:''}</TableCell>
                                    </TableRow>
                            })}        
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
                {(searchResults && searchResults.searchResult && searchResults.searchResult.length===0) &&
                            <Box display={'flex'} justifyContent={"center"} sx={{m:2}}>
                                <Typography variant='body1'>No results were found</Typography>
                            </Box>}
                {(searchResults && searchResults.totalRow && parseInt(searchResults.totalRow)>parseInt(searchResults.resultPerPageLimit)) &&
                            <Box display={'flex'} justifyContent={"center"} sx={{m:4}}>
                                <Pagination shape={'rounded'}  size={'large'} color={'primary'}
                                    count={Math.ceil(parseInt(searchResults.totalRow)/parseInt(searchResults.resultPerPageLimit))}
                                    page={curPage} 
                                    onChange={(event,value)=>{
                                        setCurPage(value)
                                        handleSearchAction()
                                    }}
                                    />
                            </Box>}
    </Paper>
}
