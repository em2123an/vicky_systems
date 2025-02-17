import { useState } from "react";
import { Box, Button, Card, CardActions, CardContent, CircularProgress, Icon, IconButton, InputAdornment, List, ListItem, ListItemText, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import {differenceInCalendarYears, differenceInCalendarMonths, differenceInCalendarDays, format} from 'date-fns'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import {useQuery, useQueryClient, useMutation} from '@tanstack/react-query'
import axios from 'axios'



export default function VisitFront({setIsDetailViewing,setCurEvents}) {
    const [patientNameQuery, setPatientNameQuery] = useState()
    const [patientIdQuery, setPatientIdQuery] = useState()
    const [visitIdQuery, setVisitIdQuery] = useState()
    const [allowSearch, setAllowSearch] = useState(false)

    //columns for handling when it is radiology report
    const radVisitColumnHeaders= [
        {label:'Patient Info',disablePadding:false,align:'left'}, 
        {label:'Visit Info',disablePadding:false,align:'left'},
        {label:'Services',disablePadding:false,align:'left'}, 
        {label:'Report Status',disablePadding:false,align:'left'}
    ]
    
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
    
    const {isLoading: isSearchResultsLoading, isError: isSearchResultsError, 
        isSuccess: isSearchResultsSuccess, data:searchResults, refetch:getResults} = useQuery(
        {queryKey:['get_search_results'], 
        queryFn: ()=>(axios.get('http://localhost:8080/getvisitsfromquery',{
            params:{
                patientNameQuery,
                patientIdQuery,
                visitIdQuery,
                offset: 0
            }
        })),
        enabled: false,
        select : (response)=>(response.data),
        })
    //handle when search button is pressed
    function handleSearchAction (){
        //setAllowSearch(true)
        getResults()
    }
    //handle when view more is clicked for the visit
    function handleViewPatDetail(patDetail){
        setIsDetailViewing(true)
        setCurEvents({...patDetail})
    }

    if(isSearchResultsSuccess||isSearchResultsError){
        //setAllowSearch(false)
    }

    return <Paper sx={{height:'100%', minHeight:'100vh'}}>
        <Box sx={{display:'flex', flexDirection:'row', justifyContent:'space-around'}}>
            <TextField variant="outlined" name="patientnamequery" label='Patient Name' value={patientNameQuery} 
                onChange={(event)=>{
                        setPatientIdQuery('')
                        setVisitIdQuery('')
                        setPatientNameQuery(event.target.value)
                    }} 
                onKeyDown={(event)=>{
                    if(event.key ==='Enter'){
                        handleSearchAction()
                    }
                }}
                slotProps={{inputLabel:{shrink:true,},
                            input:{
                                    autoComplete:false,
                                    sx: {borderRadius:'16px'},
                                    startAdornment:<InputAdornment position="start"><IconButton onClick={handleSearchAction} edge={'end'}><SearchOutlinedIcon/></IconButton></InputAdornment>,
                                    endAdornment:<InputAdornment position="end"><IconButton onClick={()=>{setPatientNameQuery('')}}><CloseOutlinedIcon/></IconButton></InputAdornment>,
                                    }}}/>
            <TextField variant="outlined" name="patientidquery" label='Patient Id' value={patientIdQuery} 
                onChange={(event)=>{
                        setPatientNameQuery('')
                        setVisitIdQuery('')
                        setPatientIdQuery(event.target.value)
                    }}
                onKeyDown={(event)=>{
                        if(event.key ==='Enter'){
                            handleSearchAction()
                        }
                    }} 
                slotProps={{inputLabel:{shrink:true,},
                            input:{
                                    autoComplete:false,
                                    sx: {borderRadius:'16px'},
                                    startAdornment:<InputAdornment position="start"><IconButton onClick={handleSearchAction} edge={'end'}><SearchOutlinedIcon/></IconButton></InputAdornment>,
                                    endAdornment:<InputAdornment position="end"><IconButton onClick={()=>{setPatientIdQuery('')}}><CloseOutlinedIcon/></IconButton></InputAdornment>,
                                    }}}/>
            <TextField variant="outlined" name="visitidquery" label='Visit Id' value={visitIdQuery} 
                onChange={(event)=>{
                        setPatientNameQuery('')
                        setPatientIdQuery('')
                        setVisitIdQuery(event.target.value)
                    }}
                onKeyDown={(event)=>{
                        if(event.key ==='Enter'){
                            handleSearchAction()
                        }
                    }} 
                slotProps={{inputLabel:{shrink:true,},
                            input:{
                                    autoComplete:false,
                                    sx: {borderRadius:'16px'},
                                    startAdornment:<InputAdornment position="start"><IconButton onClick={handleSearchAction} edge={'end'}><SearchOutlinedIcon/></IconButton></InputAdornment>,
                                    endAdornment:<InputAdornment position="end"><IconButton onClick={()=>{setVisitIdQuery('')}}><CloseOutlinedIcon/></IconButton></InputAdornment>,
                                    }}}/>
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
                                        <TableCell padding="none" sx={{boxShadow:1}}>
                                            <Card elevation={0} >
                                                <CardContent>
                                                    <Typography variant="h6" component={'div'}>{searchResult.firstname} {searchResult.lastname}</Typography>
                                                    <Typography variant="body2" sx={{color:'text.secondary', ml:1}}>Age: {getAge(searchResult.dob)}</Typography>
                                                    <Typography variant="body2" sx={{color:'text.secondary', ml:1}}>Sex: {searchResult.sex}</Typography>
                                                </CardContent>
                                            </Card></TableCell>
                                        <TableCell padding="none" sx={{boxShadow:1}}>
                                            <Card elevation={0}>
                                                <CardContent>
                                                    <Typography variant="body1" component={'div'}>{getAppointment(searchResult.scheduledatetime_start,searchResult.scheduledatetime_end)}</Typography>
                                                    <Typography variant="body2" sx={{color:'text.secondary'}}>Visit Id: {searchResult.visitid}</Typography>
                                                </CardContent>
                                                <CardActions>
                                                    <Button size="small" onClick={()=>{handleViewPatDetail(searchResult)}}>View Detail</Button>
                                                </CardActions>
                                            </Card></TableCell>
                                        <TableCell padding="none" sx={{boxShadow:1}}>
                                            <Card elevation={0}>
                                                <CardContent>
                                                    <List sx={{width:'100%', bgcolor:'background.paper'}}>
                                                        {searchResult.servicenames&&searchResult.servicenames.map((servicename)=>{
                                                            return <ListItem disablePadding>
                                                                <ListItemText 
                                                                    primary={servicename} 
                                                                    secondary={searchResult.assignedto?searchResult.assignedto:''}/>
                                                            </ListItem>
                                                        })}
                                                    </List>
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
                {(searchResults && searchResults.length===0) &&
                            <Box display={'flex'} justifyContent={"center"} sx={{m:2}}>
                                <Typography variant='body1'>No results were found</Typography>
                            </Box>}
    </Paper>
}
