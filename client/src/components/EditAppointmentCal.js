import { Box, Button, IconButton, Stack, Toolbar } from "@mui/material";
import PatientRegForm from "./registeration/PatientRegForm";
import {format, sub} from 'date-fns'
import axios from "axios"
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import { useQuery, useMutation, useQueryClient} from "@tanstack/react-query"


export default function EditAppointmentCal ({mutupdateappt, formik, handleOnCloseEditAppt, 
    selInv, serviceList, curEvents, setCurEvents, visitId, patientId,
    getAppts, listSelectedServices,setListSelectedServices}){
    
    const queryClient = useQueryClient()
    
    //mutation call to cancel the status of the scan
    const mutcancelscanstatus = useMutation({
        mutationKey:['update_scan_status', visitId],
        mutationFn: (cancelscanstatus)=>(
            axios.post('http://localhost:8080/updatescanstatus',cancelscanstatus,
                {headers:{"Content-Type":"application/x-www-form-urlencoded"}})
            ),
        onSuccess: ()=>{  
            queryClient.invalidateQueries({queryKey:['patDetail', visitId]})
        }
    })

    return <Box>
        <Toolbar sx={{display:'flex', justifyContent:'end'}}>
            <IconButton aria-label={'close'} onClick={()=>{
                handleOnCloseEditAppt()
            }}>
                <CloseOutlinedIcon fontSize="large"/>
                
            </IconButton>
        </Toolbar>
        <PatientRegForm selInv={selInv} serviceList={serviceList} curEvents={curEvents} setCurEvents={setCurEvents} 
                    formik={formik} events={getAppts} 
                    listSelectedServices={listSelectedServices} setListSelectedServices={setListSelectedServices}/>
        <Box sx={{display:'flex', flexDirection:'row', justifyContent:'space-around', m:4}}>
            <Button variant="outlined" onClick={(event)=>{
                //to get DOB
                const resultdate = sub(Date.now(),{
                    years:formik.values.age_yrs,
                    months:formik.values.age_mns,
                    days:formik.values.age_dys
                })
                const updatedapptdata = {
                    department : 'Radiology',
                    firstname : formik.values.firstname,
                    lastname : formik.values.lastname,
                    sex: formik.values.sex,
                    mobileno : formik.values.mobileno,
                    dob : format(resultdate,'yyyy-MM-dd'),
                    services : listSelectedServices.map((ser)=>(ser.serviceid)),
                    sched_start : curEvents.start?format(curEvents.start,'yyyy-MM-dd HH:mm:ss'):null,
                    sched_end : curEvents.end?format(curEvents.end,'yyyy-MM-dd HH:mm:ss'):null,
                    visitid: visitId,
                    patientid: patientId
                }
                console.log(updatedapptdata)
                mutupdateappt.mutate(updatedapptdata)
                handleOnCloseEditAppt()   
                }}>Update Appointment</Button>
            <Button color="error" variant="outlined" onClick={()=>{
                mutcancelscanstatus.mutate({
                    visitid: visitId,
                    scanstatus: 'scan_cancelled'
                  })
                handleOnCloseEditAppt()
                }}>Cancel Appointment</Button>
        </Box>
        
    </Box>
}