import { Box, CircularProgress, Icon, IconButton, InputAdornment, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useState } from "react";
import {useQuery, useQueryClient, useMutation} from '@tanstack/react-query'
import axios from 'axios'



export default function VisitFront() {
    const [patientNameQuery, setPatientNameQuery] = useState()
    const [patientIdQuery, setPatientIdQuery] = useState()
    const [visitIdQuery, setVisitIdQuery] = useState()
    const [allowSearch, setAllowSearch] = useState(false)

    //columns for handling when it is radiology report
    const radVisitColumnHeaders= [
        {label:'Patient Name',disablePadding:false,align:'left'}, 
        {label:'Patient id',disablePadding:false,align:'left'}, 
        {label:'Visit id',disablePadding:false,align:'left'},
        {label:'Assigned To',disablePadding:false,align:'left'}, 
        {label:'Report Status',disablePadding:false,align:'left'}
    ]
    
    const {isLoading: isSearchResultsLoading, isError: isSearchResultsError, 
        isSuccess: isSearchResultsSuccess, data:searchResults, refetch:getResults} = useQuery(
        {queryKey:['get_search_results',patientNameQuery,patientIdQuery,visitIdQuery], 
        queryFn: ()=>(axios.get('http://localhost:8080/getvisitsfromquery',{
            params:{
                patientNameQuery,
                patientIdQuery,
                visitIdQuery
            }
        })),
        enabled: false,
        select : (response)=>(response.data),
        })
    //handle when search button is pressed
    function handleSearchAction (){
        setAllowSearch(true)
        getResults()
    }

    if(isSearchResultsSuccess||isSearchResultsError){
        setAllowSearch(false)
    }

    return <Paper sx={{height:'100%'}}>
        <Box sx={{display:'flex', flexDirection:'row', justifyContent:'space-around'}}>
            <TextField variant="outlined" name="patientnamequery" label='Patient Name' value={patientNameQuery} 
                onChange={(event)=>{
                        setPatientIdQuery('')
                        setVisitIdQuery('')
                        setPatientNameQuery(event.target.value)
                    }} 
                slotProps={{inputLabel:{shrink:true,},
                            input:{
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
                slotProps={{inputLabel:{shrink:true,},
                            input:{
                                    sx: {borderRadius:'16px'},
                                    startAdornment:<InputAdornment position="start"><IconButton onClick={handleSearchAction} edge={'end'}><SearchOutlinedIcon/></IconButton></InputAdornment>,
                                    endAdornment:<InputAdornment position="end"><IconButton onClick={()=>{setPatientIdQuery('')}}><CloseOutlinedIcon/></IconButton></InputAdornment>,
                                    }}}/>
            <TextField variant="outlined" name="visitidquery" type='search' label='Visit Id' value={visitIdQuery} 
                onChange={(event)=>{
                    setPatientNameQuery('')
                    setPatientIdQuery('')
                    setVisitIdQuery(event.target.value)
                    }} 
                slotProps={{inputLabel:{shrink:true,},
                            input:{
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
                                searchResults&&searchResults.map((searchResult,index)=>{
                                    return <TableRow key={index}>
                                        <TableCell>{searchResult.patientname}</TableCell>
                                        <TableCell>{searchResult.patientid}</TableCell>
                                        <TableCell>{searchResult.visitid}</TableCell>
                                        <TableCell>{searchResult.assignedto?searchResult.assignedto:''}</TableCell>
                                        <TableCell>{searchResult.reportstatus?searchResult.reportstatus:''}</TableCell>
                                    </TableRow>
                            })}        
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
    </Paper>
}
